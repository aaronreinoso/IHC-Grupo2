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
    <div className="max-w-6xl mx-auto py-8">
      {/* Cabecera */}
      <div className="flex items-center mb-6">
        <Link to="/planes-prueba" className="mr-4 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Volver a la lista de planes de prueba">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Tareas del Test</h1>
      </div>
      
      {/* Feedback y Errores */}
      {error && (
        <div className="p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm bg-red-50 text-red-700 border border-red-200" role="alert">
          {error}
        </div>
      )}
      
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm ${feedback.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
        >
          {feedback}
        </div>
      )}

      {/* Controles: Búsqueda y Botón Nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          {/* Reutilizamos tu componente TareasSearch, pero si tiene estilos fijos, tal vez debas envolverlo o ajustarlo */}
          <TareasSearch search={search} setSearch={setSearch} />
        </div>
        <Link
          to={`/planes-prueba/${planId}/tareas/nueva`}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          aria-label="Crear nueva tarea"
        >
          + Nueva Tarea
        </Link>
      </div>
      
      {loading && <div aria-live="polite" className="text-gray-500 text-center p-8">Cargando datos...</div>}
      
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