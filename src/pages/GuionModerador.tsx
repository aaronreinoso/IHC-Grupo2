import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast, { Toaster } from 'react-hot-toast';
import { AccessibleTextarea } from '../components/AccessibleTextarea';

interface Prueba {
  id: string;
  producto: string;
  objetivo: string;
}

export default function GuionModerador() {
  const [pruebas, setPruebas] = useState<Prueba[]>([]);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);

  // Estados del formulario
  const [guionInicio, setGuionInicio] = useState('');
  const [guionSeguimiento, setGuionSeguimiento] = useState('');
  const [guionCierre, setGuionCierre] = useState('');

  useEffect(() => {
    fetchPruebas();
  }, []);

  const fetchPruebas = async () => {
    const { data, error } = await supabase
      .from('pruebas_usabilidad')
      .select('id, producto, objetivo');
    if (!error && data) {
      setPruebas(data);
    }
  };

  useEffect(() => {
    if (pruebaSeleccionada) {
      cargarGuion(pruebaSeleccionada);
    } else {
      setGuionInicio('');
      setGuionSeguimiento('');
      setGuionCierre('');
    }
  }, [pruebaSeleccionada]);

  const cargarGuion = async (id: string) => {
    setCargandoDatos(true);
    const { data, error } = await supabase
      .from('pruebas_usabilidad')
      .select('guion_inicio, guion_seguimiento, guion_cierre')
      .eq('id', id)
      .single();

    if (!error && data) {
      setGuionInicio(data.guion_inicio || '');
      setGuionSeguimiento(data.guion_seguimiento || '');
      setGuionCierre(data.guion_cierre || '');
    }
    setCargandoDatos(false);
  };

  const guardarGuion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pruebaSeleccionada) {
      toast.error('Primero debes seleccionar un Plan de Prueba.');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('pruebas_usabilidad')
      .update({
        guion_inicio: guionInicio,
        guion_seguimiento: guionSeguimiento,
        guion_cierre: guionCierre,
      })
      .eq('id', pruebaSeleccionada);

    if (error) {
      toast.error('Hubo un error al guardar el guion.');
    } else {
      toast.success('Guion actualizado y guardado correctamente.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <Toaster position="top-right" />
      
      <header className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">Guion del Moderador</h1>
        <p className="text-gray-600 mt-2">
          Estructura las instrucciones y preguntas para estandarizar la ejecución de la prueba.
        </p>
      </header>

      {/* Selector de Contexto (Prevención de Errores IHC) */}
      <section className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm">
        <label htmlFor="prueba-select" className="block text-sm font-bold text-blue-900 mb-3">
          1. Selecciona el Plan de Prueba a editar
        </label>
        <select
          id="prueba-select"
          value={pruebaSeleccionada}
          onChange={(e) => setPruebaSeleccionada(e.target.value)}
          className="w-full md:w-2/3 lg:w-1/2 px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-800 shadow-sm transition-shadow"
        >
          <option value="">-- Elige un plan de prueba --</option>
          {pruebas.map((prueba) => (
            <option key={prueba.id} value={prueba.id}>
              {prueba.producto} - {prueba.objetivo.substring(0, 50)}...
            </option>
          ))}
        </select>
        
        {pruebas.length === 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <span className="text-amber-500 text-xl">⚠️</span>
            <p className="text-sm text-amber-800">
              <strong>No hay planes de prueba registrados.</strong> El sistema necesita que el Miembro 1 cree un plan de prueba primero para poder adjuntarle un guion.
            </p>
          </div>
        )}
      </section>

      {/* Formulario Principal (Solo visible si hay un contexto seleccionado) */}
      {pruebaSeleccionada && (
        <section className={`bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 transition-opacity ${cargandoDatos ? 'opacity-50' : 'opacity-100'}`}>
          <form onSubmit={guardarGuion} className="space-y-8">
            
            <AccessibleTextarea
              id="guionInicio"
              label="Instrucciones de Inicio (Introducción)"
              helperText="Escribe los puntos clave para tranquilizar al usuario e indicarle cómo funcionará la dinámica."
              placeholder="Ej. 1. Gracias por ayudarnos a evaluar...&#10;2. Queremos recordarte que evaluamos la plataforma, no tus habilidades...&#10;3. Te pedimos pensar en voz alta..."
              value={guionInicio}
              onChange={(e) => setGuionInicio(e.target.value)}
              rows={5}
            />

            <AccessibleTextarea
              id="guionSeguimiento"
              label="Preguntas de Seguimiento (Durante las tareas)"
              helperText="Preguntas para hacer tras cada tarea y medir la carga cognitiva."
              placeholder="Ej. ¿Qué tan fácil te resultó localizar los filtros?&#10;¿Te sentiste seguro con el proceso de pago?"
              value={guionSeguimiento}
              onChange={(e) => setGuionSeguimiento(e.target.value)}
              rows={4}
            />

            <AccessibleTextarea
              id="guionCierre"
              label="Preguntas de Cierre (Satisfacción y Retrospectiva)"
              helperText="Preguntas finales para recolectar la percepción subjetiva del usuario."
              placeholder="Ej. ¿Qué fue lo más fácil de usar?&#10;¿Qué fue lo más confuso?&#10;¿Qué cambiarías primero del sistema?"
              value={guionCierre}
              onChange={(e) => setGuionCierre(e.target.value)}
              rows={4}
            />

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Guardando cambios...' : 'Guardar Guion del Moderador'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}