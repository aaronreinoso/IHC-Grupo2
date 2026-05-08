import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import { AccessibleTextarea } from "../components/AccessibleTextarea";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import Toast from "../components/Toast";
import {
  validateTarea,
  validateTareaField,
  TAREA_LIMITS,
} from "../utils/tareaValidation";
import type { TareaFormState } from "../utils/tareaValidation";

const initialState: Omit<TareaFormState, "prueba_id"> = {
  escenario: "",
  resultado_esperado: "",
  metrica_principal: "",
  criterio_exito: "",
};

const FIELD_FEEDBACK = {
  escenario: {
    success: "✓ El escenario describe una situación real de uso.",
    empty:
      "Ejemplo: El usuario necesita encontrar un producto específico usando el buscador de la página.",
  },
  resultado_esperado: {
    success: "✓ El resultado esperado es observable.",
    empty:
      "Ejemplo: El sistema muestra el producto correcto y permite agregarlo al carrito.",
  },
  metrica_principal: {
    success: "✓ La métrica principal es medible.",
    empty:
      "Ejemplo: Tiempo de tarea, número de errores, porcentaje de éxito o cantidad de clics.",
  },
  criterio_exito: {
    success: "✓ El criterio de éxito puede comprobarse.",
    empty:
      "Ejemplo: El usuario completa la tarea en menos de 2 minutos y sin errores críticos.",
  },
};

const INFO_CONTENT = {
  escenario: {
    title: "¿Qué es el escenario?",
    description:
      "Es la situación que se le plantea al usuario durante la prueba. Debe explicar quién usa el producto, qué necesita lograr y en qué contexto.",
    example:
      "Ejemplo: El usuario quiere comprar una camiseta desde la página principal y necesita encontrar su talla.",
  },
  resultado_esperado: {
    title: "¿Qué es el resultado esperado?",
    description:
      "Es lo que debería pasar si el usuario completa la tarea correctamente. Debe ser algo observable en la interfaz.",
    example:
      "Ejemplo: El producto seleccionado aparece en el carrito con la talla y cantidad correctas.",
  },
  metrica_principal: {
    title: "¿Qué significa métrica principal?",
    description:
      "Es el dato que usarás para evaluar el desempeño del usuario. También se conoce como KPI, pero aquí lo llamamos métrica para que sea más claro.",
    example:
      "Ejemplo: tiempo de tarea, número de errores, porcentaje de éxito, número de clics o satisfacción.",
  },
  criterio_exito: {
    title: "¿Qué es el criterio de éxito?",
    description:
      "Es la condición que permite decidir si la tarea fue completada de forma correcta. Debe ser medible y fácil de comprobar.",
    example:
      "Ejemplo: La tarea será exitosa si el usuario completa la compra en menos de 2 minutos y sin errores críticos.",
  },
};

type FieldName = keyof typeof TAREA_LIMITS;

interface InfoPopoverProps {
  title: string;
  description: string;
  example: string;
}

const InfoPopover: React.FC<InfoPopoverProps> = ({
  title,
  description,
  example,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="
          ml-2
          inline-flex
          h-6
          w-6
          items-center
          justify-center
          rounded-full
          border
          border-blue-300
          bg-blue-50
          text-xs
          font-bold
          text-blue-800
          hover:bg-blue-100
          focus:outline-none
          focus:ring-2
          focus:ring-blue-300
        "
        aria-label={`Más información: ${title}`}
        aria-expanded={isOpen}
      >
        i
      </button>

      {isOpen && (
        <span
          className="
            absolute
            left-0
            top-8
            z-40
            w-72
            rounded-xl
            border
            border-gray-200
            bg-white
            p-4
            text-left
            shadow-xl
          "
          role="tooltip"
        >
          <span className="block text-sm font-bold text-gray-900">
            {title}
          </span>
          <span className="mt-2 block text-sm leading-5 text-gray-700">
            {description}
          </span>
          <span className="mt-3 block rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">
            {example}
          </span>
        </span>
      )}
    </span>
  );
};

