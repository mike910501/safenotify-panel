# Onboarding Wizard

Self-service registration flow for new SafeNotify businesses. Single ruta pública en `/onboarding`. Termina en `/onboarding/completado` con el usuario ya autenticado.

## Archivos

```
src/
├── app/(auth)/onboarding/
│   ├── page.tsx                    # Glass card wrapper + <OnboardingWizard />
│   └── completado/page.tsx         # Pantalla post-submit
├── components/features/onboarding/
│   ├── OnboardingWizard.tsx        # State machine + AnimatePresence + persistencia
│   ├── WizardProgress.tsx          # Barra animada con layoutId
│   ├── Step1Negocio.tsx            # Nombre, tipo, dirección, ciudad
│   ├── Step2Horarios.tsx           # 7 días con apertura/cierre
│   ├── Step3Menu.tsx               # Texto y/o URL de imagen
│   ├── Step4MetodosPago.tsx        # Multi-select de métodos
│   ├── Step5Cuenta.tsx             # Email, password, WhatsApp (NO persistido)
│   ├── useInvalidShake.ts          # Shake animation hook
│   └── README.md                   # Este archivo
├── lib/
│   ├── actions/onboarding/
│   │   └── submitOnboarding.ts     # Server action atómico
│   ├── hooks/
│   │   └── useWizardPersistence.ts # localStorage versionado
│   ├── onboarding/
│   │   ├── schemas.ts              # Zod por paso + combinado
│   │   ├── slugify.ts              # Generación + retry de negocio_id
│   │   └── promptTemplate.ts       # buildPromptFromTemplate()
│   └── supabase/
│       └── admin.ts                # Service-role client (server-only)
```

## Flujo

1. Usuario entra a `/onboarding` (público, middleware lo deja pasar).
2. Si ya está logueado, middleware lo redirige a `/conversaciones`.
3. Avanza por Steps 1-4. Cada paso guarda en `localStorage["onboarding_wizard_v1"]` con TTL de 7 días.
4. En Step 5 llena credenciales (NO se persisten, solo viven en memoria).
5. Click "Crear cuenta" → llama `submitOnboarding(payload)` (server action).
6. Server valida con zod, genera slug, crea `auth.users`, inserta `negocios` y `usuarios_panel`, hace signIn.
7. Cliente limpia localStorage y `router.push("/onboarding/completado")`.

## Puntos críticos de mantenimiento

### 1. Admin client (`src/lib/supabase/admin.ts`)

- Usa `SUPABASE_SERVICE_ROLE_KEY` con `import "server-only"`.
- **Nunca importar desde Client Components.** El `server-only` hace que Next.js falle el build si alguien lo intenta. Es la primera barrera.
- La key NO tiene prefijo `NEXT_PUBLIC_` → nunca llega al bundle del browser.
- Si se filtra esta key, atacante tiene acceso total a la DB. Tratarla como secreto crítico.

### 2. Rollback en `submitOnboarding`

Cada `INSERT` post-`createUser` tiene rollback explícito:

| Falla | Acción |
|---|---|
| `negocios` insert | `rollbackAuthUser(authUserId)` |
| `usuarios_panel` insert | `rollbackNegocio(negocioId)` + `rollbackAuthUser(authUserId)` |
| `signInWithPassword` | NO rollback (la cuenta ya está bien, solo no se logueó) |

Las funciones de rollback retornan `boolean` para diferenciar "rollback ok" de "rollback falló → INCONSISTENT_STATE_MESSAGE".

Si agregas otro `INSERT` a esta secuencia, agrega su rollback inverso correspondiente.

### 3. Schema dependency (regla dura del proyecto)

El wizard escribe a tres tablas del schema actual:
- `auth.users` (Supabase Auth)
- `negocios` — columnas usadas: `negocio_id`, `nombre_negocio`, `tipo_negocio`, `direccion`, `horarios` (texto plano formateado), `menu`, `menu_imagen_url`, `metodos_pago` (lista coma-separada), `telefono_dueno`, `contacto_humano`, `numeros_notificacion`, `prompt_sistema`.
- `usuarios_panel` — `email`, `negocio_id`, `rol: 'owner'`, `activo: true`, `auth_user_id`.

**`twilio_from` se deja NULL** intencionalmente. Michael lo asigna manual cuando provisiona un número en Twilio. Mientras `twilio_from = NULL`, el bot no responde a clientes de ese negocio.

**Si el bot de n8n cambia qué columnas espera**, hay que ajustar `submitOnboarding.ts` Y `promptTemplate.ts`.

### 4. Password security

- Step 5 NO se persiste en localStorage (decisión explícita).
- El password se envía al server action, se usa para `createUser`, luego se descarta de memoria.
- En `console.log` post-success se loguea email pero NO password. Verificar al editar.

### 5. Slug collision

`findAvailableNegocioId` reintenta hasta 10 veces (slug, slug-2, ..., slug-10). Si llega al 11, falla con error user-friendly. Si esto pasa seguido, hay un problema (negocio con nombre muy genérico). Considerar mover a UUID.

### 6. Notificación a Michael (TODO)

Hoy: `console.log("[ONBOARDING] NUEVO NEGOCIO REGISTRADO: ...")`. Visible solo si miras los logs del server.

Para producción real, reemplazar con:
- Slack webhook (fire-and-forget POST)
- Email vía Resend / Postmark
- O cron de Supabase que consulte `negocios` con `twilio_from IS NULL`

No bloquear el flujo principal con esta notificación. Errores de notificación NO deben revertir la creación del negocio.

## Cómo extender

### Agregar un paso intermedio

1. Crear `StepNNombre.tsx` siguiendo el patrón de los existentes (react-hook-form + zod + shake).
2. Agregar `stepNSchema` y `StepNData` a `src/lib/onboarding/schemas.ts`.
3. Agregar al `onboardingPayloadSchema`.
4. En `OnboardingWizard.tsx`: bump `TOTAL_STEPS`, agregar al tipo `StepNumber`, `PersistedWizardState`, `INITIAL_STATE`, `STEP_LABELS`, `renderStep`. Agregar `handleStepNSubmit`. Renumerar los siguientes pasos.
5. Si el nuevo dato impacta `prompt_sistema`, ajustar `buildPromptFromTemplate`.

### Cambiar el template del `prompt_sistema`

Solo `src/lib/onboarding/promptTemplate.ts`. La función es pura, no toca DB. Si agregas un nuevo `BusinessType`, agregalo a `ROLE_BY_TYPE`.

### Agregar Twilio provisioning automático

En `submitOnboarding.ts`, después del log de `[ONBOARDING] NUEVO NEGOCIO REGISTRADO`, agregar paso 10:
- POST a Twilio API para reservar número
- UPDATE `negocios` con `twilio_from`
- Si falla, NO revertir (el negocio queda registrado con `twilio_from = NULL` y Michael lo asigna manual). Solo loguear.

No agregar como rollbackable porque el costo de borrar todo el registro por un fallo de Twilio API es alto.
