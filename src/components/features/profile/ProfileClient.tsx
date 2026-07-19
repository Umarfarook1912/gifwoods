"use client";

import { useState } from "react";
import { User, Package, MapPin, CreditCard, Lock, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils/cn";
import { AccountInfo } from "./AccountInfo";
import { OrderHistory } from "./OrderHistory";
import { AddressBook } from "./AddressBook";
import { PaymentMethods } from "./PaymentMethods";
import { SecuritySettings } from "./SecuritySettings";

type Tab = "account" | "orders" | "addresses" | "payments" | "security";

export function ProfileClient() {
  const [activeTab, setActiveTab] = useState<Tab>("account");

  const tabs = [
    { id: "account" as Tab, label: "Account Info", icon: User },
    { id: "orders" as Tab, label: "Order History", icon: Package },
    { id: "addresses" as Tab, label: "Address Book", icon: MapPin },
    { id: "payments" as Tab, label: "Payment Methods", icon: CreditCard },
    { id: "security" as Tab, label: "Security Settings", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="page-container">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-dark mb-10">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-border h-fit flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all whitespace-nowrap lg:w-full",
                    isActive
                      ? "bg-gold/10 text-gold shadow-sm border border-gold/10"
                      : "text-warm-gray hover:text-dark hover:bg-cream/50 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-gold" : "text-warm-gray")} />
                  {tab.label}
                </button>
              );
            })}
            <div className="hidden lg:block my-4 border-t border-border" />
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden lg:flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>

          {/* Active Tab Panel */}
          <div className="lg:col-span-3 transition-all duration-300">
            {activeTab === "account" && <AccountInfo />}
            {activeTab === "orders" && <OrderHistory />}
            {activeTab === "addresses" && <AddressBook />}
            {activeTab === "payments" && <PaymentMethods />}
            {activeTab === "security" && <SecuritySettings />}
          </div>
        </div>
      </div>
    </div>
  );
}
