import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, content, priority, expiresAt } = await request.json();

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Announcement error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      where: {
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: new Date() } },
        ],
      },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Get announcements error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
