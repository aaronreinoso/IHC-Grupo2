import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

type MetricTone = "info" | "success" | "warning" | "danger" | "neutral";
type EstadoFiltro = "todos" | "saludable" | "atencion" | "critico" | "sin-tareas";
type OrdenPlanes = "fecha-desc" | "fecha-asc" | "producto-asc" | "progreso-desc" | "progreso-asc" | "errores-desc";
type SeveridadFiltro = "todas" | "Alta" | "Media" | "Baja";

type EstadoPlan = "Saludable" | "Atención" | "Crítico" | "Sin tareas";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  tone: MetricTone;
  helper?: string;
}

interface PlanDashboard {
  id: string;
  producto: string;
  modulo_evaluado?: string | null;
  objetivo: string;
  fecha: string;
  created_at?: string | null;
  tareasTotal: number;
  observacionesExitosas: number;
  observacionesTotal: number;
  erroresTotal: number;
  progreso: number;
  estado: EstadoPlan;
}

interface TareaDashboard {
  id: string;
  prueba_id: string;
}

interface ObservacionDashboard {
  tarea_id: string | null;
  exito: boolean | null;
  errores: number | null;
}

interface HallazgoDashboard {
  severidad: "Alta" | "Media" | "Baja" | string | null;
}

const toneStyles: Record<
  MetricTone,
  {
    border: string;
    bg: string;
    text: string;
    iconBg: string;
    iconText: string;
    badge: string;
  }
> = {
  info: {
    border: "border-blue-200",
    bg: "bg-blue-50",
    text: "text-blue-800",
    iconBg: "bg-blue-100",
    iconText: "text-blue-800",
    badge: "bg-blue-100 text-blue-800",
  },
  success: {
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-800",
  },
  warning: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-900",
    iconBg: "bg-amber-100",
    iconText: "text-amber-900",
    badge: "bg-amber-100 text-amber-900",
  },
  danger: {
    border: "border-red-300",
    bg: "bg-red-50",
    text: "text-red-800",
    iconBg: "bg-red-100",
    iconText: "text-red-800",
    badge: "bg-red-100 text-red-800",
  },
  neutral: {
    border: "border-gray-200",
    bg: "bg-white",
    text: "text-gray-800",
    iconBg: "bg-gray-100",
    iconText: "text-gray-800",
    badge: "bg-gray-100 text-gray-800",
  },
};

