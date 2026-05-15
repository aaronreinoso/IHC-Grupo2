# Evidencia de Uso de IA en el Proceso UX

**Herramienta Utilizada:** Gemini (Google)

**Propósito:** Asistencia conceptual en diseño de interacciones, validación de heurísticas de Nielsen y estrategias de arquitectura de información. No se utilizó para generación de código directo, sino como consultor de experiencia de usuario.

### Prompts Utilizados durante el análisis:

**Prompt 1: Análisis de Heurística de Ayuda y Documentación**
> *"Actúa como un experto en UX. Estoy evaluando un dashboard de pruebas de usabilidad y noté que los usuarios no saben qué significan términos como 'Criterio de éxito' o 'KPIs' al llenar un formulario. ¿Qué heurística de Nielsen se está violando aquí y cuál sería la mejor forma visual de solucionarlo en React sin recargar demasiado la interfaz gráfica?"*
> **Impacto en el proyecto:** La IA confirmó la violación de "Ayuda y documentación" y sugirió el uso de iconos informativos (ℹ️) con atributos `title` nativos (Tooltips contextuales) colocados estratégicamente dentro de los `labels` de los inputs, solución que fue implementada en `TareaForm.tsx`.

**Prompt 2: Estrategia de Prevención de Errores**
> *"Desde la perspectiva de la heurística de 'Prevención de errores' de Nielsen, tengo un problema en mi sistema: los usuarios a veces ingresan texto basura como 'aaaaa' en los escenarios de prueba para saltarse la validación de campo requerido. ¿Qué técnica de validación de datos recomiendas implementar a nivel de frontend para mitigar esto?"*
> **Impacto en el proyecto:** La IA recomendó implementar "Validación Semántica" a través de Expresiones Regulares (Regex) enfocadas en detectar caracteres repetitivos sucesivos, además de sugerir un aumento en el límite mínimo de caracteres. Esto se tradujo en la lógica implementada en `tareaValidation.ts`.

**Prompt 3: Visibilidad del Estado del Sistema**
> *"Tengo un botón de 'Guardar Tarea' que hace una petición asíncrona a mi base de datos en Supabase. Actualmente el botón solo se queda estático mientras carga. Según la heurística de 'Visibilidad del estado del sistema', ¿qué elementos visuales o de interacción exacta debería incorporar en este botón o en la pantalla mientras se procesa la petición para reducir la ansiedad del usuario?"*
> **Impacto en el proyecto:** Se adoptó la sugerencia de deshabilitar el botón temporalmente para prevenir doble envío y renderizar un "Spinner animado en formato SVG" acompañado del texto dinámico "Guardando...", implementado exitosamente en los formularios de la aplicación.