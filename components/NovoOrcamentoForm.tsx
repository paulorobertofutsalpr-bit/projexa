"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

type Client = { id: string; nome: string };
type Item = { id: string; nome: string; valor: string };

export default function NovoOrcamentoForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [items, setItems] = useState<Item[]>([{ id: "1", nome: "", valor: "" }]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  function addItem() {
    setItems((prev) => [...prev, { id: String(prev.length + 1) + Math.random(), nome: "", valor: "" }]);
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function updateItem(id: string, field: "nome" | "valor", value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  const total = items.reduce((s, i) => s + (parseFloat(i.valor) || 0), 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientId) {
      setError("Selecione um cliente.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        itens: items.map((i) => ({ nome: i.nome, valor: parseFloat(i.valor) || 0 })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      setLoading(false);
      return;
    }
    router.push(`/orcamentos/${data.id}`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <Link href="/orcamentos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para orçamentos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo orçamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
            {error}
          </div>
        )}

        {clients.length === 0 ? (
          <p className="text-sm text-slate-500">
            Cadastre um cliente antes de criar um orçamento.{" "}
            <Link href="/clientes/novo" className="text-blue-600 hover:underline">
              Cadastrar cliente
            </Link>
          </p>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cliente</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-slate-600">Itens do orçamento</label>
                <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={14} /> Adicionar item
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <input
                      value={item.nome}
                      onChange={(e) => updateItem(item.id, "nome", e.target.value)}
                      placeholder="Ex: Projeto estrutural"
                      className={inputClass + " flex-1"}
                    />
                    <input
                      value={item.valor}
                      onChange={(e) => updateItem(item.id, "valor", e.target.value)}
                      placeholder="R$"
                      type="number"
                      className={inputClass + " w-28"}
                    />
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-lg font-semibold text-slate-900">
                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/orcamentos" className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-md">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Salvando..." : "Salvar orçamento"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
