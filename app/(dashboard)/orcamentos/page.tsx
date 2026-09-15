import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, clients } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function OrcamentosPage() {
  const user = await getCurrentUser();
  const rows = await db
    .select({
      id: budgets.id,
      numero: budgets.numero,
      status: budgets.status,
      total: budgets.total,
      createdAt: budgets.createdAt,
      clientName: clients.nome,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .where(eq(budgets.companyId, user!.companyId))
    .orderBy(desc(budgets.createdAt));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Orçamentos</h1>
          <p className="text-slate-500 text-sm mt-1">{rows.length} orçamentos registrados</p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md"
        >
          Novo orçamento
        </Link>
      </div>

      <div className="grid gap-3">
        {rows.map((b) => (
          <Link
            key={b.id}
            href={`/orcamentos/${b.id}`}
            className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 hover:border-blue-300"
          >
            <div className="sm:w-32 shrink-0">
              <div className="text-xs text-slate-400" style={{ fontFamily: "ui-monospace, monospace" }}>
                {b.numero}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{formatDate(b.createdAt)}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-900">{b.clientName}</div>
            </div>
            <div className="text-right sm:w-32 shrink-0 font-semibold text-slate-900">{formatBRL(b.total)}</div>
            <div className="sm:w-32 shrink-0 flex justify-end">
              <StatusBadge status={b.status} />
            </div>
          </Link>
        ))}
        {rows.length === 0 && <p className="text-sm text-slate-400 text-center py-8">Nenhum orçamento ainda.</p>}
      </div>
    </div>
  );
}
