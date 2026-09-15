"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

type Client = { id: string; nome: string };
type Item = {
  id: string;
  categoria: string;
  nome: string;
  observacoes: string;
  quantidade: string;
  unidade: string;
  valorUnitario: string;
  desconto: string;
};

const UNIDADES = ["Serviço", "Unidade", "Visita", "Hora", "m²", "Diária"];
const CATEGORIAS = ["Serviço", "Material", "Despesa", "Deslocamento", "Taxa", "ART/RRT", "Outro"];

function emptyItem(): Item {
  return {
    id: crypto.randomUUID(),
    categoria: "Serviço",
    nome: "",
    observacoes: "",
    quantidade: "1",
    unidade: "Serviço",
    valorUnitario: "",
    desconto: "0",
  };
}

export default function NovoOrcamentoForm({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [objeto, setObjeto] = useState("");
  const [validadeDias, setValidadeDias] = useState("15");
  const [condicaoPagamento, setCondicaoPagamento] = useState("");
  const [prazoExecucao, setPrazoExecucao] = useState("");
  const [escopoIncluso, setEscopoIncluso] = useState("");
  const [escopoNaoIncluso, setEscopoNaoIncluso] = useState("");
  const [items, setItems] = useState<Item[]>([emptyItem()]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }
  function updateItem(id: string, field: keyof Item, value: string) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  function itemTotal(i: Item) {
    const qtd = parseFloat(i.quantidade) || 0;
    const unit = parseFloat(i.valorUnitario) || 0;
    const desc = parseFloat(i.desconto) || 0;
    return Math.max(0, qtd * unit - desc);
  }

  const total = items.reduce((s, i) => s + itemTotal(i), 0);

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
        objeto,
        validadeDias: parseInt(validadeDias) || 15,
        condicaoPagamento,
        prazoExecucao,
        escopoIncluso,
        escopoNaoIncluso,
        itens: items.map((i) => ({
          nome: i.nome,
          categoria: i.categoria,
          observacoes: i.observacoes,
          quantidade: parseFloat(i.quantidade) || 1,
          unidade: i.unidade,
          valorUnitario: parseFloat(i.valorUnitario) || 0,
          desconto: parseFloat(i.desconto) || 0,
        })),
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
    <div className="max-w-3xl space-y-5">
      <div>
        <Link href="/orcamentos" className="text-sm text-blue-600 hover:underline">
          ← Voltar para orçamentos
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-2">Novo orçamento</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="text-sm text-rose-700 bg-rose-50 border-l-4 border-rose-300 px-3 py-2 rounded-r-md">
            {error}
          </div>
        )}

        {clients.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <p className="text-sm text-slate-500">
              Cadastre um cliente antes de criar um orçamento.{" "}
              <Link href="/clientes/novo" className="text-blue-600 hover:underline">
                Cadastrar cliente
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-medium text-slate-700">Dados gerais</h2>
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
                <label className="block text-xs font-medium text-slate-600 mb-1">Objeto da proposta</label>
                <textarea
                  value={objeto}
                  onChange={(e) => setObjeto(e.target.value)}
                  placeholder="Ex: Prestação de serviços técnicos para elaboração de projeto elétrico residencial..."
                  className={inputClass}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Validade (dias)</label>
                  <input
                    type="number"
                    value={validadeDias}
                    onChange={(e) => setValidadeDias(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Prazo de execução</label>
                  <input
                    value={prazoExecucao}
                    onChange={(e) => setPrazoExecucao(e.target.value)}
                    placeholder="Ex: 20 dias úteis"
                    className={inputClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Condição de pagamento</label>
                <input
                  value={condicaoPagamento}
                  onChange={(e) => setCondicaoPagamento(e.target.value)}
                  placeholder="Ex: 50% na aprovação + 50% na entrega"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-slate-700">Itens do orçamento</h2>
                <button type="button" onClick={addItem} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <Plus size={14} /> Adicionar item
                </button>
              </div>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="border border-slate-100 rounded-md p-3 space-y-2">
                    <div className="flex gap-2">
                      <input
                        value={item.nome}
                        onChange={(e) => updateItem(item.id, "nome", e.target.value)}
                        placeholder="Ex: Projeto estrutural"
                        className="flex-1 min-w-0 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={item.categoria}
                        onChange={(e) => updateItem(item.id, "categoria", e.target.value)}
                        className="shrink-0 w-28 sm:w-36 px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CATEGORIAS.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-rose-500">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Qtd.</label>
                        <input
                          type="number"
                          value={item.quantidade}
                          onChange={(e) => updateItem(item.id, "quantidade", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Unidade</label>
                        <select
                          value={item.unidade}
                          onChange={(e) => updateItem(item.id, "unidade", e.target.value)}
                          className={inputClass}
                        >
                          {UNIDADES.map((u) => (
                            <option key={u}>{u}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Valor unit. (R$)</label>
                        <input
                          type="number"
                          value={item.valorUnitario}
                          onChange={(e) => updateItem(item.id, "valorUnitario", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400 mb-0.5">Desconto (R$)</label>
                        <input
                          type="number"
                          value={item.desconto}
                          onChange={(e) => updateItem(item.id, "desconto", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <input
                      value={item.observacoes}
                      onChange={(e) => updateItem(item.id, "observacoes", e.target.value)}
                      placeholder="Observações do item (opcional)"
                      className={inputClass + " text-xs"}
                    />
                    <div className="text-right text-xs text-slate-500">
                      Total do item:{" "}
                      <span className="font-medium text-slate-800">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(itemTotal(item))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-sm text-slate-600">Total geral</span>
                <span className="text-lg font-semibold text-slate-900">
                  {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
              <h2 className="text-sm font-medium text-slate-700">Escopo</h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">O que está incluso (um item por linha)</label>
                <textarea
                  value={escopoIncluso}
                  onChange={(e) => setEscopoIncluso(e.target.value)}
                  placeholder={"Levantamento das informações\nDesenvolvimento do projeto\nEntrega digital"}
                  className={inputClass}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">O que não está incluso (um item por linha)</label>
                <textarea
                  value={escopoNaoIncluso}
                  onChange={(e) => setEscopoNaoIncluso(e.target.value)}
                  placeholder={"Taxas de órgãos públicos\nExecução da obra\nFornecimento de materiais"}
                  className={inputClass}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
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
