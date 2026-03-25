import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import FormField from '../components/FormField';
import Modal from '../components/Modal';

interface Prueba {
  id: string;
  producto: string;
}

interface Hallazgo {
  id: string;
  problema: string;
  evidencia_observada: string;
  recomendacion_mejora: string;
  frecuencia: string;
  severidad: string;
  prioridad: string;
  estado: string;
  pruebas_usabilidad?: Prueba | null;
}

interface MensajeSistema {
  tipo: string;
  texto: string;
}

const ITEMS_PER_PAGE = 5;

export default function HallazgosMejoras() {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingDatos, setLoadingDatos] = useState(true);

  const [pruebaId, setPruebaId] = useState<string>('');
  const [problema, setProblema] = useState<string>('');
  const [evidencia, setEvidencia] = useState<string>('');
  const [recomendacion, setRecomendacion] = useState<string>('');
  const [frecuencia, setFrecuencia] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Media');
  const [prioridad, setPrioridad] = useState<string>('Media');
  const [estado, setEstado] = useState<string>('Pendiente');

  const [loadingGuardar, setLoadingGuardar] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<MensajeSistema>({ tipo: '', texto: '' });

  useEffect(() => {
    fetchPruebas();
    fetchHallazgos();
  }, []);

  const fetchPruebas = async () => {
    const { data } = await supabase.from('pruebas_usabilidad').select('id, producto');
    if (data) setPruebas(data as unknown as Prueba[]);
  };

  const fetchHallazgos = async () => {
    setLoadingDatos(true);
    const { data, error } = await supabase
      .from('hallazgos')
      .select('*, pruebas_usabilidad(producto)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHallazgos(data as unknown as Hallazgo[]);
    }
    setLoadingDatos(false);
  };

  const resetForm = () => {
    setPruebaId('');
    setProblema('');
    setEvidencia('');
    setRecomendacion('');
    setFrecuencia('');
    setSeveridad('Media');
    setPrioridad('Media');
    setEstado('Pendiente');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!pruebaId || !problema || !evidencia || !recomendacion || !frecuencia) {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos requeridos.' });
      return;
    }

    setLoadingGuardar(true);
    const { error } = await supabase.from('hallazgos').insert([
      {
        prueba_id: pruebaId,
        problema,
        evidencia_observada: evidencia,
        recomendacion_mejora: recomendacion,
        frecuencia,
        severidad,
        prioridad,
        estado
      }
    ]);

    setLoadingGuardar(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar: ' + error.message });
    } else {
      fetchHallazgos();
      handleCloseModal();
    }
  };

  const filteredHallazgos = useMemo(() => {
    return hallazgos.filter(h => {
      const q = search.toLowerCase();
      const prod = h.pruebas_usabilidad?.producto?.toLowerCase() || '';
      const prob = h.problema?.toLowerCase() || '';
      const rec = h.recomendacion_mejora?.toLowerCase() || '';
      return prod.includes(q) || prob.includes(q) || rec.includes(q) || h.estado.toLowerCase().includes(q);
    });
  }, [hallazgos, search]);

  const totalPages = Math.ceil(filteredHallazgos.length / ITEMS_PER_PAGE);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredHallazgos.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredHallazgos, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Hallazgos y Mejoras</h1>
      </div>

      {/* Controles: Búsqueda y Botón Nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por producto, problema o recomendación..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors outline-none"
          />
        </div>
        <button
          onClick={handleOpenModal}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Nuevo Hallazgo
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Problema</th>
                <th className="p-4 font-semibold border-b">Recomendación</th>
                <th className="p-4 font-semibold border-b text-center">Freq.</th>
                <th className="p-4 font-semibold border-b text-center">Severidad</th>
                <th className="p-4 font-semibold border-b text-center">Prioridad</th>
                <th className="p-4 font-semibold border-b text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loadingDatos ? (
                 <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando hallazgos...</td></tr>
              ) : currentData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    {search ? "No se encontraron resultados." : "No hay hallazgos registrados."}
                  </td>
                </tr>
              ) : (
                currentData.map(h => (
                  <tr key={h.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="line-clamp-2 font-medium" title={h.problema}>
                        {h.problema || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{h.pruebas_usabilidad?.producto}</div>
                    </td>
                    <td className="p-4">
                      <div className="line-clamp-2" title={h.recomendacion_mejora}>
                        {h.recomendacion_mejora}
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono bg-gray-50/30">{h.frecuencia}</td>
                    <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            h.severidad === 'Crítica' || h.severidad === 'Alta' ? 'bg-red-50 text-red-700' :
                            h.severidad === 'Media' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-blue-50 text-blue-700'
                        }`}>
                            {h.severidad}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                       <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            h.prioridad === 'Alta' ? 'bg-orange-50 text-orange-700' :
                            h.prioridad === 'Media' ? 'bg-gray-100 text-gray-700' :
                            'bg-green-50 text-green-700'
                        }`}>
                            {h.prioridad}
                        </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          h.estado === 'Corregido' ? 'bg-green-50 text-green-700 border-green-200' : 
                          h.estado === 'En progreso' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                          'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {h.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">
              Página <span className="font-semibold text-gray-900">{currentPage}</span> de <span className="font-semibold text-gray-900">{totalPages}</span>
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {/* Modal de Creación */}
      {isModalOpen && (
         <Modal open={isModalOpen} onClose={handleCloseModal} title="Registrar Nuevo Hallazgo">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {mensaje.texto && (
                <div className={`p-3 rounded-lg text-sm font-semibold text-center ${mensaje.tipo === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="flex flex-col">
                <label htmlFor="prueba" className="mb-1 font-semibold text-gray-700 text-sm">Plan de Prueba Asociado *</label>
                <select 
                  id="prueba" 
                  value={pruebaId} 
                  onChange={(e) => setPruebaId(e.target.value)} 
                  required 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                >
                  <option value="">Seleccione un plan de prueba...</option>
                  {pruebas.map(p => (
                    <option key={p.id} value={p.id}>{p.producto}</option>
                  ))}
                </select>
              </div>

              <FormField
                as="textarea"
                label="Problema *"
                name="problema"
                value={problema}
                onChange={(e) => setProblema(e.target.value)}
                required
                placeholder="Ej: Menú 'Rendimiento' no comunica que contiene notas..."
              />
              
              <FormField
                as="textarea"
                label="Evidencia Observada *"
                name="evidencia"
                value={evidencia}
                onChange={(e) => setEvidencia(e.target.value)}
                required
                placeholder="Ej: 4 de 5 usuarios dudaron o entraron al segundo intento..."
              />

              <FormField
                as="textarea"
                label="Recomendación de Mejora *"
                name="recomendacion"
                value={recomendacion}
                onChange={(e) => setRecomendacion(e.target.value)}
                required
                placeholder="Ej: Cambiar etiqueta a 'Notas'..."
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
                <FormField 
                  label="Frecuencia *" 
                  name="frecuencia" 
                  value={frecuencia} 
                  onChange={(e) => setFrecuencia(e.target.value)} 
                  required 
                  placeholder="Ej: 4/5" 
                />
                
                <div className="flex flex-col">
                  <label htmlFor="severidad" className="mb-1 font-semibold text-gray-700 text-sm">Severidad</label>
                  <select 
                    id="severidad" 
                    value={severidad} 
                    onChange={(e) => setSeveridad(e.target.value)} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="prioridad" className="mb-1 font-semibold text-gray-700 text-sm">Prioridad</label>
                  <select 
                    id="prioridad" 
                    value={prioridad} 
                    onChange={(e) => setPrioridad(e.target.value)} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="estado" className="mb-1 font-semibold text-gray-700 text-sm">Estado</label>
                  <select 
                    id="estado" 
                    value={estado} 
                    onChange={(e) => setEstado(e.target.value)} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Corregido">Corregido</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                    type="submit" 
                    disabled={loadingGuardar} 
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loadingGuardar ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
         </Modal>
      )}
    </div>
  );
}