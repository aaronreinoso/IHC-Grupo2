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
      .order("created_at", { ascending: false });
    if (error) setError("Error al cargar los planes de prueba");
    else setPlanes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlanes();
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

  useEffect(() => {
    if (feedback && !feedback.startsWith("Error")) {
      const timer = setTimeout(() => setFeedback(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const filteredPlanes = planes.filter(plan => {
    const q = search.toLowerCase();
    return (
      plan.producto.toLowerCase().includes(q) ||
      plan.modulo_evaluado.toLowerCase().includes(q) ||
      plan.objetivo.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Planes de Prueba</h1>
      </div>

      {feedback && (
        <div aria-live="polite" className={`p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm ${feedback.startsWith("Error") ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
          {feedback}
        </div>
      )}
      
      {error && (
        <div className="p-4 mb-6 rounded-lg text-sm font-semibold text-center shadow-sm bg-red-50 text-red-700 border border-red-200" role="alert">
          {error}
        </div>
      )}

      {/* Controles: Búsqueda y Botón Nuevo */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="w-full md:w-1/2">
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por producto, módulo u objetivo..."
            aria-label="Buscar plan de prueba"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 bg-white shadow-sm outline-none"
          />
        </div>
        <button
          onClick={() => navigate('nuevo')}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          aria-label="Crear nuevo plan de prueba"
        >
          + Nuevo Plan
        </button>
      </div>

      {/* Tabla con Tailwind */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold border-b">Producto</th>
                <th className="p-4 font-semibold border-b">Módulo</th>
                <th className="p-4 font-semibold border-b hidden md:table-cell">Objetivo</th>
                <th className="p-4 font-semibold border-b text-center">Fecha</th>
                <th className="p-4 font-semibold border-b text-center hidden lg:table-cell">Duración</th>
                <th className="p-4 font-semibold border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-sm">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando planes...</td></tr>
              ) : filteredPlanes.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No hay planes de prueba registrados.</td></tr>
              ) : (
                filteredPlanes.map(plan => (
                  <tr key={plan.id} className="hover:bg-blue-50/50 transition-colors">
                    <td className="p-4 font-medium">{plan.producto}</td>
                    <td className="p-4">{plan.modulo_evaluado}</td>
                    <td className="p-4 hidden md:table-cell"><div className="line-clamp-2" title={plan.objetivo}>{plan.objetivo}</div></td>
                    <td className="p-4 text-center font-mono bg-gray-50/30">{plan.fecha}</td>
                    <td className="p-4 text-center hidden lg:table-cell">{plan.duracion}</td>
                    <td className="p-4 text-center whitespace-nowrap">
                      {/* Botón Gestionar Tareas con tooltip */}
                      <button
                        onClick={() => navigate(`/planes-prueba/${plan.id}`)}
                        title="Haz clic para ver y agregar tareas a este plan"
                        aria-label={`Gestionar tareas del plan ${plan.producto}`}
                        className="mr-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors inline-flex items-center justify-center font-semibold"
                        style={{ flexDirection: 'column', lineHeight: '1.1' }}
                      >
                        
                        + Tareas
                      </button>
                      <button
                        onClick={() => navigate(`editar/${plan.id}`)}
                        className="mr-2 px-3 py-1.5 bg-green-800 hover:bg-green-900 text-white font-medium rounded transition-colors"
                        aria-label={`Editar plan de prueba de ${plan.producto}`}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="px-3 py-1.5 bg-red-800 hover:bg-red-900 text-white font-medium rounded transition-colors"
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
      </div>

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