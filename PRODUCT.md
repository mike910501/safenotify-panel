# SafeNotify Panel — Decisiones de producto

Este archivo es la **fuente de verdad** sobre qué construir, cómo se ve, y cómo se comporta el panel. Cualquier decisión que aparezca aquí no se reabre sin razón fuerte.

Para reglas técnicas, ver `CLAUDE.md`. Para arquitectura de código, ver `ARCHITECTURE.md` (cuando exista).

---

## 1. Audiencia

### Usuario primario: Claudia Beltrán (D'Andrés Comidas Rápidas)
- Dueña de un restaurante pequeño en Barrancabermeja.
- Conoce WhatsApp pero NO es técnica.
- Va a usar el panel desde el celular y ocasionalmente desde un computador.
- Necesita saber rápido **cuándo intervenir** sin tener que leer todo.

### Usuario futuro: otros dueños de restaurantes
- Mismo perfil que Claudia.
- El panel debe escalar a multi-tenant (filtrar por `negocio_id`).

### Usuario interno: Michael (admin)
- Usa el panel para soporte y para validar que todo funciona.
- Eventualmente necesitará vista cross-negocio (ver todo lo que pasa en todos los clientes), pero NO en v1.

---

## 2. Features de v1 (lo que SÍ va)

### Auth
- Login con email + password (Supabase Auth).
- Logout desde sidebar.
- Sin "olvidé mi contraseña" en v1 (Michael resetea manual desde Supabase).
- Sin signup público (solo Michael crea usuarios).

### Conversaciones (vista principal, default)
- Lista de chats activos del negocio, ordenados por último mensaje.
- Búsqueda por nombre o número de teléfono.
- Click en chat → abre el detalle a la derecha.
- **Chats urgentes parpadean en rosa coral** (ver sección "Comportamiento de chats urgentes").
- Tag visual en cada chat: `bot activo`, `bot pausado`, `requiere humano`, `cliente molesto`.

### Detalle de conversación
- Historial completo de mensajes con timestamps.
- Mensajes diferenciados visualmente: cliente / bot / humano.
- Botón **"Pausar 30 min"** — pausa el bot temporalmente.
- Botón **"Tomar control"** — pausa indefinida.
- Input para enviar mensaje manual (al enviar, pausa el bot automáticamente y lo envía vía Twilio a través de `mensajes_salientes_panel`).

### Pedidos
- Tabla de pedidos del negocio.
- Filtros: por estado (`abierto`, `en_preparación`, `entregado`, `cancelado`).
- Columnas: código (`PED-XXX`), cliente, items, total, estado, hora de creación.
- Cambiar estado de un pedido con un click (dropdown o botones).
- NO se puede editar items, total, ni borrar pedidos desde el panel.

### Métricas (versión simple para v1)
- Tarjetas con números clave del día actual:
  - Conversaciones activas
  - Pedidos del día
  - Total facturado del día
  - Mensajes enviados/recibidos del día
- NO incluye gráficos en v1; solo números grandes con sus labels.

### Configuración (mínima para v1)
- Nombre del negocio (lectura).
- Email del usuario (lectura).
- Botón de logout.
- NO incluye edición de prompt del bot, menú, horarios — esa configuración se sigue editando en Supabase manualmente.

---

## 3. Features que NO van en v1 (pero pueden ir en v2+)

- ❌ Edición de configuración del bot (prompt, menú, horarios, FAQs) desde el panel.
- ❌ Onboarding self-service de nuevos negocios.
- ❌ Multi-usuario por negocio (varios empleados en un mismo restaurante).
- ❌ Notificaciones push o por email.
- ❌ Métricas avanzadas (gráficos, tendencias, comparativos).
- ❌ Vista cross-negocio para admin Michael.
- ❌ Reset de contraseña self-service.
- ❌ Búsqueda en historial de mensajes pasados.
- ❌ Exportar conversaciones o pedidos a CSV/PDF.
- ❌ Plantillas de respuestas rápidas.

---

## 4. Diseño visual

### Estilo general
**Cercano y amigable**, no corporativo frío ni informal infantil. Pensado para que Claudia (no técnica) se sienta cómoda y para que Michael (técnico) lo respete como producto serio.

### Paleta de colores (pastel)

