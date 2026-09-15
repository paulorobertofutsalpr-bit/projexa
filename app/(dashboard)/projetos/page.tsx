import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { projects, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import ProjetosKanban from "@/components/ProjetosKanban";

export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const user = await getCurrentUser();

  const rows = await db
    .select({
      id: projects.id,
      numero: projects.numero,
      nome: projects.nome,
      status: projects.status,
      progresso: projects.progresso,
      prazo: projects.prazo,
      prioridade: projects.prioridade,
      clientName: clients.nome,
    })
    .from(projects)
    .innerJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.companyId, user!.companyId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Projetos</h1>
        <p className="text-slate-500 text-sm mt-1">{rows.length} projetos · altere o status para atualizar o andamento</p>
      </div>
      <ProjetosKanban projects={rows} />
    </div>
  );
}
