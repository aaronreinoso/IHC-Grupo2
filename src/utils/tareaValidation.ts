import { z } from "zod";

export interface TareaFormState {
  prueba_id: string;
  escenario: string;
  resultado_esperado: string;
  metrica_principal: string;
  criterio_exito: string;
}

export const TAREA_LIMITS = {
  escenario: { min: 40, max: 500 },
  resultado_esperado: { min: 30, max: 500 },
  metrica_principal: { min: 10, max: 250 },
  criterio_exito: { min: 40, max: 300 },
};

const countWords = (value: string) => {
  return value.trim().split(/\s+/).filter(Boolean).length;
};

const hasRepeatedCharactersOnly = (value: string) => {
  const cleanValue = value.trim().toLowerCase().replace(/\s/g, "");
  return cleanValue.length > 0 && /^([a-záéíóúñ0-9])\1+$/.test(cleanValue);
};

const hasMeaningfulText = (value: string) => {
  const cleanValue = value.trim();

  if (!cleanValue) return false;
  if (hasRepeatedCharactersOnly(cleanValue)) return false;

  const letters = cleanValue.match(/[a-záéíóúñ]/gi) || [];
  return letters.length >= 10;
};

const containsAny = (value: string, words: string[]) => {
  const normalizedValue = value.toLowerCase();

  return words.some((word) =>
    normalizedValue.includes(word.toLowerCase())
  );
};

const containsMeasurableReference = (value: string) => {
  const normalizedValue = value.toLowerCase();

  return (
    /\d/.test(normalizedValue) ||
    normalizedValue.includes("%") ||
    containsAny(normalizedValue, [
      "segundo",
      "segundos",
      "minuto",
      "minutos",
      "menos de",
      "máximo",
      "maximo",
      "mínimo",
      "minimo",
      "sin errores",
      "sin error",
      "errores críticos",
      "errores criticos",
      "correctamente",
      "completa",
      "completar",
      "éxito",
      "exito",
    ])
  );
};

const escenarioSchema = z
  .string()
  .trim()
  .min(
    TAREA_LIMITS.escenario.min,
    `Describe mejor el contexto de uso. El escenario debe tener al menos ${TAREA_LIMITS.escenario.min} caracteres.`
  )
  .max(
    TAREA_LIMITS.escenario.max,
    `El escenario no debe superar los ${TAREA_LIMITS.escenario.max} caracteres.`
  )
  .refine(hasMeaningfulText, {
    message:
      "Escribe una situación real. Evita texto repetido, incompleto o sin sentido.",
  })
  .refine((value) => countWords(value) >= 10, {
    message:
      "El escenario necesita más detalle. Incluye quién usa el producto, qué quiere lograr y en qué contexto.",
  })
  .refine(
    (value) =>
      containsAny(value, [
        "usuario",
        "participante",
        "persona",
        "cliente",
        "visitante",
        "evaluador",
      ]),
    {
      message:
        "Menciona quién realizará la tarea, por ejemplo: usuario, participante, cliente o persona.",
    }
  )
  .refine(
    (value) =>
      containsAny(value, [
        "buscar",
        "encontrar",
        "completar",
        "crear",
        "registrar",
        "seleccionar",
        "navegar",
        "comprar",
        "agregar",
        "enviar",
        "consultar",
        "acceder",
        "ingresar",
        "editar",
        "filtrar",
      ]),
    {
      message:
        "Incluye una acción concreta que realizará el usuario, por ejemplo: buscar, completar, crear, seleccionar o consultar.",
    }
  );

