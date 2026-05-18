import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

type MetricTone = "info" | "success" | "warning" | "danger" | "neutral";

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  tone: MetricTone;
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

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  tone,
}) => {
  const style = toneStyles[tone];

  return (
    <article
      className={`
        rounded-2xl
        border
        ${style.border}
        ${style.bg}
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-md
      `}
      aria-label={`${title}: ${value}. ${description}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-gray-700">
            {title}
          </p>

          <p className={`mt-2 text-4xl font-extrabold ${style.text}`}>
            {value}
          </p>
        </div>

        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-xl
            text-2xl
            ${style.iconBg}
            ${style.iconText}
          `}
          aria-hidden="true"
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-sm leading-5 text-gray-700">
        {description}
      </p>
    </article>
  );
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const [metricas, setMetricas] = useState({
    planes: 0,
    participantes: 0,
    tareas: 0,
    hallazgos: 0,
  });

  const [usabilidad, setUsabilidad] = useState({
    tasaExito: 0,
    totalErrores: 0,
  });

  const [severidad, setSeveridad] = useState({
    alta: 0,
    media: 0,
    baja: 0,
  });

  const [planesRecientes, setPlanesRecientes] = useState<any[]>([]);
  const [progresoPorPlan, setProgresoPorPlan] = useState<Record<string, { exitosas: number; total: number; porcentaje: number }>>({});

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarProgresoPorPlan = async (planes: any[]) => {
    const progreso: Record<string, { exitosas: number; total: number; porcentaje: number }> = {};
    
    for (const plan of planes) {
      const { count: countTareas } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', plan.id);
      
      const { data: obsExitosas } = await supabase
        .from('observaciones')
        .select('*')
        .eq('exito', true)
        .in('tarea_id', 
          (await supabase.from('tareas').select('id').eq('prueba_id', plan.id)).data?.map((t: any) => t.id) || []
        );
      
      const total = countTareas || 0;
      const exitosas = obsExitosas?.length || 0;
      const porcentaje = total > 0 ? Math.round((exitosas / total) * 100) : 0;
      
      progreso[plan.id] = { exitosas, total, porcentaje };
    }
    
    setProgresoPorPlan(progreso);
  };

  const cargarDatosDashboard = async () => {
    setLoading(true);

    try {
      const { count: countPlanes } = await supabase
        .from("pruebas_usabilidad")
        .select("*", { count: "exact", head: true });

      const { count: countParticipantes } = await supabase
        .from("participantes")
        .select("*", { count: "exact", head: true });

      const { count: countTareas } = await supabase
        .from("tareas")
        .select("*", { count: "exact", head: true });

      const { count: countHallazgos } = await supabase
        .from("hallazgos")
        .select("*", { count: "exact", head: true });

      setMetricas({
        planes: countPlanes || 0,
        participantes: countParticipantes || 0,
        tareas: countTareas || 0,
        hallazgos: countHallazgos || 0,
      });

      const { data: observaciones } = await supabase
        .from("observaciones")
        .select("exito, errores");

      if (observaciones && observaciones.length > 0) {
        const exitosas = observaciones.filter((obs) => obs.exito).length;
        const totalErrores = observaciones.reduce(
          (acc, obs) => acc + (obs.errores || 0),
          0
        );

        setUsabilidad({
          tasaExito: Math.round((exitosas / observaciones.length) * 100),
          totalErrores,
        });
      }

      const { data: hallazgosData } = await supabase
        .from("hallazgos")
        .select("severidad");

      if (hallazgosData) {
        setSeveridad({
          alta: hallazgosData.filter((h) => h.severidad === "Alta").length,
          media: hallazgosData.filter((h) => h.severidad === "Media").length,
          baja: hallazgosData.filter((h) => h.severidad === "Baja").length,
        });
      }

      const { data: recientes } = await supabase
        .from("pruebas_usabilidad")
        .select("id, producto, objetivo, fecha")
        .order("created_at", { ascending: false })
        .limit(4);

      if (recientes) {
        setPlanesRecientes(recientes);
        await cargarProgresoPorPlan(recientes);
      }
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessTone = (): MetricTone => {
    if (usabilidad.tasaExito >= 80) return "success";
    if (usabilidad.tasaExito >= 50) return "warning";
    return "danger";
  };

  const getSuccessDescription = () => {
    if (usabilidad.tasaExito >= 80) {
      return "Buen desempeño: la mayoría de tareas se completan correctamente.";
    }

    if (usabilidad.tasaExito >= 50) {
      return "Atención: hay tareas que podrían necesitar ajustes de diseño.";
    }

    return "Crítico: la mayoría de usuarios no está completando las tareas.";
  };

  const getErrorTone = (): MetricTone => {
    if (usabilidad.totalErrores === 0) return "success";
    if (usabilidad.totalErrores <= 5) return "warning";
    return "danger";
  };

  const getErrorDescription = () => {
    if (usabilidad.totalErrores === 0) {
      return "Excelente: no se han registrado errores en las observaciones.";
    }

    if (usabilidad.totalErrores <= 5) {
      return "Revisar: existen algunos errores que pueden afectar la experiencia.";
    }

    return "Prioridad alta: los errores pueden estar dificultando el uso del sistema.";
  };

  const getSeverityPercentage = (value: number) => {
    if (metricas.hallazgos === 0) return 0;
    return Math.round((value / metricas.hallazgos) * 100);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" role="status">
        <span className="sr-only">Cargando dashboard</span>
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-700" />
      </div>
    );
  }

  const successTone = getSuccessTone();
  const errorTone = getErrorTone();

  return (
    <div className="relative mx-auto max-w-7xl space-y-8 animate-fade-in">
      <button
        aria-label="Mostrar ayuda del dashboard"
        className="
          fixed
          right-8
          top-6
          z-50
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          bg-blue-700
          text-white
          shadow-lg
          transition
          hover:bg-blue-800
          focus:outline-none
          focus:ring-4
          focus:ring-blue-300
        "
        onClick={() => setShowHelp((prev) => !prev)}
        type="button"
      >
        <span className="text-2xl font-bold" aria-hidden="true">
          ?
        </span>
      </button>

      {showHelp && (
        <div
          className="
            fixed
            right-8
            top-20
            z-50
            max-w-xs
            rounded-xl
            border
            border-blue-200
            bg-white
            p-4
            shadow-lg
            animate-fade-in
          "
          role="dialog"
          aria-label="Ayuda del dashboard"
        >
          <p className="mb-1 font-bold text-blue-800">
            ¿Nuevo aquí?
          </p>

          <p className="mb-2 text-sm leading-6 text-blue-800">
            Este dashboard resume el estado general del sistema. Para gestionar
            los planes, entra a{" "}
            <span className="font-bold">Planes de Prueba</span> o usa el enlace{" "}
            <Link
              to="/planes-prueba"
              className="font-semibold underline hover:text-blue-950"
            >
              Ver Planes de Prueba
            </Link>
            .
          </p>

          <button
            className="mt-1 text-xs font-semibold text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            onClick={() => setShowHelp(false)}
            type="button"
          >
            Cerrar
          </button>
        </div>
      )}

      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard de Usabilidad
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Revisa rápidamente el estado de tus pruebas, la participación, los
          errores y los hallazgos que requieren atención.
        </p>
      </header>

      <section
        className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de métricas principales"
      >
        <MetricCard
          title="Planes de prueba"
          value={metricas.planes}
          description="Cantidad total de planes creados para evaluar productos o flujos."
          icon="📋"
          tone="info"
        />

        <MetricCard
          title="Participantes"
          value={metricas.participantes}
          description="Personas registradas para participar en las pruebas de usabilidad."
          icon="👥"
          tone="info"
        />

        <MetricCard
          title="Tasa de éxito"
          value={`${usabilidad.tasaExito}%`}
          description={getSuccessDescription()}
          icon="🎯"
          tone={successTone}
        />

        <MetricCard
          title="Errores registrados"
          value={usabilidad.totalErrores}
          description={getErrorDescription()}
          icon="⚠️"
          tone={errorTone}
        />
      </section>

      <section
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        aria-label="Detalle del dashboard"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Hallazgos por severidad
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Prioriza primero los hallazgos de severidad alta.
            </p>
          </div>

          {metricas.hallazgos === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                Aún no hay hallazgos registrados.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-bold text-red-800">
                    <span
                      className="h-3 w-3 rounded-full bg-red-600"
                      aria-hidden="true"
                    />
                    Alta
                  </span>
                  <span className="font-bold text-gray-800">
                    {severidad.alta} · {getSeverityPercentage(severidad.alta)}%
                  </span>
                </div>

                <div
                  className="h-4 w-full rounded-full bg-gray-100"
                  aria-label={`Severidad alta: ${severidad.alta} hallazgos`}
                >
                  <div
                    className="h-4 rounded-full bg-red-600 transition-all duration-1000"
                    style={{
                      width: `${getSeverityPercentage(severidad.alta)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-bold text-amber-900">
                    <span
                      className="h-3 w-3 rounded-full bg-amber-500"
                      aria-hidden="true"
                    />
                    Media
                  </span>
                  <span className="font-bold text-gray-800">
                    {severidad.media} · {getSeverityPercentage(severidad.media)}%
                  </span>
                </div>

                <div
                  className="h-4 w-full rounded-full bg-gray-100"
                  aria-label={`Severidad media: ${severidad.media} hallazgos`}
                >
                  <div
                    className="h-4 rounded-full bg-amber-500 transition-all duration-1000"
                    style={{
                      width: `${getSeverityPercentage(severidad.media)}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 font-bold text-emerald-800">
                    <span
                      className="h-3 w-3 rounded-full bg-emerald-600"
                      aria-hidden="true"
                    />
                    Baja
                  </span>
                  <span className="font-bold text-gray-800">
                    {severidad.baja} · {getSeverityPercentage(severidad.baja)}%
                  </span>
                </div>

                <div
                  className="h-4 w-full rounded-full bg-gray-100"
                  aria-label={`Severidad baja: ${severidad.baja} hallazgos`}
                >
                  <div
                    className="h-4 rounded-full bg-emerald-600 transition-all duration-1000"
                    style={{
                      width: `${getSeverityPercentage(severidad.baja)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                <strong>Lectura rápida:</strong> los hallazgos en rojo deben
                atenderse primero porque pueden bloquear o dificultar tareas
                importantes.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Planes de prueba recientes
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Últimos planes creados o registrados en el sistema.
              </p>
            </div>

            <Link
              to="/planes-prueba"
              className="
                text-sm
                font-bold
                text-blue-700
                hover:text-blue-900
                hover:underline
                focus:outline-none
                focus:ring-2
                focus:ring-blue-300
                rounded
              "
            >
              Ver todos &rarr;
            </Link>
          </div>

          {planesRecientes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <p className="text-sm font-medium text-gray-600">
                No has creado ningún plan de prueba aún.
              </p>

              <Link
                to="/planes-prueba/nuevo"
                className="
                  mt-4
                  inline-block
                  rounded-lg
                  bg-blue-700
                  px-4
                  py-2
                  text-sm
                  font-bold
                  text-white
                  hover:bg-blue-800
                  focus:outline-none
                  focus:ring-4
                  focus:ring-blue-300
                "
              >
                Crear el primer plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-bold text-gray-600">
                      Producto evaluado
                    </th>
                    <th className="pb-3 text-sm font-bold text-gray-600">
                      Objetivo principal
                    </th>
                    <th className="pb-3 text-sm font-bold text-gray-600">
                      Fecha
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {planesRecientes.map((plan) => {
                    const prog = progresoPorPlan[plan.id];
                    return (
                      <tr
                        key={plan.id}
                        className="transition-colors hover:bg-gray-50"
                      >
                        <td className="py-4 text-sm font-bold text-gray-900">
                          {plan.producto}
                        </td>

                        <td
                          className="max-w-xs py-4 text-sm text-gray-700"
                          title={plan.objetivo}
                        >
                          <div className="space-y-1">
                            <p className="truncate">{plan.objetivo}</p>
                            {prog && prog.total > 0 && (
                              <div className="flex items-center gap-2 text-xs">
                                <div className="h-2 w-24 rounded-full bg-gray-100">
                                  <div
                                    className="h-2 rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${prog.porcentaje}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-gray-600">
                                  {prog.exitosas}/{prog.total} • {prog.porcentaje}%
                                </span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-4 text-sm font-semibold text-gray-600">
                          {new Date(plan.fecha).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}