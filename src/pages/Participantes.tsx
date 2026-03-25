import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // <-- IMPORTANTE
import { supabase } from '../supabaseClient';
import { AccessibleInput } from '../components/AccessibleInput';
import toast, { Toaster } from 'react-hot-toast';

export default function Participantes() {
  const { planId } = useParams(); // Obtenemos el ID del plan de la URL

  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [nombre, setNombre] = useState('');
  const [perfil, setPerfil] = useState('');
  const [errores, setErrores] = useState<{nombre?: string; perfil?: string}>({});

  useEffect(() => {
    if (planId) fetchParticipantesDelPlan();
  }, [planId]);

  // Cargamos solo los participantes que tienen una "sesión" en este plan
  const fetchParticipantesDelPlan = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sesiones')
      .select('id, participantes(id, nombre, perfil)')
      .eq('prueba_id', planId);
      
    if (!error && data) {
      // Extraemos la data para que sea fácil de mapear
      const participantesMapeados = data
        .filter(s => s.participantes !== null)
        .map(s => ({
          sesion_id: s.id,
          id: (s.participantes as any).id,
          nombre: (s.participantes as any).nombre,
          perfil: (s.participantes as any).perfil
        }));
      setParticipantes(participantesMapeados);
    }
    setLoading(false);
  };

  const validarFormulario = () => {
    const nuevosErrores: any = {};
    if (!nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio.';
    if (!perfil) nuevosErrores.perfil = 'Selecciona un perfil válido.';
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarParticipante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;
    if (!planId) {
       toast.error('Error: No hay un plan seleccionado en la URL');
       return;
    }

    setLoading(true);
    
    // 1. Insertamos al participante
    const { data: partData, error: partError } = await supabase
      .from('participantes')
      .insert([{ nombre, perfil }])
      .select()
      .single();
    
    if (partError || !partData) {
      toast.error('Error al guardar el participante');
      setLoading(false);
      return;
    }

    // 2. CREAMOS LA SESIÓN (El puente entre el Participante y el Plan)
    const { error: sesionError } = await supabase
      .from('sesiones')
      .insert([{ prueba_id: planId, participante_id: partData.id }]);

    if (sesionError) {
       toast.error('Error al vincular el participante al plan');
    } else {
      toast.success('Participante registrado y asignado al plan');
      setNombre('');
      setPerfil('');
      fetchParticipantesDelPlan(); // Recargar la lista
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-6">Gestión de Participantes</h1>
      
      <form onSubmit={guardarParticipante} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Añadir Nuevo Participante al Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibleInput
            id="nombre" label="Nombre Completo" placeholder="Ej. Kevin Porras"
            value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre}
          />
          
          <div className="flex flex-col mb-4">
            <label htmlFor="perfil" className="mb-1 text-sm font-semibold text-gray-800">Perfil Tecnológico</label>
            <select
              id="perfil" value={perfil} onChange={(e) => setPerfil(e.target.value)}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white ${errores.perfil ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              aria-invalid={!!errores.perfil}
            >
              <option value="">Selecciona un perfil...</option>
              <option value="Bachiller (Básico)">Bachiller (Básico)</option>
              <option value="Universitario (Medio)">Universitario (Medio)</option>
              <option value="Postgrado (Avanzado)">Postgrado (Avanzado)</option>
            </select>
            {errores.perfil && <span className="mt-1 text-sm text-red-600 font-medium">{errores.perfil}</span>}
          </div>
        </div>
        <button type="submit" disabled={loading} className="mt-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
          {loading ? 'Guardando...' : '+ Asignar Participante'}
        </button>
      </form>

      <h3 className="text-xl font-bold text-gray-800 mb-4">Participantes en este Plan</h3>
      {participantes.length === 0 ? (
         <p className="text-gray-500 italic p-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">Aún no hay participantes asignados a este plan.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {participantes.map(p => (
            <div key={p.sesion_id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
              <h3 className="font-bold text-lg text-gray-800">{p.nombre}</h3>
              <span className="inline-block mt-3 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-full">
                {p.perfil}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}