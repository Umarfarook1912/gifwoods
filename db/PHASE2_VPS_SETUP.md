# Phase 2 — VPS Setup Guide (Hostinger)

Follow this when traffic exceeds Supabase free tier limits.

## 1. Provision VPS on Hostinger

- Plan: KVM 2 or higher (minimum 2 vCPU, 4 GB RAM for Postgres + PgBouncer)
- OS: Ubuntu 22.04 LTS
- Region: Pick closest to your Vercel region (e.g., India / Singapore for `sin1`)

## 2. Install PostgreSQL 16

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y postgresql-16 postgresql-contrib

# Start and enable
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

## 3. Create Databases and Roles

```sql
-- Run as postgres superuser
sudo -u postgres psql

CREATE USER gifwoods_admin WITH PASSWORD 'CHANGE_ME_STRONG_PASS' SUPERUSER;
CREATE USER gifwoods_app WITH PASSWORD 'CHANGE_ME_APP_PASS';

CREATE DATABASE gifwoods OWNER gifwoods_admin;
CREATE DATABASE gifwoods_test OWNER gifwoods_admin;

-- Grant app user CRUD on gifwoods
GRANT CONNECT ON DATABASE gifwoods TO gifwoods_app;
\c gifwoods
GRANT USAGE ON SCHEMA public TO gifwoods_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO gifwoods_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO gifwoods_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO gifwoods_app;

\q
```

## 4. Enable SSL

```bash
# PostgreSQL ships with SSL off on some distros — check:
sudo -u postgres psql -c "SHOW ssl;"

# If off, edit /etc/postgresql/16/main/postgresql.conf:
#   ssl = on

# Generate self-signed cert (or use Let's Encrypt):
sudo openssl req -new -x509 -days 3650 -nodes \
  -out /etc/postgresql/16/main/server.crt \
  -keyout /etc/postgresql/16/main/server.key
sudo chown postgres:postgres /etc/postgresql/16/main/server.{crt,key}
sudo chmod 600 /etc/postgresql/16/main/server.key

sudo systemctl restart postgresql
```

## 5. Firewall — Port 5432

```bash
# Allow only Vercel IP ranges + your static IP:
sudo ufw allow from YOUR_LOCAL_IP to any port 5432
# For Vercel serverless: allow from 0.0.0.0/0 on 5432 (PgBouncer port 6432 instead)
# Better: use PgBouncer (step 6) and only expose 6432

sudo ufw enable
```

## 6. Install PgBouncer (mandatory for Vercel serverless)

```bash
sudo apt install -y pgbouncer

# /etc/pgbouncer/pgbouncer.ini — key settings:
# [databases]
# gifwoods = host=127.0.0.1 port=5432 dbname=gifwoods
#
# [pgbouncer]
# listen_addr = 0.0.0.0
# listen_port = 6432
# auth_type = scram-sha-256
# pool_mode = transaction          ← required for Vercel serverless
# max_client_conn = 200
# default_pool_size = 20
# server_tls_sslmode = require

sudo systemctl enable pgbouncer
sudo systemctl restart pgbouncer
```

## 7. Nightly Backup Cron

```bash
# Create backup script: /home/gifwoods_admin/backup.sh
#!/bin/bash
DATE=$(date +%Y%m%d)
pg_dump -U gifwoods_admin gifwoods | gzip > /var/backups/gifwoods/gifwoods_${DATE}.sql.gz
find /var/backups/gifwoods/ -mtime +30 -delete

# Cron (daily at 2am):
crontab -e
# 0 2 * * * /home/gifwoods_admin/backup.sh
```

## 8. DATABASE_URL for Vercel

```
postgresql://gifwoods_app:APP_PASSWORD@VPS_IP:6432/gifwoods?sslmode=require
```

Add to Vercel → Project Settings → Environment Variables.
