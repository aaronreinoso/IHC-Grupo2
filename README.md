# Prueba Práctica Final - HCI / UX
**Sistema:** Usability Test Dashboard 2.0  
---

##  Estructura de Evidencias 

Esta carpeta contiene la documentación de todas las fases requeridas para la evaluación:
   **[Fase 1: Planificación Scrum]**
  * `product_backlog.md`: Historias de usuario, épicas y estimación de prioridades.
  * `sprint_planning.md`: Tareas asignadas y criterios de aceptación para el rediseño.
*  **[Fase 2: Evaluación Heurística]**
  * `heuristic_evaluation.md`: Auditoría basada en los 10 principios de Jakob Nielsen, detectando fallos críticos y moderados en el código base.
* **[Fase 3: Rediseño UX]**
  * Carpeta `wireframes/`: Contiene los bocetos y diseños de alta fidelidad para la solución del formulario de tareas (`TareaForm.tsx`).
*  **[Fase 4: Implementación Funcional]**
  * Los cambios fueron aplicados directamente en el código fuente (carpeta raíz `src/`). Se aplicaron las Leyes de Gestalt, jerarquía visual y prevención de errores en tiempo real.
*  **[Fase 5: Evidencia IA]**
  * `ai_evidence.md`: Documentación de los prompts utilizados para optimizar la estructura de los componentes React y mejorar la carga cognitiva de la interfaz.

---

## Justificación Técnica de Implementación
Se seleccionó el componente **`TareaForm.tsx`** como pantalla crítica a rediseñar. Las mejoras implementadas incluyen:

1. **Prevención de Errores (Heurística #5):** Se eliminó el truncamiento automático de texto (`value.slice`). En su lugar, se implementaron validaciones visuales dinámicas: el borde del `textarea` cambia a estado de error (rojo) si no se cumple con el mínimo/máximo de caracteres requeridos, y se bloquea el envío del formulario.
2. **Leyes de Gestalt (Proximidad):** Se dividió un formulario extenso y abrumador en dos tarjetas semánticas: *Contexto de la Tarea* y *Definición de Éxito*, reduciendo la carga cognitiva.
3. **Diseño Emocional:** Se integraron contadores de caracteres descriptivos (ej. `Mín. 20, 45/150`) que otorgan control al usuario, y notificaciones de éxito (`Toast`) tras completar el guardado para reforzar la sensación de logro.
4. **Protección de Datos:** Se añadió un `ConfirmCancelModal` para evitar salidas accidentales que resulten en pérdida de información tipeada.

---

## Despliegue Local

El proyecto base está construido con **React + Vite + TypeScript** y conectado a **Supabase**. Para probar la implementación de las mejoras UX:
1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar el servidor de desarrollo:
    ```bash
    npm run dev
    ```