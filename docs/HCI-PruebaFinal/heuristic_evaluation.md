# Evaluación Heurística — Usability Test Dashboard 2.0

## Metodología
Se aplicó una evaluación heurística basada en los principios de Nielsen, revisando Login, Dashboard, formularios, navegación y reportes. La escala usada fue:

- **Crítica:** compromete acceso, seguridad, continuidad del flujo o datos.
- **Moderada:** afecta comprensión, eficiencia o prevención de errores.
- **Leve:** afecta consistencia, claridad visual o comodidad de uso.

## Hallazgos principales

| ID | Módulo | Heurística de Nielsen | Descripción del problema | Gravedad | Estado | Sugerencia técnica / UX | Responsable | Prioridad |
|---|---|---|---|---|---|---|---|---|
| 1 | Login | Reconocimiento antes que recuerdo | El sistema redirige directamente al Dashboard sin autenticación previa, dejando expuesta una ruta privada. | Crítica | Corregido / en revisión | Implementar flujo de autenticación con `AuthGuard`, sesión Supabase y redirección obligatoria a `/login` cuando no exista sesión. Eliminar cualquier bypass en producción. | Backend / Frontend | 5 |
| 2 | Dashboard | Visibilidad del estado | Las métricas no muestran mensajes de error detallados ni botones de reintento ante fallos de conexión con el backend. | Moderada | Pendiente | Agregar estados de carga, skeletons, mensajes de error y acción “Reintentar”. | Frontend | 3 |
| 3 | Participantes | Ayuda y documentación | El selector de perfil no explica los niveles de competencia, por ejemplo Medio o Avanzado. | Moderada | Pendiente | Incorporar microcopy, tooltips o descripciones bajo el selector. | UX/UI | 3 |
| 4 | TareaForm | Prevención de errores | No existe validación semántica suficiente para evitar contenido irrelevante o cadenas repetitivas. | Leve | Parcial | Añadir validaciones con Zod/Yup, longitud mínima útil y filtros de repetición. | Frontend | 1 |
| 5 | TareaForm | Ayuda y documentación | Se usan términos técnicos como KPIs o criterios de éxito sin explicación contextual. | Moderada | Parcial | Añadir íconos de ayuda, ejemplos y definiciones breves. | UX/UI | 3 |
| 6 | TareaForm | Visibilidad del estado | El botón muestra texto estático durante guardado y no siempre comunica progreso real. | Leve | Parcial | Usar spinner, barra de progreso o estado dinámico de guardado. | Frontend | 1 |
| 7 | TareaForm | Prevención de errores | Las validaciones de longitud mínima son permisivas y no aseguran descripciones de negocio. | Moderada | Parcial | Fortalecer esquema `tareaValidation.ts` con reglas descriptivas y mensajes claros. | Backend / Frontend | 3 |
| 8 | PlanLayout | Consistencia y estándares | En resoluciones reducidas, los íconos de navegación pueden perder etiquetas o tooltips. | Leve | Pendiente | Mantener etiquetas flotantes, tooltips y navegación colapsable accesible. | Frontend | 1 |
| 9 | Dashboard | Estética y diseño minimalista | La visualización de métricas presenta alta densidad de información y colores sin suficiente significado semántico. | Leve | Pendiente | Rediseñar tarjetas con jerarquía visual, separación por grupos y colores semánticos. | UX/UI | 1 |
| 10 | Navegación | Flexibilidad y eficiencia | El sidebar fijo puede impedir al usuario maximizar el área de trabajo en pantallas pequeñas. | Moderada | Pendiente | Implementar navegación lateral reactiva y opción de colapsar/expandir. | Frontend | 3 |

## Análisis del error crítico

El hallazgo más importante es el acceso directo al Dashboard sin autenticación. Desde HCI, este problema no solo afecta seguridad técnica, sino también la confianza del usuario. Una interfaz institucional debe comunicar límites claros: primero identificación, luego acceso a información interna.

### Impacto UX
- Rompe la expectativa mental de que un sistema institucional requiere acceso seguro.
- Reduce la percepción de confiabilidad del producto.
- Permite que usuarios no autorizados visualicen información o naveguen módulos internos.
- Confunde el flujo de inicio, porque el usuario no sabe si está autenticado o si ingresó por error.

### Solución aplicada / recomendada
- Mantener `Login` como ruta pública.
- Agrupar Dashboard, Planes, Tareas, Participantes, Observaciones y Hallazgos dentro de `AuthGuard`.
- Redirigir a `/login` cuando no exista sesión válida.
- Usar `GuestGuard` para evitar que usuarios autenticados vuelvan al Login.
- Evitar parámetros de desarrollo como `bypassAuth=1` o `skipLogin=1` en producción.

## Recomendaciones finales

1. Corregir primero autenticación y permisos antes de mejoras estéticas.
2. Añadir retroalimentación visible en todas las operaciones asíncronas.
3. Reforzar validaciones en formularios con mensajes humanos y específicos.
4. Mejorar navegación móvil con sidebar colapsable.
5. Documentar cada mejora en commits reales y archivos `.md`.
