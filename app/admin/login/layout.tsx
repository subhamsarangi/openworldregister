import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal Login | Langtoo",
  description: "Secure passcode entry for the Langtoo administration panel.",
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
