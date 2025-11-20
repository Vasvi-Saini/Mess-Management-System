import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MESS_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { date, mealType, items, specialItem } = await request.json();

    const menu = await prisma.menu.upsert({
      where: {
        date_mealType: {
          date: new Date(date),
          mealType,
        },
      },
      update: { items, specialItem },
      create: {
        date: new Date(date),
        mealType,
        items,
        specialItem,
      },
    });

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Menu error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");

    const date = dateStr ? new Date(dateStr) : new Date();
    date.setHours(0, 0, 0, 0);

    const menus = await prisma.menu.findMany({
      where: {
        date: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      orderBy: { mealType: "asc" },
    });

    return NextResponse.json(menus);
  } catch (error) {
    console.error("Get menu error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
