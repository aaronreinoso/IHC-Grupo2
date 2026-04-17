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

const TareaForm: React.FC = () => {
  // Leemos planId y tareaId de la ruta
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
        setProducto(data?.producto);  
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
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
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
          state: { feedback: editMode ? "¡Tarea actualizada correctamente!" : "¡Tarea guardada correctamente, !" } 
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
    <div style={{ maxWidth: "85vh", marginLeft: "40vh", marginTop: "-4vh", display: "flex",flexDirection: "column", padding: "2%",minHeight: "100vh", background: "#f9fafb", borderRadius: 18, boxShadow: "0 6px 32px #0002", border: '1px solid #e3eafc' }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", color: '#1976d2', marginBottom: 10 }}>
        {editMode ? "Editar Tarea" : "Nueva Tarea"}
      </h1>

      <div
        style={{
          marginBottom: 10,
          padding: "14px 18px",
          background: "#EAF3FF",
          border: "1px solid #8FB7E8",
          borderRadius: 12,
          color: "#0F3D75",
          fontSize: "1rem",
          fontWeight: 700,
          lineHeight: 1.5,
          boxShadow: "0 1px 2px rgba(15, 61, 117, 0.08)",
        }}
        aria-label="Información del producto"
      >
        Producto: <span style={{ fontWeight: 600, color: "#0A2E57" }}>{producto}</span>
      </div>
      
      {feedback && (
        <div role="status" aria-live="polite" style={{ color: feedback.startsWith("Error") ? "#d32f2f" : "#388e3c", fontWeight: "bold", marginBottom: 18, fontSize: 18, borderRadius: 8, background: feedback.startsWith("Error") ? "#ffebee" : "#e8f5e9", padding: 12, border: `1px solid ${feedback.startsWith("Error") ? "#ffcdd2" : "#c8e6c9"}` }}>
          {feedback}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        
        
        
        <AccessibleTextarea 
          id="escenario" 
          name="escenario" 
          label="Escenario *" 
          value={form.escenario} 
          onChange={handleChange} 
          error={errors.escenario} 
          minLength={20} 
          maxLength={500} 
          required 
          placeholder="Ej: El usuario debe encontrar el producto X..." 
        />
        
        <AccessibleTextarea 
          id="resultado_esperado" 
          name="resultado_esperado" 
          label="Resultado Esperado *" 
          value={form.resultado_esperado} 
          onChange={handleChange} 
          error={errors.resultado_esperado} 
          minLength={20} 
          maxLength={500} 
          required 
          placeholder="Ej: El producto aparece en el carrito..." 
        />
        
        <AccessibleInput 
          id="metrica_principal" 
          name="metrica_principal" 
          label="Métrica Principal (KPIs) *" 
          value={form.metrica_principal} 
          onChange={handleChange} 
          error={errors.metrica_principal} 
          minLength={10} 
          maxLength={250} 
          required 
          placeholder="Ej: Tiempo de consecución de la tarea..." 
        />
        
        <AccessibleTextarea 
          id="criterio_exito" 
          name="criterio_exito" 
          label="Criterio de Éxito *" 
          value={form.criterio_exito} 
          onChange={handleChange} 
          error={errors.criterio_exito} 
          minLength={20} 
          maxLength={300} 
          required 
          placeholder="Ej: El usuario completa el flujo en menos de 2 minutos..." 
        />

        <div style={{ display: 'flex', gap: '2%' }}>
          <button type="button" onClick={() => setShowCancelModal(true)} style={{ fontWeight: "bold", padding: '12px 24px', background: '#e0e0e0', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ fontWeight: "bold", padding: '12px 24px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', flex: 1 }}>
            {loading ? "Guardando..." : "Guardar Tarea"}
          </button>
        </div>
      </form>
      
      <ConfirmCancelModal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)} onConfirm={() => navigate(`/planes-prueba/${planId}/tareas`)} />
    </div>
  );
};

export default TareaForm;