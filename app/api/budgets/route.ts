import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { budgets, budgetItems, clientHistoryEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID, randomBytes } from "crypto";

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
  const items = Array.isArray(body?.itens) ? body.itens : [];
  const validItems = items
    .filter((i: { nome?: string; valor?: number }) => i.nome?.trim() && Number(i.valor) > 0)
    .map((i: { nome: string; valor: number }) => ({ nome: i.nome.trim(), valorCentavos: Math.round(Number(i.valor) * 100) }));

  if (!body?.clientId || validItems.length === 0) {
    return NextResponse.json({ error: "Selecione um cliente e ao menos um item válido." }, { status: 400 });
  }

  const total = validItems.reduce((s: number, i: { valorCentavos: number }) => s + i.valorCentavos, 0);
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
    total,
    publicToken,
  });

  for (const item of validItems) {
    await db.insert(budgetItems).values({
      id: randomUUID(),
      budgetId: id,
      nome: item.nome,
      valor: item.valorCentavos,
    });
  }

  await db.insert(clientHistoryEvents).values({
    id: randomUUID(),
    clientId: body.clientId,
    description: `Orçamento ${numero} criado`,
  });

  return NextResponse.json({ ok: true, id });
}
