import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { AccessibleInput } from '../components/AccessibleInput';
import { AccessibleTextarea } from '../components/AccessibleTextarea';
import { AccessibleSelect } from '../components/AccessibleSelect';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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
  sesion_id: string;
  tarea_id: string;
  exito: boolean;
  tiempo_segundos: number;
  errores: number;
  comentarios: string;
  problema_detectado: string;
  severidad: string;
  mejora_propuesta: string;
  sesiones?: Sesion | null;
  tareas?: Tarea | null;
}

interface MensajeSistema {
  tipo: string;
  texto: string;
}

const ITEMS_PER_PAGE = 5;

export default function Observaciones() {
  const [observaciones, setObservaciones] = useState<Observacion[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [sesiones, setSesiones] = useState<Sesion[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDatos, setLoadingDatos] = useState(true);

  const [sesionId, setSesionId] = useState<string>('');
  const [tareaId, setTareaId] = useState<string>('');
  const [exito, setExito] = useState<boolean>(false);
  const [tiempo, setTiempo] = useState<number | ''>('');
  const [errores, setErrores] = useState<number | ''>(0);
  const [comentarios, setComentarios] = useState<string>('');
  const [problema, setProblema] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Baja');
  const [mejora, setMejora] = useState<string>('');

  const [loadingGuardar, setLoadingGuardar] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeSistema>({ tipo: '', texto: '' });
  const [feedback, setFeedback] = useState<string>(''); 

  useEffect(() => {
    fetchDependencias();
    fetchObservaciones();
  }, []);

  useEffect(() => {
    if (feedback && !feedback.includes("Error")) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchDependencias = async () => {
    const { data: dataTareas } = await supabase.from('tareas').select('id, escenario');
    const { data: dataSesiones } = await supabase.from('sesiones').select('id, participantes(nombre)');
    
    if (dataTareas) setTareas(dataTareas as unknown as Tarea[]);
    if (dataSesiones) setSesiones(dataSesiones as unknown as Sesion[]);
  };

  const fetchObservaciones = async () => {
    setLoadingDatos(true);
    const { data, error } = await supabase
      .from('observaciones')
      .select('*, tareas(escenario), sesiones(participantes(nombre))')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setObservaciones(data as unknown as Observacion[]);
    }
    setLoadingDatos(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setSesionId('');
    setTareaId('');
    setExito(false);
    setTiempo('');
    setErrores(0);
    setComentarios('');
    setProblema('');
    setSeveridad('Baja');
    setMejora('');
    setMensaje({ tipo: '', texto: '' });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (obs: Observacion) => {
    resetForm();
    setEditingId(obs.id);
    setSesionId(obs.sesion_id || '');
    setTareaId(obs.tarea_id || '');
    setExito(obs.exito || false);
    setTiempo(obs.tiempo_segundos ?? 0);
    setErrores(obs.errores ?? 0);
    setComentarios(obs.comentarios || '');
    setProblema(obs.problema_detectado || '');
    setSeveridad(obs.severidad || 'Baja');
    setMejora(obs.mejora_propuesta || '');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setFeedback("");
    const { error } = await supabase.from('observaciones').delete().eq('id', deleteId);
    
    if (error) {
      setFeedback("Error al eliminar: " + error.message);
    } else {
      setFeedback("Observación eliminada correctamente.");
      fetchObservaciones();
    }
    setDeleteId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (Number(tiempo) < 0) {
       setMensaje({ tipo: 'error', texto: 'El tiempo no puede ser negativo.' });
       return;
    }

    if (!sesionId || !tareaId || tiempo === '') {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos obligatorios.' });
      return;
    }

    setLoadingGuardar(true);
    const payload = {
      sesion_id: sesionId,
      tarea_id: tareaId,
      exito,
      tiempo_segundos: tiempo,
      errores: errores === '' ? 0 : errores,
      comentarios,
      problema_detectado: problema,
      severidad,
      mejora_propuesta: mejora
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('observaciones').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('observaciones').insert([payload]);
      error = insertError;
    }

    setLoadingGuardar(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: `Error al ${editingId ? 'actualizar' : 'guardar'}: ` + error.message });
    } else {
      setFeedback(`Observación ${editingId ? 'actualizada' : 'registrada'} correctamente.`);
      fetchObservaciones();
      handleCloseModal();
    }
  };

  const filteredObservaciones = useMemo(() => {
    return observaciones.filter(obs => {
      const q = search.toLowerCase();
      const participante = obs.sesiones?.participantes?.nombre?.toLowerCase() || '';
      const tarea = obs.tareas?.escenario?.toLowerCase() || '';
      return participante.includes(q) || tarea.includes(q) || obs.severidad.toLowerCase().includes(q);
    });
  }, [observaciones, search]);

  const totalPages = Math.ceil(filteredObservaciones.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredObservaciones.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredObservaciones, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Registro de Observaciones</h1>
      </div>

      {feedback && (
        <div aria-live="polite" className={`p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm ${feedback.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {feedback}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="search" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por participante, tarea o severidad..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm outline-none"
          />
        </div>
        <button onClick={handleOpenModal} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
          + Nueva Observación
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Participante</th>
                <th className="p-4 font-semibold border-b">Tarea</th>
                <th className="p-4 font-semibold border-b text-center">Éxito</th>
                <th className="p-4 font-semibold border-b text-center">Tiempo (s)</th>
                <th className="p-4 font-semibold border-b text-center">Severidad</th>
                <th className="p-4 font-semibold border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {loadingDatos ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando observaciones...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No hay observaciones registradas.</td></tr>
              ) : (
                currentData.map(obs => (
                  <tr key={obs.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">{obs.sesiones?.participantes?.nombre || 'N/A'}</td>
                    <td className="p-4 line-clamp-2" title={obs.tareas?.escenario}>{obs.tareas?.escenario || 'N/A'}</td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obs.exito ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{obs.exito ? 'Sí' : 'No'}</span>
                    </td>
                    <td className="p-4 text-center font-mono">{obs.tiempo_segundos}</td>
                    <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${obs.severidad === 'Crítica' || obs.severidad === 'Alta' ? 'bg-red-100 text-red-800' : obs.severidad === 'Media' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{obs.severidad}</span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                       <button onClick={() => handleEdit(obs)} className="mr-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors text-sm">Editar</button>
                       <button onClick={() => setDeleteId(obs.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors text-sm">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Anterior</button>
            <span className="text-sm text-gray-600">Página <span className="font-semibold text-gray-900">{currentPage}</span> de <span className="font-semibold text-gray-900">{totalPages}</span></span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 disabled:opacity-50">Siguiente</button>
          </div>
        )}
      </div>

      <ConfirmDeleteModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        itemName="esta observación"
      />

      {isModalOpen && (
         <Modal open={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Observación" : "Registrar Nueva Observación"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mensaje.texto && (
                <div className={`p-3 rounded-lg text-sm font-semibold text-center ${mensaje.tipo === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibleSelect id="sesion" label="Participante (Sesión) *" value={sesionId} onChange={(e) => setSesionId(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {sesiones.map(s => (<option key={s.id} value={s.id}>{s.participantes?.nombre || 'Sesión sin nombre'}</option>))}
                </AccessibleSelect>
                
                <AccessibleSelect id="tarea" label="Tarea Evaluada *" value={tareaId} onChange={(e) => setTareaId(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {tareas.map(t => (<option key={t.id} value={t.id}>{t.escenario}</option>))}
                </AccessibleSelect>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AccessibleInput id="tiempo" label="Tiempo (segundos) *" type="number" value={tiempo} onChange={(e) => setTiempo(Number(e.target.value))} required min="0" />
                <AccessibleInput id="errores" label="Cant. Errores" type="number" value={errores} onChange={(e) => setErrores(Number(e.target.value))} min="0" />
                
                <div className="flex flex-col mb-4 pt-1">
                  <label htmlFor="exito" className="mb-2 text-sm font-semibold text-gray-800">¿Completó con éxito?</label>
                  <div className="flex items-center h-[42px] px-2">
                    <input type="checkbox" id="exito" checked={exito} onChange={(e) => setExito(e.target.checked)} className="w-5 h-5 text-blue-600 rounded cursor-pointer" />
                  </div>
                </div>
              </div>

              <AccessibleTextarea id="comentarios" label="Comentarios del participante" value={comentarios} onChange={(e) => setComentarios(e.target.value)} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AccessibleInput id="problema" label="Problema Detectado" value={problema} onChange={(e) => setProblema(e.target.value)} />
                <AccessibleSelect id="severidad" label="Severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)}>
                   <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option>
                </AccessibleSelect>
              </div>

              <AccessibleInput id="mejora" label="Mejora Propuesta" value={mejora} onChange={(e) => setMejora(e.target.value)} />

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" disabled={loadingGuardar} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm disabled:opacity-70">
                    {loadingGuardar ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
         </Modal>
      )}
    </div>
  );
}