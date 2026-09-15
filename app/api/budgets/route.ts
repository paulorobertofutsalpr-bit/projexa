import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, budgetItems, clientHistoryEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID, randomBytes } from "crypto";

type ItemInput = {
  nome?: string;
  categoria?: string;
  observacoes?: string;
  quantidade?: number;
  unidade?: string;
  valorUnitario?: number;
  desconto?: number;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const rows = await db.select().from(budgets).where(eq(budgets.companyId, user.companyId));
  return NextResponse.json({ budgets: rows });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const items = Array.isArray(body?.itens) ? (body.itens as ItemInput[]) : [];

  const validItems = items
    .filter((i) => i.nome?.trim() && Number(i.valorUnitario) > 0)
    .map((i) => {
      const quantidade = Number(i.quantidade) || 1;
      const valorUnitarioCentavos = Math.round(Number(i.valorUnitario) * 100);
      const descontoCentavos = Math.round((Number(i.desconto) || 0) * 100);
      const totalCentavos = Math.max(0, Math.round(quantidade * valorUnitarioCentavos) - descontoCentavos);
      return {
        nome: i.nome!.trim(),
        categoria: i.categoria?.trim() || "Serviço",
        observacoes: i.observacoes?.trim() || null,
        quantidade,
        unidade: i.unidade?.trim() || "Serviço",
        valorUnitarioCentavos,
        descontoCentavos,
        totalCentavos,
      };
    });

  if (!body?.clientId || validItems.length === 0) {
    return NextResponse.json({ error: "Selecione um cliente e ao menos um item válido." }, { status: 400 });
  }

  const total = validItems.reduce((s, i) => s + i.totalCentavos, 0);
  const id = randomUUID();
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  const numero = `ORC-${year}-${seq}`;
  const publicToken = randomBytes(16).toString("hex");

  await db.insert(budgets).values({
    id,
    companyId: user.companyId,
    clientId: body.clientId,
    numero,
    status: "Rascunho",
    objeto: body.objeto || null,
    validadeDias: Number(body.validadeDias) > 0 ? Number(body.validadeDias) : 15,
    condicaoPagamento: body.condicaoPagamento || null,
    prazoExecucao: body.prazoExecucao || null,
    escopoIncluso: body.escopoIncluso || null,
    escopoNaoIncluso: body.escopoNaoIncluso || null,
    observacoesComerciais: body.observacoesComerciais || null,
    total,
    publicToken,
  });

  for (const item of validItems) {
    await db.insert(budgetItems).values({
      id: randomUUID(),
      budgetId: id,
      categoria: item.categoria,
      nome: item.nome,
      observacoes: item.observacoes,
      quantidade: item.quantidade,
      unidade: item.unidade,
      valorUnitario: item.valorUnitarioCentavos,
      desconto: item.descontoCentavos,
      valor: item.totalCentavos,
    });
  }

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: body.clientId,
    description: `Orçamento ${numero} criado`,
  });

  return NextResponse.json({ ok: true, id });
}
