# Sprint Planning - Sprint 1

**Nombre del Proyecto:** Rediseño UX - Usability Test Dashboard 2.0  
**Objetivo del Sprint:** Solucionar los problemas críticos de prevención de errores y control del usuario, enfocándose en la implementación de validaciones visuales claras y la estructuración del flujo de autenticación (Login).  
**Duración Estimada:** 1 Semana  

### Backlog del Sprint (Tareas Seleccionadas)

| ID Historia | Tareas Técnicas (To-Do) | Asignado a | Estado |
| :--- | :--- | :--- | :--- |
| **US-01 (Login)** | 1. Diseñar Wireframes (Lo-Fi y Hi-Fi) de la pantalla Login.<br>2. Crear componente `Login.tsx`.<br>3. Implementar protección de rutas en `App.tsx`. | Equipo Frontend | Por hacer |
| **US-02 (Feedback Dashboard)** | 1. Capturar el error en el bloque `catch` de `Dashboard.tsx`.<br>2. Importar e instanciar `<Toast message={error} />`. | Equipo Frontend | Por hacer |
| **US-03 (Mejora TareaForm)** | 1. Eliminar `value.slice` en la función `handleChange`.<br>2. Añadir renderizado condicional de bordes rojos en `AccessibleTextarea`.<br>3. Deshabilitar el submit si hay errores de longitud. | Equipo Frontend | En progreso |
| **US-04 (Página 404)** | 1. Crear componente `NotFound.tsx` con diseño institucional.<br>2. Configurar la ruta comodín `<Route path="*" />` en React Router. | Equipo Frontend | Por hacer |

### Criterios de Aceptación Globales
* El código debe pasar sin advertencias en la consola.
* Los componentes creados deben seguir la paleta de colores actual (Tailwind CSS: `blue-600`, `gray-50`, `red-600` para errores).
* Se deben subir commits descriptivos a GitHub (Ej: `feat: implementación de página de login y validación de rutas`).