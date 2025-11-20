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

    const { category, title, description, isAnonymous } = await request.json();

    const complaint = await prisma.complaint.create({
      data: {
        userId: isAnonymous ? null : session.user.id,
        category,
        title,
        description,
        isAnonymous,
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Complaint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Get complaints error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MESS_MANAGER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, response } = await request.json();

    const complaint = await prisma.complaint.update({
      where: { id },
      data: { status, response },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
