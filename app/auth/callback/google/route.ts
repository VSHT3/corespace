import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");

  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  if (!savedState || savedState !== state) {
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  cookieStore.delete("google_oauth_state");

  const redirectUri = `${origin}/auth/callback/google`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenResponse.json();

  if (!tokens.id_token) {
    console.error("Google token exchange failed:", tokens);
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error: signInError } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: tokens.id_token,
  });

  if (signInError) {
    console.error("Supabase signInWithIdToken error:", signInError);
    return NextResponse.redirect(`${origin}/login?error=google_auth_failed`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
