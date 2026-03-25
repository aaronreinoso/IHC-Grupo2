import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";

interface PlanPruebaItem {
  id: string;
  producto: string;
  modulo_evaluado: string;
  objetivo: string;
  fecha: string;
  lugar: string;
  metodo: string;
  perfil_usuarios: string;
  duracion: string;
}

const PlanesPruebaList: React.FC = () => {
  const [planes, setPlanes] = useState<PlanPruebaItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const location = useLocation();
  const [feedback, setFeedback] = useState<string>(location.state?.feedback || "");

  const navigate = useNavigate();
  const fetchPlanes = async () => {
    setLoading(true);
    setError("");
    const { data, error } = await supabase
      .from("pruebas_usabilidad")
      .select("id, producto, modulo_evaluado, objetivo, fecha, lugar, metodo, perfil_usuarios, duracion")
      .order("fecha", { ascending: false });
    if (error) setError("Error al cargar los planes de prueba");
    else setPlanes(data || []);
    setLoading(false);
  };
  useEffect(() => {
    fetchPlanes();
    // Limpiar feedback de location después de mostrarlo
    if (location.state?.feedback) {
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setFeedback("");
    const { error } = await supabase.from("pruebas_usabilidad").delete().eq("id", deleteId);
    if (error) {
      setFeedback("Error al eliminar: " + error.message);
    } else {
      setFeedback("Plan de prueba eliminado correctamente.");
      fetchPlanes();
    }
    setDeleteId(null);
  };

  // Ocultar feedback de éxito tras 3 segundos
  useEffect(() => {
    if (feedback && !feedback.startsWith("Error")) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Filtrado de planes según búsqueda
  const filteredPlanes = planes.filter(plan => {
    const q = search.toLowerCase();
    return (
      plan.producto.toLowerCase().includes(q) ||
      plan.modulo_evaluado.toLowerCase().includes(q) ||
      plan.objetivo.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: 32, background: "#f9fafb", borderRadius: 16, boxShadow: "0 4px 24px #0002" }}>
      <h2 style={{ fontSize: "2.2rem", fontWeight: "bold", marginBottom: 24, color: '#222' }}>Plan de Prueba</h2>
      <div style={{ marginBottom: 8 }}>
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por producto, módulo u objetivo..."
          aria-label="Buscar plan de prueba"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1.5px solid #b0bec5',
            fontSize: 17,
            outline: 'none',
            boxShadow: '0 1px 4px #0001',
            background: '#fff',
            marginBottom: 0,
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 28px', fontWeight: 'bold', fontSize: 18, cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}
          onClick={() => navigate('nuevo')}
          aria-label="Crear nuevo plan de prueba"
        >
          + Nuevo Plan 
        </button>
      </div>
      {loading && <div>Cargando...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8, background: '#fff', borderRadius: 8 }}>
            <thead>
              <tr style={{ background: "#e3eafc" }}>
                <th style={{ padding: 10 }}>Producto</th>
                <th style={{ padding: 10 }}>Módulo</th>
                <th style={{ padding: 10 }}>Objetivo</th>
                <th style={{ padding: 10 }}>Fecha</th>
                <th style={{ padding: 10 }}>Lugar</th>
                <th style={{ padding: 10 }}>Método</th>
                <th style={{ padding: 10 }}>Perfil Usuarios</th>
                <th style={{ padding: 10 }}>Duración</th>
                <th style={{ padding: 10, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlanes.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: 24 }}>No hay planes de prueba registrados.</td></tr>
              ) : (
                filteredPlanes.map(plan => (
                  <tr key={plan.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: 10 }}>{plan.producto}</td>
                    <td style={{ padding: 10 }}>{plan.modulo_evaluado}</td>
                    <td style={{ padding: 10 }}>{plan.objetivo}</td>
                    <td style={{ padding: 10 }}>{plan.fecha}</td>
                    <td style={{ padding: 10 }}>{plan.lugar}</td>
                    <td style={{ padding: 10 }}>{plan.metodo}</td>
                    <td style={{ padding: 10 }}>{plan.perfil_usuarios}</td>
                    <td style={{ padding: 10 }}>{plan.duracion}</td>
                    <td style={{ padding: 10, minWidth: '170px', textAlign: 'center' }}>
                      <button
                        style={{ marginRight: 8, background: '#1e88e5', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => navigate(`/planes-prueba/${plan.id}/tareas`)}
                        aria-label={`Ver tareas del plan ${plan.producto}`}
                      >
                        Tareas
                      </button>
                      <button
                        style={{ marginRight: 8, background: '#43a047', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer'  }}
                        onClick={() => navigate(`editar/${plan.id}`)}
                        aria-label={`Editar plan de prueba de ${plan.producto}`}
                      >
                        Editar
                      </button>
                      <button
                        style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 'bold', cursor: 'pointer' }}
                        onClick={() => handleDelete(plan.id)}
                        aria-label={`Eliminar plan de prueba de ${plan.producto}`}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDeleteModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={confirmDelete}
        itemName="este plan de prueba"
      />
    </div>
  );

}


export default PlanesPruebaList;
