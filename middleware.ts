import { NextResponse, type NextRequest } from "next/server";

const windowMs = 60_000;
const maxRequests = 80;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous";
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return NextResponse.next();
  }

  if (bucket.count >= maxRequests) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  bucket.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/intake/:path*", "/api/:path*"]
};
