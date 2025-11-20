"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartData {
  attendance: { date: string; mealType: string; count: number }[];
  ratings: { date: string; score: number }[];
}

export function AnalyticsCharts({ data }: { data: ChartData }) {
  // Group attendance by date
  const attendanceByDate: Record<string, Record<string, number>> = {};
  data.attendance.forEach((a) => {
    if (!attendanceByDate[a.date]) {
      attendanceByDate[a.date] = {};
    }
    attendanceByDate[a.date][a.mealType] = a.count;
  });

  // Group ratings by date
  const ratingsByDate: Record<string, { total: number; count: number }> = {};
  data.ratings.forEach((r) => {
    if (!ratingsByDate[r.date]) {
      ratingsByDate[r.date] = { total: 0, count: 0 };
    }
    ratingsByDate[r.date].total += r.score;
    ratingsByDate[r.date].count += 1;
  });

  const dates = Object.keys(attendanceByDate).sort();
  const ratingDates = Object.keys(ratingsByDate).sort();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Attendance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {dates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No attendance data</p>
          ) : (
            <div className="space-y-4">
              {dates.map((date) => (
                <div key={date} className="space-y-2">
                  <p className="text-sm font-medium">{date}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["BREAKFAST", "LUNCH", "DINNER"].map((meal) => (
                      <div key={meal} className="text-center">
                        <p className="text-xs text-muted-foreground">{meal}</p>
                        <p className="font-bold">
                          {attendanceByDate[date][meal] || 0}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Rating Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {ratingDates.length === 0 ? (
            <p className="text-muted-foreground text-sm">No rating data</p>
          ) : (
            <div className="space-y-2">
              {ratingDates.map((date) => {
                const avg = (ratingsByDate[date].total / ratingsByDate[date].count).toFixed(1);
                return (
                  <div key={date} className="flex justify-between items-center">
                    <span className="text-sm">{date}</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2 bg-primary rounded"
                        style={{ width: `${parseFloat(avg) * 20}px` }}
                      />
                      <span className="font-medium">{avg}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
