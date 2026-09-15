import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED = ["Planejamento", "Em andamento", "Em revisão", "Aguardando cliente", "Pausado", "Concluído", "Cancelado"];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado." }, { status: 401 });

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  const update: { status: string; progresso?: number } = { status };
  if (status === "Concluído") update.progresso = 100;

  await db
    .update(projects)
    .set(update)
    .where(and(eq(projects.id, id), eq(projects.companyId, user.companyId)));

  return NextResponse.json({ ok: true });
}
