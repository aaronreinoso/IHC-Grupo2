# HCI-PruebaFinal — Resumen de entrega

Esta carpeta contiene la documentación solicitada para la prueba práctica final de HCI / UX del proyecto **Usability Test Dashboard 2.0**.

## Archivos incluidos

| Archivo | Contenido |
|---|---|
| `product_backlog.md` | Backlog priorizado con historias de usuario y criterios de aceptación. |
| `sprint_planning.md` | Planificación Scrum del sprint académico. |
| `heuristic_evaluation.md` | Evaluación heurística con 10 hallazgos UX. |
| `ai_evidence.md` | Prompts usados, resultados y reflexión sobre IA. |
| `github_evidence.md` | Commits sugeridos y comandos Git. |
| `wireframes/wireframes_login.md` | Wireframes Lo-Fi, Mid-Fi y Hi-Fi del Login. |
| `implementation/technical_changes.md` | Evidencia de implementación funcional y revisión técnica. |

## Hallazgo crítico priorizado
El sistema permitía el acceso directo al Dashboard sin autenticación previa. La documentación propone y evidencia la corrección mediante rutas privadas protegidas con `AuthGuard`, redirección a `/login`, validaciones en el formulario y feedback visual.

## Recomendación clave
Antes de publicar el proyecto, se debe eliminar o restringir cualquier bypass de desarrollo de autenticación, especialmente parámetros como `bypassAuth=1` o `skipLogin=1`, porque contradicen la solución del hallazgo crítico.
