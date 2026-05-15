# Evidencia de uso de IA — Prueba Práctica HCI / UX

## Herramienta utilizada
ChatGPT como apoyo para revisión UX, organización Scrum, documentación de evaluación heurística y generación de propuestas de mejora.

## Propósito del uso de IA
La IA se utilizó como herramienta de apoyo, no como sustituto del criterio técnico. Sirvió para estructurar la documentación, priorizar hallazgos, redactar criterios de aceptación y convertir los problemas detectados en tareas accionables.

## Prompts utilizados

### Prompt 1 — Revisión del error crítico
> Revisa este proyecto React de un Dashboard HCI y ayúdame a documentar el error crítico donde el sistema permite entrar al Dashboard sin autenticación previa. Necesito una explicación UX, técnica y una solución con AuthGuard.

**Resultado obtenido:**  
Se identificó que el flujo debía separar rutas públicas y privadas. La solución se documentó mediante guardas de autenticación y redirección a `/login` cuando no hay sesión.

**Cómo ayudó:**  
Permitió transformar un problema de seguridad en un hallazgo UX claro, con impacto, criterio de aceptación y recomendación técnica.

---

### Prompt 2 — Backlog y Sprint Planning
> Con base en la prueba práctica de HCI, crea un Product Backlog y Sprint Planning para un proyecto llamado Usability Test Dashboard 2.0, priorizando el problema crítico del Login y otras mejoras UX.

**Resultado obtenido:**  
Se estructuraron historias de usuario, tareas del sprint, criterios de aceptación, riesgos y commits sugeridos.

**Cómo ayudó:**  
Facilitó la organización Scrum exigida en la prueba y permitió vincular cada hallazgo con una tarea concreta.

---

### Prompt 3 — Evaluación heurística
> Genera una evaluación heurística con mínimo 10 problemas UX clasificados como críticos, moderados y leves para Login, Dashboard, formularios, navegación y reportes.

**Resultado obtenido:**  
Se generó una tabla con módulo, heurística de Nielsen, descripción, gravedad, estado, sugerencia técnica, responsable y prioridad.

**Cómo ayudó:**  
Permitió evidenciar el análisis HCI de forma ordenada y alineada con la rúbrica.

---

### Prompt 4 — Wireframes documentados
> Crea wireframes Lo-Fi, Mid-Fi y Hi-Fi en formato Markdown para rediseñar la pantalla crítica de Login, aplicando Gestalt, jerarquía visual, arquitectura de información, navegación contextual, prevención de errores y diseño emocional.

**Resultado obtenido:**  
Se obtuvieron wireframes textuales y una justificación de diseño para la pantalla de acceso.

**Cómo ayudó:**  
Ayudó a explicar el rediseño sin depender de imágenes externas, cumpliendo la restricción de originalidad.

---

### Prompt 5 — Evidencia de implementación
> Documenta los cambios técnicos aplicados en el proyecto React: Login, AuthGuard, GuestGuard, RoleGuard, validaciones, mensajes de error y estados de carga.

**Resultado obtenido:**  
Se generó un reporte técnico con archivos impactados, criterios de prueba y observaciones de seguridad.

**Cómo ayudó:**  
Sirvió para conectar la mejora UX con evidencia funcional y revisable en GitHub.

## Reflexión sobre el uso de IA
La IA ayudó principalmente en la organización y redacción técnica. Las decisiones finales se basan en la revisión del proyecto y en los criterios de HCI: seguridad percibida, prevención de errores, visibilidad del estado, consistencia y diseño centrado en el usuario.

## Limitaciones
- La IA no reemplaza pruebas reales con usuarios.
- Las recomendaciones deben validarse ejecutando el proyecto.
- La protección real de datos debe complementarse con políticas de seguridad en Supabase, no solo con guardas del frontend.
