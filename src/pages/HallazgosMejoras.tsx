import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { AccessibleInput } from '../components/AccessibleInput';
import { AccessibleTextarea } from '../components/AccessibleTextarea';
import { AccessibleSelect } from '../components/AccessibleSelect';
import Modal from '../components/Modal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

interface Prueba { id: string; producto: string; }
interface Hallazgo {
  id: string; prueba_id: string; problema: string;
  evidencia_observada: string; recomendacion_mejora: string;
  frecuencia: string; severidad: string; prioridad: string; estado: string;
  pruebas_usabilidad?: Prueba | null;
}

const ITEMS_PER_PAGE = 5;

export default function HallazgosMejoras() {
  const { planId } = useParams(); // <-- Obtenemos el ID del plan de la URL

  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDatos, setLoadingDatos] = useState(true);

  // Estados del formulario (ya no necesitamos pruebaId en el estado porque siempre será planId)
  const [problema, setProblema] = useState<string>('');
  const [evidencia, setEvidencia] = useState<string>('');
  const [recomendacion, setRecomendacion] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Media');
  const [prioridad, setPrioridad] = useState<string>('Media');
  const [estado, setEstado] = useState<string>('Pendiente');

  const [loadingGuardar, setLoadingGuardar] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    if (planId) {
      fetchHallazgos();
    }
  }, [planId]);

  useEffect(() => {
    if (feedback && !feedback.includes("Error")) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const fetchHallazgos = async () => {
    if (!planId) return;
    setLoadingDatos(true);
    
    // FILTRAMOS LOS HALLAZGOS SOLO PARA ESTE PLAN
    const { data, error } = await supabase
      .from('hallazgos')
      .select('*, pruebas_usabilidad(producto)')
      .eq('prueba_id', planId)
      .order('created_at', { ascending: false });
    
    if (!error && data) setHallazgos(data as unknown as Hallazgo[]);
    setLoadingDatos(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setProblema(''); setEvidencia(''); setRecomendacion('');
    setFrecuencia(''); setSeveridad('Media'); setPrioridad('Media'); setEstado('Pendiente');
    setMensaje({ tipo: '', texto: '' });
  };

  const handleOpenModal = () => { resetForm(); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); resetForm(); };

  const handleEdit = (hallazgo: Hallazgo) => {
    resetForm();
    setEditingId(hallazgo.id);
    setProblema(hallazgo.problema || ''); setEvidencia(hallazgo.evidencia_observada || '');
    setRecomendacion(hallazgo.recomendacion_mejora || ''); setFrecuencia(hallazgo.frecuencia || '');
    setSeveridad(hallazgo.severidad || 'Media'); setPrioridad(hallazgo.prioridad || 'Media');
    setEstado(hallazgo.estado || 'Pendiente');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setFeedback("");
    const { error } = await supabase.from('hallazgos').delete().eq('id', deleteId);
    if (error) setFeedback("Error al eliminar: " + error.message);
    else { setFeedback("Hallazgo eliminado correctamente."); fetchHallazgos(); }
    setDeleteId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!problema || !evidencia || !recomendacion || !frecuencia) {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos requeridos.' });
      return;
    }

    setLoadingGuardar(true);
    // FIJAMOS EL PLAN ID ESTRICTAMENTE DESDE LA URL
    const payload = {
      prueba_id: planId,
      problema, evidencia_observada: evidencia, recomendacion_mejora: recomendacion,
      frecuencia, severidad, prioridad, estado
    };

    let error;
    if (editingId) {
      const { error: updateError } = await supabase.from('hallazgos').update(payload).eq('id', editingId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('hallazgos').insert([payload]);
      error = insertError;
    }

    setLoadingGuardar(false);
    if (error) setMensaje({ tipo: 'error', texto: `Error al ${editingId ? 'actualizar' : 'registrar'}: ` + error.message });
    else { setFeedback(`Hallazgo ${editingId ? 'actualizado' : 'registrado'} con éxito.`); fetchHallazgos(); handleCloseModal(); }
  };

  const filteredHallazgos = useMemo(() => {
    return hallazgos.filter(h => {
      const q = search.toLowerCase();
      const prob = h.problema?.toLowerCase() || '';
      const rec = h.recomendacion_mejora?.toLowerCase() || '';
      return prob.includes(q) || rec.includes(q) || h.estado.toLowerCase().includes(q);
    });
  }, [hallazgos, search]);

  const totalPages = Math.ceil(filteredHallazgos.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHallazgos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHallazgos, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hallazgos y Mejoras</h1>
      </div>

      {feedback && (
        <div aria-live="polite" className={`p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm ${feedback.includes("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {feedback}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por problema o recomendación..." className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm outline-none" />
        </div>
        <button onClick={handleOpenModal} className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
          + Nuevo Hallazgo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Problema</th>
                <th className="p-4 font-semibold border-b">Recomendación</th>
                <th className="p-4 font-semibold border-b text-center">Freq.</th>
                <th className="p-4 font-semibold border-b text-center">Severidad</th>
                <th className="p-4 font-semibold border-b text-center">Estado</th>
                <th className="p-4 font-semibold border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loadingDatos ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando hallazgos...</td></tr>
              ) : currentData.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No hay hallazgos registrados.</td></tr>
              ) : (
                currentData.map(h => (
                  <tr key={h.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="line-clamp-2 font-medium" title={h.problema}>{h.problema || 'N/A'}</div>
                    </td>
                    <td className="p-4"><div className="line-clamp-2" title={h.recomendacion_mejora}>{h.recomendacion_mejora}</div></td>
                    <td className="p-4 text-center font-mono bg-gray-50/30">{h.frecuencia}</td>
                    <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${h.severidad === 'Crítica' || h.severidad === 'Alta' ? 'bg-red-50 text-red-700' : h.severidad === 'Media' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>{h.severidad}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium border ${h.estado === 'Corregido' ? 'bg-green-50 text-green-700 border-green-200' : h.estado === 'En progreso' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{h.estado}</span>
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                       <button onClick={() => handleEdit(h)} className="mr-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition-colors">Editar</button>
                       <button onClick={() => setDeleteId(h.id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors">Eliminar</button>
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

      <ConfirmDeleteModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} itemName="este hallazgo" />

      {isModalOpen && (
         <Modal open={isModalOpen} onClose={handleCloseModal} title={editingId ? "Editar Hallazgo" : "Registrar Nuevo Hallazgo"}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mensaje.texto && (<div className={`p-3 rounded-lg text-sm font-semibold text-center ${mensaje.tipo === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{mensaje.texto}</div>)}

              {/* Indicador visual en lugar del ComboBox */}
              <div style={{ padding: '12px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9', color: '#0d47a1', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                 Asociado al Plan ID: {planId}
              </div>

              <AccessibleTextarea id="problema" name="problema" label="Problema *" value={problema} onChange={(e) => setProblema(e.target.value)} required />
              <AccessibleTextarea id="evidencia" name="evidencia" label="Evidencia Observada *" value={evidencia} onChange={(e) => setEvidencia(e.target.value)} required />
              <AccessibleTextarea id="recomendacion" name="recomendacion" label="Recomendación de Mejora *" value={recomendacion} onChange={(e) => setRecomendacion(e.target.value)} required />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <AccessibleInput id="frecuencia" name="frecuencia" label="Frecuencia *" value={frecuencia} onChange={(e) => setFrecuencia(e.target.value)} required />
                
                <AccessibleSelect id="severidad" name="severidad" label="Severidad" value={severidad} onChange={(e) => setSeveridad(e.target.value)}>
                   <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option><option value="Crítica">Crítica</option>
                </AccessibleSelect>

                <AccessibleSelect id="prioridad" name="prioridad" label="Prioridad" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                   <option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option>
                </AccessibleSelect>

                <AccessibleSelect id="estado" name="estado" label="Estado" value={estado} onChange={(e) => setEstado(e.target.value)}>
                   <option value="Pendiente">Pendiente</option><option value="En progreso">En progreso</option><option value="Corregido">Corregido</option>
                </AccessibleSelect>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-4">
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