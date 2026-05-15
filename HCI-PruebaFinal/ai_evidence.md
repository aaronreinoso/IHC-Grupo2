# Fase 5: Evidencia de Uso de IA

Para la resolución integral de esta prueba práctica, se utilizaron herramientas de Inteligencia Artificial (Figma AI y Asistentes LLM) con el objetivo de optimizar la experiencia de usuario, aplicar correctamente las heurísticas de Nielsen y diseñar los estados dinámicos del sistema.

A continuación, se documentan los prompts utilizados en el flujo de trabajo:

## 1. Optimización de Código y Estructura Cognitiva (Frontend)
El primer paso fue utilizar IA para analizar el código React original y aplicar leyes de percepción visual, reduciendo la carga cognitiva del formulario extenso.

* **Herramienta:** Gemini
* **Prompt utilizado:**
  > "Actúa como un experto en HCI. Revisa mi componente TareaForm.tsx en React y sugiéreme cómo aplicar la Ley de Proximity de Gestalt y mejorar la jerarquía visual para que el usuario no se sienta abrumado por los campos de texto. Genera el código para agrupar los inputs en cards con títulos claros."
* **Resultado Obtenido:** La IA sugirió dividir el formulario en dos secciones lógicas: '1. Contexto de la Tarea' y '2. Definición de Éxito', envolviéndolos en contenedores `<section>` con bordes suaves y sombras. Esto se implementó directamente en el código fuente, mejorando radicalmente el escaneo visual.

## 2. Generación de Wireframes Base (Figma AI)
Con la estructura lógica definida, se utilizó IA para generar la primera propuesta visual de la pantalla.

* **Herramienta:** Figma AI / LLM
* **Prompt utilizado:**
  > "Diseña una pantalla de escritorio para un Dashboard de Usabilidad llamada 'Nueva Tarea'. Usa un fondo gris claro (#F9FAFB). En la parte superior, coloca migas de pan que digan 'Dashboard / Planes de Prueba / Plan Alpha / Nueva Tarea'. El contenido principal debe estar dividido en dos tarjetas blancas amplias con sombra suave: '1. Contexto de la Tarea' y '2. Definición de Éxito'. Añade un botón primario azul de 'Guardar' deshabilitado y un Toast verde de éxito flotando en la esquina superior derecha."
* **Resultado Obtenido:** Se generó la estructura arquitectónica base (Mid-Fi) que definió la ubicación de los *breadcrumbs*, los *badges* de información y la alineación de los botones de acción, ubicados en la carpeta `/wireframes`.

## 3. Diseño de Flujos de Interacción y Estados (UI Avanzada)
Para evidenciar las heurísticas de "Prevención de Errores" y "Visibilidad del Estado", se solicitó a la IA generar las variantes dinámicas de la interfaz.

* **Herramienta:** Figma AI / LLM
* **Prompt utilizado:**
  > "Actúa como un UX/UI Designer Senior. Necesito diseñar un flujo de interacción (variantes de estado) para la pantalla 'Formulario de Nueva Tarea' de un aplicativo web académico. El diseño debe ser minimalista, con fondo claro, tarjetas blancas con sombras sutiles, botones en azul institucional, y colores semánticos (rojo para error, verde para éxito, amarillo/naranja para advertencias).
  > Por favor, diseña 3 vistas o estados de esta misma pantalla para mostrar el comportamiento dinámico:
  >
  > **Vista 1: Estado con Errores de Validación (Prevención de errores)**
  > Muestra el campo 'Escenario *' con un texto inválido (ej. 'zzzzzzzz'). El borde del campo debe ser rojo. Debajo, muestra un mensaje de error en rojo: '! Error semántico: Contenido sin valor detectado'. Muestra el campo 'Métrica Principal (KPIs) *' completamente vacío, pero con el borde rojo y un mensaje debajo que diga: '! Este campo es obligatorio para continuar'. El botón primario 'Guardar Tarea' debe verse deshabilitado.
  >
  > **Vista 2: Calificación de la Información (Feedback en tiempo real)**
  > Los campos ahora tienen información válida y detallada. Debajo del campo 'Resultado Esperado *', incluye un indicador de calidad de datos: una pequeña barra de progreso visual o un texto dinámico en color verde que diga '✓ Calidad del detalle: Alta (45/150 caracteres)'. El botón 'Guardar Tarea' ahora está activo en color azul vibrante. Importante: En esta vista AÚN NO debe aparecer ningún mensaje de éxito.
  >
  > **Vista 3: Interacción al Guardar y Éxito (Visibilidad del estado)**
  > Muestra la parte inferior de la pantalla en el momento en que el usuario hace clic. El botón primario azul ahora muestra un spinner (anillo de carga animado) y el texto ha cambiado a 'Guardando datos...'. Justo encima de los botones, diseña la aparición dinámica de la notificación de éxito (Toast). Es una caja rectangular con fondo verde muy claro, que incluye un ícono de un trofeo 🏆 y el texto: '¡Excelente Gisselle! Tus datos precisos mejoran la investigación de usabilidad.' (Esta notificación simula haber aparecido un segundo después de presionar el botón)."
* **Resultado Obtenido y Cómo Ayudó en el Diseño UI:**
  La IA fue fundamental para definir la lógica visual de los estados dinámicos del sistema. **¿Cómo ayudó específicamente?**
  1. **Definición Semántica de Colores:** Ayudó a establecer que los errores debían ir acompañados de un borde rojo y un texto explicativo, en lugar de solo bloquear el botón, cumpliendo con la Heurística de "Ayuda para diagnosticar errores".
  2. **Diseño Emocional:** Sugirió el uso de recompensas visuales (como el texto verde "ALTA CALIDAD DE DATOS" y el Toast con el trofeo 🏆), permitiendo entender cómo gamificar la entrada de datos para reducir la frustración del usuario.
  3. **Gestión de la Carga Cognitiva:** Al diseñar el "flujo de interacción", ayudó a planificar que la pantalla no mostrara toda la información de golpe, sino que reaccionara en tiempo real (como el spinner de "Guardando datos...") para cumplir con la Heurística de "Visibilidad del estado del sistema".