import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import type { Tarea } from "../types/tarea";
import TareasTable from "../components/TareasTable";
import TareasSearch from "../components/TareasSearch";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

const TareasList: React.FC = () => {
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
  }, []);

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
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: 32, background: "#f9fafb", borderRadius: 16, boxShadow: "0 4px 24px #0002" }}>
      <h2 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: 24, color: '#222' }}>Tareas del Test</h2>
      
      <TareasSearch search={search} setSearch={setSearch} />
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
          onClick={() => navigate('/tarea')}
          aria-label="Crear nueva tarea"
        >
          + Nueva Tarea
        </button>
      </div>
      
      {loading && <div aria-live="polite" style={{ fontSize: 18, marginTop: 16 }}>Cargando datos...</div>}
      
      {error && (
        <div style={{ color: "#d32f2f", background: "#ffebee", padding: "12px", borderRadius: "8px", fontWeight: "bold" }} role="alert">
          {error}
        </div>
      )}
      
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            color: feedback.startsWith("Error") ? "#d32f2f" : "#388e3c",
            background: feedback.startsWith("Error") ? "#ffebee" : "#e8f5e9",
            border: `1px solid ${feedback.startsWith("Error") ? "#ffcdd2" : "#c8e6c9"}`,
            fontWeight: "bold",
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            fontSize: 17,
            textAlign: 'center',
            boxShadow: '0 2px 8px #0001',
          }}
        >
          {feedback}
        </div>
      )}

      {!loading && !error && (
        <TareasTable 
          tareas={filteredTareas} 
          onEdit={(id) => navigate(`/tarea/${id}`)} 
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