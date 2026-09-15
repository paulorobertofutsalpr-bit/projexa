import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { budgets, budgetItems, clients, companies } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { formatBRL, formatDate } from "@/lib/format";
import ContractPartiesHeader from "@/components/ContractPartiesHeader";
import ScopeList from "@/components/ScopeList";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ImprimirOrcamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rows = await db
    .select({
      numero: budgets.numero,
      objeto: budgets.objeto,
      validadeDias: budgets.validadeDias,
      condicaoPagamento: budgets.condicaoPagamento,
      prazoExecucao: budgets.prazoExecucao,
      escopoIncluso: budgets.escopoIncluso,
      escopoNaoIncluso: budgets.escopoNaoIncluso,
      total: budgets.total,
      createdAt: budgets.createdAt,
      client: clients,
      company: companies,
    })
    .from(budgets)
    .innerJoin(clients, eq(budgets.clientId, clients.id))
    .innerJoin(companies, eq(budgets.companyId, companies.id))
    .where(and(eq(budgets.id, id), eq(budgets.companyId, user.companyId)));

  const budget = rows[0];
  if (!budget) notFound();

  const items = await db.select().from(budgetItems).where(eq(budgetItems.budgetId, id));
  const dataValidade = new Date(budget.createdAt);
  dataValidade.setDate(dataValidade.getDate() + budget.validadeDias);

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto px-4 print:px-0">
        <div className="flex justify-end mb-4 print:hidden">
          <PrintButton />
        </div>
        <div className="bg-white rounded-lg border border-slate-200 print:border-0 p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              {budget.company.logoData ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={budget.company.logoData} alt={budget.company.name} className="w-10 h-10 object-contain" />
              ) : null}
              <span className="font-semibold text-slate-900">{budget.company.name}</span>
            </div>
            <div className="text-right text-sm">
              <div className="font-semibold text-slate-900">Proposta {budget.numero}</div>
              <div className="text-slate-500">{formatDate(budget.createdAt)}</div>
            </div>
          </div>

          <ContractPartiesHeader company={budget.company} client={budget.client} />

          {budget.objeto && (
            <div>
              <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Objeto da proposta</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line">{budget.objeto}</p>
            </div>
          )}

          <div>
            <h2 className="text-xs uppercase tracking-wide text-slate-400 mb-2">Escopo e valores</h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2">Serviço</th>
                  <th className="py-2 text-right">Qtd.</th>
                  <th className="py-2 text-right">Unit.</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100">
                    <td className="py-2">
                      {i.nome}
                      {i.observacoes && <div className="text-xs text-slate-400">{i.observacoes}</div>}
                    </td>
                    <td className="py-2 text-right">
                      {i.quantidade} {i.unidade}
                    </td>
                    <td className="py-2 text-right">{formatBRL(i.valorUnitario)}</td>
                    <td className="py-2 text-right">{formatBRL(i.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end mt-2">
              <div className="text-right">
                <div className="text-xs text-slate-400">Valor total da proposta</div>
                <div className="text-xl font-semibold text-slate-900">{formatBRL(budget.total)}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-slate-400">Validade</div>
              <div className="text-slate-800">{formatDate(dataValidade)}</div>
            </div>
            {budget.prazoExecucao && (
              <div>
                <div className="text-xs text-slate-400">Prazo de execução</div>
                <div className="text-slate-800">{budget.prazoExecucao}</div>
              </div>
            )}
            {budget.condicaoPagamento && (
              <div className="col-span-2">
                <div className="text-xs text-slate-400">Condição de pagamento</div>
                <div className="text-slate-800">{budget.condicaoPagamento}</div>
              </div>
            )}
          </div>

          {(budget.escopoIncluso || budget.escopoNaoIncluso) && (
            <div className="grid grid-cols-2 gap-4">
              <ScopeList title="O que está incluso" text={budget.escopoIncluso} tone="positive" />
              <ScopeList title="O que não está incluso" text={budget.escopoNaoIncluso} tone="negative" />
            </div>
          )}

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-400 text-center">
            {budget.company.name}
            {budget.company.phone ? ` · ${budget.company.phone}` : ""}
            {budget.company.email ? ` · ${budget.company.email}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
