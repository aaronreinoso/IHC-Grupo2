import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // Estados para las métricas generales
  const [metricas, setMetricas] = useState({
    planes: 0,
    participantes: 0,
    tareas: 0,
    hallazgos: 0,
  });

  // Estados para métricas de usabilidad (Cálculos de las observaciones)
  const [usabilidad, setUsabilidad] = useState({
    tasaExito: 0,
    totalErrores: 0,
  });

  // Estado para gráficos de hallazgos
  const [severidad, setSeveridad] = useState({ alta: 0, media: 0, baja: 0 });
  const [planesRecientes, setPlanesRecientes] = useState<any[]>([]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setLoading(true);

    try {
      // 1. Obtener conteos generales
      const { count: countPlanes } = await supabase.from('pruebas_usabilidad').select('*', { count: 'exact', head: true });
      const { count: countParticipantes } = await supabase.from('participantes').select('*', { count: 'exact', head: true });
      const { count: countTareas } = await supabase.from('tareas').select('*', { count: 'exact', head: true });
      const { count: countHallazgos } = await supabase.from('hallazgos').select('*', { count: 'exact', head: true });

      setMetricas({
        planes: countPlanes || 0,
        participantes: countParticipantes || 0,
        tareas: countTareas || 0,
        hallazgos: countHallazgos || 0,
      });

      // 2. Calcular métricas de observaciones (Éxito y Errores)
      const { data: observaciones } = await supabase.from('observaciones').select('exito, errores');
      
      if (observaciones && observaciones.length > 0) {
        const exitosas = observaciones.filter(obs => obs.exito).length;
        const totalErrores = observaciones.reduce((acc, obs) => acc + (obs.errores || 0), 0);
        
        setUsabilidad({
          tasaExito: Math.round((exitosas / observaciones.length) * 100),
          totalErrores: totalErrores
        });
      }

      // 3. Obtener severidad de los hallazgos
      const { data: hallazgosData } = await supabase.from('hallazgos').select('severidad');
      if (hallazgosData) {
        setSeveridad({
          alta: hallazgosData.filter(h => h.severidad === 'Alta').length,
          media: hallazgosData.filter(h => h.severidad === 'Media').length,
          baja: hallazgosData.filter(h => h.severidad === 'Baja').length,
        });
      }

      // 4. Últimos planes de prueba para la tabla de actividad
      const { data: recientes } = await supabase
        .from('pruebas_usabilidad')
        .select('id, producto, objetivo, fecha')
        .order('created_at', { ascending: false })
        .limit(4);
        
      if (recientes) setPlanesRecientes(recientes);

    } catch (error) {
      console.error('Error cargando el dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard de Usabilidad</h1>
        <p className="text-gray-500 mt-2">Visión general del estado de las pruebas y hallazgos del sistema.</p>
      </header>

      {/* TARJETAS DE MÉTRICAS (KPIs Principales) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Planes de Prueba</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{metricas.planes}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-2xl">📋</div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Participantes</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{metricas.participantes}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-2xl">👥</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Tasa de Éxito</p>
            <p className="text-3xl font-bold text-indigo-600 mt-1">{usabilidad.tasaExito}%</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg text-2xl">🎯</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase">Total Errores</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">{usabilidad.totalErrores}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-2xl">⚠️</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GRÁFICO DE BARRAS (Severidad de Hallazgos) */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Hallazgos por Severidad</h2>
          
          {metricas.hallazgos === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">Aún no hay hallazgos registrados.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Barra Alta */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-rose-700">Alta</span>
                  <span className="font-bold text-gray-600">{severidad.alta}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-rose-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.alta / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>

              {/* Barra Media */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-amber-600">Media</span>
                  <span className="font-bold text-gray-600">{severidad.media}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-amber-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.media / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>

              {/* Barra Baja */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-emerald-600">Baja</span>
                  <span className="font-bold text-gray-600">{severidad.baja}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-emerald-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.baja / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVIDAD RECIENTE */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Planes de Prueba Recientes</h2>
            <Link to="/planes-prueba" className="text-sm font-semibold text-blue-600 hover:underline focus:outline-none">
              Ver todos &rarr;
            </Link>
          </div>

          {planesRecientes.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">No has creado ningún plan de prueba aún.</p>
              <Link to="/planes-prueba/nuevo" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                Crear el primer plan
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-semibold text-gray-500">Producto Evaluado</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Objetivo Principal</th>
                    <th className="pb-3 text-sm font-semibold text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {planesRecientes.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 text-sm font-bold text-gray-800">{plan.producto}</td>
                      <td className="py-4 text-sm text-gray-600 truncate max-w-xs" title={plan.objetivo}>
                        {plan.objetivo}
                      </td>
                      <td className="py-4 text-sm text-gray-500 font-medium">
                        {new Date(plan.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}