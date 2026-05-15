# Product Backlog — Usability Test Dashboard 2.0

**Proyecto:** Usability Test Dashboard 2.0  
**Asignatura:** Interacción Humano / Computador  
**Rol asumido:** UX Engineer / Frontend Developer  
**Sprint:** Mejora crítica de acceso, retroalimentación y prevención de errores

## Objetivo del backlog
Organizar las mejoras UX detectadas mediante evaluación heurística, priorizando primero el error crítico de seguridad y flujo de acceso: el sistema permitía llegar al Dashboard sin autenticación previa.

## Criterios de priorización

| Nivel | Criterio | Acción esperada |
|---|---|---|
| P1 | Bloquea seguridad, acceso o flujo principal | Corregir antes de cualquier mejora visual |
| P2 | Afecta comprensión, carga cognitiva o validación | Corregir dentro del sprint funcional |
| P3 | Mejora claridad, consistencia o experiencia móvil | Implementar si queda tiempo |

## Backlog priorizado

| ID | Historia de usuario | Problema UX asociado | Prioridad | Responsable sugerido | Criterio de aceptación |
|---|---|---|---|---|---|
| US-01 | Como usuario institucional, quiero que el sistema me solicite iniciar sesión antes de acceder al Dashboard, para proteger la información del aplicativo. | Ausencia de pantalla de acceso; redirección directa al Dashboard sin autenticación. | P1 | Backend / Frontend | Las rutas privadas se protegen con `AuthGuard`; si no hay sesión válida, el usuario es redirigido a `/login`. |
| US-02 | Como usuario, quiero ver mensajes claros de error al iniciar sesión o registrarme, para saber qué debo corregir. | Falta de estados de error y feedback. | P1 | Frontend | El formulario muestra errores por campo, mensajes generales y estados de carga. |
| US-03 | Como usuario nuevo, quiero que el registro indique los requisitos de contraseña, para evitar intentos fallidos. | Prevención de errores insuficiente. | P2 | Frontend | La contraseña valida mínimo 8 caracteres, mayúscula, minúscula y número. |
| US-04 | Como usuario, quiero evitar enviar varias veces el mismo formulario, para no generar registros duplicados o errores de servidor. | Botón “Guardando...” sin bloqueo claro ni control de doble envío. | P2 | Frontend | El submit se bloquea durante la operación y se usa estado `loading`. |
| US-05 | Como usuario, quiero recibir confirmación visual cuando una acción se complete correctamente, para confiar en el sistema. | Escasa visibilidad del estado. | P2 | Frontend | Se usan notificaciones tipo toast para éxito/error. |
| US-06 | Como usuario, quiero que las rutas privadas estén separadas de las rutas públicas, para comprender el flujo de navegación. | Arquitectura de navegación ambigua. | P1 | Frontend | `Login` se mantiene como ruta pública; Dashboard y módulos internos quedan dentro de `AuthGuard`. |
| US-07 | Como administrador, quiero que ciertas acciones estén restringidas por rol, para mantener control de permisos. | Falta de permisos contextuales. | P2 | Backend / Frontend | Las rutas de creación sensible usan `RoleGuard`. |
| US-08 | Como usuario, quiero ayudas contextuales en campos complejos, para reducir mi carga cognitiva. | Terminología técnica sin ayuda. | P3 | UX/UI | Se incluyen ayudas, descripciones y microcopy cerca de los campos. |
| US-09 | Como usuario móvil, quiero que la navegación sea clara en pantallas pequeñas, para no perder contexto. | Sidebar fijo en pantallas reducidas. | P3 | Frontend | El layout debe permitir navegación adaptable y colapsable. |
| US-10 | Como evaluador, quiero que la documentación técnica explique los cambios, para revisar la evidencia en GitHub. | Falta de evidencia organizada. | P1 | Equipo | Se entregan archivos `.md` con backlog, sprint, heurística, IA, wireframes e implementación. |

## Definition of Done

- La mejora crítica de autenticación queda documentada y asociada a evidencia técnica.
- Los archivos `.md` se ubican dentro de `HCI-PruebaFinal/`.
- La evaluación heurística contiene mínimo 10 problemas clasificados por gravedad.
- El rediseño UX justifica leyes de Gestalt, jerarquía visual, arquitectura de información, navegación contextual, prevención de errores y diseño emocional.
- La implementación funcional se describe con archivos modificados, criterios de prueba y commits sugeridos.
