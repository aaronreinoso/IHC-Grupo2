import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import { AccessibleTextarea } from "../components/AccessibleTextarea";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import { validateTarea } from "../utils/tareaValidation";
import type { TareaFormState } from "../utils/tareaValidation";

const initialState: Omit<TareaFormState, 'prueba_id'> = {
  escenario: "",
  resultado_esperado: "",
  metrica_principal: "",
  criterio_exito: "",
};

// LÍMITES AJUSTADOS: KPIs a 50 y Criterios a 100
const LIMITS = {
  escenario: { min: 20, max: 150 },
  resultado_esperado: { min: 20, max: 150 },
  metrica_principal: { min: 10, max: 50 },
  criterio_exito: { min: 20, max: 100 },
};

const TareaForm: React.FC = () => {
  const { planId, tareaId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState<TareaFormState>({ ...initialState, prueba_id: planId || "" });
  const [errors, setErrors] = useState<Partial<Record<keyof TareaFormState, string>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [limiteMinutosPlan, setLimiteMinutosPlan] = useState<number | null>(null);
  const [producto, setProducto] = useState<String>("");

  useEffect(() => {
    if (planId) {
      (async () => {
        const { data } = await supabase
          .from("pruebas_usabilidad")
          .select("duracion, producto")
          .eq("id", planId)
          .single();
        setProducto(data?.producto || "");  
        if (data && data.duracion) {
           const [h, m, s] = data.duracion.split(':').map(Number);
           setLimiteMinutosPlan((h || 0) * 60 + (m || 0) + ((s || 0) / 60));
        }
      })();
    }
  }, [planId]);

  useEffect(() => {
    if (tareaId) {
      setEditMode(true);
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
    } else {
      setEditMode(false);
      setForm({ ...initialState, prueba_id: planId || "" });
    }
  }, [tareaId, planId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    let finalValue = value;
    const limit = LIMITS[name as keyof typeof LIMITS];
    
    if (limit && value.length > limit.max) {
      finalValue = value.slice(0, limit.max);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));

    if (limit && finalValue.length >= limit.min && errors[name as keyof TareaFormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    const validationErrors = validateTarea(form);
    
    if (!form.prueba_id) {
        setFeedback("Error: No se ha asociado un Plan de Prueba a esta tarea.");
        return;
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.focus();
      }
      return;
    }
    
    setLoading(true);

    if (limiteMinutosPlan !== null) {
      const { count } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', form.prueba_id);
      
      const currentTasks = count || 0;
      const tasksToValidate = editMode ? currentTasks : currentTasks + 1;
      const requiredMinutes = tasksToValidate * 2; 
      
      if (requiredMinutes > limiteMinutosPlan) {
        setFeedback(`Error: El plan tiene ${limiteMinutosPlan} min. Solo permite ${Math.floor(limiteMinutosPlan / 2)} tareas (2 min/tarea).`);
        setLoading(false);
        return;
      }
    }
    
    try {
      let error;
      if (editMode && tareaId) {
        ({ error } = await supabase.from("tareas").update(form).eq("id", tareaId));
      } else {
        ({ error } = await supabase.from("tareas").insert([form]));
      }

      if (error) {
        setFeedback("Error al guardar: " + error.message);
      } else {
        navigate(`/planes-prueba/${planId}/tareas`, { 
          state: { feedback: editMode ? "¡Tarea actualizada correctamente!" : "¡Tarea guardada correctamente!" } 
        });
      }
    } catch (err) {
      setFeedback("Error inesperado al guardar.");
    } finally {
      setLoading(false);
    }
  };

  const renderCounter = (field: keyof typeof LIMITS, customMessage: string) => {
    const length = form[field].length;
    const { min, max } = LIMITS[field];
    const isUnderMin = length > 0 && length < min;
    const isAtMax = length >= max;

    return (
      <div className="flex justify-between text-xs mt-1 ml-1 px-1" aria-hidden="true">
        <span className={`${isUnderMin ? "text-red-600 font-medium" : "text-gray-500"}`}>
          {customMessage} (Mín. {min})
        </span>
        <span className={`${isAtMax ? "text-red-600 font-bold" : "text-gray-500 font-medium"}`}>
          {length}/{max}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-8 bg-gray-50 rounded-2xl shadow-lg border border-blue-100">
      
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight mb-4">
          {editMode ? "Editar Tarea" : "Nueva Tarea"}
        </h1>

        {producto && (
          <div 
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 shadow-sm flex items-center gap-2"
            aria-label="Información del producto"
          >
            <span className="font-medium">Producto a evaluar:</span> 
            <span className="font-bold text-blue-800">{producto}</span>
          </div>
        )}
      </header>
      
      {feedback && (
        <div 
          role="status" 
          aria-live="polite" 
          className={`p-4 mb-6 rounded-xl text-base font-semibold shadow-sm ${
            feedback.startsWith("Error") 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        
        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            1. Contexto de la Tarea
          </h2>
          <div className="space-y-5">
            <div>
              <AccessibleTextarea 
                id="escenario" 
                name="escenario" 
                label="Escenario *" 
                value={form.escenario} 
                onChange={handleChange} 
                error={errors.escenario} 
                maxLength={LIMITS.escenario.max} 
                required 
                placeholder="Ej: El usuario debe encontrar el producto X..." 
              />
              {renderCounter("escenario", "Describe la situación.")}
            </div>
            
            <div>
              <AccessibleTextarea 
                id="resultado_esperado" 
                name="resultado_esperado" 
                label="Resultado Esperado *" 
                value={form.resultado_esperado} 
                onChange={handleChange} 
                error={errors.resultado_esperado} 
                maxLength={LIMITS.resultado_esperado.max} 
                required 
                placeholder="Ej: El producto aparece en el carrito..." 
              />
              {renderCounter("resultado_esperado", "Explica qué debe suceder.")}
            </div>
          </div>
        </section>

        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            2. Definición de Éxito
          </h2>
          <div className="space-y-5">
            <div>
              <AccessibleInput 
                id="metrica_principal" 
                name="metrica_principal" 
                label="Métrica Principal (KPIs) *" 
                value={form.metrica_principal} 
                onChange={handleChange} 
                error={errors.metrica_principal} 
                maxLength={LIMITS.metrica_principal.max} 
                required 
                placeholder="Ej: Tiempo de tarea..." 
              />
              {renderCounter("metrica_principal", "¿Qué vas a medir?")}
            </div>
            
            <div>
              <AccessibleTextarea 
                id="criterio_exito" 
                name="criterio_exito" 
                label="Criterio de Éxito *" 
                value={form.criterio_exito} 
                onChange={handleChange} 
                error={errors.criterio_exito} 
                maxLength={LIMITS.criterio_exito.max} 
                required 
                placeholder="Ej: El flujo se completa en < 2 min..." 
              />
              {renderCounter("criterio_exito", "Condición exacta para el éxito.")}
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)} 
            className="w-full sm:w-1/3 py-3 px-4 font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full sm:w-2/3 py-3 px-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:bg-blue-400"
          >
            {loading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
      
      <ConfirmCancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => navigate(`/planes-prueba/${planId}/tareas`)} />
    </div>
  );
};

export default TareaForm;