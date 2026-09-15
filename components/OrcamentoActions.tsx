"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

export default function OrcamentoActions({
  budgetId,
  status,
  publicToken,
}: {
  budgetId: string;
  status: string;
  publicToken: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/proposta/${publicToken}` : "";

  async function updateStatus(newStatus: string) {
    setLoading(true);
    await fetch(`/api/budgets/${budgetId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
      <h2 className="text-sm font-medium text-slate-700">Ações</h2>

      {status === "Rascunho" && (
        <button
          onClick={() => updateStatus("Enviado")}
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          Marcar como enviado
        </button>
      )}

      {(status === "Enviado" || status === "Aprovado" || status === "Recusado") && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Link público da proposta</label>
          <div className="flex gap-2">
            <input readOnly value={publicUrl} className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-md bg-slate-50" />
            <button onClick={copyLink} className="px-3 py-2 text-sm border border-slate-200 rounded-md hover:bg-slate-50 flex items-center gap-1">
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Envie esse link para o cliente aprovar ou recusar a proposta, sem precisar criar conta.
          </p>
        </div>
      )}

      {status === "Enviado" && (
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => updateStatus("Aprovado")}
            disabled={loading}
            className="text-xs text-emerald-700 hover:underline"
          >
            Marcar como aprovado manualmente
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={() => updateStatus("Recusado")}
            disabled={loading}
            className="text-xs text-rose-700 hover:underline"
          >
            Marcar como recusado
          </button>
        </div>
      )}
    </div>
  );
}
