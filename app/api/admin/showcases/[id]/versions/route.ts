import { NextResponse } from "next/server";
import { adminRoute } from "@/lib/auth/adminRoute";
import { listVersions } from "@/lib/content/showcases";

export const GET = adminRoute("content.view", (_request, _auth, params) => {
  return NextResponse.json({ versions: listVersions(params.id!) });
});
