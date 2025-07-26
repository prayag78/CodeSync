import { NextRequest, NextResponse } from "next/server";

// POST /api/execution
export async function POST(req: NextRequest) {
  try {
    const { language, code, input } = await req.json();
    console.log(language, code, input);

    // Call the Piston API
    const pistonRes = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language,
        version: "*",
        files: [{ name: "main", content: code }],
        stdin: input,
      }),
    });

    const data = await pistonRes.json();
    const result = data.run?.output || data.run?.stdout || data.run?.stderr || "No output";

    return NextResponse.json({ result });
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
