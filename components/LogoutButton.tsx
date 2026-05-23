"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={handleLogout} className="btn-ghost btn-ghost-hover" style={{ fontSize: "11px", padding: "5px 12px", width: "100%" }}>
      Sign out
    </button>
  );
}
