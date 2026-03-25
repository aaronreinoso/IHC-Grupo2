import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { AccessibleInput } from '../components/AccessibleInput';
import toast, { Toaster } from 'react-hot-toast';

export default function Participantes() {
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [perfil, setPerfil] = useState('');
  const [errores, setErrores] = useState<{nombre?: string; perfil?: string}>({});

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('participantes').select('*').order('created_at', { ascending: false });
    if (!error && data) setParticipantes(data);
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

    setLoading(true);
    const { error } = await supabase.from('participantes').insert([{ nombre, perfil }]);
    
    if (error) {
      toast.error('Error al guardar el participante');
    } else {
      toast.success('Participante registrado correctamente');
      setNombre('');
      setPerfil('');
      fetchParticipantes(); // Recargar la lista
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Participantes</h1>
      
      {/* Formulario */}
      <form onSubmit={guardarParticipante} className="bg-gray-50 p-6 rounded-md border border-gray-200 mb-8">
        <h2 className="text-lg font-semibold mb-4">Nuevo Participante</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibleInput
            id="nombre"
            label="Nombre Completo"
            placeholder="Ej. Kevin Porras"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            error={errores.nombre}
          />
          
          <div className="flex flex-col mb-4">
            <label htmlFor="perfil" className="mb-1 text-sm font-semibold text-gray-800">Perfil Tecnológico/Educativo</label>
            <select
              id="perfil"
              value={perfil}
              onChange={(e) => setPerfil(e.target.value)}
              className={`px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errores.perfil ? 'border-red-500 ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              aria-invalid={!!errores.perfil}
            >
              <option value="">Selecciona un perfil...</option>
              <option value="Bachiller (Básico)">Bachiller (Básico)</option>
              <option value="Bachiller (Medio)">Bachiller (Medio)</option>
              <option value="Bachiller (Avanzado)">Bachiller (Avanzado)</option>
              <option value="Universitario (Medio)">Universitario (Medio)</option>
              <option value="Universitario (Avanzado)">Universitario (Avanzado)</option>
              <option value="Postgrado (Avanzado)">Postgrado (Avanzado)</option>
            </select>
            {errores.perfil && <span className="mt-1 text-sm text-red-600 font-medium">{errores.perfil}</span>}
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando...' : 'Registrar Participante'}
        </button>
      </form>

      {/* Lista de Participantes (Diseño en Tarjetas en lugar de tablas aburridas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {participantes.map(p => (
          <div key={p.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg text-gray-800">{p.nombre}</h3>
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {p.perfil}
            </span>
            {/* Aquí puedes agregar un botón de eliminar conectando al supabase.from().delete() */}
          </div>
        ))}
      </div>
    </div>
  );
}