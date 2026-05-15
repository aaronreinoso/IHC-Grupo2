import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import { AccessibleTextarea } from "../components/AccessibleTextarea";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import Toast from "../components/Toast"; 
import { validateTarea } from "../utils/tareaValidation";
import type { TareaFormState } from "../utils/tareaValidation";

const initialState: Omit<TareaFormState, 'prueba_id'> = {
  escenario: "",
  resultado_esperado: "",
  metrica_principal: "",
  criterio_exito: "",
};

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
  const [errors, setErrors] = useState<Partial<Record<keyof TareaFormState, string | undefined>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [limiteMinutosPlan, setLimiteMinutosPlan] = useState<number | null>(null);
  const [producto, setProducto] = useState<String>("");
  
  // Estado para controlar el Tooltip de ayuda de KPIs
  const [showKPIHelp, setShowKPIHelp] = useState(false);

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

  // MEJORA UX: Prevención de Errores - Evaluación en tiempo real sin cortar texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    const limit = LIMITS[name as keyof typeof LIMITS];
    if (limit) {
      if (value.length > limit.max) {
        setErrors((prev) => ({ ...prev, [name]: `Límite excedido. Máximo ${limit.max} caracteres.` }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
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
        setFeedback(editMode ? "¡Tarea actualizada correctamente!" : "¡Tarea guardada correctamente!");
        setTimeout(() => {
          navigate(`/planes-prueba/${planId}/tareas`);
        }, 1500);
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
    const isOverMax = length > max;

    return (
      <div className="flex justify-between text-xs mt-1 ml-1 px-1" aria-hidden="true">
        <span className={`${isUnderMin || isOverMax ? "text-red-600 font-medium" : "text-gray-500"}`}>
          {isOverMax ? "Reduce el texto." : `${customMessage} (Mín. ${min})`}
        </span>
        <span className={`${isOverMax ? "text-red-600 font-bold" : "text-gray-500 font-medium"}`}>
          {length}/{max}
        </span>
      </div>
    );
  };

  // Validación para deshabilitar botón si hay excesos de caracteres
  const hasLengthErrors = Object.values(errors).some(err => err !== undefined);

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-8 bg-gray-50 rounded-2xl shadow-lg border border-blue-100 relative">
      
      {/* MEJORA UX: Navegación Contextual (Breadcrumbs) */}
      <nav className="text-sm font-medium text-gray-500 mb-6 flex items-center gap-2" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-600 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link to={`/planes-prueba/${planId}/tareas`} className="hover:text-blue-600 transition-colors">Tareas del Plan</Link>
        <span>/</span>
        <span className="text-blue-700 font-bold">{editMode ? "Editar Tarea" : "Nueva Tarea"}</span>
      </nav>

      <header className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-800 tracking-tight">
          {editMode ? "Editar Tarea" : "Nueva Tarea"}
        </h1>

        {producto && (
          <div 
            className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 shadow-sm flex items-center gap-2"
            aria-label="Información del producto"
          >
            <span className="font-medium text-blue-600">Evaluando:</span> 
            <span className="font-bold text-blue-900">{producto}</span>
          </div>
        )}
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        
        {/* Ley de Gestalt: Proximidad - Tarjeta 1 */}
        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
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
                required 
                placeholder="Ej: El producto aparece en el carrito..." 
              />
              {renderCounter("resultado_esperado", "Explica qué debe suceder.")}
            </div>
          </div>
        </section>

        {/* Ley de Gestalt: Proximidad - Tarjeta 2 */}
        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm transition-shadow hover:shadow-md">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            2. Definición de Éxito
          </h2>
          <div className="space-y-5">
            
            {/* MEJORA UX: Tooltip de Ayuda para KPI */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <label htmlFor="metrica_principal" className="block text-sm font-bold text-gray-700">
                  Métrica Principal (KPIs) *
                </label>
                <button
                  type="button"
                  onMouseEnter={() => setShowKPIHelp(true)}
                  onMouseLeave={() => setShowKPIHelp(false)}
                  onClick={() => setShowKPIHelp(!showKPIHelp)}
                  className="text-blue-500 hover:text-blue-700 transition-colors focus:outline-none"
                  aria-label="¿Qué es un KPI?"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* Contenido del Emergente (Tooltip) */}
              {showKPIHelp && (
                <div className="absolute z-10 w-64 p-3 mt-1 text-xs text-white bg-slate-800 rounded-lg shadow-xl animate-fade-in border border-slate-600">
                  <p className="font-bold mb-1 text-blue-300 underline">¿Qué es un KPI?</p>
                  <p>Es un indicador clave de desempeño. En UX, son métricas como el <span className="font-bold">tiempo de tarea</span> o la <span className="font-bold">tasa de error</span> que nos dicen si el usuario logró su objetivo.</p>
                </div>
              )}

              <AccessibleInput 
                id="metrica_principal" 
                name="metrica_principal" 
                label="" 
                value={form.metrica_principal} 
                onChange={handleChange} 
                error={errors.metrica_principal} 
                required 
                placeholder="Ej: Tiempo de tarea, clics erróneos..." 
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
                required 
                placeholder="Ej: El flujo se completa en < 2 min..." 
              />
              {renderCounter("criterio_exito", "Condición exacta para el éxito.")}
            </div>
          </div>
        </section>

        {/* Jerarquía Visual: Botones de Acción */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-4 border-t border-gray-200">
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)} 
            className="w-full sm:w-auto py-3 px-6 font-bold text-gray-600 bg-gray-100 border border-gray-300 hover:bg-gray-200 rounded-xl transition-colors focus:ring-4 focus:ring-gray-200"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading || hasLengthErrors} 
            className="w-full sm:w-auto py-3 px-8 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed focus:ring-4 focus:ring-blue-300"
          >
            {loading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
      
      {/* Diseño Emocional: Notificación de Éxito o Error */}
      {feedback && <Toast message={feedback} onClose={() => setFeedback("")} />}

      <ConfirmCancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => navigate(`/planes-prueba/${planId}/tareas`)} />
    </div>
  );
};

export default TareaForm;