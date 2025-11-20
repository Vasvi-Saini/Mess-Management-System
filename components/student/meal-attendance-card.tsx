"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MealAttendanceCardProps {
  mealType: string;
  menu: {
    id: string;
    items: string[];
    specialItem?: string | null;
  } | undefined;
  attendance: {
    optedIn: boolean;
  } | undefined;
  hasRated: boolean;
}

const CUTOFF_TIMES: Record<string, number> = {
  BREAKFAST: 7,
  LUNCH: 11,
  DINNER: 18,
};

export function MealAttendanceCard({ mealType, menu, attendance, hasRated }: MealAttendanceCardProps) {
  const [loading, setLoading] = useState(false);
  const [optedIn, setOptedIn] = useState(attendance?.optedIn ?? true);

  const currentHour = new Date().getHours();
  const cutoffHour = CUTOFF_TIMES[mealType];
  const isPastCutoff = currentHour >= cutoffHour;

  const handleToggle = async () => {
    if (!menu) return;

    setLoading(true);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuId: menu.id,
          mealType,
          optedIn: !optedIn,
        }),
      });

      if (!res.ok) throw new Error();

      setOptedIn(!optedIn);
      toast.success(optedIn ? "Opted out of meal" : "Opted in for meal");
    } catch {
      toast.error("Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{mealType}</h3>
        {hasRated && <Badge variant="secondary">Rated</Badge>}
      </div>

      {menu ? (
        <>
          <div className="text-sm text-muted-foreground">
            <p>{menu.items.join(", ")}</p>
            {menu.specialItem && (
              <p className="text-primary font-medium mt-1">Special: {menu.specialItem}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Badge variant={optedIn ? "default" : "destructive"}>
              {optedIn ? "Opted In" : "Opted Out"}
            </Badge>

            {!isPastCutoff && (
              <Button
                size="sm"
                variant={optedIn ? "destructive" : "default"}
                onClick={handleToggle}
                disabled={loading}
              >
                {optedIn ? "Opt Out" : "Opt In"}
              </Button>
            )}
          </div>

          {isPastCutoff && (
            <p className="text-xs text-muted-foreground">Cutoff time has passed</p>
          )}
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No menu available</p>
      )}
    </div>
  );
}
