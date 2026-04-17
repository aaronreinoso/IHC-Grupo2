import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { Tarea } from "../types/tarea";
import TareasTable from "../components/TareasTable";
import TareasSearch from "../components/TareasSearch";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

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

  useEffect(() => {
    if (feedback && !feedback.startsWith("Error")) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

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
    /* AARÓN: Se añadió px-4 sm:px-6 lg:px-8 para responsividad en bordes de celular */
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      
      {/* Cabecera */}
      <div className="flex items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Tareas del Test</h1>
      </div>
      
      {/* Feedback y Errores (Accesibles) */}
      {error && (
        <div className="p-4 mb-6 rounded-xl text-sm font-semibold text-center shadow-sm bg-red-50 text-red-700 border border-red-200" role="alert">
          {error}
        </div>
      )}
      
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 mb-6 rounded-xl text-sm font-semibold text-center shadow-sm ${feedback.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {feedback}
        </div>
      )}

      {/* Controles: Búsqueda y Botón Nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <TareasSearch search={search} setSearch={setSearch} />
        </div>
        
        {/* AARÓN: Accesibilidad de teclado (focus:ring) e ícono para el botón principal */}
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
      </div>
      
      {/* AARÓN: UI de Loading mejorada (Spinner + Accesibilidad aria-busy) */}
      {loading && (
        <div aria-live="polite" aria-busy="true" className="flex flex-col items-center justify-center py-16">
          <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 font-medium text-lg">Cargando tareas...</p>
        </div>
      )}
      
      {!loading && !error && (
        <TareasTable 
          tareas={filteredTareas} 
          onEdit={(id) => navigate(`/planes-prueba/${planId}/tareas/editar/${id}`)} 
          onDelete={(id) => handleDelete(id)} 
        />
      )}

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