const estadoStyles: Record<EstadoPlan, string> = {
  Saludable: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Atención: "bg-amber-100 text-amber-900 border-amber-200",
  Crítico: "bg-red-100 text-red-800 border-red-200",
  "Sin tareas": "bg-gray-100 text-gray-700 border-gray-200",
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  tone,
  helper,
}) => {
  const style = toneStyles[tone];

  return (
    <article
      className={`rounded-2xl border ${style.border} ${style.bg} p-5 shadow-sm transition-shadow hover:shadow-md`}
      aria-label={`${title}: ${value}. ${description}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-gray-700">
            {title}
          </p>
          <p className={`mt-2 text-4xl font-extrabold ${style.text}`}>{value}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${style.iconBg} ${style.iconText}`}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm leading-5 text-gray-700">{description}</p>

      {helper && (
        <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${style.badge}`}>
          {helper}
        </span>
      )}
    </article>
  );
};

const formatDate = (date: string) => {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEstadoPlan = (progreso: number, observacionesTotal: number, erroresTotal: number): EstadoPlan => {
  if (observacionesTotal === 0) return "Sin tareas";
  if (progreso >= 80 && erroresTotal <= 2) return "Saludable";
  if (progreso >= 50) return "Atención";
  return "Crítico";
};

const getEstadoTone = (estado: EstadoPlan): MetricTone => {
  if (estado === "Saludable") return "success";
  if (estado === "Atención") return "warning";
  if (estado === "Crítico") return "danger";
  return "neutral";
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  const [planes, setPlanes] = useState<PlanDashboard[]>([]);
  const [hallazgos, setHallazgos] = useState<HallazgoDashboard[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");
  const [severidadFiltro, setSeveridadFiltro] = useState<SeveridadFiltro>("todas");
  const [ordenPlanes, setOrdenPlanes] = useState<OrdenPlanes>("fecha-desc");

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setError("");
    setLoading(true);

    try {
      const [planesResponse, tareasResponse, observacionesResponse, hallazgosResponse] = await Promise.all([
        supabase
          .from("pruebas_usabilidad")
          .select("id, producto, modulo_evaluado, objetivo, fecha, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("tareas").select("id, prueba_id"),
        supabase.from("observaciones").select("tarea_id, exito, errores"),
        supabase.from("hallazgos").select("severidad"),
      ]);

      if (planesResponse.error) throw planesResponse.error;
      if (tareasResponse.error) throw tareasResponse.error;
      if (observacionesResponse.error) throw observacionesResponse.error;
      if (hallazgosResponse.error) throw hallazgosResponse.error;

      const tareas = (tareasResponse.data || []) as TareaDashboard[];
      const observaciones = (observacionesResponse.data || []) as ObservacionDashboard[];
      const hallazgosData = (hallazgosResponse.data || []) as HallazgoDashboard[];

      const tareasPorPlan = tareas.reduce<Record<string, TareaDashboard[]>>((acc, tarea) => {
        if (!acc[tarea.prueba_id]) acc[tarea.prueba_id] = [];
        acc[tarea.prueba_id].push(tarea);
        return acc;
      }, {});

      const observacionesPorTarea = observaciones.reduce<Record<string, ObservacionDashboard[]>>((acc, obs) => {
        if (!obs.tarea_id) return acc;
        if (!acc[obs.tarea_id]) acc[obs.tarea_id] = [];
        acc[obs.tarea_id].push(obs);
        return acc;
      }, {});

      const planesNormalizados = (planesResponse.data || []).map((plan) => {
        const tareasDelPlan = tareasPorPlan[plan.id] || [];
        const observacionesDelPlan = tareasDelPlan.flatMap((tarea) => observacionesPorTarea[tarea.id] || []);
        const observacionesExitosas = observacionesDelPlan.filter((obs) => obs.exito === true).length;
        const tareasTotal = tareasDelPlan.length;
        const observacionesTotal = observacionesDelPlan.length;
        const erroresTotal = observacionesDelPlan.reduce((acc, obs) => acc + (obs.errores || 0), 0);
        const progreso = observacionesTotal > 0 ? Math.round((observacionesExitosas / observacionesTotal) * 100) : 0;
        const estado = getEstadoPlan(progreso, observacionesTotal, erroresTotal);

        return {
          id: plan.id,
          producto: plan.producto || "Producto sin nombre",
          modulo_evaluado: plan.modulo_evaluado,
          objetivo: plan.objetivo || "Sin objetivo registrado",
          fecha: plan.fecha,
          created_at: plan.created_at,
          tareasTotal,
          observacionesExitosas,
          observacionesTotal,
          erroresTotal,
          progreso,
          estado,
        } satisfies PlanDashboard;
      });

      setPlanes(planesNormalizados);
      setHallazgos(hallazgosData);
    } catch (err) {
      console.error("Error cargando el dashboard:", err);
      setError("No se pudo cargar la información del dashboard. Revisa la conexión o intenta actualizar los datos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const actualizarDashboard = async () => {
    setRefreshing(true);
    await cargarDatosDashboard();
  };

  const metricas = useMemo(() => {
    const observacionesTotal = planes.reduce((acc, plan) => acc + plan.observacionesTotal, 0);
    const erroresTotal = planes.reduce((acc, plan) => acc + plan.erroresTotal, 0);
    const tareasTotal = planes.reduce((acc, plan) => acc + plan.tareasTotal, 0);
    const observacionesExitosas = planes.reduce((acc, plan) => acc + plan.observacionesExitosas, 0);
    const tasaExito = observacionesTotal > 0 ? Math.round((observacionesExitosas / observacionesTotal) * 100) : 0;

    return {
      planes: planes.length,
      tareas: tareasTotal,
      observacionesExitosas,
      observaciones: observacionesTotal,
      tasaExito,
      totalErrores: erroresTotal,
      saludables: planes.filter((plan) => plan.estado === "Saludable").length,
      atencion: planes.filter((plan) => plan.estado === "Atención").length,
      criticos: planes.filter((plan) => plan.estado === "Crítico").length,
      sinTareas: planes.filter((plan) => plan.estado === "Sin tareas").length,
    };
  }, [planes]);

  const hallazgosFiltrados = useMemo(() => {
    if (severidadFiltro === "todas") return hallazgos;
    return hallazgos.filter((hallazgo) => hallazgo.severidad === severidadFiltro);
  }, [hallazgos, severidadFiltro]);

  const severidad = useMemo(() => ({
    alta: hallazgosFiltrados.filter((h) => h.severidad === "Alta").length,
    media: hallazgosFiltrados.filter((h) => h.severidad === "Media").length,
    baja: hallazgosFiltrados.filter((h) => h.severidad === "Baja").length,
  }), [hallazgosFiltrados]);

  const planesFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    const filtrados = planes.filter((plan) => {
      const coincideBusqueda =
        !query ||
        plan.producto.toLowerCase().includes(query) ||
        plan.objetivo.toLowerCase().includes(query) ||
        (plan.modulo_evaluado || "").toLowerCase().includes(query);

      const coincideEstado =
        estadoFiltro === "todos" ||
        (estadoFiltro === "saludable" && plan.estado === "Saludable") ||
        (estadoFiltro === "atencion" && plan.estado === "Atención") ||
        (estadoFiltro === "critico" && plan.estado === "Crítico") ||
        (estadoFiltro === "sin-tareas" && plan.estado === "Sin tareas");

      return coincideBusqueda && coincideEstado;
    });

    return [...filtrados].sort((a, b) => {
      if (ordenPlanes === "fecha-asc") return new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      if (ordenPlanes === "producto-asc") return a.producto.localeCompare(b.producto, "es");
      if (ordenPlanes === "progreso-desc") return b.progreso - a.progreso;
      if (ordenPlanes === "progreso-asc") return a.progreso - b.progreso;
      if (ordenPlanes === "errores-desc") return b.erroresTotal - a.erroresTotal;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  }, [planes, busqueda, estadoFiltro, ordenPlanes]);

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("todos");
    setSeveridadFiltro("todas");
    setOrdenPlanes("fecha-desc");
  };

  const filtrosActivos = busqueda || estadoFiltro !== "todos" || severidadFiltro !== "todas" || ordenPlanes !== "fecha-desc";
  const estadoDominante = metricas.criticos > 0 ? "Crítico" : metricas.atencion > 0 ? "Atención" : metricas.sinTareas > 0 ? "Sin tareas" : "Saludable";
  const estadoTone = getEstadoTone(estadoDominante);

  const getSuccessTone = (): MetricTone => {
    if (metricas.tasaExito >= 80) return "success";
    if (metricas.tasaExito >= 50) return "warning";
    return metricas.observaciones === 0 ? "neutral" : "danger";
  };

  const getSuccessDescription = () => {
    if (metricas.observaciones === 0) return "Sin observaciones registradas para calcular desempeño.";
    if (metricas.tasaExito >= 80) return "Buen desempeño: la mayoría de tareas se completan correctamente.";
    if (metricas.tasaExito >= 50) return "Atención: hay tareas que podrían necesitar ajustes de diseño.";
    return "Crítico: la mayoría de usuarios no está completando las tareas.";
  };

  const getErrorTone = (): MetricTone => {
    if (metricas.totalErrores === 0) return "success";
    if (metricas.totalErrores <= 5) return "warning";
    return "danger";
  };

  const getErrorDescription = () => {
    if (metricas.totalErrores === 0) return "Excelente: no se han registrado errores en las observaciones.";
    if (metricas.totalErrores <= 5) return "Revisar: existen algunos errores que pueden afectar la experiencia.";
    return "Prioridad alta: los errores pueden estar dificultando el uso del sistema.";
  };

  const getSeverityPercentage = (value: number) => {
    if (hallazgosFiltrados.length === 0) return 0;
    return Math.round((value / hallazgosFiltrados.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4" role="status" aria-live="polite">
        <span className="sr-only">Cargando dashboard</span>
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
        <p className="text-sm font-semibold text-gray-600">Cargando métricas, filtros y estado general...</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 animate-fade-in">
      <button
        aria-label="Mostrar ayuda del dashboard"
        className="fixed right-8 top-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        onClick={() => setShowHelp((prev) => !prev)}
        type="button"
      >
        <span className="text-2xl font-bold" aria-hidden="true">?</span>
      </button>

      {showHelp && (
        <div
          className="fixed right-8 top-20 z-50 max-w-sm rounded-xl border border-blue-200 bg-white p-4 shadow-lg animate-fade-in"
          role="dialog"
          aria-label="Ayuda del dashboard"
        >
          <p className="mb-1 font-bold text-blue-800">Ayuda rápida</p>
          <p className="mb-2 text-sm leading-6 text-blue-800">
            El dashboard aplica visibilidad del estado del sistema, filtros, ordenación y agrupación lógica. Usa los controles para reducir carga cognitiva y priorizar planes críticos, siguiendo criterios de Nielsen, Shneiderman, Cañas y análisis emocional.
          </p>
          <button
            className="mt-1 rounded text-xs font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => setShowHelp(false)}
            type="button"
          >
            Cerrar
          </button>
        </div>
      )}

      <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="font-semibold text-blue-700 hover:text-blue-900 hover:underline">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-bold text-gray-900" aria-current="page">Dashboard de Usabilidad</li>
        </ol>
      </nav>

      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
              Orientación y contexto
            </span>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Dashboard de Usabilidad</h1>
            <p className="mt-2 max-w-3xl text-gray-600">
              Revisa el estado de las pruebas, filtra información relevante, ordena los planes y detecta dónde intervenir primero.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${toneStyles[estadoTone].border} ${toneStyles[estadoTone].bg}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Estado global</p>
            <p className={`mt-1 text-2xl font-extrabold ${toneStyles[estadoTone].text}`}>{estadoDominante}</p>
            <p className="mt-1 text-sm text-gray-700">
              {metricas.criticos} críticos · {metricas.atencion} en atención · {metricas.saludables} saludables
            </p>
          </div>
        </div>
      </header>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5" role="alert" aria-live="assertive">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-semibold text-red-800">{error}</p>
            <button
              type="button"
              onClick={actualizarDashboard}
              className="rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Reintentar
            </button>
          </div>
        </section>
      )}

      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de métricas principales">
        <MetricCard
          title="Planes visibles"
          value={planesFiltrados.length}
          description={`De ${metricas.planes} planes registrados. La cifra cambia según búsqueda, estado y orden aplicado.`}
          icon="📋"
          tone="info"
          helper="Métrica filtrable"
        />

        <MetricCard
          title="Tareas registradas"
          value={metricas.tareas}
          description="Cantidad de tareas diseñadas para las pruebas de usabilidad."
          icon="✅"
          tone="info"
          helper={`${metricas.observaciones} observaciones`}
        />

        <MetricCard
          title="Tasa de éxito"
          value={`${metricas.tasaExito}%`}
          description={getSuccessDescription()}
          icon="🎯"
          tone={getSuccessTone()}
          helper={`${metricas.observacionesExitosas} observaciones con éxito`}
        />

        <MetricCard
          title="Errores registrados"
          value={metricas.totalErrores}
          description={getErrorDescription()}
          icon="⚠️"
          tone={getErrorTone()}
          helper="Prioridad de atención"
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" aria-label="Filtros y ordenación del dashboard">
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-lg font-bold text-gray-900">Filtros, ordenación y estado de la información</h2>
          <p className="text-sm text-gray-600">
            Estos controles reducen la carga visual: primero filtra, luego ordena y finalmente actúa sobre el plan con mayor prioridad.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Buscar plan</span>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Producto, módulo u objetivo..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              aria-label="Buscar por producto, módulo u objetivo"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Estado del plan</span>
            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as EstadoFiltro)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              aria-label="Filtrar planes por estado"
            >
              <option value="todos">Todos los estados</option>
              <option value="saludable">Saludable</option>
              <option value="atencion">Atención</option>
              <option value="critico">Crítico</option>
              <option value="sin-tareas">Sin tareas</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Hallazgos</span>
            <select
              value={severidadFiltro}
              onChange={(event) => setSeveridadFiltro(event.target.value as SeveridadFiltro)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              aria-label="Filtrar hallazgos por severidad"
            >
              <option value="todas">Todas las severidades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-gray-700">Ordenar planes</span>
            <select
              value={ordenPlanes}
              onChange={(event) => setOrdenPlanes(event.target.value as OrdenPlanes)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              aria-label="Ordenar planes de prueba"
            >
              <option value="fecha-desc">Fecha: más recientes</option>
              <option value="fecha-asc">Fecha: más antiguos</option>
              <option value="producto-asc">Producto: A-Z</option>
              <option value="progreso-desc">Progreso: mayor a menor</option>
              <option value="progreso-asc">Progreso: menor a mayor</option>
              <option value="errores-desc">Errores: mayor prioridad</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-gray-600" aria-live="polite">
            Mostrando {planesFiltrados.length} de {metricas.planes} planes. Hallazgos visibles: {hallazgosFiltrados.length}.
          </p>

          <div className="flex flex-wrap gap-2">
            {filtrosActivos && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
              >
                Limpiar filtros
              </button>
            )}
            <button
              type="button"
              onClick={actualizarDashboard}
              disabled={refreshing}
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? "Actualizando..." : "Actualizar datos"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3" aria-label="Detalle agrupado del dashboard">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6">
            <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
              Priorización heurística
            </span>
            <h2 className="mt-3 text-lg font-bold text-gray-900">Hallazgos por severidad</h2>
            <p className="mt-1 text-sm text-gray-600">
              Agrupación por impacto para facilitar reconocimiento antes que memoria y apoyar decisiones rápidas.
            </p>
          </div>

          {hallazgosFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">No hay hallazgos para el filtro seleccionado.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {[
                { label: "Alta", value: severidad.alta, color: "bg-red-600", text: "text-red-800" },
                { label: "Media", value: severidad.media, color: "bg-amber-500", text: "text-amber-900" },
                { label: "Baja", value: severidad.baja, color: "bg-emerald-600", text: "text-emerald-800" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={`inline-flex items-center gap-2 font-bold ${item.text}`}>
                      <span className={`h-3 w-3 rounded-full ${item.color}`} aria-hidden="true" />
                      {item.label}
                    </span>
                    <span className="font-bold text-gray-800">
                      {item.value} · {getSeverityPercentage(item.value)}%
                    </span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-gray-100" aria-label={`Severidad ${item.label}: ${item.value} hallazgos`}>
                    <div className={`h-4 rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${getSeverityPercentage(item.value)}%` }} />
                  </div>
                </div>
              ))}

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <strong>Lectura emocional:</strong> rojo indica urgencia y posible frustración del usuario; amarillo sugiere fricción; verde indica bajo impacto.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
                Planes ordenables
              </span>
              <h2 className="mt-3 text-lg font-bold text-gray-900">Planes de prueba</h2>
              <p className="mt-1 text-sm text-gray-600">
                Tabla interactiva con estado, avance según observaciones exitosas, errores y acción principal claramente visible.
              </p>
            </div>

            <Link
              to="/planes-prueba"
              className="rounded text-sm font-bold text-blue-700 hover:text-blue-900 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Ver todos &rarr;
            </Link>
          </div>

          {metricas.planes === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">No has creado ningún plan de prueba aún.</p>
              <Link
                to="/planes-prueba/nuevo"
                className="mt-4 inline-block rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Crear el primer plan
              </Link>
            </div>
          ) : planesFiltrados.length === 0 ? (
            <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
              <p className="text-sm font-bold text-amber-900">No hay planes que coincidan con los filtros actuales.</p>
              <button
                type="button"
                onClick={limpiarFiltros}
                className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 focus:outline-none focus:ring-4 focus:ring-amber-200"
              >
                Mostrar todos los planes
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">Planes de prueba filtrados y ordenados por el usuario</caption>
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Producto</th>
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Estado</th>
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Progreso</th>
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Errores</th>
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Fecha</th>
                    <th className="px-3 py-3 text-sm font-bold text-gray-600">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {planesFiltrados.map((plan) => (
                    <tr key={plan.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-3 py-4 text-sm">
                        <p className="font-bold text-gray-900">{plan.producto}</p>
                        <p className="mt-1 max-w-xs truncate text-xs text-gray-500" title={plan.objetivo}>{plan.objetivo}</p>
                      </td>

                      <td className="px-3 py-4 text-sm">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${estadoStyles[plan.estado]}`}>
                          {plan.estado}
                        </span>
                      </td>

                      <td className="px-3 py-4 text-sm">
                        <div className="flex min-w-36 items-center gap-2">
                          <div className="h-2 w-24 rounded-full bg-gray-100" aria-hidden="true">
                            <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${plan.progreso}%` }} />
                          </div>
                          <span className="font-semibold text-gray-700">{plan.progreso}%</span>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-sm font-semibold text-gray-700">{plan.erroresTotal}</td>
                      <td className="px-3 py-4 text-sm font-semibold text-gray-600">{formatDate(plan.fecha)}</td>
                      <td className="px-3 py-4 text-sm">
                        <Link
                          to={`/planes-prueba/${plan.id}`}
                          className="inline-flex rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200"
                          aria-label={`Gestionar tareas del plan ${plan.producto}`}
                        >
                          Gestionar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
