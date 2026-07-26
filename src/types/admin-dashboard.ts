export type DashboardRangeKey = "7" | "14" | "30" | "90";
export type DashboardMetricKey = "revenue" | "orders" | "users";

export interface ChartBarPoint {
  key: string;
  label: string;
  fullLabel: string;
  value: number;
  revenue: number;
  orders: number;
  users: number;
}

export interface StatusBarPoint {
  label: string;
  value: number;
  colorClass: string;
}

export interface AnalyticsSeriesResponse {
  rangeDays: number;
  metric: DashboardMetricKey;
  granularity: "day" | "week";
  series: ChartBarPoint[];
  usersSeries: ChartBarPoint[];
  ordersByStatus: StatusBarPoint[];
  summary: {
    revenue: number;
    orders: number;
    users: number;
  };
}
