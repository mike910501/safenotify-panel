---
name: mobile-motion-premium
description: Patrones premium de mobile-first para SafeNotify, con foco en interactividad y fluidez tipo WhatsApp Business + Cash App/Revolut. Cárgala SIEMPRE que la tarea involucre UI mobile, transiciones de pantalla, microinteracciones, gestures, motion design, o cuando el usuario mencione "fluido", "interactivo", "premium feel", "se siente lento", "estático", "mobile", "celular" o suba screenshots de mobile.
---

# Mobile Motion Premium — Panel SafeNotify

Esta skill define cómo construir el panel SafeNotify en mobile con sensación premium: familiar como WhatsApp Business + expresivo como Cash App/Revolut. Reemplaza a `responsive-mobile` cuando se trate de iteraciones de calidad y motion, no solo de layout estructural.

## Filosofía

**Lo técnicamente correcto no basta.** Un layout responsive bien construido se siente plano si los elementos solo aparecen y desaparecen. La diferencia entre app B+ y app A+ está en:

1. **Transiciones espaciales:** los elementos no aparecen, vienen de algún lado y van a algún lado.
2. **Spring physics, no `ease`:** los movimientos imitan la física natural, no curvas matemáticas.
3. **Tap feedback:** cada elemento interactivo reacciona al toque antes de hacer nada más.
4. **Gestures naturales:** swipe back, pull to refresh, drag to dismiss.
5. **Continuidad visual:** si el avatar está en la lista en posición A, al abrir el detalle ese avatar viaja a la nueva posición B, no aparece de la nada.

Si la skill no se traduce en esos 5 puntos en código, no se aplicó.

## Stack obligatorio

- **`framer-motion`** (también publicado como `motion`) — librería principal de animación. Si no está instalada, instalarla con `npm install framer-motion` antes de empezar.
- **`lucide-react`** — íconos (ya está en el proyecto).
- **Tailwind CSS** — clases utilitarias (ya está).
- NO instalar GSAP, react-spring, animejs ni otras librerías de animación. Solo framer-motion.

## Spring presets (números específicos, NO inventar)

Importar y reutilizar SIEMPRE estos presets. No usar `ease: "easeOut"` ni duraciones fijas para movimientos físicos.

```tsx
// src/lib/motion/springs.ts (crear este archivo)
export const SPRING = {
  // Para botones (tap, scale) — rápido y firme
  snappy: { type: "spring", stiffness: 500, damping: 30 },
  // Para transiciones de pantalla (lista → detalle, drawer)
  smooth: { type: "spring", stiffness: 400, damping: 35 },
  // Para elementos que "rebotan" un poco (toasts, badges)
  bouncy: { type: "spring", stiffness: 350, damping: 22 },
  // Para entradas suaves de listas (sin overshoot)
  gentle: { type: "spring", stiffness: 200, damping: 28 },
} as const;

// Duraciones SOLO para fades (opacity), no para transforms
export const DURATION = {
  fast: 0.15,
  medium: 0.25,
  slow: 0.4,
} as const;
```

Regla: **opacity → `duration`. Transforms (x, y, scale, rotate) → `spring`.** Mezclar no se hace.

## Tap feedback universal

Todo elemento clickeable (botón, item de lista, card) debe tener feedback de tap. Sin esto, la app se siente "muerta".

```tsx
import { motion } from "framer-motion";
import { SPRING } from "@/lib/motion/springs";

<motion.button
  whileTap={{ scale: 0.96 }}
  transition={SPRING.snappy}
  className="..."
>
  Texto
</motion.button>
```

**Nunca `whileHover` en componentes que se usan en mobile.** No hay hover en touch. Si la app es híbrida (desktop + mobile), agregar `whileHover` solo en desktop con `md:` condicional o detectar el dispositivo. Para SafeNotify, todo es mobile-first: solo `whileTap`.

## Patrones específicos para el panel SafeNotify

### 1. Bottom navigation con indicador animado

El "Chats / Pedidos / Métricas / Configurar" hoy es estático. Premium se ve así:

```tsx
"use client";

import { motion } from "framer-motion";
import { MessageSquare, Package, BarChart3, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { SPRING, DURATION } from "@/lib/motion/springs";

const ITEMS = [
  { href: "/conversaciones", label: "Chats", Icon: MessageSquare },
  { href: "/pedidos", label: "Pedidos", Icon: Package },
  { href: "/metricas", label: "Métricas", Icon: BarChart3 },
  { href: "/configuracion", label: "Configurar", Icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 flex"
      style={{
        background: "rgba(20, 12, 38, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <motion.button
            key={href}
            onClick={() => router.push(href)}
            whileTap={{ scale: 0.9 }}
            transition={SPRING.snappy}
            className="flex-1 relative flex flex-col items-center justify-center py-2 min-h-[56px]"
          >
            {/* Indicador animado con layoutId — viaja entre tabs */}
            {active && (
              <motion.div
                layoutId="bottom-nav-indicator"
                transition={SPRING.smooth}
                className="absolute top-0 inset-x-6 h-0.5"
                style={{
                  background: "linear-gradient(to right, transparent, #C4B5FD, transparent)",
                  boxShadow: "0 0 12px rgba(196,181,253,0.6)",
                }}
              />
            )}

            <motion.div
              animate={{
                scale: active ? 1.1 : 1,
                color: active ? "#C4B5FD" : "rgba(255,255,255,0.5)",
              }}
              transition={SPRING.snappy}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
            <motion.span
              animate={{
                color: active ? "#C4B5FD" : "rgba(255,255,255,0.4)",
                fontWeight: active ? 600 : 500,
              }}
              transition={{ duration: DURATION.fast }}
              className="text-[10px] mt-0.5"
            >
              {label}
            </motion.span>
          </motion.button>
        );
      })}
    </nav>
  );
}
```

