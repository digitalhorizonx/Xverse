import { NextResponse } from "next/server";
import { ContentError } from "./showcases";

const STATUS: Record<ContentError["code"], number> = {
  not_found: 404,
  slug_taken: 409,
  invalid_transition: 400,
  forbidden_transition: 403,
  missing_translations: 422,
  invalid_blocks: 422,
  published_delete: 400,
};

/** Uniform ContentError → HTTP mapping for the admin content routes. */
export function contentErrorResponse(error: unknown): NextResponse | null {
  if (error instanceof ContentError) {
    return NextResponse.json({ error: error.code, detail: error.detail ?? null }, { status: STATUS[error.code] });
  }
  return null;
}
