import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard | Langtoo",
  description: "Configure featured languages, writing systems, and manage learning content on Langtoo.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
