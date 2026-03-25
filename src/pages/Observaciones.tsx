import { useState, useEffect,  } from 'react';
import { supabase } from '../supabaseClient';

// 1. Definición estricta de interfaces para TypeScript
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
      fetchObservaciones();
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h2>Registro de Observaciones</h2>
      <p>Registra el comportamiento de los participantes durante la prueba.</p>

      {mensaje.texto && (
        <div aria-live="polite" style={{ padding: '10px', marginBottom: '15px', borderRadius: '4px', background: mensaje.tipo === 'error' ? '#f8d7da' : '#d4edda', color: mensaje.tipo === 'error' ? '#721c24' : '#155724' }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="sesion" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Participante (Sesión) *</label>
            <select id="sesion" value={sesionId} onChange={(e) => setSesionId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">Seleccione...</option>
              {sesiones.map(s => (
                <option key={s.id} value={s.id}>{s.participantes?.nombre || 'Sesión sin nombre'}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tarea" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tarea Evaluada *</label>
            <select id="tarea" value={tareaId} onChange={(e) => setTareaId(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="">Seleccione...</option>
              {tareas.map(t => (
                <option key={t.id} value={t.id}>{t.escenario}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="tiempo" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tiempo (segundos) *</label>
            <input type="number" id="tiempo" value={tiempo} onChange={(e) => setTiempo(Number(e.target.value))} required min="1" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label htmlFor="errores" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cantidad de Errores</label>
            <input type="number" id="errores" value={errores} onChange={(e) => setErrores(Number(e.target.value))} min="0" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '25px' }}>
            <input type="checkbox" id="exito" checked={exito} onChange={(e) => setExito(e.target.checked)} style={{ marginRight: '8px', transform: 'scale(1.2)' }} />
            <label htmlFor="exito" style={{ fontWeight: 'bold', cursor: 'pointer' }}>¿Completó con éxito?</label>
          </div>
        </div>

        <div>
          <label htmlFor="comentarios" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Comentarios del participante</label>
          <textarea id="comentarios" value={comentarios} onChange={(e) => setComentarios(e.target.value)} rows={2} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ej: Dudó entre 'Notas' y 'Rendimiento'..." />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label htmlFor="problema" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Problema Detectado</label>
            <input type="text" id="problema" value={problema} onChange={(e) => setProblema(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label htmlFor="severidad" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Severidad</label>
            <select id="severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
              <option value="Baja">Baja</option>
              <option value="Media">Media</option>
              <option value="Alta">Alta</option>
              <option value="Crítica">Crítica</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="mejora" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Mejora Propuesta</label>
          <input type="text" id="mejora" value={mejora} onChange={(e) => setMejora(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>

        <button type="submit" disabled={loading} style={{ padding: '12px 20px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          {loading ? 'Guardando...' : 'Guardar Observación'}
        </button>
      </form>

      <hr style={{ margin: '40px 0', borderTop: '1px solid #eee' }} />

      <h3>Observaciones Registradas</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f4f4f4' }}>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Participante</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Tarea</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Éxito</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Tiempo (s)</th>
              <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Severidad</th>
            </tr>
          </thead>
          <tbody>
            {observaciones.map(obs => (
              <tr key={obs.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{obs.sesiones?.participantes?.nombre || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{obs.tareas?.escenario || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{obs.exito ? '✅ Sí' : '❌ No'}</td>
                <td style={{ padding: '12px' }}>{obs.tiempo_segundos}</td>
                <td style={{ padding: '12px' }}>{obs.severidad}</td>
              </tr>
            ))}
            {observaciones.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No hay observaciones registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}