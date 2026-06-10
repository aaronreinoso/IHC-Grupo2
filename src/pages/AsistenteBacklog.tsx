import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "../supabaseClient";
import type { PlanPruebaShort, PruebaUsabilidad, Observacion } from "../types/plan";

/* ============================================================================
   AsistenteBacklog.tsx · Google Gemini (GRATIS) · análisis automático del repo

   Un solo botón: la app reúne internamente el código fuente del proyecto
   (embebido en compilación con import.meta.glob, sin subir archivos ni ejecutar
   repomix), lo envía a Gemini y devuelve directamente el Sprint Backlog en .md.

   API key (gratis): https://aistudio.google.com/apikey
   .env.local →  VITE_GEMINI_API_KEY=AIza...
   ============================================================================ */

const MODEL = "gemini-2.5-flash"; // alternativa con más cupo: "gemini-2.5-flash-lite"
const MAX_CODE_CHARS = 600_000;

const ENV_KEY =
  ((import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_GEMINI_API_KEY as string | undefined) ?? "";

/* ---- Código fuente embebido en compilación (equivalente a lo que haría repomix) ---- */
const sourceModules = import.meta.glob(
  ["/src/**/*.{ts,tsx,js,jsx,css}", "/package.json", "/index.html", "/vite.config.ts"],
  { query: "?raw", import: "default", eager: true }
) as Record<string, string>;

function buildSnapshot(): string {
  const entries = Object.entries(sourceModules).sort(([a], [b]) => a.localeCompare(b));
  let out = "Snapshot del proyecto (estructura tipo Repomix)\n\n<files>\n";
  for (const [path, content] of entries) {
    out += `<file path="${path}">\n${content}\n</file>\n\n`;
  }
  out += "</files>\n";
  return out;
}

async function fetchPlanData(planId: string) {
  const { data: plan } = await supabase
    .from("pruebas_usabilidad")
    .select("*")
    .eq("id", planId)
    .single();

  const { data: observations } = await supabase
    .from("observaciones")
    .select("*, tareas!inner(*)")
    .eq("tareas.prueba_id", planId);

  return { 
    plan: plan as PruebaUsabilidad | null, 
    observations: (observations || []) as (Observacion & { tareas: { escenario: string } })[] 
  };
}

function buildObservationsPrompt(
  modulo: string,
  numSprints: string,
  escala: string,
  plan: PruebaUsabilidad,
  observations: (Observacion & { tareas: { escenario: string } })[]
): string {
  const obsText = observations
    .map(
      (o, i) =>
        `Hallazgo #${i + 1}:
- Tarea: ${o.tareas?.escenario || "N/A"}
- Éxito: ${o.exito ? "Sí" : "No"}
- Tiempo: ${o.tiempo_segundos}s | Errores: ${o.errores}
- Problema: ${o.problema_detectado}
- Severidad: ${o.severidad}
- Mejora prop.: ${o.mejora_propuesta || "N/A"}
- Comentarios: ${o.comentarios || "N/A"}`
    )
    .join("\n\n");

  return `Actúa como evaluador experto en usabilidad y Scrum Master. Te paso los resultados de una prueba de usabilidad real.
    PLAN DE PRUEBA:
    - Producto: ${plan.producto}
    - Objetivo: ${plan.objetivo}
    - Metodología: ${plan.metodologia}

    HALLAZGOS DETECTADOS:
    ${obsText}

    PASO 1 (interno): analiza los hallazgos contra ISO 9241-11 (Eficacia, Eficiencia, Satisfacción) y prioriza los problemas de severidad "Crítica" y "Alta".
    PASO 2: genera un SPRINT BACKLOG profesional para el "${modulo}".

    REQUISITOS DEL BACKLOG:
    - Distribuye el trabajo en ${numSprints} sprint(s). Escala de estimación: ${escala}.
    - Agrupa en ÉPICAS coherentes basadas en los problemas encontrados.
    - Cada historia: "Como [rol], quiero [meta], para [beneficio]", con criterios de aceptación (2-3 verificables), estimación, prioridad y sprint.
    - Cada historia debe mitigar directamente uno o más de los hallazgos citados.
    - Inicia con una nota de contexto ISO 9241-11 de MÁXIMO 2 frases sobre el estado de usabilidad del producto.
    - Cierra con "## Resumen por sprint".

    ESTRUCTURA OBLIGATORIA:
    # Sprint Backlog — ${modulo}
    (2 frases de contexto ISO 9241-11)
    ## Épica 1: <nombre>
    ### HU-01 — <título>
    - **Historia:** Como ..., quiero ..., para ...
    - **Criterios de aceptación:** ...
    - **Estimación:** X pts · **Prioridad:** Alta/Media/Baja · **Sprint:** N
    - **Referencia hallazgo:** Hallazgo #X
    ## Resumen por sprint

    FORMATO: devuelve ÚNICAMENTE el Sprint Backlog en Markdown válido en español (sin bloques \`\`\`). No muestres la lista de hallazgos por separado.`;
}

/* ---- llamada a Gemini ---- */
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey.trim() },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Error ${res.status} de Gemini. ${detail.slice(0, 180)}`);
  }
  const data = await res.json();
  const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
    .map((p: { text?: string }) => p.text ?? "")
    .join("")
    .replace(/```(?:md|markdown|xml)?/g, "")
    .trim();
  if (!text) throw new Error("Gemini no devolvió contenido. Inténtalo de nuevo.");
  return text;
}

