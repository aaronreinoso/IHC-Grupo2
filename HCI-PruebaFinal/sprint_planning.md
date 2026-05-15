# Sprint Planning - Rediseño UX (Sprint 1)

**Objetivo del Sprint:** Resolver las principales violaciones heurísticas (Críticas y Moderadas) identificadas en los módulos de Dashboard, Formularios de Tareas y Navegación, mejorando la prevención de errores y la visibilidad del estado del sistema.

**Capacidad del Equipo:** 1 UX/UI Engineer (Individual)
**Duración Estimada:** 1 Semana

**Tareas Seleccionadas (Sprint Backlog):**
0. **US-01 (Login)** 1. Diseñar Wireframes (Lo-Fi y Hi-Fi) de la pantalla Login.<br>2. Crear componente Login.tsx.<br>3. Implementar protección de rutas en App.tsx. | Equipo Frontend | Por hacer |
1. **(US-02)** Implementar Skeletons y vistas de error de conexión en `Dashboard.tsx`.
2. **(US-03 & US-05)** Diseñar e integrar *Microcopy* y *Tooltips* de ayuda contextual en los selectores de `Participantes.tsx` y etiquetas de `TareaForm.tsx`.
3. **(US-04 & US-07)** Robustecer lógica de `tareaValidation.ts` con expresiones regulares para bloquear spam y definir longitudes mínimas descriptivas.
4. **(US-06)** Integrar feedback visual (Spinner SVG) en estados de carga en botones de acción.
5. **(US-08 & US-10)** Ajustar `Layout.tsx` y `PlanLayout.tsx` para soportar colapso de navegación (sidebar) manteniendo accesibilidad en iconos.
6. **(US-09)** Aplicar paleta de colores semántica (verde, amarillo, rojo) basada en umbrales de éxito en las tarjetas del Dashboard.

**Responsable:** Aarón Adrián Reinoso