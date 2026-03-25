export interface TareaFormState {
  prueba_id: string;
  escenario: string;
  resultado_esperado: string;
  metrica_principal: string;
  criterio_exito: string;
}

export const validateTarea = (values: TareaFormState) => {
  const newErrors: Partial<Record<keyof TareaFormState, string>> = {};
  
  if (!values.prueba_id) {
    newErrors.prueba_id = "Debes seleccionar un Plan de Prueba.";
  }
  
  if (!values.escenario || values.escenario.trim().length < 20) {
    newErrors.escenario = "El escenario debe ser descriptivo (mínimo 20 caracteres).";
  } else if (values.escenario.trim().length > 500) {
    newErrors.escenario = "El escenario es demasiado largo (máximo 500 caracteres).";
  }

  if (!values.resultado_esperado || values.resultado_esperado.trim().length < 20) {
    newErrors.resultado_esperado = "El resultado esperado debe ser detallado (mínimo 20 caracteres).";
  } else if (values.resultado_esperado.trim().length > 500) {
    newErrors.resultado_esperado = "El resultado esperado es demasiado largo (máximo 500 caracteres).";
  }

  if (!values.metrica_principal || values.metrica_principal.trim().length < 10) {
    newErrors.metrica_principal = "Debes especificar la métrica con claridad (mínimo 10 caracteres).";
  } else if (values.metrica_principal.trim().length > 250) {
    newErrors.metrica_principal = "La métrica no puede exceder los 250 caracteres.";
  }

  if (!values.criterio_exito || values.criterio_exito.trim().length < 20) {
    newErrors.criterio_exito = "El criterio de éxito debe ser claro y medible (mínimo 20 caracteres).";
  } else if (values.criterio_exito.trim().length > 300) {
    newErrors.criterio_exito = "El criterio de éxito no puede exceder los 300 caracteres.";
  }

  return newErrors;
};
