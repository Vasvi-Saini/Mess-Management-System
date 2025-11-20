import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { menuId, mealType, optedIn } = await request.json();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.mealAttendance.upsert({
      where: {
        userId_date_mealType: {
          userId: session.user.id,
          date: today,
          mealType,
        },
      },
      update: { optedIn },
      create: {
        userId: session.user.id,
        menuId,
        date: today,
        mealType,
        optedIn,
      },
    });

    // If opting out, add credit
    if (!optedIn) {
      const creditAmount = mealType === "LUNCH" ? 50 : mealType === "DINNER" ? 60 : 30;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits: { increment: creditAmount } },
      });

      await prisma.creditTransaction.create({
        data: {
          userId: session.user.id,
          amount: creditAmount,
          reason: `Opted out of ${mealType}`,
          date: today,
          mealType,
        },
      });
    }

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendances = await prisma.mealAttendance.findMany({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: { user: { select: { name: true, hostel: true } } },
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
