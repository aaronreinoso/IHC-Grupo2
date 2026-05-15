# Cambios aplicados al login según Interacción Humano-Computador

## 1. Leyes de Gestalt
- Se agruparon los campos dentro de contenedores visuales para reforzar la ley de proximidad.
- Se mantuvo alineación uniforme entre etiquetas, campos, ayudas y errores para reforzar semejanza y continuidad.
- Se separó el panel informativo del formulario para diferenciar zonas funcionales.

## 2. Jerarquía visual
- Se agregó una estructura clara: marca, estado del formulario, título principal, descripción, navegación y acción principal.
- El botón principal tiene mayor peso visual para indicar la acción más importante.
- Los textos secundarios usan menor tamaño y color más suave para no competir con la acción principal.

## 3. Arquitectura de información
- Se organizó el acceso en dos modos: Ingresar y Registrarse.
- Cada modo muestra solo la información necesaria para completar la tarea.
- Los mensajes de ayuda se colocaron cerca del campo correspondiente.

## 4. Navegación contextual
- Se reemplazó el enlace inferior como única alternativa por una navegación tipo pestaña entre Ingresar y Registrarse.
- El estado activo indica claramente en qué contexto se encuentra el usuario.
- También se conserva una acción contextual al final del formulario.

## 5. Prevención de errores
- Se añadieron ayudas, mensajes de error por campo y aviso general cuando hay errores.
- El registro muestra requisitos de contraseña en tiempo real.
- Se mantiene el bloqueo de doble envío y cooldown ante demasiados intentos.
- Se agregaron atributos de accesibilidad como `aria-invalid` y `aria-describedby`.

## 6. Diseño emocional
- Se incorporó un lenguaje más cercano: “Bienvenido/a de nuevo”, “Entrar al dashboard”, “Crear cuenta segura”.
- Se añadió una interfaz más amable con tarjetas, sombras suaves, bordes redondeados y fondo degradado.
- Los mensajes refuerzan seguridad, confianza y claridad.

Archivo modificado principal: `src/pages/Login.tsx`.
