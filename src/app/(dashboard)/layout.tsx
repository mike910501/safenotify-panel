import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { DashboardBackground } from "@/components/features/layout/DashboardBackground";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-deep-1)" }}>
      <DashboardBackground />
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-auto bg-transparent">{children}</main>
    </div>
  );
}
