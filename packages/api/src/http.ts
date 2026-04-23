import { NextResponse } from "next/server";
import { toErrorPayload } from "./errors";

export async function routeHandler<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const payload = toErrorPayload(error);
    return NextResponse.json({ ok: false, message: payload.message }, { status: payload.status });
  }
}
