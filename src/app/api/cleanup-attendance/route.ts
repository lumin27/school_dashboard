import { cleanupOldAttendance } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await cleanupOldAttendance();
    return NextResponse.json({
      message: "Old attendance records cleaned up successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to clean up attendance records." },
      { status: 500 }
    );
  }
}