const resultadoEsperadoSchema = z
  .string()
  .trim()
  .min(
    TAREA_LIMITS.resultado_esperado.min,
    `Explica mejor qué debería ocurrir. El resultado esperado debe tener al menos ${TAREA_LIMITS.resultado_esperado.min} caracteres.`
  )
  .max(
    TAREA_LIMITS.resultado_esperado.max,
    `El resultado esperado no debe superar los ${TAREA_LIMITS.resultado_esperado.max} caracteres.`
  )
  .refine(hasMeaningfulText, {
    message:
      "Describe un resultado observable. Evita texto repetido, incompleto o sin sentido.",
  })
  .refine((value) => countWords(value) >= 8, {
    message:
      "El resultado esperado necesita más detalle. Explica qué verá, recibirá o completará el usuario.",
  })
  .refine(
    (value) =>
      containsAny(value, [
        "muestra",
        "visualiza",
        "aparece",
        "queda",
        "completa",
        "confirma",
        "guarda",
        "actualiza",
        "crea",
        "finaliza",
        "redirecciona",
        "recibe",
        "permite",
      ]),
    {
      message:
        "Indica un resultado verificable, por ejemplo: se muestra, aparece, se guarda, se completa o se confirma.",
    }
  );

const metricaPrincipalSchema = z
  .string()
  .trim()
  .min(
    TAREA_LIMITS.metrica_principal.min,
    `Indica una métrica más clara. Debe tener al menos ${TAREA_LIMITS.metrica_principal.min} caracteres.`
  )
  .max(
    TAREA_LIMITS.metrica_principal.max,
    `La métrica no debe superar los ${TAREA_LIMITS.metrica_principal.max} caracteres.`
  )
  .refine(hasMeaningfulText, {
    message:
      "Escribe una métrica válida. Evita texto repetido, incompleto o sin sentido.",
  })
  .refine(
    (value) =>
      containsAny(value, [
        "tiempo",
        "duración",
        "duracion",
        "segundos",
        "minutos",
        "errores",
        "clics",
        "clicks",
        "porcentaje",
        "%",
        "tasa",
        "éxito",
        "exito",
        "satisfacción",
        "satisfaccion",
        "intentos",
        "completitud",
        "abandono",
      ]),
    {
      message:
        "Usa una métrica medible, por ejemplo: tiempo de tarea, número de errores, porcentaje de éxito, clics o satisfacción.",
    }
  );

const criterioExitoSchema = z
  .string()
  .trim()
  .min(
    TAREA_LIMITS.criterio_exito.min,
    `Define mejor cuándo la tarea será exitosa. El criterio debe tener al menos ${TAREA_LIMITS.criterio_exito.min} caracteres.`
  )
  .max(
    TAREA_LIMITS.criterio_exito.max,
    `El criterio de éxito no debe superar los ${TAREA_LIMITS.criterio_exito.max} caracteres.`
  )
  .refine(hasMeaningfulText, {
    message:
      "Escribe un criterio verificable. Evita texto repetido, incompleto o sin sentido.",
  })
  .refine((value) => countWords(value) >= 8, {
    message:
      "El criterio necesita más detalle. Explica la condición exacta para considerar exitosa la tarea.",
  })
  .refine(containsMeasurableReference, {
    message:
      "El criterio debe ser medible. Incluye una referencia como tiempo, porcentaje, número de errores, 'sin errores' o una condición observable.",
  });

export const tareaSchema = z.object({
  prueba_id: z
    .string()
    .trim()
    .min(1, "Debes seleccionar un plan de prueba antes de guardar la tarea."),
  escenario: escenarioSchema,
  resultado_esperado: resultadoEsperadoSchema,
  metrica_principal: metricaPrincipalSchema,
  criterio_exito: criterioExitoSchema,
});

export const validateTarea = (values: TareaFormState) => {
  const result = tareaSchema.safeParse(values);
  const newErrors: Partial<Record<keyof TareaFormState, string>> = {};

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof TareaFormState;

      if (!newErrors[field]) {
        newErrors[field] = issue.message;
      }
    });
  }

  return newErrors;
};

export const validateTareaField = (
  field: keyof TareaFormState,
  value: string
) => {
  const fieldSchema = tareaSchema.shape[field];
  const result = fieldSchema.safeParse(value);

  if (result.success) return undefined;

  return result.error.issues[0]?.message || "Revisa este campo.";
};