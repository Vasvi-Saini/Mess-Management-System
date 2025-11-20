import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { UserManagement } from "@/components/admin/user-management";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { CreditLedger } from "@/components/admin/credit-ledger";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get stats for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Attendance trends
  const attendanceTrends = await prisma.mealAttendance.groupBy({
    by: ["date", "mealType"],
    where: {
      date: { gte: sevenDaysAgo },
      optedIn: true,
    },
    _count: true,
  });

  // Rating trends
  const ratings = await prisma.rating.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { score: true, createdAt: true },
  });

  // Total stats
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT" } });
  const totalComplaints = await prisma.complaint.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  const resolvedComplaints = await prisma.complaint.count({
    where: { status: "RESOLVED", updatedAt: { gte: sevenDaysAgo } },
  });

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(2)
    : "N/A";

  // Credit transactions
  const creditTransactions = await prisma.creditTransaction.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const totalCreditsDistributed = creditTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Users list
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      hostel: true,
      credits: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Format data for charts
  const chartData = {
    attendance: attendanceTrends.map((a) => ({
      date: new Date(a.date).toLocaleDateString(),
      mealType: a.mealType,
      count: a._count,
    })),
    ratings: ratings.map((r) => ({
      date: new Date(r.createdAt).toLocaleDateString(),
      score: r.score,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System analytics and management</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgRating}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complaints (7d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {resolvedComplaints}/{totalComplaints}
            </p>
            <p className="text-xs text-muted-foreground">resolved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Credits Distributed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCreditsDistributed.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users ({users.length})</TabsTrigger>
          <TabsTrigger value="credits">Credit Ledger</TabsTrigger>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Trends & Analytics</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsCharts data={chartData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user roles and access</CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement users={users} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits">
          <Card>
            <CardHeader>
              <CardTitle>Credit Ledger</CardTitle>
              <CardDescription>Track credit distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <CreditLedger transactions={creditTransactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements">
          <Card>
            <CardHeader>
              <CardTitle>Post Announcement</CardTitle>
              <CardDescription>Broadcast updates to all users</CardDescription>
            </CardHeader>
            <CardContent>
              <AnnouncementForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
