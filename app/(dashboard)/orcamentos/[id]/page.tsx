import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, budgetItems, clients } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import OrcamentoActions from "@/components/OrcamentoActions";

export const dynamic = "force-dynamic";

export default async function OrcamentoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: budgets.id,
      numero: budgets.numero,
      status: budgets.status,
      total: budgets.total,
      createdAt: budgets.createdAt,
      publicToken: budgets.publicToken,
      approvedAt: budgets.approvedAt,
      clientName: clients.nome,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user!.companyId)));

  const budget = rows[0];
  if (!budget) notFound();

  const items = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/orcamentos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para orçamentos
        </Link>
        <div className="flex items-center justify-between mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{budget.numero}</h1>
            <p className="text-slate-500 text-sm">{budget.clientName}</p>
          </div>
          <StatusBadge status={budget.status} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between px-5 py-3 text-sm">
            <span className="text-slate-700">{i.nome}</span>
            <span className="font-medium text-slate-900">{formatBRL(i.valor)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-5 py-3">
          <span className="text-sm font-medium text-slate-600">Total</span>
          <span className="text-lg font-semibold text-slate-900">{formatBRL(budget.total)}</span>
        </div>
      </div>

      {budget.approvedAt && (
        <div className="text-sm text-emerald-700 bg-emerald-50 border-l-4 border-emerald-300 px-4 py-2 rounded-r-md">
          Aprovado pelo cliente em {formatDate(budget.approvedAt)}
        </div>
      )}

      <OrcamentoActions budgetId={budget.id} status={budget.status} publicToken={budget.publicToken} />
    </div>
  );
}
