import { NextResponse } from "next/server";
import { MediaError } from "./service";

const STATUS: Record<MediaError["code"], number> = {
  too_large: 413,
  unsupported_type: 415,
  decode_failed: 422,
  not_found: 404,
  in_use: 409,
  duplicate: 409,
};

/** Uniform MediaError → HTTP mapping for the admin media routes. */
export function mediaErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof MediaError) {
    return NextResponse.json({ error: error.code, detail: error.detail ?? null }, { status: STATUS[error.code] });
  }
  return null;
}
