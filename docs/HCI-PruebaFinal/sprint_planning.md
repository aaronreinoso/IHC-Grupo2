# Sprint Planning — Prueba Práctica HCI / UX

## Sprint Goal
Corregir el flujo crítico de acceso del aplicativo y documentar una mejora UX funcional que evidencie evaluación heurística, rediseño, implementación y control de versiones.

## Duración estimada
Sprint académico de 2 horas, organizado en bloques cortos de análisis, implementación y documentación.

## Alcance del sprint

### Incluido
- Revisión del proyecto React/Vite.
- Priorización del error crítico de Login.
- Protección del Dashboard y rutas privadas.
- Mejoras de feedback visual y prevención de errores.
- Documentación Scrum y HCI en archivos `.md`.
- Evidencia de uso de IA.

### No incluido
- Rediseño completo de todos los módulos.
- Cambios de base de datos fuera del flujo de autenticación.
- Implementación de un sistema completo de roles en backend, salvo la evidencia de guardas en frontend.

## Sprint Backlog

| Tarea | Descripción | Prioridad | Responsable | Estado sugerido |
|---|---|---|---|---|
| T1 | Revisar rutas públicas y privadas del proyecto. | Alta | Frontend Developer | Completado |
| T2 | Documentar el error crítico: Dashboard accesible sin autenticación. | Alta | UX Engineer | Completado |
| T3 | Implementar o validar `AuthGuard` para rutas privadas. | Alta | Frontend Developer | Completado |
| T4 | Implementar o validar `GuestGuard` para evitar que usuarios autenticados vuelvan al Login. | Media | Frontend Developer | Completado |
| T5 | Revisar validaciones del Login y Registro. | Alta | Frontend Developer | Completado |
| T6 | Documentar mejoras de microcopy, mensajes de error y estados de carga. | Media | UX/UI Designer | Completado |
| T7 | Crear evaluación heurística con 10 hallazgos. | Alta | UX Engineer | Completado |
| T8 | Crear wireframes Lo-Fi, Mid-Fi y Hi-Fi en formato textual/documental. | Media | UX/UI Designer | Completado |
| T9 | Documentar evidencia de IA y prompts utilizados. | Media | UX Engineer | Completado |
| T10 | Preparar commits sugeridos y evidencia GitHub. | Alta | Equipo | Pendiente de ejecutar en GitHub |

## Historias de usuario seleccionadas

### US-01 — Acceso protegido
**Como** usuario institucional,  
**quiero** que el sistema solicite autenticación antes de ingresar al Dashboard,  
**para** proteger los datos del aplicativo.

**Criterios de aceptación:**
- Sin sesión activa, `/dashboard` redirige a `/login`.
- Las rutas internas están dentro de `AuthGuard`.
- El flujo no depende de recordar una URL manualmente.

### US-02 — Login con prevención de errores
**Como** usuario,  
**quiero** recibir mensajes claros al equivocarme en el Login o Registro,  
**para** corregir mis datos sin frustración.

**Criterios de aceptación:**
- El correo valida formato.
- La contraseña muestra requisitos cuando corresponde.
- El sistema muestra estados de carga y evita doble envío.

### US-03 — Evidencia UX organizada
**Como** docente evaluador,  
**quiero** encontrar la documentación en una carpeta clara,  
**para** comprobar Scrum, heurística, wireframes, IA e implementación.

**Criterios de aceptación:**
- Existe carpeta `HCI-PruebaFinal/`.
- Existen archivos `product_backlog.md`, `sprint_planning.md`, `heuristic_evaluation.md`, `ai_evidence.md` y evidencia de implementación.

## Plan de commits sugeridos

1. `docs: add product backlog and sprint planning`
2. `docs: add heuristic evaluation findings`
3. `ux: redesign login access flow documentation`
4. `feat: protect private routes with auth guard`
5. `docs: add ai evidence and implementation report`

## Riesgos del sprint

| Riesgo | Impacto | Mitigación |
|---|---|---|
| El guard de autenticación solo valida frontend. | Alto | Complementar con políticas de Supabase/RLS en backend. |
| Existe modo bypass de desarrollo. | Alto | Eliminarlo o bloquearlo en producción. |
| Las mejoras visuales no cubren todos los módulos. | Medio | Priorizar la pantalla crítica y documentar próximos pasos. |
| No se ejecutan commits reales. | Medio | Usar los mensajes sugeridos y registrar capturas o historial Git. |
