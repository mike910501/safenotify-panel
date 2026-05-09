import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { Sidebar } from "@/components/features/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  return (
    <div className="flex h-screen bg-background">
      <Sidebar usuario={usuario} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
