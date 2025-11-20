import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuManager } from "@/components/manager/menu-manager";
import { ComplaintViewer } from "@/components/manager/complaint-viewer";

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "MESS_MANAGER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get today's attendance counts
  const attendanceCounts = await prisma.mealAttendance.groupBy({
    by: ["mealType"],
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      optedIn: true,
    },
    _count: true,
  });

  // Get total students
  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT" },
  });

  // Get today's ratings
  const todayRatings = await prisma.rating.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      menu: { select: { mealType: true } },
    },
  });

  // Calculate average ratings per meal
  const ratingsByMeal: Record<string, { total: number; count: number }> = {};
  todayRatings.forEach((r) => {
    if (!ratingsByMeal[r.menu.mealType]) {
      ratingsByMeal[r.menu.mealType] = { total: 0, count: 0 };
    }
    ratingsByMeal[r.menu.mealType].total += r.score;
    ratingsByMeal[r.menu.mealType].count += 1;
  });

  // Get recent complaints
  const complaints = await prisma.complaint.findMany({
    where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Check for alert condition (40% or more opted out)
  const mealCounts: Record<string, number> = {
    BREAKFAST: 0,
    LUNCH: 0,
    DINNER: 0,
  };
  attendanceCounts.forEach((a) => {
    mealCounts[a.mealType] = a._count;
  });

  const alerts = Object.entries(mealCounts)
    .filter(([, count]) => count < totalStudents * 0.6)
    .map(([meal]) => meal);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mess Manager Dashboard</h1>
        <p className="text-muted-foreground">Real-time attendance and meal management</p>
      </div>

      {alerts.length > 0 && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">Low Attendance Alert</CardTitle>
            <CardDescription>
              More than 40% students have opted out for: {alerts.join(", ")}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {["BREAKFAST", "LUNCH", "DINNER"].map((meal) => {
          const count = mealCounts[meal] || 0;
          const avgRating = ratingsByMeal[meal]
            ? (ratingsByMeal[meal].total / ratingsByMeal[meal].count).toFixed(1)
            : "N/A";

          return (
            <Card key={meal}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{meal}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-3xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground">
                      of {totalStudents} students
                    </p>
                  </div>
                  <Badge variant={avgRating === "N/A" ? "secondary" : "default"}>
                    Rating: {avgRating}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="menu" className="space-y-4">
        <TabsList>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
          <TabsTrigger value="complaints">
            Complaints ({complaints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <Card>
            <CardHeader>
              <CardTitle>Daily Menu</CardTitle>
              <CardDescription>Manage today&apos;s menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <MenuManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Recent Complaints</CardTitle>
              <CardDescription>Address student concerns</CardDescription>
            </CardHeader>
            <CardContent>
              <ComplaintViewer complaints={complaints} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
