import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { AccessibleInput } from "../components/AccessibleInput";
import { AccessibleTextarea } from "../components/AccessibleTextarea";
import ConfirmCancelModal from "../components/ConfirmCancelModal";

interface PlanPrueba {
  producto: string;
  modulo: string;
  objetivo: string;
  perfilUsuarios: string;
  metodo: string;
  fecha: string;
  lugar: string;
  duracion: string; // formato hh:mm:ss
  guion_inicio: string;
  guion_seguimiento: string;
  guion_cierre: string;
}

const initialState: PlanPrueba = {
  producto: "",
  modulo: "",
  objetivo: "",
  perfilUsuarios: "",
  metodo: "",
  fecha: "",
  lugar: "",
  duracion: "",
  guion_inicio: "",
  guion_seguimiento: "",
  guion_cierre: "",
};

export default function PlanPruebaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<PlanPrueba>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof PlanPrueba, string>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (id) {
      setEditMode(true);
      (async () => {
        const { data, error } = await supabase
          .from("pruebas_usabilidad")
          .select("*")
          .eq("id", id)
          .single();
        if (data) {
          setForm({
            producto: data.producto || "",
            modulo: data.modulo_evaluado || "",
            objetivo: data.objetivo || "",
            perfilUsuarios: data.perfil_usuarios || "",
            metodo: data.metodo || "",
            fecha: data.fecha || "",
            lugar: data.lugar || "",
            duracion: data.duracion || "",
            guion_inicio: data.guion_inicio || "",
            guion_seguimiento: data.guion_seguimiento || "",
            guion_cierre: data.guion_cierre || "",
          });
        } else if (error) {
          setFeedback("No se pudo cargar el plan de prueba.");
        }
      })();
    } else {
      setEditMode(false);
      setForm(initialState);
    }
  }, [id]);

  const validate = (values: PlanPrueba) => {
    const newErrors: Partial<Record<keyof PlanPrueba, string>> = {};
    if (!values.producto || values.producto.length < 3) newErrors.producto = "El producto debe tener al menos 3 caracteres.";
    if (!values.modulo || values.modulo.length < 3) newErrors.modulo = "El módulo debe tener al menos 3 caracteres.";
    if (!values.objetivo || values.objetivo.length < 10) newErrors.objetivo = "El objetivo debe tener al menos 10 caracteres.";
    if (!values.perfilUsuarios || values.perfilUsuarios.length < 3) newErrors.perfilUsuarios = "El perfil de usuarios es obligatorio.";
    if (!values.metodo || values.metodo.length < 3) newErrors.metodo = "El método es obligatorio.";
    if (!values.fecha) {
      newErrors.fecha = "La fecha es obligatoria.";
    } else {
      const today = new Date();
      today.setHours(0,0,0,0);
      const inputDate = new Date(values.fecha);
      if (inputDate < today && !editMode) {
        newErrors.fecha = "La fecha no puede ser anterior a hoy.";
      }
    }
    if (!values.lugar || values.lugar.length < 3) newErrors.lugar = "El lugar es obligatorio.";
    
    if (!/^\d{2}:\d{2}:\d{2}$/.test(values.duracion)) {
      newErrors.duracion = "La duración debe tener el formato hh:mm:ss";
    } else {
      const [h, m, s] = values.duracion.split(":").map(Number);
      if (h === 0 && m === 0 && s === 0) newErrors.duracion = "La duración no puede ser 00:00:00";
    }
    
    if (!values.guion_inicio || values.guion_inicio.length < 5) newErrors.guion_inicio = "Obligatorio (mínimo 5 caracteres).";
    if (!values.guion_seguimiento || values.guion_seguimiento.length < 5) newErrors.guion_seguimiento = "Obligatorio (mínimo 5 caracteres).";
    if (!values.guion_cierre || values.guion_cierre.length < 5) newErrors.guion_cierre = "Obligatorio (mínimo 5 caracteres).";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleDurationChange = (type: 'h' | 'm' | 's', value: string) => {
    const [h, m, s] = form.duracion.split(":").map((v) => v.padStart(2, '0'));
    let newH = h || "00", newM = m || "00", newS = s || "00";
    if (type === 'h') newH = value.padStart(2, '0');
    if (type === 'm') newM = value.padStart(2, '0');
    if (type === 's') newS = value.padStart(2, '0');
    const dur = `${newH}:${newM}:${newS}`;
    setForm((prev) => ({ ...prev, duracion: dur }));
    setErrors((prev) => ({ ...prev, duracion: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback("");
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstErrorField = Object.keys(validationErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) element.focus();
      return;
    }
    setLoading(true);
    const safeForm = {
      producto: form.producto,
      modulo_evaluado: form.modulo,
      objetivo: form.objetivo,
      perfil_usuarios: form.perfilUsuarios,
      metodo: form.metodo,
      fecha: form.fecha,
      lugar: form.lugar,
      duracion: form.duracion,
      guion_inicio: form.guion_inicio,
      guion_seguimiento: form.guion_seguimiento,
      guion_cierre: form.guion_cierre,
    };

    try {
      let error;
      let newPlanId = id;

      if (editMode && id) {
        ({ error } = await supabase.from("pruebas_usabilidad").update(safeForm).eq("id", id));
      } else {
        const { data, error: insertError } = await supabase
          .from("pruebas_usabilidad")
          .insert([safeForm])
          .select()
          .single();
        
        error = insertError;
        if (data) {
          newPlanId = data.id;
        }
      }

      if (error) {
        setFeedback("Error al guardar: " + error.message);
      } else {
        if (editMode) {
          navigate("/planes-prueba", { state: { feedback: "¡Plan actualizado correctamente!" } });
        } else {
          // Ahora te envía directamente a la lista de tareas del plan
          navigate(`/planes-prueba/${newPlanId}/tareas`, { 
            state: { feedback: "¡Plan guardado correctamente! Ya puedes gestionar las tareas de este plan." } 
          });
        }
      }
    } catch (err) {
      setFeedback("Error inesperado al guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-200 mt-10">
      <h1 className="text-2xl font-bold text-blue-700 mb-6">
        {editMode ? "Editar Plan de Prueba" : "Nuevo Plan de Prueba"}
      </h1>

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

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibleInput
            id="producto" name="producto" label="Producto:"
            value={form.producto} onChange={handleChange} error={errors.producto}
            placeholder="Ej: Sistema ventas" required
          />
          <AccessibleInput
            id="modulo" name="modulo" label="Módulo evaluado:"
            value={form.modulo} onChange={handleChange} error={errors.modulo}
            placeholder="Ej: Inventario" required
          />
        </div>

        <AccessibleTextarea
          id="objetivo" name="objetivo" label="Objetivo de la prueba:"
          value={form.objetivo} onChange={handleChange} error={errors.objetivo}
          placeholder="Describe el objetivo principal..." required rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibleInput
            id="perfilUsuarios" name="perfilUsuarios" label="Perfil de usuarios:"
            value={form.perfilUsuarios} onChange={handleChange} error={errors.perfilUsuarios}
            placeholder="Ej: Estudiantes universitarios" required
          />
          <AccessibleInput
            id="metodo" name="metodo" label="Método:"
            value={form.metodo} onChange={handleChange} error={errors.metodo}
            placeholder="Ej: Moderado remoto" required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AccessibleInput
            id="fecha" name="fecha" type="date" label="Fecha programada:"
            value={form.fecha} onChange={handleChange} error={errors.fecha}
            min={new Date().toISOString().split('T')[0]} required
          />
          <AccessibleInput
            id="lugar" name="lugar" label="Lugar o Canal:"
            value={form.lugar} onChange={handleChange} error={errors.lugar}
            placeholder="Ej: Zoom-Online o Lab 1-Presencial" required
          />
        </div>

        <div className="flex flex-col mb-4">
          <label className="mb-1 text-sm font-semibold text-gray-800">
            Duración estimada (hh:mm:ss):
          </label>
          <div className="flex items-center gap-2">
            <select
              value={form.duracion.split(":")[0] || "00"}
              onChange={e => handleDurationChange('h', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[...Array(13)].map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className="font-bold text-gray-500">:</span>
            <select
              value={form.duracion.split(":")[1] || "00"}
              onChange={e => handleDurationChange('m', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
            <span className="font-bold text-gray-500">:</span>
            <select
              value={form.duracion.split(":")[2] || "00"}
              onChange={e => handleDurationChange('s', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {[...Array(60)].map((_, i) => (
                <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
              ))}
            </select>
          </div>
          {errors.duracion && <span className="mt-1 text-sm text-red-600 font-medium">{errors.duracion}</span>}
        </div>

        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Guion del Moderador (Borrador Inicial)</h3>
          <AccessibleTextarea
            id="guion_inicio" name="guion_inicio" label="Guion de inicio:"
            value={form.guion_inicio} onChange={handleChange} error={errors.guion_inicio}
            placeholder="Instrucciones iniciales..." required rows={2}
          />
          <AccessibleTextarea
            id="guion_seguimiento" name="guion_seguimiento" label="Guion de seguimiento:"
            value={form.guion_seguimiento} onChange={handleChange} error={errors.guion_seguimiento}
            placeholder="Preguntas durante la prueba..." required rows={2}
          />
          <AccessibleTextarea
            id="guion_cierre" name="guion_cierre" label="Guion de cierre:"
            value={form.guion_cierre} onChange={handleChange} error={errors.guion_cierre}
            placeholder="Agradecimientos y preguntas finales..." required rows={2}
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-gray-100">
          <button 
            type="button" 
            onClick={() => setShowCancelModal(true)}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-gray-300"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors focus:ring-4 focus:ring-blue-300 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Plan de Prueba"}
          </button>
        </div>
      </form>
      
      <ConfirmCancelModal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        onConfirm={() => navigate('/planes-prueba')} 
      />
    </div>
  );
}