import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const school = await prisma.school.findFirst({
      select: { logo: true },
    });

    return NextResponse.json({
      logo: school?.logo ?? "/logo.png",
    });
  } catch (error) {
    console.error("Error fetching school logo:", error);
    return NextResponse.json(
      { logo: "/logo.png", error: "Failed to fetch logo" },
      { status: 500 }
    );
  }
}
