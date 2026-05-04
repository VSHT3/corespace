import { type NextRequest, NextResponse } from "next/server";

// Supabase sends the user here with #access_token in the fragment after clicking reset link.
// Fragments don't reach the server, so redirect to a client page that reads them.
export async function GET(request: NextRequest) {
  const url = new URL("/auth/reset/complete", request.url);
  // Preserve any query params Supabase may send
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return NextResponse.redirect(url);
}
