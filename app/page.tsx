import { db } from "@/db";
import { companies, users } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let companyList: { id: string; name: string; document: string | null }[] = [];
  let userCount = 0;
  let dbError: string | null = null;

  try {
    companyList = await db.select().from(companies);
    const userRows = await db.select().from(users);
    userCount = userRows.length;
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Erro desconhecido ao conectar no banco.";
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header
        className="text-white"
        style={{ backgroundColor: "#0B1D3A" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded bg-blue-600 flex items-center justify-center font-semibold">
              Pj
            </div>
            <span className="text-xl font-semibold tracking-tight">Projexa</span>
          </div>
          <h1 className="text-3xl font-semibold mb-2">A base do sistema está no ar 🎉</h1>
          <p className="text-blue-200 max-w-xl">
            Esta é a Fase 0 do roadmap: projeto Next.js publicado, conectado ao banco
            PostgreSQL, com autenticação e multiempresa por vir nas próximas fases.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-sm font-medium text-slate-500 mb-3">Status da conexão com o banco</h2>
          {dbError ? (
            <div className="flex items-start gap-3 px-4 py-3 border-l-4 border-rose-300 bg-rose-50 rounded-r-md">
              <span className="text-rose-700 text-sm">
                Não foi possível conectar ao banco: {dbError}
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-3 px-4 py-3 border-l-4 border-emerald-300 bg-emerald-50 rounded-r-md">
              <span className="text-emerald-700 text-sm">
                Conectado com sucesso. {companyList.length} empresa(s) e {userCount} usuário(s) cadastrados.
              </span>
            </div>
          )}
        </div>

        {companyList.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {companyList.map((c) => (
              <div key={c.id} className="px-6 py-4">
                <div className="font-medium text-slate-900">{c.name}</div>
                <div className="text-sm text-slate-500">{c.document}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
