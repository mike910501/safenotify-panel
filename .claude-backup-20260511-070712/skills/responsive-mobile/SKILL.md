---
name: responsive-mobile
description: Reglas de diseño responsive y patrones mobile-first del panel SafeNotify. Cárgala SIEMPRE que la tarea involucre UI, layouts, vistas que deban verse en celular, breakpoints, navegación móvil, o cuando el usuario mencione "mobile", "móvil", "celular", "responsive", "tablet", "ipad" o screenshots de mobile.
---

# Responsive y mobile-first del panel SafeNotify

Esta skill define cómo se comportan los componentes del panel en distintos tamaños de pantalla. Lectura obligatoria antes de tocar cualquier UI.

## Contexto

Claudia (la cliente) y futuros usuarios usan el panel desde computador en el local, pero también necesitan abrirlo en su celular cuando están fuera (entregando, en la calle, etc.). El panel DEBE verse y funcionar bien en mobile, no como un add-on. Mobile no es opcional.

## Breakpoints

Usamos los breakpoints por defecto de Tailwind. Convención del proyecto:

- **Mobile:** `< md` (menos de 768px). Es donde más se rompe hoy.
- **Tablet:** `md` a `lg` (768px - 1023px).
- **Desktop:** `lg` y arriba (1024px+).

Cuando el contexto dice "en mobile" sin más detalle, asumir `< md`.

Mobile-first: escribir clases base sin prefijo (aplican a mobile), y usar `md:` para overrides en pantallas grandes. NO al revés.

```tsx
// ✅ Mobile-first (correcto)
<div className="flex-col md:flex-row">

// ❌ Desktop-first (incorrecto)
<div className="flex-row max-md:flex-col">
```

## Reglas duras de UX en mobile

### 1. Navegación principal: bottom nav, NO sidebar

En `< md`, el sidebar de navegación (Conversaciones / Pedidos / Métricas / Configuración) se oculta y se reemplaza por una barra inferior (bottom nav) con íconos + label corto.

- 4 ítems máximo (los que ya hay).
- Posición fija en el bottom (`fixed bottom-0`).
- Ícono encima, label corto debajo.
- El ítem activo se diferencia con color (consistente con el glow lavanda del proyecto).
- Altura mínima 56px + safe area inferior.
- En `md+` se oculta y vuelve el sidebar lateral.

```tsx
{/* Bottom nav: solo mobile */}
<nav className="md:hidden fixed bottom-0 inset-x-0 ...">
  ...
</nav>

{/* Sidebar lateral: solo desktop */}
<aside className="hidden md:flex ...">
  ...
</aside>
```

El nombre de usuario (ej. "Michael Ladino" + negocio) y el botón "Cerrar sesión" se mueven a una vista de Configuración o a un menú dentro del bottom nav, NO se muestran ocupando espacio en mobile.

### 2. Conversaciones: lista o detalle, nunca ambas

Patrón WhatsApp móvil:

- Sin chat seleccionado → solo se ve la lista (full width).
- Con chat seleccionado → solo se ve el detalle (full width). La lista se oculta.
- En el header del detalle hay un botón "atrás" (ícono `ArrowLeft` de lucide-react) que es visible **solo en mobile** y vuelve a la lista (limpia el `?phone=` de la URL).
- En `md+` se ven ambas como hoy (lista 280px + detalle).

```tsx
{/* Lista: visible si NO hay chat O en desktop */}
<aside className={selectedPhone ? "hidden md:flex" : "flex"}>...</aside>

{/* Detalle: visible si hay chat O en desktop empty state */}
<main className={selectedPhone ? "flex" : "hidden md:flex"}>...</main>

{/* Botón atrás: solo mobile, dentro del header del detalle */}
<button className="md:hidden ..." onClick={() => router.push("/conversaciones")}>
  <ArrowLeft />
</button>
```

### 3. Acciones del header: solo ícono en mobile

Botones como "Tomar el control" / "Devolver al bot" en mobile NO muestran texto, solo ícono. En desktop muestran ícono + texto.

```tsx
<button>
  <Pause className="h-4 w-4" />
  <span className="hidden md:inline">Tomar el control</span>
</button>
```

El cambio de color del botón según estado (naranja → rojo) sigue comunicando la acción sin necesidad del texto.

## Reglas técnicas obligatorias

### Tamaño tappable mínimo

Todo elemento interactivo (botón, link, ícono clickeable) tiene al menos **44×44px** efectivos de área de tap (recomendación Apple HIG, también para Android Material 48dp).

Si visualmente es más chico, agregar padding hasta llegar a 44px:

```tsx
<button className="p-3">  {/* p-3 = 12px x 2 lados = 24px + contenido */}
  <Icon className="h-5 w-5" />  {/* 20px de ícono → total ~44px */}
</button>
```

### Inputs: font-size mínimo 16px en mobile para evitar zoom iOS

Safari de iOS hace zoom automático cuando un input tiene `font-size < 16px`. Para evitarlo, todos los `<input>`, `<textarea>` y `<select>` deben tener mínimo `text-base` (16px) en mobile.