Clave: el `layoutId="bottom-nav-indicator"` hace que la barra lavanda **viaje** entre tabs al cambiar de sección, no que aparezca/desaparezca.

### 2. Transición lista → detalle (WhatsApp-style + premium)

Patrón: el item de la lista "se expande" hacia el detalle. NO aparece de la nada.

```tsx
// En ConversationListItem: agregar layoutId al avatar y al phone
<motion.div
  layoutId={`avatar-${chat.phone}`}
  transition={SPRING.smooth}
  className="h-9 w-9 rounded-full ..."
  style={{ background: avatarGradient }}
>
  {initials}
</motion.div>

<motion.span
  layoutId={`phone-${chat.phone}`}
  transition={SPRING.smooth}
  className="..."
>
  {chat.phone}
</motion.span>
```

```tsx
// En ConversationDetail (header): mismo layoutId
<motion.div
  layoutId={`avatar-${phone}`}
  transition={SPRING.smooth}
  className="h-9 w-9 rounded-full ..."
  style={{ background: avatarGradient }}
>
  {initials}
</motion.div>

<motion.p
  layoutId={`phone-${phone}`}
  transition={SPRING.smooth}
  className="..."
>
  {phone}
</motion.p>
```

Resultado: cuando Claudia toca un chat, el avatar y el número **viajan** físicamente de la lista al header del detalle. Eso es lo que se siente premium.

### 3. Swipe back gesture (volver a la lista deslizando)

En mobile, el detalle del chat debe tener swipe-back además del botón ArrowLeft. Es el gesture nativo iOS.

```tsx
"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useRouter } from "next/navigation";
import { SPRING } from "@/lib/motion/springs";

export function SwipeBackContainer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [0, 200], [1, 0.5]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Si arrastró > 100px o velocidad alta → volver
    if (info.offset.x > 100 || info.velocity.x > 500) {
      router.push("/conversaciones");
    }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={{ left: 0, right: 0.4 }}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      transition={SPRING.smooth}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
```

Usar SOLO en mobile (`md:hidden` wrapper o detectar viewport). En desktop el swipe-back no aplica.

### 4. Burbujas de mensaje con entrada animada

Cuando llega un mensaje nuevo (de cliente, bot o humano), no debe "aparecer". Debe entrar desde abajo con una pequeña expansión, estilo iMessage/WhatsApp.

```tsx
// MessageBubble.tsx
"use client";

import { motion } from "framer-motion";
import { SPRING } from "@/lib/motion/springs";
import type { Historial } from "@/types/domain.types";

export function MessageBubble({ mensaje }: { mensaje: Historial }) {
  const esCliente = mensaje.enviado_por === "cliente";
  const esHumano = mensaje.enviado_por === "humano";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING.gentle}
      className={`flex ${esCliente ? "justify-start" : "justify-end"}`}
    >
      <div
        className="max-w-[80%] px-3 py-2 rounded-2xl break-words"
        style={{
          background: esCliente
            ? "rgba(255,255,255,0.06)"
            : esHumano
            ? "rgba(244,168,166,0.10)"
            : "rgba(184,216,138,0.08)",
          border: `1px solid ${
            esCliente
              ? "rgba(255,255,255,0.10)"
              : esHumano
              ? "rgba(244,168,166,0.25)"
              : "rgba(184,216,138,0.20)"
          }`,
        }}
      >
        {esHumano && (
          <span className="block text-[10px] mb-1 opacity-60">
            Mensaje manual del operador
          </span>
        )}
        <p className="text-sm text-white">{mensaje.content}</p>
      </div>
    </motion.div>
  );
}
```

El `layout` prop hace que cuando llega un mensaje nuevo, los anteriores se desplazan suavemente arriba, no saltan.

### 5. Pull to refresh en la lista de chats

Patrón Revolut/Cash App: tirar hacia abajo para actualizar. Sin librerías externas, solo framer-motion.

