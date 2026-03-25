import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import FormField from "../components/FormField";
import PlanDatalist from "../components/PlanDatalist";
import ConfirmCancelModal from "../components/ConfirmCancelModal";
import type { PlanPruebaShort } from "../types/plan";
import { validateTarea } from "../utils/tareaValidation";
import type { TareaFormState } from "../utils/tareaValidation";

const initialState: TareaFormState = {
  prueba_id: "",
  escenario: "",
  resultado_esperado: "",
  metrica_principal: "",
  criterio_exito: "",
};

const TareaForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<TareaFormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof TareaFormState, string>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [planesList, setPlanesList] = useState<PlanPruebaShort[]>([]);
  const [inputPlanText, setInputPlanText] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    // Sincronizar el texto del input si estamos editando y cargamos el id
    if (form.prueba_id && planesList.length > 0) {
      const p = planesList.find(p => p.id === form.prueba_id);
      if (p) setInputPlanText(p.producto);
    }
  }, [form.prueba_id, planesList]);

  // Cargar lista de planes de prueba disponibles
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("pruebas_usabilidad")
        .select("id, producto, duracion");
      if (!error && data) {
        setPlanesList(data);
      }
    })();
  }, []);

  useEffect(() => {
    if (id) {
      setEditMode(true);
      (async () => {
        const { data, error } = await supabase
          .from("tareas")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          setForm({
            prueba_id: data.prueba_id || "",
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
      setForm(initialState);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const element = document.getElementsByName(firstErrorField)[0];
      if (element) {
        element.focus();
      }
      
      return;
    }
    setLoading(true);

    // Validación de negocio: Verificar si la duración del plan permite agregar esta tarea
    const selectedPlan = planesList.find(p => p.id === form.prueba_id);
    if (selectedPlan && selectedPlan.duracion) {
      // Convertir hh:mm:ss a minutos
      const [h, m, s] = selectedPlan.duracion.split(':').map(Number);
      const limitMinutes = (h || 0) * 60 + (m || 0) + ((s || 0) / 60);

      // Contar tareas actuales de este plan
      const { count } = await supabase
        .from('tareas')
        .select('*', { count: 'exact', head: true })
        .eq('prueba_id', form.prueba_id);
      
      const currentTasks = count || 0;
      
      // Si estamos agregando una nueva tarea (o cambiando de plan)
      const tasksToValidate = editMode ? currentTasks : currentTasks + 1;
      const requiredMinutes = tasksToValidate * 2; // Regla: 2 minutos por tarea mínimo
      
      if (requiredMinutes > limitMinutes) {
        setFeedback(`Error de validación: El plan seleccionado tiene una duración de ${limitMinutes} minutos, lo cual solo permite un máximo de ${Math.floor(limitMinutes / 2)} tareas (2 minutos requeridos por tarea).`);
        setLoading(false);
        return;
      }
    }
    
    try {
      let error;
      if (editMode && id) {
        ({ error } = await supabase
          .from("tareas")
          .update(form)
          .eq("id", id));
      } else {
        ({ error } = await supabase.from("tareas").insert([form]));
      }

      if (error) {
        setFeedback("Error al guardar: " + error.message);
      } else {
        navigate("/tareas", { 
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
    <div style={{
      maxWidth: 800,
      margin: "2.5rem auto",
      padding: 36,
      background: "#f9fafb",
      borderRadius: 18,
      boxShadow: "0 6px 32px #0002",
      border: '1px solid #e3eafc',
      fontFamily: 'Segoe UI, Arial, sans-serif',
    }}>
      <h1 style={{ fontSize: "2.3rem", fontWeight: "bold", color: '#1976d2', marginBottom: 18 }}>
        {editMode ? "Editar Tarea" : "Nueva Tarea"}
      </h1>
      
      {feedback && (
        <div 
          role="status"
          aria-live="polite"
          style={{ 
            color: feedback.startsWith("Error") ? "#d32f2f" : "#388e3c", 
            fontWeight: "bold", 
            marginBottom: 18, 
            fontSize: 18, 
            borderRadius: 8, 
            background: feedback.startsWith("Error") ? "#ffebee" : "#e8f5e9", 
            padding: 12, 
            border: `1px solid ${feedback.startsWith("Error") ? "#ffcdd2" : "#c8e6c9"}` 
          }}
        >
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }} aria-label="Formulario de tareas del test">
        <PlanDatalist
          planesList={planesList}
          inputPlanText={inputPlanText}
          setInputPlanText={setInputPlanText}
          error={errors.prueba_id}
          onChangePlanId={(id) => {
            handleChange({ target: { name: 'prueba_id', value: id } } as any);
          }}
        />
        
        <FormField
          label="Escenario:"
          name="escenario"
          value={form.escenario}
          onChange={handleChange}
          error={errors.escenario}
          as="textarea"
          minLength={20}
          maxLength={500}
          required
          placeholder="Ej: El usuario debe encontrar el producto X, agregarlo al carrito y proceder a la pantalla de pago..."
        />
        <FormField
          label="Resultado Esperado:"
          name="resultado_esperado"
          value={form.resultado_esperado}
          onChange={handleChange}
          error={errors.resultado_esperado}
          as="textarea"
          minLength={20}
          maxLength={500}
          required
          placeholder="Ej: El producto aparece en el carrito con el precio correcto y el botón de pago habilitado."
        />
        <FormField
          label="Métrica Principal (KPIs):"
          name="metrica_principal"
          value={form.metrica_principal}
          onChange={handleChange}
          error={errors.metrica_principal}
          minLength={10}
          maxLength={250}
          required
          placeholder="Ej: Tiempo de consecución de la tarea, Tasa de éxito sin errores."
        />
        <FormField
          label="Criterio de Éxito:"
          name="criterio_exito"
          value={form.criterio_exito}
          onChange={handleChange}
          error={errors.criterio_exito}
          as="textarea"
          minLength={20}
          maxLength={300}
          required
          placeholder="Ej: El usuario completa el flujo en menos de 2 minutos sin asistencia ni errores críticos."
        />

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)}
            aria-label="Cancelar y volver a la lista"
            style={{ 
              fontWeight: "bold", 
              padding: '12px 24px', 
              background: '#e0e0e0', 
              color: '#333', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            aria-label="Guardar la tarea"
            style={{ 
              fontWeight: "bold", 
              padding: '12px 24px', 
              background: '#1976d2', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {loading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
      
      <ConfirmCancelModal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        onConfirm={() => navigate('/tareas')} 
      />
    </div>
  );
};

export default TareaForm;