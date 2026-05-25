import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createExhibition } from "../actions";
import PromptPicker from "./PromptPicker";

export default async function ExhibitionEntryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // IB students do the exhibition once — if one exists, go straight to workspace
  const { data: existing } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    redirect(`/dashboard/tok/${existing.id}`);
  }

  return (
    <main className="page-main" style={{ maxWidth: "1400px" }}>
      <div className="mb-6">
        <Link href="/dashboard/tok" className="back-link">← TOK</Link>
      </div>

      <div className="mb-4 space-y-2">
        <p className="eyebrow">TOK Exhibition</p>
        <h1 className="heading" style={{ fontSize: "32px" }}>Choose your prompt</h1>
      </div>

      <PromptPicker createAction={createExhibition} />
    </main>
  );
}
