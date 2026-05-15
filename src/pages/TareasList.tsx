import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { Tarea } from "../types/tarea";
import TareasTable from "../components/TareasTable";
import TareasSearch from "../components/TareasSearch";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import Toast from "../components/Toast";

const TareasList: React.FC = () => {
  const { planId } = useParams();
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const location = useLocation();
  const [feedback, setFeedback] = useState<string>(location.state?.feedback || "");

  const navigate = useNavigate();

  const fetchTareas = async () => {
    setLoading(true);
    setError("");
    const { data, error: fetchError } = await supabase
      .from("tareas")
      .select(`
        id, 
        escenario, 
        resultado_esperado, 
        metrica_principal, 
        criterio_exito, 
        prueba_id,
        pruebas_usabilidad(producto)
      `)
      .eq("prueba_id", planId)
      .order("id", { ascending: false });
    
    if (fetchError) setError("Error al cargar las tareas.");
    else setTareas((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTareas();
    if (location.state?.feedback) {
      window.history.replaceState({}, document.title);
    }
  }, [planId]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setFeedback("");
    const { error } = await supabase.from("tareas").delete().eq("id", deleteId);
    if (error) {
      setFeedback("Error al eliminar: " + error.message);
    } else {
      setFeedback("Tarea eliminada correctamente.");
      window.dispatchEvent(new Event('plan-refresh'));
      fetchTareas();
    }
    setDeleteId(null);
  };

  const filteredTareas = tareas.filter(tarea => {
    const q = search.toLowerCase();
    return (
      tarea.escenario.toLowerCase().includes(q) ||
      tarea.resultado_esperado.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
      
      <div className="flex items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Tareas del Test</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <TareasSearch search={search} setSearch={setSearch} />
        </div>
        
        {/* CORRECCIÓN: El botón azul SOLO aparece si ya existen tareas */}
        {!loading && tareas.length > 0 && (
          <Link
            to={`/planes-prueba/${planId}/tareas/nueva`}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all flex items-center justify-center gap-2"
            aria-label="Crear nueva tarea para este plan de prueba"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Nueva Tarea
          </Link>
        )}
      </div>
      
      {loading && (
        <div aria-live="polite" aria-busy="true" className="flex flex-col items-center justify-center py-16">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium text-lg">Cargando tareas...</p>
        </div>
      )}
      
      {/* Si no hay tareas, se muestra únicamente este bloque con el botón rojo */}
      {!loading && tareas.length === 0 ? (
        <div className="text-center py-12 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl relative overflow-hidden animate-fadeIn my-6">
          <div className="absolute top-0 left-0 w-full h-1 bg-rose-400"></div>
          <span className="text-5xl mb-4 block">⚠️</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Plan sin tareas asignadas</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Este plan de prueba aún está inactivo. Para poder evaluar la usabilidad con participantes, necesitas definir al menos una tarea.
          </p>
          <button 
            onClick={() => navigate(`/planes-prueba/${planId}/tareas/nueva`)}
            className="bg-rose-600 text-white px-6 py-3 rounded-full font-bold hover:bg-rose-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto"
          >
            <span>+</span> Añadir la primera tarea
          </button>
        </div>
      ) : !loading && (
        <TareasTable 
          tareas={filteredTareas} 
          onEdit={(id) => navigate(`/planes-prueba/${planId}/tareas/editar/${id}`)} 
          onDelete={(id) => handleDelete(id)} 
        />
      )}

      <Toast message={error || feedback} onClose={() => { setError(""); setFeedback(""); }} />

      <ConfirmDeleteModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        itemName="esta tarea"
      />
    </div>
  );
};

export default TareasList;