import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import Toast from "../components/Toast";
import { validateTarea } from "../utils/tareaValidation";

interface TareaFormState {
  prueba_id: string;
  escenario: string;
  resultado_esperado: string;
  metrica_principal: string;
  criterio_exito: string;
}

const initialState: Omit<TareaFormState, "prueba_id"> = {
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

  const [form, setForm] = useState<TareaFormState>({
    ...initialState,
    prueba_id: planId || "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TareaFormState, string>>
  >({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [limiteMinutosPlan, setLimiteMinutosPlan] = useState<number | null>(
    null,
  );
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
          const [h, m, s] = data.duracion.split(":").map(Number);
          setLimiteMinutosPlan((h || 0) * 60 + (m || 0) + (s || 0) / 60);
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    let finalValue = value;
    const limit = LIMITS[name as keyof typeof LIMITS];

    if (limit && value.length > limit.max) {
      finalValue = value.slice(0, limit.max);
    }

    setForm((prev: TareaFormState) => ({ ...prev, [name]: finalValue }));

    if (
      limit &&
      finalValue.length >= limit.min &&
      errors[name as keyof TareaFormState]
    ) {
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
        .from("tareas")
        .select("*", { count: "exact", head: true })
        .eq("prueba_id", form.prueba_id);

      const currentTasks = count || 0;
      const tasksToValidate = editMode ? currentTasks : currentTasks + 1;
      const requiredMinutes = tasksToValidate * 2;

      if (requiredMinutes > limiteMinutosPlan) {
        setFeedback(
          `Error: El plan tiene ${limiteMinutosPlan} min. Solo permite ${Math.floor(limiteMinutosPlan / 2)} tareas (2 min/tarea).`,
        );
        setLoading(false);
        return;
      }
    }

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
        navigate(`/planes-prueba/${planId}/tareas`, {
          state: {
            feedback: editMode
              ? "¡Tarea actualizada correctamente!"
              : "¡Tarea guardada correctamente!",
          },
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
      <div
        className="flex justify-between text-xs mt-1 ml-1 px-1"
        aria-hidden="true"
      >
        <span
          className={`${isUnderMin ? "text-red-600 font-medium" : "text-gray-500"}`}
        >
          {customMessage} (Mín. {min})
        </span>
        <span
          className={`${isAtMax ? "text-red-600 font-bold" : "text-gray-500 font-medium"}`}
        >
          {length}/{max}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-8 bg-gray-50 rounded-2xl shadow-lg border border-blue-100 relative">
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

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
            1. Contexto de la Tarea
          </h2>
          <div className="space-y-5">
            <div>
              <AccessibleInput
                id="escenario"
                name="escenario"
                label={
                  <span className="flex items-center gap-1">
                    Escenario * <span title="Describe el contexto o la situación inicial en la que se encuentra el usuario antes de iniciar la tarea (ej. 'El usuario quiere comprar un regalo para un amigo')" className="cursor-help text-blue-500 text-sm">ℹ️</span>
                  </span>
                }
                value={form.escenario}
                onChange={handleChange}
                error={errors.escenario}
                maxLength={500}
                required
                placeholder="Ej: El usuario debe encontrar el producto X..."
              />
              {renderCounter("escenario", "Describe la situación.")}
            </div>

            <div>
              <AccessibleInput
                id="resultado_esperado"
                name="resultado_esperado"
                label={
                  <span className="flex items-center gap-1">
                    Resultado Esperado * <span title="Define qué acción específica debe completar el usuario para que la tarea se considere finalizada (ej. 'El usuario llega a la página de confirmación de compra')" className="cursor-help text-blue-500 text-sm">ℹ️</span>
                  </span>
                }
                value={form.resultado_esperado}
                onChange={handleChange}
                error={errors.resultado_esperado}
                maxLength={500}
                required
                placeholder="Ej: El usuario agrega el producto al carrito exitosamente"
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
                label={
                  <span className="flex items-center gap-1">
                    Métrica Principal (KPIs) * <span title="Indicador Clave de Rendimiento (KPI) que se usará para medir la eficiencia de la tarea (ej. 'Tiempo en la tarea', 'Tasa de error')" className="cursor-help text-blue-500 text-sm">ℹ️</span>
                  </span>
                }
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
              <AccessibleInput
                id="criterio_exito"
                name="criterio_exito"
                label={
                  <span className="flex items-center gap-1">
                    Criterio de Éxito * <span title="Métrica que define si la tarea se completó correctamente (ej. 'Logró comprar en menos de 3 clics')" className="cursor-help text-blue-500 text-sm">ℹ️</span>
                  </span>
                }
                value={form.criterio_exito}
                onChange={handleChange}
                error={errors.criterio_exito}
                maxLength={500}
                required
                placeholder="Ej: Menos de 3 clics para completar la acción"
              />
              {renderCounter(
                "criterio_exito",
                "Condición exacta para el éxito.",
              )}
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
            className="w-full sm:w-2/3 py-3 px-4 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors disabled:bg-blue-400 flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar Tarea"
            )}
          </button>
        </div>
      </form>

      {/* Toast Render */}
      <Toast message={feedback} onClose={() => setFeedback("")} />

      <ConfirmCancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate(`/planes-prueba/${planId}/tareas`)}
      />
    </div>
  );
};

export default TareaForm;
