import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

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

  return (
    <main style={{ maxWidth: "640px", margin: "0 auto", padding: "4rem 1.5rem" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <p className="eyebrow">Account</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Profile</h1>
      </div>

      <div className="card space-y-5">
        <div>
          <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Email</p>
          <p style={{ fontSize: "15px" }}>{user.email}</p>
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

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.25rem" }}>Actions</p>
            <p style={{ fontSize: "13px", color: "#888" }}>Manage your account</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
