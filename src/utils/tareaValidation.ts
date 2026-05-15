export const validateTarea = (values: any) => {
  const errors: any = {};
  const repeatedCharsRegex = /(.)\1{4,}/; // Evita 5 caracteres iguales seguidos

  if (!values.escenario || values.escenario.trim().length < 15) {
    errors.escenario = "El escenario debe ser descriptivo (mín. 15 caracteres).";
  } else if (repeatedCharsRegex.test(values.escenario)) {
    errors.escenario = "El texto contiene caracteres repetitivos inválidos.";
  }

  if (!values.resultado_esperado || values.resultado_esperado.trim().length < 10) {
    errors.resultado_esperado = "El resultado debe ser claro (mín. 10 caracteres).";
  } else if (repeatedCharsRegex.test(values.resultado_esperado)) {
    errors.resultado_esperado = "El texto contiene caracteres repetitivos inválidos.";
  }

  if (!values.criterio_exito || values.criterio_exito.trim().length < 10) {
    errors.criterio_exito = "El criterio de éxito es obligatorio (mín. 10 caracteres).";
  } else if (repeatedCharsRegex.test(values.criterio_exito)) {
    errors.criterio_exito = "El texto contiene caracteres repetitivos inválidos.";
  }

  return errors;
};