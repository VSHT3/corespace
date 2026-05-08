import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your Corespace account.",
};

export default function ResetCompleteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
