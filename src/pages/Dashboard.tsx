import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  
  // Métricas generales extraídas de los conteos de las tablas
  const [metricas, setMetricas] = useState({
    planes: 0,
    participantes: 0,
    tareas: 0,
    hallazgos: 0,
  });

  // Métricas calculadas sobre la tabla de observaciones
  const [usabilidad, setUsabilidad] = useState({
    tasaExito: 0,
    totalErrores: 0,
    saludSistema: 100, // Indicador de calidad global
  });

  const [severidad, setSeveridad] = useState({ alta: 0, media: 0, baja: 0 });
  const [planesRecientes, setPlanesRecientes] = useState<any[]>([]);

  useEffect(() => {
    cargarDatosDashboard();
  }, []);

  const cargarDatosDashboard = async () => {
    setLoading(true);

    try {
      // 1. Obtener conteos generales de las tablas principales
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

      // 2. Cálculo de métricas de éxito y errores desde observaciones
      const { data: observaciones } = await supabase.from('observaciones').select('exito, errores');
      
      let tasa = 0;
      let salud = 100;
      let erroresTotales = 0;

      if (observaciones && observaciones.length > 0) {
        const exitosas = observaciones.filter(obs => obs.exito).length;
        erroresTotales = observaciones.reduce((acc, obs) => acc + (obs.errores || 0), 0);
        tasa = Math.round((exitosas / observaciones.length) * 100);
        
        // La salud del sistema representa la calidad de la experiencia. 
        // Se basa en el total de errores registrados: 100 - (Errores * 2)
        salud = Math.max(0, 100 - (erroresTotales * 2)); 
      }

      setUsabilidad({
        tasaExito: tasa,
        totalErrores: erroresTotales,
        saludSistema: salud
      });

      // 3. Distribución de severidad de hallazgos
      const { data: hallazgosData } = await supabase.from('hallazgos').select('severidad');
      if (hallazgosData) {
        setSeveridad({
          alta: hallazgosData.filter(h => h.severidad === 'Alta').length,
          media: hallazgosData.filter(h => h.severidad === 'Media').length,
          baja: hallazgosData.filter(h => h.severidad === 'Baja').length,
        });
      }

      // 4. Obtener actividad reciente (limitado para reducir carga visual)
      const { data: recientes } = await supabase
        .from('pruebas_usabilidad')
        .select('id, producto, objetivo, fecha')
        .order('created_at', { ascending: false })
        .limit(3);
        
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn relative mt-2">
      
      {/* HEADER COMPACTO CON SALUD DEL SISTEMA */}
      <header className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">Estado de Evaluaciones</h1>
          <p className="text-gray-600 text-sm">
            {metricas.planes === 0 
              ? "El espacio de trabajo está listo para iniciar." 
              : metricas.hallazgos > 0 
                ? `Se han documentado ${metricas.hallazgos} hallazgos clave en ${metricas.planes} planes registrados.` 
                : "Las pruebas están en curso. Registra observaciones para generar métricas."}
          </p>
        </div>
        
        {metricas.planes > 0 && (
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Salud del Sistema</p>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-gray-100 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${usabilidad.saludSistema > 70 ? 'bg-emerald-500' : usabilidad.saludSistema > 40 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                  style={{ width: `${usabilidad.saludSistema}%` }}
                ></div>
              </div>
              <span className="text-lg font-bold text-gray-800">{usabilidad.saludSistema}%</span>
            </div>
          </div>
        )}
      </header>

      {/* TARJETAS DE MÉTRICAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center justify-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full text-2xl mb-2">📋</div>
          <p className="text-3xl font-black text-gray-800">{metricas.planes}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Planes Activos</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center justify-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full text-2xl mb-2">🎯</div>
          <p className="text-3xl font-black text-gray-800">{usabilidad.tasaExito}%</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Tasa de Éxito</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center justify-center hover:shadow-md transition-shadow">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-full text-2xl mb-2">⚠️</div>
          <p className="text-3xl font-black text-gray-800">{usabilidad.totalErrores}</p>
          <p className="text-xs font-semibold text-gray-500 uppercase mt-1">Total Errores</p>
        </div>
      </div>

      {/* BLOQUE DE IMPACTO Y ACTIVIDAD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* IMPACTO DE HALLAZGOS POR SEVERIDAD */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Impacto de Hallazgos</h2>
          
          {metricas.hallazgos === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">Aún no hay datos de hallazgos registrados.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">Severidad Alta</span>
                  <span className="font-bold text-gray-600">{severidad.alta} detectados</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-rose-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.alta / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Severidad Media</span>
                  <span className="font-bold text-gray-600">{severidad.media} detectados</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-amber-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.media / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Severidad Baja</span>
                  <span className="font-bold text-gray-600">{severidad.baja} detectados</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${(severidad.baja / metricas.hallazgos) * 100}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LISTADO DE EVALUACIONES RECIENTES */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Evaluaciones Recientes</h2>
          </div>

          {planesRecientes.length === 0 ? (
             <div className="text-center py-6 flex-grow flex flex-col justify-center">
               <p className="text-gray-500 text-sm">No se han encontrado evaluaciones recientes.</p>
             </div>
          ) : (
            <div className="space-y-2 flex-grow">
              {planesRecientes.map((plan) => (
                <Link key={plan.id} to={`/planes-prueba/${plan.id}/tareas`} className="block group">
                  <div className="p-3 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <p className="font-bold text-gray-800 text-sm group-hover:text-blue-700 transition-colors truncate">{plan.producto}</p>
                      <p className="text-xs text-gray-500 truncate">{plan.objetivo}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-semibold text-gray-400 block">
                        {new Date(plan.fecha).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              
              <div className="pt-1">
                <Link to="/planes-prueba" className="block text-center mt-1 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors">
                  Ver historial completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}