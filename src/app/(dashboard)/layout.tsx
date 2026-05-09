export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--sn-bg)]">
      {/* Sidebar placeholder — implementado en feat/sidebar */}
      <aside className="w-[200px] shrink-0 bg-[var(--sn-sidebar-bg)] hidden lg:block" />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
