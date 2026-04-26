import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TOKPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="flex flex-col flex-1 px-6 py-16 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <Link href="/dashboard" className="back-link">← Dashboard</Link>
      </div>

      <div className="mb-10 space-y-2">
        <p className="eyebrow">TOK</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Exhibition Helper</h1>
        <p style={{ color: "#555" }}>
          Build your TOK Exhibition from prompt selection to object justification.
        </p>
      </div>

      <div className="card text-center space-y-3" style={{ padding: "3rem" }}>
        <p className="heading" style={{ fontSize: "20px" }}>Coming soon</p>
        <p style={{ color: "#555", maxWidth: "28rem", margin: "0 auto" }}>
          Prompt selection, object analysis, and AI-powered justification tools
          are under construction.
        </p>
      </div>
    </main>
  );
}
