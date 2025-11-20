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

    const { menuId, score, comment } = await request.json();

    if (score < 1 || score > 5) {
      return NextResponse.json({ error: "Score must be between 1 and 5" }, { status: 400 });
    }

    const rating = await prisma.rating.create({
      data: {
        userId: session.user.id,
        menuId,
        score,
        comment,
      },
    });

    // Update rating streak
    await prisma.user.update({
      where: { id: session.user.id },
      data: { ratingStreak: { increment: 1 } },
    });

    return NextResponse.json(rating);
  } catch (error) {
    console.error("Rating error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "7");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const ratings = await prisma.rating.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        menu: { select: { date: true, mealType: true } },
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(ratings);
  } catch (error) {
    console.error("Get ratings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
