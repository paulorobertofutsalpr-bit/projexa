"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Project = {
  id: string;
  numero: string;
  nome: string;
  status: string;
  progresso: number;
  prazo: string | null;
  prioridade: string;
  clientName: string;
};

const STATUSES = ["Planejamento", "Em andamento", "Em revisão", "Aguardando cliente", "Pausado", "Concluído"];

export default function ProjetosKanban({ projects }: { projects: Project[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/projects/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {STATUSES.map((status) => {
        const items = projects.filter((p) => p.status === status);
        return (
          <div key={status} className="w-72 shrink-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <h3 className="text-sm font-medium text-slate-600">{status}</h3>
              <span className="text-xs text-slate-400">{items.length}</span>
            </div>
            <div className="space-y-2 bg-slate-100/70 rounded-lg p-2 min-h-[80px]">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-md border border-slate-200 p-3 shadow-sm">
                  <div className="text-xs text-slate-400 mb-1" style={{ fontFamily: "ui-monospace, monospace" }}>
                    {p.numero}
                  </div>
                  <Link href={`/projetos/${p.id}`} className="font-medium text-sm text-slate-900 mb-1 hover:text-blue-600 block">
                    {p.nome}
                  </Link>
                  <div className="text-xs text-slate-500 mb-2">{p.clientName}</div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${p.progresso}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">{p.prazo || "Sem prazo"}</span>
                    <select
                      value={p.status}
                      onChange={(e) => updateStatus(p.id, e.target.value)}
                      className="text-xs border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 bg-white"
                    >
                      {STATUSES.concat("Cancelado").map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