/* ---- mini renderizador Markdown ---- */
function inline(text: string, key: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (/^\*\*[^*]+\*\*$/.test(p))
      return <strong key={`${key}-${i}`} className="font-semibold text-gray-900">{p.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(p))
      return <code key={`${key}-${i}`} className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.8em] font-mono text-gray-800">{p.slice(1, -1)}</code>;
    return <span key={`${key}-${i}`}>{p}</span>;
  });
}
function renderMarkdown(md: string) {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  const flush = () => {
    if (list.length) {
      out.push(<ul key={`ul${out.length}`} className="my-2 space-y-1.5">{list}</ul>);
      list = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      const t = line.replace(/^\s*[-*]\s+/, "");
      list.push(
        <li key={`li${idx}`} className="relative pl-5 text-sm text-gray-700 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rotate-45 before:rounded-[1px] before:bg-blue-600">
          {inline(t, `li${idx}`)}
        </li>
      );
      return;
    }
    flush();
    if (/^#{3}\s+/.test(line))
      out.push(<h3 key={idx} className="mt-5 mb-1.5 text-base font-semibold text-gray-900">{inline(line.replace(/^#{3}\s+/, ""), String(idx))}</h3>);
    else if (/^#{2}\s+/.test(line))
      out.push(<h2 key={idx} className="mt-6 mb-2 border-b-2 border-blue-100 pb-1.5 text-lg font-bold text-blue-900">{inline(line.replace(/^#{2}\s+/, ""), String(idx))}</h2>);
    else if (/^#\s+/.test(line))
      out.push(<h1 key={idx} className="mt-6 mb-2 text-xl font-bold text-gray-900">{inline(line.replace(/^#\s+/, ""), String(idx))}</h1>);
    else if (/^(-{3,}|_{3,})$/.test(line))
      out.push(<hr key={idx} className="my-5 border-gray-200" />);
    else if (line.trim() === "")
      out.push(<div key={idx} className="h-1" />);
    else
      out.push(<p key={idx} className="my-2 text-sm leading-relaxed text-gray-700">{inline(line, String(idx))}</p>);
  });
  flush();
  return out;
}

export default function AsistenteBacklog() {
  const [sourceMode, setSourceMode] = useState<"repo" | "plan">("repo");
  const [planes, setPlanes] = useState<PlanPruebaShort[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [modulo, setModulo] = useState("Módulo de IA de Usabilidad");
  const [numSprints, setNumSprints] = useState("3");
  const [escala, setEscala] = useState("Fibonacci (1,2,3,5,8,13)");
  const [apiKey, setApiKey] = useState(ENV_KEY);
  const [loading, setLoading] = useState(false);
  const [backlog, setBacklog] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPlanes() {
      const { data } = await supabase
        .from("pruebas_usabilidad")
        .select("id, producto, duracion")
        .order("created_at", { ascending: false });
      if (data) setPlanes(data as PlanPruebaShort[]);
    }
    fetchPlanes();
  }, []);

  const numArchivos = useMemo(() => Object.keys(sourceModules).length, []);

  async function generar() {
    if (!apiKey.trim())
      return toast.error("Falta la API key (defínela en .env.local o pégala abajo).");

    setLoading(true);
    setBacklog("");

    try {
      let prompt = "";

      if (sourceMode === "repo") {
        if (numArchivos === 0) throw new Error("No se encontró código fuente embebido.");
        const snapshot = buildSnapshot().slice(0, MAX_CODE_CHARS);
        prompt = `Actúa como evaluador experto en usabilidad y Scrum Master. Te paso el código fuente de una aplicación React.
    PASO 1 (interno, no lo muestres): analiza el código contra ISO 9241-11, WCAG 2.1 AA, las 10 heurísticas de Nielsen y principios de Diseño Centrado en el Usuario, detectando problemas REALES y concretos (cita archivos).
    PASO 2: a partir de esos hallazgos, genera DIRECTAMENTE un SPRINT BACKLOG profesional para el "${modulo}".
    REQUISITOS DEL BACKLOG:
    - Distribuye el trabajo en ${numSprints} sprint(s). Escala de estimación: ${escala}.
    - Agrupa en ÉPICAS coherentes (Accesibilidad WCAG, Heurísticas de Nielsen, Validación con usuarios, Fundamentos del módulo).
    - Cada historia: "Como [rol], quiero [meta], para [beneficio]", con criterios de aceptación (2-3 verificables), estimación, prioridad y sprint.
    - Cada historia referencia el principio que atiende (ISO 9241-11, WCAG o Nielsen) y, si aplica, el archivo afectado.
    - Inicia con una nota de contexto ISO 9241-11 de MÁXIMO 2 frases.
    - Cierra con "## Resumen por sprint".

    ESTRUCTURA OBLIGATORIA:
    # Sprint Backlog — ${modulo}
    (2 frases de contexto ISO 9241-11)
    ## Épica 1: <nombre>
    ### HU-01 — <título>
    - **Historia:** Como ..., quiero ..., para ...
    - **Criterios de aceptación:** ...
    - **Estimación:** X pts · **Prioridad:** Alta/Media/Baja · **Sprint:** N
    - **Principio / archivo:** ...
    ## Resumen por sprint

    FORMATO: devuelve ÚNICAMENTE el Sprint Backlog en Markdown válido en español (sin bloques \`\`\`). No muestres la lista de hallazgos por separado.

    CÓDIGO FUENTE DEL PROYECTO:
    ${snapshot}`;
      } else {
        if (!selectedPlanId) throw new Error("Selecciona un Plan de Prueba primero.");
        const { plan, observations } = await fetchPlanData(selectedPlanId);
        if (!plan) throw new Error("No se pudo obtener la información del plan.");
        if (!observations || observations.length === 0)
          throw new Error("El plan seleccionado no tiene observaciones registradas.");

        prompt = buildObservationsPrompt(modulo || plan.producto, numSprints, escala, plan, observations);
      }

      const text = await callGemini(apiKey, prompt);
      setBacklog(text);
      toast.success("Sprint backlog generado");
      setTimeout(() => resultRef.current?.focus(), 60);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al generar el backlog.");
    } finally {
      setLoading(false);
    }
  }

  function descargar() {
    const stamp = new Date().toISOString().slice(0, 10);
    const md = `<!-- Generado por el Asistente IA de Usabilidad (Gemini) · ${stamp} -->\n# Sprint Backlog — ${modulo}\n\n${backlog}\n`;
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sprint-backlog-usabilidad-${stamp}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success("Descargando .md");
  }

  function descargarPDF() {
    window.print();
    toast.success("Abriendo diálogo de impresión...");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(backlog);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  const inputCls =
    "w-full min-h-[48px] rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Toaster position="top-right" />

      <header className="mb-6 no-print">
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
          Asistente IA · Usabilidad
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
          Generador de Sprint Backlog
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] text-gray-600">
          Con un clic, la IA analiza el código del proyecto (ISO 9241-11, WCAG y heurísticas de
          Nielsen) y genera el sprint backlog, descargable como{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.85em]">.md</code>.
          <span className="mt-1 block text-xs text-gray-500">
            {numArchivos} archivos del proyecto se analizan automáticamente.
          </span>
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm no-print">
        {/* Selector de modo */}
        <div className="mb-6 flex rounded-xl border-2 border-gray-100 bg-gray-50 p-1">
          <button
            onClick={() => setSourceMode("repo")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              sourceMode === "repo"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Análisis de Repositorio
          </button>
          <button
            onClick={() => setSourceMode("plan")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-all ${
              sourceMode === "plan"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Observaciones de Usuario
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {sourceMode === "repo" ? (
            <div>
              <label htmlFor="modulo" className="mb-1.5 block text-sm font-semibold text-gray-800">
                Nombre del módulo / proyecto
              </label>
              <input
                id="modulo"
                className={inputCls}
                value={modulo}
                onChange={(e) => setModulo(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label htmlFor="plan" className="mb-1.5 block text-sm font-semibold text-gray-800">
                Seleccionar Plan de Prueba
              </label>
              <select
                id="plan"
                className={inputCls}
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                <option value="">Seleccione un plan...</option>
                {planes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.producto}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="sprints" className="mb-1.5 block text-sm font-semibold text-gray-800">
              Número de sprints
            </label>
            <select
              id="sprints"
              className={inputCls}
              value={numSprints}
              onChange={(e) => setNumSprints(e.target.value)}
            >
              <option value="1">1 sprint</option>
              <option value="2">2 sprints</option>
              <option value="3">3 sprints</option>
              <option value="4">4 sprints</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="escala" className="mb-1.5 block text-sm font-semibold text-gray-800">
            Escala de estimación
          </label>
          <select
            id="escala"
            className={inputCls}
            value={escala}
            onChange={(e) => setEscala(e.target.value)}
          >
            <option>Fibonacci (1,2,3,5,8,13)</option>
            <option>Tallas (XS,S,M,L,XL)</option>
            <option>Lineal (1-10)</option>
          </select>
        </div>

        {!ENV_KEY && (
          <div className="mt-4">
            <label htmlFor="apikey" className="mb-1.5 block text-sm font-semibold text-gray-800">
              API key de Gemini{" "}
              <span className="font-normal text-gray-500">
                — o define VITE_GEMINI_API_KEY en .env.local
              </span>
            </label>
            <input
              id="apikey"
              type="password"
              className={inputCls}
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={generar}
          disabled={loading}
          aria-busy={loading}
          className="mt-5 inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-60"
        >
          {loading
            ? sourceMode === "repo"
              ? "Analizando proyecto y generando…"
              : "Analizando observaciones y generando…"
            : sourceMode === "repo"
            ? "Analizar proyecto y generar Sprint Backlog"
            : "Analizar observaciones y generar Sprint Backlog"}
        </button>
      </section>

      {backlog && (
        <section className="mt-6" aria-label="Sprint backlog generado">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 no-print">
            <h2 className="text-xl font-bold text-gray-900">Sprint Backlog generado</h2>
            <div className="flex gap-2">
              <button
                onClick={copiar}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Copiar
              </button>
              <button
                onClick={descargar}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border-2 border-gray-200 bg-gray-50 px-4 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Descargar .md
              </button>
              <button
                onClick={descargarPDF}
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              >
                Descargar PDF
              </button>
            </div>
          </div>
          <div
            ref={resultRef}
            tabIndex={-1}
            aria-live="polite"
            className="rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 print-container"
          >
            {renderMarkdown(backlog)}
          </div>
        </section>
      )}
    </div>
  );
}