| Rol | Color | Hex |
|---|---|---|
| Sidebar fondo | Verde menta suave | `#E8F0DC` |
| Sidebar texto activo | Verde oscuro | `#3B6D11` |
| Verde principal (botón enviar, acentos) | Verde pistacho | `#B8D88A` |
| Verde hover | Verde pistacho oscuro | `#A5C674` |
| Naranja (pausa) | Durazno | `#FAE0B8` |
| Naranja oscuro (pausa hover) | Durazno oscuro | `#F0C58A` |
| Rojo (urgencia) | Rosa coral | `#F4A8A6` |
| Rojo oscuro (tomar control hover) | Rosa coral oscuro | `#E88A88` |
| Texto sobre coral | Rojo vino | `#7A2E2D` |
| Texto sobre durazno | Marrón cálido | `#854F0B` |
| Texto sobre menta | Verde profundo | `#3B6D11` |
| Fondo principal | Beige cálido | `#FAF8F5` |
| Fondo de cards | Blanco | `#FFFFFF` |

**Modo oscuro:** activo. Sidebar pasa a verde-marrón profundo, fondos a tonos antracita cálidos. Los colores semánticos (rosa coral, durazno, menta) mantienen su rol pero con stops más oscuros.

### Tipografía
- Sans-serif moderna (Inter o Geist; aplicar la default de shadcn/ui).
- Pesos: 400 regular, 500 medium. NO usar 600 ni 700 (se ven pesados en pastel).
- Tamaños base: 13-14px para UI, 16px para texto de lectura, 18-22px para títulos.

### Bordes y radios
- Border radius: 8px (`rounded-lg` en Tailwind) para botones e inputs, 12px (`rounded-xl`) para cards.
- Bordes: 0.5px sutiles, salvo cuando un chat está seleccionado o es urgente.
- Sin sombras pesadas. Solo focus rings y elevaciones sutiles en hover.

### Iconos
- Librería: `lucide-react`.
- Tamaño base: 16-18px en UI, 24px en hero/empty states.
- Solo outline, no filled.

---

## 5. Comportamiento de chats urgentes

### ¿Qué dispara el estado "urgente"?
El bot de n8n marca un chat como `requiere_intervencion = true` cuando detecta:
1. Cliente pide humano explícitamente (palabras clave: "humano", "persona", "dueño", "real", "alguien").
2. Cliente expresa frustración o enojo (sentimiento negativo detectado).
3. El bot lleva 3+ mensajes sin entender al cliente.

⚠️ **Esta lógica vive en el bot, NO en el panel.** El panel solo lee el estado.

### ⚠️ Pendiente técnico
La columna `requiere_intervencion` (boolean) y `motivo_intervencion` (text) **no existen aún** en `chats_activos`. Para v1, el panel implementa la UI asumiendo que existirán; mientras no existan, ningún chat parpadea (lo cual también es OK para arrancar).

Tareas asociadas (fuera de scope del panel pero a coordinar con n8n):
- Agregar columnas a `chats_activos` (o vista equivalente).
- Implementar detección en el workflow del bot.

### Comportamiento visual del chat urgente
- Fondo: rosa coral suave (`rgba(244,168,166,0.20)`).
- Borde: rosa coral más visible.
- **Parpadeo sutil cada 1.6s** mediante un halo que se expande y desvanece (CSS animation, sin JS).
- Tag visual con el motivo: `requiere humano` o `cliente molesto`.
- Avatar del cliente en tono coral pastel.
- Hover: fondo más intenso (sin perder el parpadeo).

### Notificación en sidebar
- El item "Conversaciones" del sidebar muestra un **badge rosa coral con el conteo de chats urgentes**, también parpadeando.
- Cuando Claudia entra a la conversación urgente y la atiende (toma control o pausa el bot), el badge se actualiza.

---

## 6. Micro-interacciones (lo "fluido" que pidió Michael)

### Hover states
- **Items del sidebar:** se desplazan 2px a la derecha + cambian color de fondo a verde menta más intenso.
- **Chats en la lista:** se desplazan 2px a la derecha + fondo verde menta suave.
- **Botones:** se elevan 1px (`translateY(-1px)`) + cambian color/intensidad.
- **Mensajes:** sin hover (no son clickeables).

### Click states
- **Botones:** efecto de presión (`scale(0.97)`).
- **Chat en la lista:** se queda con borde verde y fondo más intenso al ser seleccionado.

### Transiciones
- Todas las propiedades animables usan `transition: all 0.15s ease`.
- Mensajes nuevos aparecen con **fade + slide arriba** (300ms).
- Cambios de pantalla (Conversaciones ↔ Pedidos): sin transición de página, cambio instantáneo (más rápido y menos cansador en uso intensivo).

