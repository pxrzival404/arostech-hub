export const runtime = 'edge'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-4">
          <a href="/tracking" className="flex items-center text-foreground hover:text-primary">Dashboard</a>
          <a href="/projects" className="flex items-center text-foreground hover:text-primary">Projects</a>
        </div>
        <div className="ml-auto flex items-center">
          <span className="text-sm text-slate-600">Welcome,</span>
          <span className="font-semibold text-foreground">Client User</span>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>

      <footer className="mt-auto py-6 text-center text-slate-600 text-sm border-t border-slate-200">
        <p>© 2026 DBSN. All rights reserved.</p>
      </footer>
    </div>
  );
}
