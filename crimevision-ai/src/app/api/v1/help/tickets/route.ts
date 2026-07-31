import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, category, priority, description, email } = body;

    if (!subject || !description) {
      return NextResponse.json(
        { error: "Subject and description are required." },
        { status: 400 }
      );
    }

    const ticketId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticketId,
        subject,
        category: category || "General Technical Support",
        priority: priority || "MEDIUM",
        status: "OPEN",
        email: email || "investigator@crimevision.internal",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process support ticket" },
      { status: 500 }
    );
  }
}
