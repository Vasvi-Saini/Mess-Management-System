import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealAttendanceCard } from "@/components/student/meal-attendance-card";
import { RatingForm } from "@/components/student/rating-form";
import { ComplaintForm } from "@/components/student/complaint-form";
import { AnnouncementList } from "@/components/shared/announcement-list";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  if (session.user.role === "MESS_MANAGER") {
    redirect("/manager");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true, ratingStreak: true, name: true },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMenus = await prisma.menu.findMany({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    include: {
      attendances: {
        where: { userId: session.user.id },
      },
      ratings: {
        where: { userId: session.user.id },
      },
    },
    orderBy: { mealType: "asc" },
  });

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { expiresAt: null },
        { expiresAt: { gte: new Date() } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Manage your meals and provide feedback</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">Credits: {user?.credits?.toFixed(2) || 0}</Badge>
          <Badge variant="outline">Streak: {user?.ratingStreak || 0}</Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Today&apos;s Meals</CardTitle>
            <CardDescription>Mark your attendance for meals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {["BREAKFAST", "LUNCH", "DINNER"].map((mealType) => {
                const menu = todayMenus.find((m) => m.mealType === mealType);
                const attendance = menu?.attendances[0];
                const rating = menu?.ratings[0];

                return (
                  <MealAttendanceCard
                    key={mealType}
                    mealType={mealType}
                    menu={menu}
                    attendance={attendance}
                    hasRated={!!rating}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rate a Meal</CardTitle>
            <CardDescription>Provide feedback for meals you attended</CardDescription>
          </CardHeader>
          <CardContent>
            <RatingForm menus={todayMenus} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Complaint</CardTitle>
            <CardDescription>Report issues or suggestions</CardDescription>
          </CardHeader>
          <CardContent>
            <ComplaintForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest updates from management</CardDescription>
          </CardHeader>
          <CardContent>
            <AnnouncementList announcements={announcements} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
