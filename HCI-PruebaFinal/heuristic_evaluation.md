# Matriz de Evaluación Heurística

| ID | Módulo | Heurística de Nielsen | Descripción del Problema | Gravedad | Sugerencia UX |
|---|---|---|---|---|---|
| **1** | Login | Reconocimiento antes que recuerdo | Ausencia de pantalla de acceso; el sistema redirige al Dashboard sin autenticación. | **Crítica** | Implementar flujo de autenticación (Auth Guard) para proteger datos. |
| **2** | Dashboard | Visibilidad del estado | Las métricas no muestran mensajes de error ni botones de reintento ante fallos de conexión. | **Moderada** | Implementar estados de carga (skeletons) y vistas de error de red. |
| **3** | Participantes | Ayuda y documentación | El selector de perfil carece de descripciones que definan los niveles de competencia (ej. Medio). | **Moderada** | Incorporar microcopy o tooltips explicativos para reducir la carga cognitiva. |
| **4** | TareaForm | Prevención de errores | No existe validación semántica para evitar contenido "basura" (ej. cadenas repetitivas). | **Leve** | Integrar filtros de expresiones regulares (Regex) para asegurar la calidad. |
| **5** | TareaForm | Ayuda y documentación | Se emplean términos técnicos complejos sin proveer ayuda contextual para usuarios novatos. | **Moderada** | Añadir iconos de información que ofrezcan definiciones técnicas. |
| **6** | TareaForm | Visibilidad del estado | El botón de acción muestra texto estático sin indicadores dinámicos de progreso. | **Leve** | Utilizar spinners para confirmar que el proceso asíncrono está activo. |
| **7** | TareaForm | Prevención de errores | Las validaciones de longitud mínima son permisivas e insuficientes. | **Moderada** | Robustecer el esquema exigiendo descripciones que cumplan criterios de negocio. |
| **8** | PlanLayout | Consistencia y estándares | En móviles, los iconos de navegación pierden etiquetas y carecen de tooltips. | **Leve** | Asegurar consistencia mediante etiquetas flotantes o atributos visuales. |
| **9** | Dashboard | Estética y diseño minimalista | Alta densidad de información sin colores semánticos para éxito/error. | **Leve** | Rediseñar métricas aplicando colores contrastantes (verde/rojo) para el escaneo. |
| **10** | Navegación | Flexibilidad y eficiencia | El Sidebar permanece fijo, impidiendo colapsarlo para maximizar el área de trabajo. | **Moderada** | Implementar navegación lateral reactiva que permita el colapso. |