### Inputs
- **Focus ring verde pistacho** (`box-shadow: 0 0 0 3px rgba(184,216,138,0.30)`) al hacer focus.
- Borde se vuelve verde pistacho.
- Sin labels flotantes (lo dejamos simple, label arriba o placeholder).

### Animaciones que NO usamos
- ❌ Animaciones de entrada de página tipo fade del contenedor entero.
- ❌ Spinners decorativos (solo cuando hay carga real).
- ❌ Confetis o efectos celebratorios.
- ❌ Parallax o scroll animations.

El criterio: la animación existe **para dar feedback al usuario sobre algo que está pasando**, no para verse bonito.

---

## 7. Layout

### Estructura general
- **Sidebar fijo izquierdo (200px de ancho):** logo + navegación + usuario.
- **Área principal:** depende de la pantalla:
  - Conversaciones: lista (280px) + detalle (resto).
  - Pedidos: tabla full width.
  - Métricas: grid de cards.
  - Configuración: form simple.

### Responsive
- **Desktop (>= 1024px):** layout completo como en mockup.
- **Tablet (768-1023px):** sidebar colapsa a íconos, lista y detalle se mantienen lado a lado.
- **Móvil (< 768px):** sidebar se vuelve drawer (hamburguesa), lista y detalle se vuelven pantallas separadas con navegación back.

⚠️ Móvil es importante porque Claudia probablemente entrará desde el celular. Diseñar mobile-first o al menos validar bien en móvil antes de cerrar v1.

---

## 8. Tono y copy de la UI

- **Voz:** cercana, directa, sin formalismos rígidos.
- **Tutear vs ustedear:** tutear ("Tu negocio", "Pausar el bot", "Enviar mensaje").
- **NO usar emojis decorativos en la UI** (solo si están en el contenido del usuario, ej. mensajes del bot).
- **Mensajes de error claros:** "No se pudo enviar el mensaje" en vez de "Error 500".
- **Empty states con guía:** cuando no hay chats, mostrar "Aún no hay conversaciones. Cuando tus clientes escriban al WhatsApp, aparecerán aquí."

---

## 9. Estados y feedback

### Loading
- Skeletons (placeholders grises animados) en lugar de spinners para listas y cards.
- Spinner solo para acciones puntuales (enviar mensaje, pausar bot).

### Errores
- Toast en esquina superior derecha con mensaje claro y botón de reintentar cuando aplique.
- Errores de red: "Sin conexión, reintentando..." que se actualiza solo cuando vuelve.

### Confirmaciones
- Acciones destructivas requieren modal de confirmación (ej. cancelar pedido).
- Acciones reversibles (pausar bot) NO requieren confirmación, solo feedback visual + opción de deshacer.

### Realtime
- **Mensajes nuevos aparecen automáticamente** (Supabase Realtime suscrito a `historial`).
- **Cambios de estado de pedido aparecen automáticamente** (suscripción a `pedidos`).
- Lista de chats se reordena cuando llega mensaje nuevo (animación suave).

---

## 10. Roadmap (después de v1)

Orden tentativo de prioridades una vez v1 esté en producción:

1. **Métricas v2:** gráficos básicos (mensajes por hora, pedidos por día, top clientes).
2. **Edición de configuración del bot:** prompt, menú, horarios, FAQs.
3. **Plantillas de respuestas rápidas:** Claudia puede crear shortcuts de mensajes que envía manualmente.
4. **Multi-usuario por negocio:** varios empleados con permisos.
5. **Onboarding self-service:** nuevos clientes pueden registrar su negocio sin intervención de Michael.
6. **Notificaciones push** cuando hay chat urgente y Claudia no está en el panel.
7. **Búsqueda en historial completo de mensajes.**
8. **Export de pedidos** a CSV.

---

## 11. Métricas de éxito de v1

¿Cómo sabemos si el panel cumplió su propósito?

- Claudia entra al panel **al menos 1 vez al día** durante 2 semanas seguidas.
- Claudia toma control o pausa el bot **al menos 3 veces por semana** (señal de que el panel resuelve un problema real).
- Pedidos cambian de estado en el panel (no solo en WhatsApp), confirmando que el panel reemplaza parte del flujo manual.
- Cero quejas de "no entendí cómo usar X" después de la primera semana.