```tsx
"use client";

import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { SPRING } from "@/lib/motion/springs";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const y = useMotionValue(0);
  const indicatorOpacity = useTransform(y, [0, 40, 80], [0, 0.5, 1]);
  const indicatorRotate = useTransform(y, [0, 80], [0, 180]);
  const [refreshing, setRefreshing] = useState(false);

  async function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 80 && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }

  return (
    <div className="relative h-full overflow-hidden">
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="absolute top-3 inset-x-0 flex justify-center z-10 pointer-events-none"
      >
        <motion.div
          style={{ rotate: refreshing ? 0 : indicatorRotate }}
          animate={refreshing ? { rotate: 360 } : {}}
          transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : SPRING.smooth}
        >
          <Loader2 className="h-5 w-5 text-white/70" />
        </motion.div>
      </motion.div>

      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.4, bottom: 0 }}
        onDragEnd={handleDragEnd}
        style={{ y }}
        transition={SPRING.smooth}
        className="h-full overflow-y-auto"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

Usar solo en mobile y solo en pantallas tipo lista (Conversaciones, Pedidos), no en el detalle.

### 6. Botón "Tomar el control" / "Devolver al bot" con feedback expresivo

El estado cambia con un pulso visual claro, no solo cambia de color.

```tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { SPRING } from "@/lib/motion/springs";

export function PauseControlButton({
  botPausado,
  onClick,
}: {
  botPausado: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={SPRING.snappy}
      animate={{
        background: botPausado
          ? "rgba(244,168,166,0.15)"
          : "rgba(250,224,184,0.12)",
        borderColor: botPausado
          ? "rgba(244,168,166,0.40)"
          : "rgba(250,224,184,0.30)",
        boxShadow: botPausado
          ? "0 0 20px rgba(244,168,166,0.35)"
          : "0 0 0px rgba(0,0,0,0)",
      }}
      className="relative h-11 w-11 md:w-auto md:px-3 rounded-xl border flex items-center justify-center gap-1.5"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={botPausado ? "play" : "pause"}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={SPRING.snappy}
          className="flex items-center"
          style={{ color: botPausado ? "#F4A8A6" : "#FAE0B8" }}
        >
          {botPausado ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>

      <span
        className="hidden md:inline text-xs font-medium"
        style={{ color: botPausado ? "#F4A8A6" : "#FAE0B8" }}
      >
        {botPausado ? "Devolver al bot" : "Tomar control"}
      </span>
    </motion.button>
  );
}
```

El ícono rota y escala al cambiar de estado. En mobile es solo ícono cuadrado de 44x44. Glow aparece cuando está pausado para reforzar visualmente "este chat está bajo tu control".

## Reglas técnicas críticas

1. **Performance:** `motion.div` es más caro que `div`. NO envolver listas largas de 50+ items con `motion.div` cada uno sin `layout`. Si la lista crece, usar `LazyMotion`:

```tsx
import { LazyMotion, domAnimation, m } from "framer-motion";

<LazyMotion features={domAnimation}>
  <m.div>...</m.div>
</LazyMotion>
```

2. **`useReducedMotion`:** respetar preferencia del sistema.

```tsx
import { useReducedMotion } from "framer-motion";

const reduce = useReducedMotion();
const transition = reduce ? { duration: 0 } : SPRING.smooth;
```

3. **No animar `width`/`height` salvo con `layout`.** Costoso. Usar `transform: scale` o `opacity`.

4. **`AnimatePresence` requiere `key` única en hijos.**

5. **GPU acceleration:** solo `transform` y `opacity` corren en GPU.

## Anti-patrones explícitos (NO hacer)

- ❌ Usar `transition={{ duration: 0.5, ease: "easeOut" }}` para transformaciones físicas. Eso se SIENTE como animación de PowerPoint. Usar SPRING.
- ❌ Animar TODO. Si todo se mueve, nada destaca. Reservar motion para momentos clave.
- ❌ Duraciones largas (>0.5s) en taps. El usuario quiere respuesta inmediata. 0.15s-0.3s.
- ❌ Spring con stiffness < 150 en botones. Se siente "como gelatina". Snappy (400+).
- ❌ `whileHover` en componentes mobile.
- ❌ Olvidar `safe-area-inset-bottom` en elementos fijos abajo.

## Cómo abordar una tarea con esta skill

1. Identificar qué momento está plano: ¿entrada al chat? ¿cambio de estado? ¿navegación?
2. Elegir el patrón adecuado de esta skill.
3. Usar los presets de `SPRING`, NO inventar números.
4. Aplicar primero al COMPONENTE más visible del flujo.
5. Probar en celular real. Si baja a 30fps, simplificar.
6. NO añadir motion donde no aporta.

## Inspiración concreta

- **WhatsApp Business:** lista→detalle con shared element del avatar, swipe back, mensajes entrando desde abajo.
- **Cash App / Revolut:** spring bouncy en botones, números que animan al cambiar, feedback inmediato.
- **Linear mobile:** navegación entre tabs con indicador que viaja, transiciones smooth.

Sweet spot SafeNotify: **WhatsApp como esqueleto + Cash App como sazón**. Lo familiar abajo, lo premium en los detalles.
