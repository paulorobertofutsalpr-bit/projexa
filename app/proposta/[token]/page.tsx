import { notFound } from "next/navigation";
import { db } from "@/db";
import { budgets, budgetItems, clients, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import PropostaActions from "@/components/PropostaActions";
import ContractPartiesHeader from "@/components/ContractPartiesHeader";

export const dynamic = "force-dynamic";

export default async function PropostaPublicaPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const rows = await db
    .select({
      id: budgets.id,
      numero: budgets.numero,
      status: budgets.status,
      total: budgets.total,
      createdAt: budgets.createdAt,
      client: clients,
      company: companies,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .innerJoin(companies, eq(budgets.companyId, companies.id))
    .where(eq(budgets.publicToken, token));

  const budget = rows[0];
  if (!budget) notFound();

  const items = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, budget.id));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="text-white" style={{ backgroundColor: "#0B1D3A" }}>
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 mb-4">
            {budget.company.logoData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={budget.company.logoData} alt={budget.company.name} className="w-8 h-8 rounded object-contain" />
            ) : (
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-semibold text-sm">Pj</div>
            )}
            <span className="font-semibold">{budget.company.name}</span>
          </div>
          <h1 className="text-2xl font-semibold">Proposta {budget.numero}</h1>
          <p className="text-blue-200 text-sm mt-1">
            Para {budget.client.nome} · {formatDate(budget.createdAt)}
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-5">
        <ContractPartiesHeader company={budget.company} client={budget.client} />

        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
          {items.map((i) => (
            <div key={i.id} className="px-5 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">{i.nome}</span>
                <span className="font-medium text-slate-900">{formatBRL(i.valor)}</span>
              </div>
              {i.observacoes && <div className="text-xs text-slate-400 mt-1">{i.observacoes}</div>}
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-sm font-medium text-slate-600">Total</span>
            <span className="text-lg font-semibold text-slate-900">{formatBRL(budget.total)}</span>
          </div>
        </div>

        <PropostaActions token={token} status={budget.status} />
      </div>
    </div>
  );
}
