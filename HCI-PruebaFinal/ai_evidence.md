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
>
# Prompts para Generación de Wireframes (Rediseño UX)

A continuación, se detallan los prompts utilizados en herramientas de Inteligencia Artificial generativa (como Midjourney, v0.dev o DALL-E) para la creación de los wireframes en sus tres niveles de fidelidad para el formulario "Gestión de Tareas de Usabilidad".

## 1. Wireframe Lo-Fi (Baja Fidelidad - Conceptualización)

**Objetivo:** Definir la estructura básica, distribución de componentes y jerarquía sin elementos visuales distractores.

**Prompt utilizado:**
> "Genera un wireframe de nivel Lo-Fi (estilo boceto a mano alzada en blanco y negro o wireframe de líneas simples) para una aplicación web de escritorio. La pantalla muestra un formulario llamado 'Gestión de Tareas de Usabilidad'. En el lado izquierdo hay un menú lateral colapsado (solo se ven iconos cuadrados). En el centro, un formulario estructurado en una sola columna. El formulario tiene tres campos de entrada de texto de una sola línea (no cajas grandes de texto). Junto a las etiquetas de texto de cada campo, dibuja un pequeño círculo que represente un ícono de ayuda (tooltip). Al final del formulario, dibuja un botón rectangular ancho. No incluyas colores ni imágenes reales, usa líneas y cajas (placeholders) típicas de un wireframe temprano."

---

## 2. Wireframe Mid-Fi (Media Fidelidad - Estructura Digital)

**Objetivo:** Establecer la jerarquía tipográfica, márgenes reales, espaciados y escala de grises para el flujo de interacción.

**Prompt utilizado:**
> "Diseña un wireframe Mid-Fi (fidelidad media, estricto uso de escala de grises, sin colores vivos) de un Dashboard de UX. La vista principal es un formulario de captura de datos llamado 'Nueva Tarea'. El menú lateral izquierdo está en un tono gris oscuro, colapsado, mostrando 4 iconos minimalistas. El área principal tiene un fondo gris muy claro. El formulario contiene inputs de texto de una sola línea bien definidos. Al lado de etiquetas como 'Criterio de Éxito', incluye un ícono de 'información' (una 'i' minúscula en un círculo). El botón inferior debe decir 'Guardar Tarea' y tener un pequeño círculo al lado del texto simulando un spinner de carga en pausa. Diseño limpio, espaciado uniforme, estilo componente web."

---

## 3. Wireframe Hi-Fi (Alta Fidelidad - Mockup Final)

**Objetivo:** Mostrar el diseño visual final con la paleta de colores, tipografía exacta y sistema de diseño implementado (Tailwind CSS).

**Prompt utilizado:**
> "Genera un diseño UI Hi-Fi (alta fidelidad, realista, estilo moderno con Tailwind CSS) para una plataforma web de pruebas de usabilidad. El menú lateral izquierdo es de color azul marino oscuro (slate-900), colapsado. El área de trabajo tiene un fondo gris muy claro (gray-50). En el centro hay un formulario dentro de una tarjeta blanca con bordes suaves y sombra ligera. Las etiquetas del formulario son texto oscuro y tienen un pequeño ícono azul de 'información' (tooltip) flotando al lado. Los campos de entrada (inputs) son de una sola línea con bordes sutiles en gris claro. El botón de envío es de color azul brillante (blue-600) y muestra el texto 'Guardando...' junto con un ícono de spinner de carga (SVG animado) en blanco. La estética debe ser profesional, limpia y enfocada en accesibilidad."