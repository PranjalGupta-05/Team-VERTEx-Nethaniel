import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function GET() {
  try {
    const summary = store.dashboardSummary();
    return NextResponse.json({ data: summary });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
  }
}