```tsx
<input className="text-base md:text-sm" />  {/* 16px en mobile, 14px en desktop */}
```

### Safe area iOS

Elementos fijos en la parte inferior (bottom nav, input de chat) deben respetar el safe area de iOS para no quedar tapados por la barra de Safari.

Tailwind no tiene utilidad nativa para esto. Usar `style` con `env(safe-area-inset-bottom)`:

```tsx
<nav
  className="fixed bottom-0 ..."
  style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
>
```

Para el input del chat (`ManualMessageInput.tsx`), aplicar el mismo padding-bottom.

### Glassmorphism: degradar en mobile viejo

`backdrop-filter: blur(...)` consume GPU y puede hacer scroll lento en celulares de gama baja. Mantener el efecto pero NO encadenarlo en muchos elementos a la vez. En mobile, preferir 1 elemento con blur + el resto con `background` sólido semitransparente.

Si una vista mobile se siente lenta al hacer scroll, primero quitar blurs anidados.

### Burbujas de mensajes

- Padding interno mínimo: `px-3 py-2` (12px horizontal, 8px vertical).
- Ancho máximo: 80% del contenedor (`max-w-[80%]`). Hoy probablemente no tiene límite y se rompen palabras feo.
- Texto: `text-sm` mínimo en mobile (14px) — `text-xs` (12px) es ilegible para usuarios mayores.
- Word-wrap: `break-words` para URLs largas, no `break-all` (rompe palabras normales).

### Tipografía mínima legible

En mobile:
- Body / mensajes: `text-sm` o `text-base`.
- Labels secundarios: `text-xs` solo si es metadata (timestamps, contadores).
- Headers de sección: `text-base font-medium` o más.

Subir un escalón vs desktop. El `text-xs` que se ve bien en monitor de 27" es ilegible en celular sostenido a 40cm.

## Patrones específicos del panel SafeNotify

### Layout principal (dashboard)

```
Mobile (< md):
┌─────────────────┐
│   Contenido     │  ← Vista actual full width
│                 │
│                 │
├─────────────────┤
│  📨  📦  📊  ⚙️  │  ← Bottom nav
└─────────────────┘

Desktop (md+):
┌──────┬──────────┐
│      │ Contenido│
│ Side │          │
│ bar  │          │
└──────┴──────────┘
```

### Vista de Conversaciones

```
Mobile sin chat:
┌─────────────────┐
│ 🔍 Buscar       │
│                 │
│ Chat 1          │
│ Chat 2          │
│ Chat 3          │
├─────────────────┤
│ Bottom nav      │
└─────────────────┘

Mobile con chat:
┌─────────────────┐
│ ←  +57 312 ... ⏸│  ← Header con back y acción solo ícono
├─────────────────┤
│  Mensaje 1      │
│       Mensaje 2 │
│  Mensaje 3      │
├─────────────────┤
│ [escribe...] →  │  ← Input + botón
└─────────────────┘
```

### Vista de Pedidos (mismo patrón)

- Lista de pedidos: cards más altas y con todos los datos legibles, NO tabla horizontal que requiera scroll lateral.
- Acciones (Marcar en camino, Marcar listo, etc.): botones grandes apilados verticalmente, no tres pegados pequeñitos.
- Filtros (estado): chips horizontales con scroll si hay muchos.

## Anti-patrones (NO hacer)

- ❌ NO usar `display: none` para esconder cosas en mobile cuando deberían moverse a otro lugar (ej. esconder el sidebar de navegación sin reemplazarlo por bottom nav).
- ❌ NO asumir hover. Mobile no tiene hover. Toda funcionalidad accesible solo por hover (tooltips, popovers que aparecen al hover) debe tener equivalente por tap.
- ❌ NO usar `position: fixed` sin pensar en safe areas.
- ❌ NO meter inputs con `text-xs` en mobile (causa zoom iOS molesto).
- ❌ NO romper layout horizontal en pantallas chicas (sidebar 280px + contenido = 380px de ancho mínimo, no cabe en celular).
- ❌ NO ocultar acciones críticas en menús "..." si son frecuentes. "Tomar control" se usa varias veces al día.
- ❌ NO modificar el schema de Supabase ni la lógica del bot solo por temas de UI.

## Cómo abordar una tarea de responsive

Cuando recibas una tarea de hacer un componente responsive:

1. Mira el componente actual y describe qué hace en desktop.
2. Decide qué patrón aplica de los descritos arriba (nav, lista/detalle, ícono solo, etc.).
3. Aplica mobile-first: clases base son las de mobile, `md:` overrides para desktop.
4. Verifica las reglas técnicas: tappable 44×44, fonts 16px+ en inputs, safe areas, ancho máximo de mensajes.
5. Si dudas en una decisión de UX, NO inventes — pregunta al usuario con opciones explícitas.
6. NO toques lógica de negocio (Server Actions, Realtime, queries) salvo que sea estrictamente necesario para responsive.
