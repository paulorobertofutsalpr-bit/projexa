"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, FileText, FolderKanban, Settings, LogOut } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/projetos", label: "Projetos", icon: FolderKanban },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function Sidebar({
  userName,
  companyName,
  logoData,
}: {
  userName: string;
  companyName: string;
  logoData?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col" style={{ backgroundColor: "#0B1D3A" }}>
      <div className="h-16 flex items-center gap-2 px-6 border-b border-white/10">
        {logoData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoData} alt={companyName} className="w-8 h-8 rounded object-contain bg-white/5" />
        ) : (
          <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
            Pj
          </div>
        )}
        <span className="text-white font-semibold text-lg tracking-tight truncate">{companyName || "Projexa"}</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={1.75} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-xs text-slate-400 px-2 mb-2">
          <div className="text-slate-200 font-medium">{userName}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-300 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
