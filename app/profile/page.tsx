import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DeleteAccountButton from "./DeleteAccountButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const createdAt = new Date(user.created_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("user_id", user.id);

  const exhibitionCount = exhibitions?.length ?? 0;

  const emailConfirmed = !!user.email_confirmed_at;

  return (
    <main className="page-main">
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Account</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Profile</h1>
      </div>

      <div className="card space-y-5">
        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Email</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <p style={{ fontSize: "15px" }}>{user.email}</p>
            {emailConfirmed ? (
              <span className="tag tag-mint" style={{ fontSize: "10px" }}>Verified</span>
            ) : (
              <span className="tag tag-yellow" style={{ fontSize: "10px" }}>Unverified</span>
            )}
          </div>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Member since</p>
          <p style={{ fontSize: "15px" }}>{createdAt}</p>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Plan</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="tag tag-mint">Free</span>
            <Link href="/pricing" className="back-link" style={{ fontSize: "12px" }}>
              Upgrade →
            </Link>
          </div>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.75rem" }}>TOK Progress</p>
          <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
            <div>
              <span className="heading" style={{ fontSize: "24px", display: "block" }}>{exhibitionCount}</span>
              <span className="eyebrow">Exhibition{exhibitionCount !== 1 ? "s" : ""}</span>
            </div>
            <Link href="/dashboard/tok/exhibition" className="btn-ghost btn-ghost-hover" style={{ fontSize: "11px", padding: "5px 12px" }}>
              Open TOK →
            </Link>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Actions</p>
            <p style={{ fontSize: "13px", color: "#888" }}>Manage your account</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <Link href="/forgot-password" className="btn-ghost btn-ghost-hover" style={{ fontSize: "11px", padding: "5px 12px" }}>
              Change password
            </Link>
            <LogoutButton />
          </div>
        </div>

        <div className="divider" />

        <div>
          <p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Danger zone</p>
          <DeleteAccountButton />
        </div>
      </div>
    </main>
  );
}