const FieldTitle: React.FC<{
  title: string;
  required?: boolean;
  info: InfoPopoverProps;
}> = ({ title, required = true, info }) => {
  return (
    <div className="mb-2 flex items-center">
      <span className="text-sm font-semibold text-gray-800">
        {title} {required && <span aria-hidden="true">*</span>}
      </span>
      <InfoPopover {...info} />
    </div>
  );
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

  const [touched, setTouched] = useState<
    Partial<Record<keyof TareaFormState, boolean>>
  >({});

  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [limiteMinutosPlan, setLimiteMinutosPlan] = useState<number | null>(
    null
  );
  const [producto, setProducto] = useState<string>("");

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
          setLimiteMinutosPlan(
            (h || 0) * 60 + (m || 0) + (s || 0) / 60
          );
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
          setFeedback(
            "No pudimos cargar esta tarea. Intenta nuevamente en unos segundos."
          );
        }
      })();
    } else {
      setEditMode(false);
      setForm({ ...initialState, prueba_id: planId || "" });
    }
  }, [tareaId, planId]);

  const getFieldStatus = (field: FieldName) => {
    const value = form[field].trim();
    const fieldError = validateTareaField(field, value);

    if (errors[field]) return "error";
    if (!value) return "empty";
    if (fieldError) return "warning";

    return "success";
  };

  const getFieldClassName = (field: FieldName) => {
    const status = getFieldStatus(field);

    if (status === "success") {
      return "border-emerald-500 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";
    }

    if (status === "error") {
      return "border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100 bg-red-50";
    }

    if (status === "warning") {
      return "border-amber-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-100";
    }

    return "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
  };

  const isFormComplete = Object.keys(TAREA_LIMITS).every((field) => {
    const key = field as FieldName;
    return !validateTareaField(key, form[key]);
  });

  const progressCount = Object.keys(TAREA_LIMITS).filter((field) => {
    const key = field as FieldName;
    return !validateTareaField(key, form[key]);
  }).length;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const field = name as FieldName;

    let finalValue = value;
    const limit = TAREA_LIMITS[field];

    if (limit && value.length > limit.max) {
      finalValue = value.slice(0, limit.max);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (errors[name as keyof TareaFormState]) {
      const fieldError = validateTareaField(
        name as keyof TareaFormState,
        finalValue
      );

      if (!fieldError) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    const field = name as keyof TareaFormState;

    setTouched((prev) => ({ ...prev, [name]: true }));

    const fieldError = validateTareaField(field, value);

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");

    const validationErrors = validateTarea(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      setTouched({
        escenario: true,
        resultado_esperado: true,
        metrica_principal: true,
        criterio_exito: true,
      });

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
          `Advertencia: este plan dura ${limiteMinutosPlan} min. Para mantener una prueba realista, solo permite ${Math.floor(
            limiteMinutosPlan / 2
          )} tareas de 2 min cada una.`
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
        setFeedback(
          "No pudimos guardar la tarea. Revisa tu conexión e intenta nuevamente."
        );
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
      setFeedback(
        "Ocurrió un problema inesperado al guardar. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderFieldFeedback = (field: FieldName) => {
    const length = form[field].trim().length;
    const { min, max } = TAREA_LIMITS[field];
    const status = getFieldStatus(field);
    const showTouchedFeedback = touched[field] || length > 0;
    const fieldWarning = validateTareaField(field, form[field]);

    const messageClass =
      status === "error"
        ? "text-red-700 font-medium"
        : status === "success"
        ? "text-emerald-700 font-semibold"
        : status === "warning"
        ? "text-amber-700 font-medium"
        : "text-gray-600";

    const counterClass =
      length >= max
        ? "text-red-700 font-bold"
        : status === "success"
        ? "text-emerald-700 font-semibold"
        : "text-gray-600 font-medium";

    let message = FIELD_FEEDBACK[field].empty;

    if (status === "error") {
      message = errors[field] || "Revisa este campo antes de continuar.";
    } else if (status === "success") {
      message = FIELD_FEEDBACK[field].success;
    } else if (showTouchedFeedback && fieldWarning) {
      message = fieldWarning;
    } else if (showTouchedFeedback && length > 0 && length < min) {
      message = `Sigue escribiendo: faltan ${
        min - length
      } caracteres para completar este campo.`;
    }

    return (
      <div
        className="flex justify-between gap-3 text-xs mt-1 ml-1 px-1"
        id={`${field}-feedback`}
        aria-live="polite"
      >
        <span className={messageClass}>{message}</span>
        <span className={counterClass}>
          {length}/{max}
        </span>
      </div>
    );
  };

  const renderMotivationalMessage = () => {
    const remainingFields = Object.keys(TAREA_LIMITS).length - progressCount;

    if (isFormComplete) {
      return (
        <div
          className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800"
          role="status"
          aria-live="polite"
        >
          ✅ ¡Excelente! La tarea cumple con los criterios mínimos de claridad,
          medición y contexto. Ya puedes guardarla.
        </div>
      );
    }

    return (
      <div
        className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-800"
        role="status"
        aria-live="polite"
      >
        💡 Vas bien: completa o mejora {remainingFields} campo
        {remainingFields === 1 ? "" : "s"} para que la tarea sea clara,
        medible y útil en la prueba de usabilidad.
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 p-4 sm:p-8 bg-white rounded-2xl shadow-lg border border-gray-200 relative">
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 tracking-tight">
            {editMode ? "Editar Tarea" : "Nueva Tarea"}
          </h1>

          {isFormComplete && (
            <div className="inline-flex items-center justify-center rounded-full bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold text-blue-800">
              ⭐ Tarea clara y medible
            </div>
          )}
        </div>

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
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            1. Contexto de la Tarea
          </h2>

          <div className="space-y-5">
            <div>
              <FieldTitle
                title="Escenario"
                info={INFO_CONTENT.escenario}
              />

              <AccessibleTextarea
                id="escenario"
                name="escenario"
                label="Escenario"
                value={form.escenario}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.escenario}
                maxLength={TAREA_LIMITS.escenario.max}
                required
                placeholder="Ej: El usuario necesita encontrar una camiseta usando el buscador de la tienda..."
                aria-describedby="escenario-feedback"
                inputClassName={getFieldClassName("escenario")}
                hideLabel
                hideError
              />
              {renderFieldFeedback("escenario")}
            </div>

            <div>
              <FieldTitle
                title="Resultado esperado"
                info={INFO_CONTENT.resultado_esperado}
              />

              <AccessibleTextarea
                id="resultado_esperado"
                name="resultado_esperado"
                label="Resultado esperado"
                value={form.resultado_esperado}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.resultado_esperado}
                maxLength={TAREA_LIMITS.resultado_esperado.max}
                required
                placeholder="Ej: El sistema muestra el producto correcto y permite agregarlo al carrito..."
                aria-describedby="resultado_esperado-feedback"
                inputClassName={getFieldClassName("resultado_esperado")}
                hideLabel
                hideError
              />
              {renderFieldFeedback("resultado_esperado")}
            </div>
          </div>
        </section>

        <section className="bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            2. Medición de la Tarea
          </h2>

          <div className="space-y-5">
            <div>
              <FieldTitle
                title="Métrica principal"
                info={INFO_CONTENT.metrica_principal}
              />

              <AccessibleInput
                id="metrica_principal"
                name="metrica_principal"
                label="Métrica principal"
                value={form.metrica_principal}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.metrica_principal}
                maxLength={TAREA_LIMITS.metrica_principal.max}
                required
                placeholder="Ej: Tiempo de tarea y número de errores cometidos..."
                aria-describedby="metrica_principal-feedback"
                inputClassName={getFieldClassName("metrica_principal")}
                hideLabel
                hideError
              />
              {renderFieldFeedback("metrica_principal")}
            </div>

            <div>
              <FieldTitle
                title="Criterio de éxito"
                info={INFO_CONTENT.criterio_exito}
              />

              <AccessibleTextarea
                id="criterio_exito"
                name="criterio_exito"
                label="Criterio de éxito"
                value={form.criterio_exito}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.criterio_exito}
                maxLength={TAREA_LIMITS.criterio_exito.max}
                required
                placeholder="Ej: La tarea será exitosa si el usuario completa la compra en menos de 2 minutos y sin errores críticos..."
                aria-describedby="criterio_exito-feedback"
                inputClassName={getFieldClassName("criterio_exito")}
                hideLabel
                hideError
              />
              {renderFieldFeedback("criterio_exito")}
            </div>
          </div>
        </section>

        {renderMotivationalMessage()}

        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={loading}
            className="w-full sm:w-1/3 py-3 px-4 font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-2/3 py-3 px-4 font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <span
                className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin"
                aria-hidden="true"
              />
            )}
            {loading ? "Guardando tarea..." : "Guardar Tarea"}
          </button>
        </div>
      </form>

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