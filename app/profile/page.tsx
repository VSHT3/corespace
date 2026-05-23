import React from "react";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";
import DeleteAccountButton from "./DeleteAccountButton";
import UsernameForm from "./UsernameForm";
import NotificationPrefs from "./NotificationPrefs";
import AiDashboardToggle from "./AiDashboardToggle";

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

  const emailConfirmed = !!user.email_confirmed_at;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, email_study_tips, email_product_updates, show_ai_limit_on_dashboard")
    .eq("id", user.id)
    .single();

  const { data: exhibitions } = await supabase
    .from("tok_exhibitions")
    .select("id")
    .eq("user_id", user.id);

  const exhibitionIds = (exhibitions ?? []).map((e) => e.id);

  let aiCalls = 0;
  if (exhibitionIds.length > 0) {
    const { data: objects } = await supabase
      .from("tok_objects")
      .select("justification, scores")
      .in("exhibition_id", exhibitionIds);

    aiCalls = (objects ?? []).reduce((count, o) => {
      let c = 0;
      if (o.justification?.trim()) c += 1;
      if (o.scores && typeof o.scores === "object" && !Array.isArray(o.scores) && Object.keys(o.scores).length > 0) {
        c += 1;
      }
      return count + c;
    }, 0);
  }

  const aiLimit = 20;
  const aiPct = Math.min((aiCalls / aiLimit) * 100, 100);

  function Card({ accent, title, children }: { accent: string; title: string; children: React.ReactNode }) {
    const items = React.Children.toArray(children);
    return (
      <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", width: "100%" }}>
        <div style={{ height: "4px", background: accent, flexShrink: 0 }} />
        <div style={{ padding: "1rem 1.25rem 1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
          <p className="eyebrow" style={{ marginBottom: "0.75rem", textAlign: "center" }}>{title}</p>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
            {items.map((item, i) => (
              <div key={i} style={{ borderBottom: i < items.length - 1 ? "1px solid #e0e0e0" : "none", paddingBottom: i < items.length - 1 ? "0.65rem" : 0 }}>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "4rem 2rem", boxSizing: "border-box", animation: "fadeUp 0.28s ease both" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p className="eyebrow">Settings</p>
        <h1 className="heading" style={{ fontSize: "36px" }}>Account</h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", alignItems: "stretch" }}>
        {/* Column 1 — Profile */}
        <Card accent="var(--yellow)" title="Profile">
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.15rem" }}>Email</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
              <p style={{ fontSize: "14px" }}>{user.email}</p>
              {emailConfirmed ? (
                <span className="tag tag-mint" style={{ fontSize: "9px" }}>Verified</span>
              ) : (
                <span className="tag tag-yellow" style={{ fontSize: "9px" }}>Unverified</span>
              )}
            </div>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.15rem" }}>Username</p>
            <UsernameForm initialUsername={profile?.username ?? null} />
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.15rem" }}>Member since</p>
            <p style={{ fontSize: "14px" }}>{createdAt}</p>
          </div>
          <div>
            <p className="eyebrow" style={{ marginBottom: "0.3rem" }}>Plan</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="tag tag-mint">Free</span>
              <Link href="/pricing" className="back-link" style={{ fontSize: "12px" }}>Upgrade →</Link>
            </div>
          </div>
        </Card>

        {/* Column 2 — AI Usage + Privacy */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ flex: 1, display: "flex" }}>
            <Card accent="var(--mint)" title="AI Usage">
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "20px", fontWeight: 700, fontFeatureSettings: "'tnum'" }}>{aiCalls}</span>
                  <span style={{ fontSize: "12px", color: "#888" }}>/ {aiLimit} this month</span>
                </div>
                <div style={{ width: "100%", height: "6px", borderRadius: "3px", background: "#eee", overflow: "hidden" }}>
                  <div style={{ width: `${aiPct}%`, height: "100%", background: aiPct >= 80 ? "var(--pink)" : "var(--mint)", borderRadius: "3px", transition: "width 0.3s" }} />
                </div>
                <p style={{ fontSize: "11px", color: "#888", marginTop: "0.4rem", lineHeight: 1.4 }}>
                  Free tier: {aiLimit} AI calls/month. Upgrade for unlimited.
                </p>
                <div style={{ borderTop: "1px solid #e0e0e0", marginTop: "0.5rem", paddingTop: "0.5rem" }}>
                  <AiDashboardToggle initialShow={profile?.show_ai_limit_on_dashboard ?? true} />
                </div>
              </div>
            </Card>
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            <Card accent="var(--sky)" title="Privacy">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href="/privacy" className="back-link" style={{ fontSize: "13px" }}>Privacy Policy →</Link>
                <Link href="/terms" className="back-link" style={{ fontSize: "13px" }}>Terms of Service →</Link>
                <Link href="/contact" className="back-link" style={{ fontSize: "13px" }}>Contact Support →</Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Column 3 — Notifications + Account + Danger zone */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ flex: 1, display: "flex" }}>
            <Card accent="var(--pink)" title="Notifications">
              <NotificationPrefs
                initialStudyTips={profile?.email_study_tips ?? true}
                initialProductUpdates={profile?.email_product_updates ?? true}
              />
            </Card>
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            <Card accent="var(--yellow)" title="Account">
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                <Link href="/forgot-password" className="btn-ghost btn-ghost-hover" style={{ fontSize: "11px", padding: "5px 12px", width: "100%", maxWidth: "220px", textAlign: "center" }}>
                  Change password
                </Link>
                <div style={{ width: "100%", maxWidth: "220px" }}><LogoutButton /></div>
              </div>
            </Card>
          </div>
          <div style={{ flex: 1, display: "flex" }}>
            <Card accent="var(--pink)" title="Danger zone">
              <div style={{ display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", maxWidth: "220px" }}>
                  <DeleteAccountButton />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
