---
name: conventions
description: Convenciones de naming, estructura de carpetas, estilo de código, mensajes de commit y reglas no negociables del proyecto SafeNotify Panel. Cárgala SIEMPRE que vayas a escribir código o crear archivos para mantener consistencia.
---

# Convenciones del proyecto SafeNotify Panel

## Idioma

- **Código, nombres de variables, archivos, funciones, comentarios técnicos:** inglés.
- **Mensajes de UI vistos por el usuario final:** español (Claudia y clientes son colombianos).
- **Documentación interna (README, CLAUDE.md, decisiones):** español.
- **Commits:** español.

## Estructura de carpetas (Next.js App Router)

```
safenotify-panel/
├── .claude/                    # Skills y agentes (no se sube a producción)
├── public/                     # Assets estáticos
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/             # Rutas de autenticación
│   │   ├── (dashboard)/        # Rutas autenticadas del panel
│   │   ├── api/                # Route handlers
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── features/           # Componentes específicos del dominio
│   ├── lib/
│   │   ├── supabase/           # Cliente Supabase + types generados
│   │   ├── utils.ts
│   │   └── constants.ts
│   └── types/                  # Tipos compartidos
├── CLAUDE.md
├── package.json
└── tsconfig.json
```

## Naming

- **Componentes React:** `PascalCase` (`ConversationList.tsx`, `PedidoCard.tsx`).
- **Hooks:** `camelCase` con prefijo `use` (`useConversations.ts`).
- **Funciones utilitarias:** `camelCase` (`formatPhone`, `parsePedidoCode`).
- **Constantes:** `SCREAMING_SNAKE_CASE` (`PEDIDO_STATES`, `MAX_HISTORIAL_LENGTH`).
- **Tipos / interfaces:** `PascalCase` (`Negocio`, `PedidoEstado`).
- **Archivos de tipos:** `.types.ts` o dentro de `src/types/`.
- **Nombres de tablas Supabase:** `snake_case` plural en español (`negocios`, `historial`, `sesiones_pausadas`). NO se cambian: el bot ya las usa.

## TypeScript

- `strict: true` en `tsconfig.json`.
- `any` está prohibido salvo justificación documentada con comentario `// @ts-expect-error: razón`.
- Usar tipos generados de Supabase (`supabase gen types typescript`) en `src/lib/supabase/database.types.ts`.
- Evitar tipos inline largos; extraer a `src/types/` cuando se reusan.

## Commits

Formato: `tipo(scope): descripción corta en español`.

Tipos:
- `feat`: nueva funcionalidad.
- `fix`: corrección de bug.
- `refactor`: cambio de código sin alterar comportamiento.
- `docs`: solo documentación.
- `chore`: tareas de mantenimiento (deps, configs).
- `test`: agregar o corregir tests.

Ejemplos:
- `feat(auth): agregar login con email y password`
- `fix(historial): corregir orden cronológico de mensajes`
- `chore(deps): actualizar Next.js a 15.1`

## Estilo de código

- Indentación: 2 espacios.
- Comillas: dobles (`"`) en TypeScript/JSX, simples (`'`) en strings cortos no UI.
- Punto y coma al final de cada statement.
- Líneas máximo 100 caracteres.
- Imports ordenados: librerías externas → alias internos (`@/`) → relativos.
- Componentes: un componente por archivo salvo helpers privados muy pequeños.

## Patrones que SÍ usamos

- **Server Components por defecto.** Solo agregar `"use client"` cuando se necesita estado, eventos o hooks de cliente.
- **Server Actions** para mutaciones (insert/update/delete) en lugar de route handlers cuando sea posible.
- **Suspense boundaries** alrededor de fetch de datos para loading states naturales.
- **Variables de entorno** prefijadas: `NEXT_PUBLIC_*` solo si deben ser visibles al cliente; el resto sin prefijo.

## Patrones que NO usamos

- ❌ Pages Router de Next.js.
- ❌ `getServerSideProps` / `getStaticProps`.
- ❌ Redux / Zustand para estado global salvo necesidad MUY clara (preferimos React Query / Server Components).
- ❌ CSS-in-JS (styled-components, emotion). Solo Tailwind.
- ❌ Variables `any`.
- ❌ Comentarios obvios (`// incrementar contador`); el código se explica solo.

## Branching de Git

- `main`: rama de producción, siempre desplegable.
- Trabajamos en una rama por feature: `feat/login`, `feat/pausar-bot`, `fix/historial-orden`.
- PR antes de merge a main (en proyectos con más gente; ahora pusheamos directo pero con commits limpios).
