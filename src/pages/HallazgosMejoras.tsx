// src/pages/HallazgosMejoras.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FormField from '../components/FormField';

interface Prueba {
  id: string;
  producto: string;
}

interface Hallazgo {
  id: string;
  recomendacion_mejora: string;
  evidencia_observada: string; // ¡Nuevo campo añadido!
  frecuencia: string;
  severidad: string;
  prioridad: string;
  estado: string;
}

interface MensajeSistema {
  tipo: string;
  texto: string;
}

export default function HallazgosMejoras() {
  const [hallazgos, setHallazgos] = useState<Hallazgo[]>([]);
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  
  // Estados del formulario
  const [pruebaId, setPruebaId] = useState<string>('');
  const [recomendacion, setRecomendacion] = useState<string>('');
  const [evidencia, setEvidencia] = useState<string>(''); // Estado para la nueva evidencia
  const [frecuencia, setFrecuencia] = useState<string>('');
  const [severidad, setSeveridad] = useState<string>('Media');
  const [prioridad, setPrioridad] = useState<string>('Media');
  const [estado, setEstado] = useState<string>('Pendiente');

  const [loading, setLoading] = useState<boolean>(false);
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
    const { data, error } = await supabase
      .from('hallazgos')
      .select('*, pruebas_usabilidad(producto)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHallazgos(data as unknown as Hallazgo[]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!pruebaId || !recomendacion || !frecuencia || !evidencia) {
      setMensaje({ tipo: 'error', texto: 'Por favor, completa los campos requeridos, incluyendo la evidencia.' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('hallazgos').insert([
      {
        prueba_id: pruebaId,
        frecuencia,
        severidad,
        prioridad,
        estado,
        recomendacion_mejora: recomendacion,
        evidencia_observada: evidencia // Guardando el nuevo campo
      }
    ]);

    setLoading(false);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar el hallazgo: ' + error.message });
    } else {
      setMensaje({ tipo: 'exito', texto: 'Hallazgo registrado con éxito.' });
      // Limpiar formulario tras éxito
      setRecomendacion('');
      setEvidencia('');
      setFrecuencia(''); 
      // Opcional: mantener el estado/severidad o resetearlos a por defecto
      fetchHallazgos();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Síntesis de Hallazgos y Plan de Mejora</h1>
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

      {/* Formulario principal */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col">
            <label htmlFor="prueba" className="mb-2 font-semibold text-gray-700">Plan de Prueba Asociado *</label>
            <select 
              id="prueba" 
              value={pruebaId} 
              onChange={(e) => setPruebaId(e.target.value)} 
              required 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
            >
              <option value="">Seleccione un plan de prueba...</option>
              {pruebas.map(p => (
                <option key={p.id} value={p.id}>{p.producto}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <FormField
                as="textarea"
                label="Problema y Recomendación de Mejora *"
                name="recomendacion"
                value={recomendacion}
                onChange={(e) => setRecomendacion(e.target.value)}
                required
                placeholder="Ej: Los usuarios no ven el botón. Recomiendo cambiar el color..."
              />
              
              <FormField
                as="textarea"
                label="Evidencia Observada *"
                name="evidencia"
                value={evidencia}
                onChange={(e) => setEvidencia(e.target.value)}
                required
                placeholder="Ej: 4 de 5 usuarios dudaron antes de hacer clic..."
              />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-end">
            <FormField 
              label="Frecuencia *" 
              name="frecuencia" 
              value={frecuencia} 
              onChange={(e) => setFrecuencia(e.target.value)} 
              required 
              placeholder="Ej: 3/5" 
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

            <div className="flex flex-col">
              <label htmlFor="prioridad" className="mb-2 font-semibold text-gray-700">Prioridad</label>
              <select 
                id="prioridad" 
                value={prioridad} 
                onChange={(e) => setPrioridad(e.target.value)} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="estado" className="mb-2 font-semibold text-gray-700">Estado</label>
              <select 
                id="estado" 
                value={estado} 
                onChange={(e) => setEstado(e.target.value)} 
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-colors"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Corregido">Corregido</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Registrar Hallazgo'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de resultados */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 bg-gray-50/50">
           <h3 className="text-xl font-bold text-gray-800">Listado de Hallazgos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b w-1/3">Recomendación / Problema</th>
                <th className="p-4 font-semibold border-b">Evidencia</th>
                <th className="p-4 font-semibold border-b">Freq.</th>
                <th className="p-4 font-semibold border-b">Severidad</th>
                <th className="p-4 font-semibold border-b">Prioridad</th>
                <th className="p-4 font-semibold border-b text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {hallazgos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 italic">
                    No hay hallazgos registrados en este momento.
                  </td>
                </tr>
              ) : (
                hallazgos.map(h => (
                  <tr key={h.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4">
                      <div className="line-clamp-2" title={h.recomendacion_mejora}>
                        {h.recomendacion_mejora}
                      </div>
                    </td>
                    <td className="p-4">
                       <div className="line-clamp-2 text-gray-500" title={h.evidencia_observada}>
                        {h.evidencia_observada || 'N/A'}
                      </div>
                    </td>
                    <td className="p-4 font-mono">{h.frecuencia}</td>
                    <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            h.severidad === 'Crítica' || h.severidad === 'Alta' ? 'bg-red-50 text-red-700' :
                            h.severidad === 'Media' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-blue-50 text-blue-700'
                        }`}>
                            {h.severidad}
                        </span>
                    </td>
                    <td className="p-4">
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
      </div>
    </div>
  );
}