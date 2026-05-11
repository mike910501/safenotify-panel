---
name: safenotify-context
description: Contexto completo del producto SafeNotify, su ecosistema, terminología y decisiones de diseño. Cárgala cuando trabajes en cualquier feature del panel para entender qué hace el producto, quiénes son los usuarios y cómo se conecta con el bot de n8n.
---

# SafeNotify — Contexto del producto

## Qué es SafeNotify

SafeNotify SAS es una empresa colombiana (NIT 901.980.653-1) que ofrece automatización de atención por WhatsApp para restaurantes y pequeños negocios. El producto principal es un bot conversacional que recibe pedidos, responde preguntas frecuentes, agenda reservas y notifica al dueño del negocio cuando hay actividad relevante.

## Cliente actual en producción

**D'Andrés Comidas Rápidas**
- Ubicación: Barrancabermeja, Santander
- Dueña: Claudia Beltrán (+573133592457)
- Número Twilio del bot: +573002146502
- Tipo de negocio: restaurante de comidas rápidas (hamburguesas, perros, etc.)

## Arquitectura del ecosistema completo

El bot (NO este proyecto) corre en n8n Cloud:

```
Cliente final --(WhatsApp)--> Twilio --(webhook)--> n8n workflow
                                                       |
                                                       +--> DeepSeek API (respuesta IA)
                                                       +--> Supabase (lectura/escritura de datos)
                                                       +--> Google Calendar (reservas)
                                                       +--> Twilio (envío de respuesta al cliente)
```

El **panel web** (este proyecto) es una capa humana sobre el mismo Supabase:

```
Claudia / admin --(navegador)--> Panel Next.js --(SDK)--> Supabase
```

## Glosario

- **negocio:** un cliente de SafeNotify (D'Andrés es un negocio).
- **bot:** el workflow de n8n que responde mensajes automáticamente.
- **historial:** tabla con todos los mensajes (cliente <-> bot).
- **pedido:** orden de compra registrada por el bot, identificada por código tipo PED-XXX.
- **interaccion:** evento programado (recordatorio, seguimiento) que el bot dispara.
- **resumen:** condensación de conversación generada por Claude Haiku para no inflar el contexto.
- **sesion_pausada:** registro que indica que un humano tomó control de un chat (el bot deja de responder a ese cliente por X minutos).

## Decisiones clave del producto

1. **Multi-tenant desde el día 1.** El sistema soporta múltiples negocios, no solo D'Andrés. Toda lógica del panel debe filtrar por negocio_id.
2. **El bot es la fuente de verdad operacional.** El panel observa y a veces interviene, pero NO debe sobrescribir decisiones del bot a la ligera.
3. **Pausar > intervenir.** Cuando un humano necesita tomar control, lo hace pausando el bot (insert en sesiones_pausadas) y respondiendo manualmente. Cuando termina, despausa.
4. **Pricing actual:** $200K COP/mes por negocio (precio de lanzamiento para Claudia), $290K COP/mes para nuevos clientes a partir del segundo.

## Roadmap del panel (v1)

Features mínimas para v1:
1. Login (Supabase Auth).
2. Vista de conversaciones en vivo por negocio.
3. Pausar/despausar el bot en un chat específico.
4. Vista de pedidos con cambio de estado.
5. Métricas básicas (mensajes/día, pedidos/día).

Features fuera de v1:
- Multi-usuario por negocio.
- Edición de prompts del bot desde el panel.
- Analytics avanzado.
- Onboarding self-service de nuevos negocios.
