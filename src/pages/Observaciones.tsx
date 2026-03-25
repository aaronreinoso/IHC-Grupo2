// src/pages/Observaciones.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FormField from '../components/FormField';

// Definición estricta de interfaces para TypeScript
interface Participante {
  nombre: string;
}

interface Sesion {
  id: string;
  participantes?: Participante | null;
}

interface Tarea {
  id: string;
  escenario: string;
}

interface Observacion {
  id: string;
  exito: boolean;
  tiempo_segundos: number;
  severidad: string;
  sesiones?: Sesion | null;
  tareas?: Tarea | null;
}

interface MensajeSistema {
  tipo: string;
  texto: string;
}

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  
  // Estados del formulario
  const [sesionId, setSesionId] = useState<string>('');
  const [tareaId, setTareaId] = useState<string>('');
  const [exito, setExito] = useState<boolean>(false);
  const [tiempo, setTiempo] = useState<number | ''>('');
  const [errores, setErrores] = useState<number | ''>(0);
  const [comentarios, setComentarios] = useState<string>('');
  const [problema, setProblema] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Baja');
  const [mejora, setMejora] = useState<string>('');

  // Feedback del sistema
  const [loading, setLoading] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeSistema>({ tipo: '', texto: '' });

  useEffect(() => {
    fetchDependencias();
    fetchObservaciones();
  }, []);

  const fetchDependencias = async () => {
    const { data: dataTareas } = await supabase.from('tareas').select('id, escenario');
    const { data: dataSesiones } = await supabase.from('sesiones').select('id, participantes(nombre)');
    
    if (dataTareas) setTareas(dataTareas as unknown as Tarea[]);
    if (dataSesiones) setSesiones(dataSesiones as unknown as Sesion[]);
  };

  const fetchObservaciones = async () => {
    const { data, error } = await supabase
      .from('observaciones')
      .select('*, tareas(escenario), sesiones(participantes(nombre))')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setObservaciones(data as unknown as Observacion[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!sesionId || !tareaId || tiempo === '') {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos obligatorios (Sesión, Tarea y Tiempo).' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('observaciones').insert([
      {
        sesion_id: sesionId,
        tarea_id: tareaId,
        exito,
        tiempo_segundos: tiempo,
        errores: errores === '' ? 0 : errores,
        comentarios,
        problema_detectado: problema,
        severidad,
        mejora_propuesta: mejora
      }
    ]);

    setLoading(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar la observación: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Observación registrada correctamente.' });
      setTiempo(''); 
      setErrores(0); 
      setComentarios(''); 
      setProblema(''); 
      setMejora('');
      // Mantener sesionId y tareaId puede ser útil para cargar múltiples observaciones seguidas, pero puedes resetearlos si lo prefieres
      fetchObservaciones();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Registro de Observaciones</h1>
      </div>

      {mensaje.texto && (
        <div
          aria-live="polite"
          className={`p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm ${
            mensaje.tipo === "error" 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario usando Tailwind y tu componente FormField */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label htmlFor="sesion" className="mb-2 font-semibold text-gray-700">Participante (Sesión) *</label>
              <select 
                id="sesion" 
                value={sesionId} 
                onChange={(e) => setSesionId(e.target.value)} 
                required 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="">Seleccione...</option>
                {sesiones.map(s => (
                  <option key={s.id} value={s.id}>{s.participantes?.nombre || 'Sesión sin nombre'}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="tarea" className="mb-2 font-semibold text-gray-700">Tarea Evaluada *</label>
              <select 
                id="tarea" 
                value={tareaId} 
                onChange={(e) => setTareaId(e.target.value)} 
                required 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="">Seleccione...</option>
                {tareas.map(t => (
                  <option key={t.id} value={t.id}>{t.escenario}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
             <FormField 
                label="Tiempo (segundos) *" 
                name="tiempo" 
                type="number" 
                value={tiempo} 
                onChange={(e) => setTiempo(Number(e.target.value))} 
                required 
              />
              <FormField 
                label="Cantidad de Errores" 
                name="errores" 
                type="number" 
                value={errores} 
                onChange={(e) => setErrores(Number(e.target.value))} 
              />
            <div className="flex items-center pb-3">
              <input 
                type="checkbox" 
                id="exito" 
                checked={exito} 
                onChange={(e) => setExito(e.target.checked)} 
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="exito" className="ml-3 font-semibold text-gray-700 cursor-pointer">
                ¿Completó con éxito?
              </label>
            </div>
          </div>

          <FormField 
            as="textarea" 
            label="Comentarios del participante" 
            name="comentarios" 
            value={comentarios} 
            onChange={(e) => setComentarios(e.target.value)} 
            placeholder="Ej: Dudó entre 'Notas' y 'Rendimiento'..." 
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField 
              label="Problema Detectado" 
              name="problema" 
              value={problema} 
              onChange={(e) => setProblema(e.target.value)} 
            />
            <div className="flex flex-col">
              <label htmlFor="severidad" className="mb-2 font-semibold text-gray-700">Severidad</label>
              <select 
                id="severidad" 
                value={severidad} 
                onChange={(e) => setSeveridad(e.target.value)} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>
          </div>

          <FormField 
            label="Mejora Propuesta" 
            name="mejora" 
            value={mejora} 
            onChange={(e) => setMejora(e.target.value)} 
          />

          <div className="pt-4 border-t border-gray-100">
             <button 
                type="submit" 
                disabled={loading} 
                className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Observación'}
              </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <h3 className="text-xl font-bold text-gray-800">Observaciones Registradas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Participante</th>
                <th className="p-4 font-semibold border-b">Tarea</th>
                <th className="p-4 font-semibold border-b">Éxito</th>
                <th className="p-4 font-semibold border-b">Tiempo (s)</th>
                <th className="p-4 font-semibold border-b">Severidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {observaciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No hay observaciones registradas en este momento.
                  </td>
                </tr>
              ) : (
                observaciones.map(obs => (
                  <tr key={obs.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">{obs.sesiones?.participantes?.nombre || 'N/A'}</td>
                    <td className="p-4">{obs.tareas?.escenario || 'N/A'}</td>
                    <td className="p-4">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obs.exito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {obs.exito ? 'Sí' : 'No'}
                       </span>
                    </td>
                    <td className="p-4 font-mono">{obs.tiempo_segundos}</td>
                    <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            obs.severidad === 'Crítica' || obs.severidad === 'Alta' ? 'bg-red-100 text-red-800' :
                            obs.severidad === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                        }`}>
                            {obs.severidad}
                        </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}