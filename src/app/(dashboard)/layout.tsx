import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { BottomNav } from "@/components/features/layout/BottomNav";
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

      {/* Sidebar lateral — solo desktop */}
      <Sidebar usuario={usuario} />

      {/* Contenido principal — padding-bottom en mobile para que el bottom nav no tape nada */}
      <main className="flex-1 overflow-auto bg-transparent pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav — solo mobile */}
      <BottomNav />
    </div>
  );
}
