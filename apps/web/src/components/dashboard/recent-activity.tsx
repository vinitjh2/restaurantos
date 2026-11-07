"use client";

import { DEMO_ACTIVITIES } from "@/lib/demo-data";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Activity,
  CheckCircle2,
  ChefHat,
  Percent,
  Wallet,
  Truck,
} from "lucide-react";

export function RecentActivityFeed() {
  const getIcon = (type: string) => {
    switch (type) {
      case "BILL":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
      case "KOT":
        return <ChefHat className="h-3.5 w-3.5 text-amber-600" />;
      case "DISCOUNT":
        return <Percent className="h-3.5 w-3.5 text-purple-600" />;
      case "SHIFT":
        return <Wallet className="h-3.5 w-3.5 text-blue-600" />;
      case "INVENTORY":
        return <Truck className="h-3.5 w-3.5 text-orange-600" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  return (
    <Card className="col-span-1 xl:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-600" />
          <CardTitle>Live Activity & Audit Feed</CardTitle>
        </div>
        <CardDescription>Immutable transaction events and supervisor approvals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
          {DEMO_ACTIVITIES.map((activity) => (
            <div key={activity.id} className="relative flex items-start gap-3 text-xs">
              <div className="absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white shadow-xs">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{activity.title}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{activity.time}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{activity.description}</p>
                <span className="text-[10px] text-slate-400 font-medium">By {activity.user}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
