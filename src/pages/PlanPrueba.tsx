import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import FormField from "../components/FormField";

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

interface PlanPruebaPageProps {
  id?: string | null;
  onSuccess?: () => void;
}

const PlanPruebaPage: React.FC<PlanPruebaPageProps> = (props) => {
  // Permite funcionar tanto con rutas como con props
  const params = useParams();
  const id = props.id !== undefined ? props.id : params.id;
  const navigate = useNavigate();
  const [form, setForm] = useState<PlanPrueba>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof PlanPrueba, string>>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // Cargar datos si es edición
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
    // eslint-disable-next-line
  }, [id]);

  // Validación avanzada
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
      // Validar que la fecha no sea pasada
      const today = new Date();
      today.setHours(0,0,0,0);
      const inputDate = new Date(values.fecha);
      if (inputDate < today) {
        newErrors.fecha = "La fecha no puede ser anterior a hoy.";
      }
    }
    if (!values.lugar || values.lugar.length < 3) newErrors.lugar = "El lugar es obligatorio.";
    // Validación de duración en formato hh:mm:ss
    if (!/^\d{2}:\d{2}:\d{2}$/.test(values.duracion)) {
      newErrors.duracion = "La duración debe tener el formato hh:mm:ss (ej: 01:30:00)";
    } else {
      const [h, m, s] = values.duracion.split(":").map(Number);
      if (h === 0 && m === 0 && s === 0) newErrors.duracion = "La duración no puede ser 00:00:00";
    }
    if (!values.guion_inicio || values.guion_inicio.length < 5) newErrors.guion_inicio = "El guion de inicio es obligatorio y debe tener al menos 5 caracteres.";
    if (!values.guion_seguimiento || values.guion_seguimiento.length < 5) newErrors.guion_seguimiento = "El guion de seguimiento es obligatorio y debe tener al menos 5 caracteres.";
    if (!values.guion_cierre || values.guion_cierre.length < 5) newErrors.guion_cierre = "El guion de cierre es obligatorio y debe tener al menos 5 caracteres.";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // Manejar cambio de duración con selectores
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
      guion_inicio: form.guion_inicio || "",
      guion_seguimiento: form.guion_seguimiento || "",
      guion_cierre: form.guion_cierre || "",
    };
    try {
      let error;
      if (editMode && id) {
        // Update
        ({ error } = await supabase
          .from("pruebas_usabilidad")
          .update(safeForm)
          .eq("id", id));
      } else {
        // Create
        ({ error } = await supabase.from("pruebas_usabilidad").insert([safeForm]));
      }
      if (error) {
        setFeedback("Error al guardar: " + error.message);
      } else {
        setFeedback(editMode ? "¡Plan de prueba actualizado correctamente!" : "¡Plan de prueba guardado correctamente!");
        if (props.onSuccess) {
          props.onSuccess();
        } else {
          // Pasar mensaje de éxito a la lista usando state
          navigate("/planes-prueba", { state: { feedback: editMode ? "¡Plan de prueba actualizado correctamente!" : "¡Plan de prueba guardado correctamente!" } });
        }
      }
    } catch (err) {
      setFeedback("Error inesperado al guardar.");
      // eslint-disable-next-line no-console
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
      <h1 style={{ fontSize: "2.3rem", fontWeight: "bold", color: '#1976d2', marginBottom: 18 }}>{editMode ? "Editar Plan de Prueba" : "Nuevo Plan de Prueba"}</h1>
      {feedback && (
        <div style={{ color: feedback.startsWith("¡Plan de prueba guardado") || feedback.startsWith("¡Plan de prueba actualizado") ? "#388e3c" : "#d32f2f", fontWeight: "bold", marginBottom: 18, fontSize: 18, borderRadius: 8, background: '#fff', padding: 12, border: '1px solid #e0e0e0' }}>
          {feedback}
        </div>
      )}
      <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <FormField
          label="Producto:"
          name="producto"
          value={form.producto}
          onChange={handleChange}
          error={errors.producto}
          minLength={3}
          required
          placeholder="Ej: sistema ventas"
        />
        <FormField
          label="Módulo evaluado:"
          name="modulo"
          value={form.modulo}
          onChange={handleChange}
          error={errors.modulo}
          minLength={3}
          required
          placeholder="Ej: inventario"
        />
        <FormField
          label="Objetivo:"
          name="objetivo"
          value={form.objetivo}
          onChange={handleChange}
          error={errors.objetivo}
          as="textarea"
          minLength={10}
          required
          placeholder="Describe el objetivo de la prueba"
        />
        <FormField
          label="Perfil de usuarios:"
          name="perfilUsuarios"
          value={form.perfilUsuarios}
          onChange={handleChange}
          error={errors.perfilUsuarios}
          minLength={3}
          required
          placeholder="Ej: admin, usuario final"
        />
        <FormField
          label="Método:"
          name="metodo"
          value={form.metodo}
          onChange={handleChange}
          error={errors.metodo}
          minLength={3}
          required
          placeholder="Ej: Observación directa"
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "bold" }}>
            Fecha:<span style={{ color: 'red' }}>*</span>
          </label><br />
          <input
            type="date"
            name="fecha"
            value={form.fecha}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            required
            style={{ width: '100%', padding: 8, fontSize: 16, border: errors.fecha ? '1px solid red' : undefined, borderRadius: 4 }}
          />
          {errors.fecha && (
            <div style={{ color: "red", fontSize: 13 }}>{errors.fecha}</div>
          )}
        </div>
        <FormField
          label="Lugar:"
          name="lugar"
          value={form.lugar}
          onChange={handleChange}
          error={errors.lugar}
          minLength={3}
          required
          placeholder="Ej: laboratorio 1"
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontWeight: "bold" }}>Duración (hh:mm:ss):</label><br />
          <select
            value={form.duracion.split(":")[0] || "00"}
            onChange={e => handleDurationChange('h', e.target.value)}
            style={{ marginRight: 4 }}
            required
          >
            {[...Array(13)].map((_, i) => (
              <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
            ))}
          </select>
          :
          <select
            value={form.duracion.split(":")[1] || "00"}
            onChange={e => handleDurationChange('m', e.target.value)}
            style={{ margin: "0 4px" }}
            required
          >
            {[...Array(60)].map((_, i) => (
              <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
            ))}
          </select>
          :
          <select
            value={form.duracion.split(":")[2] || "00"}
            onChange={e => handleDurationChange('s', e.target.value)}
            style={{ marginLeft: 4 }}
            required
          >
            {[...Array(60)].map((_, i) => (
              <option key={i} value={i.toString().padStart(2, '0')}>{i.toString().padStart(2, '0')}</option>
            ))}
          </select>
          {errors.duracion && (
            <div style={{ color: "red", fontSize: 13 }}>{errors.duracion}</div>
          )}
        </div>
        <FormField
          label="Guion de inicio:"
          name="guion_inicio"
          value={form.guion_inicio}
          onChange={handleChange}
          error={errors.guion_inicio}
          as="textarea"
          minLength={5}
          required
          placeholder="Bienvenida, instrucciones iniciales, etc."
        />
        <FormField
          label="Guion de seguimiento:"
          name="guion_seguimiento"
          value={form.guion_seguimiento}
          onChange={handleChange}
          error={errors.guion_seguimiento}
          as="textarea"
          minLength={5}
          required
          placeholder="Instrucciones, preguntas, observaciones durante la prueba"
        />
        <FormField
          label="Guion de cierre:"
          name="guion_cierre"
          value={form.guion_cierre}
          onChange={handleChange}
          error={errors.guion_cierre}
          as="textarea"
          minLength={5}
          required
          placeholder="Agradecimientos, cierre, etc."
        />
        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/planes-prueba')}
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
            {loading ? "Guardando..." : "Guardar Plan de Prueba"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanPruebaPage;

