import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import { AccessibleTextarea } from "../components/AccessibleTextarea";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import { validateTarea } from "../utils/tareaValidation";
import type { TareaFormState } from "../utils/tareaValidation";

export default function TareaForm() {
  // Ahora capturamos el planId y el tareaId desde la URL
  const { planId, tareaId } = useParams(); 
  const navigate = useNavigate();
  const editMode = !!tareaId;

  const [form, setForm] = useState<TareaFormState>({
    prueba_id: planId || "", // Se asigna automáticamente por la URL
    escenario: "",
    resultado_esperado: "",
    metrica_principal: "",
    criterio_exito: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TareaFormState, string>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (editMode && tareaId) {
      (async () => {
        const { data, error } = await supabase
          .from("tareas")
          .select("*")
          .eq("id", tareaId)
          .single();
        
        if (data) {
          setForm({
            prueba_id: data.prueba_id || planId || "",
            escenario: data.escenario || "",
            resultado_esperado: data.resultado_esperado || "",
            metrica_principal: data.metrica_principal || "",
            criterio_exito: data.criterio_exito || "",
          });
        } else if (error) {
          setFeedback("Error: No se pudo cargar la tarea.");
        }
      })();
    }
  }, [tareaId, editMode, planId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    
    const validationErrors = validateTarea(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Accesibilidad: Manejo de foco en el primer error
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      return;
    }
    
    setLoading(true);

    try {
      let error;
      if (editMode && tareaId) {
        ({ error } = await supabase
          .from("tareas")
          .update(form)
          .eq("id", tareaId));
      } else {
        ({ error } = await supabase.from("tareas").insert([form]));
      }

      if (error) {
        setFeedback("Error al guardar: " + error.message);
      } else {
        // CORRECCIÓN: Navegación dinámica hacia la lista de tareas del plan actual
        navigate(`/planes-prueba/${planId}/tareas`, { 
          state: { feedback: editMode ? "¡Tarea actualizada correctamente!" : "¡Tarea guardada correctamente!" } 
        });
      }
    } catch (err) {
      setFeedback("Error inesperado al guardar.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
      <div className="flex items-center mb-6">
        <Link to={`/planes-prueba/${planId}/tareas`} className="mr-4 text-blue-700 hover:text-blue-900" aria-label="Volver a la lista de tareas">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-blue-700">
          {editMode ? "Editar Tarea" : "Nueva Tarea"}
        </h1>
      </div>
      
      {feedback && (
        <div 
          role="status"
          aria-live="polite"
          className={`p-4 mb-6 rounded-lg font-bold border ${
            feedback.startsWith("Error") 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6" aria-label="Formulario de tareas del test">
        
        {/* Implementación de los inputs accesibles del Miembro 2 */}
        <AccessibleTextarea
          id="escenario"
          name="escenario"
          label="Escenario:"
          value={form.escenario}
          onChange={handleChange}
          error={errors.escenario}
          placeholder="Ej: El usuario debe encontrar el producto X, agregarlo al carrito..."
        />
        
        <AccessibleTextarea
          id="resultado_esperado"
          name="resultado_esperado"
          label="Resultado Esperado:"
          value={form.resultado_esperado}
          onChange={handleChange}
          error={errors.resultado_esperado}
          placeholder="Ej: El producto aparece en el carrito con el precio correcto..."
        />
        
        <AccessibleInput
          id="metrica_principal"
          name="metrica_principal"
          label="Métrica Principal (KPIs):"
          value={form.metrica_principal}
          onChange={handleChange}
          error={errors.metrica_principal}
          placeholder="Ej: Tiempo de consecución de la tarea, Tasa de éxito..."
        />
        
        <AccessibleTextarea
          id="criterio_exito"
          name="criterio_exito"
          label="Criterio de Éxito:"
          value={form.criterio_exito}
          onChange={handleChange}
          error={errors.criterio_exito}
          placeholder="Ej: El usuario completa el flujo en menos de 2 minutos sin asistencia..."
        />

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)}
            aria-label="Cancelar y volver a la lista"
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-gray-300"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            aria-label="Guardar la tarea"
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
      
      <ConfirmCancelModal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        onConfirm={() => navigate(`/planes-prueba/${planId}/tareas`)} 
      />
    </div>
  );
}