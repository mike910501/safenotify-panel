import { cn, getInitials, formatRelativeTime, phoneToGradient } from "@/lib/utils";
import type { ChatActivo } from "@/types/domain.types";

interface ConversationListItemProps {
  chat: ChatActivo;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Returns display initials for the chat avatar.
 * Derives from the last 2 digits of the phone number until nombre_cliente
 * is exposed in the chats_activos VIEW.
 */
function getAvatarLabel(chat: ChatActivo): string {
  const phone = chat.phone ?? "";
  if (!phone) return "?";
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 2) {
    return digits.slice(-2);
  }
  return getInitials(phone);
}

export function ConversationListItem({
  chat,
  isSelected,
  onClick,
}: ConversationListItemProps) {
  const avatarLabel = getAvatarLabel(chat);
  const nombre = chat.phone ?? "";
  const ultimoMensaje = chat.ultimo_mensaje ?? "";
  const preview =
    ultimoMensaje.length > 40
      ? ultimoMensaje.slice(0, 40) + "…"
      : ultimoMensaje;
  const timestamp = chat.ultimo_mensaje_at
    ? formatRelativeTime(chat.ultimo_mensaje_at)
    : "";

  const avatarGradient = phoneToGradient(chat.phone ?? "");

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full text-left px-3 py-3 rounded-xl transition-all duration-200 ease-out flex items-start gap-3",
        isSelected
          ? "border-2"
          : "border border-transparent hover:-translate-y-[2px] hover:scale-[1.02]"
      )}
      style={
        isSelected
          ? {
              background: "rgba(255,255,255,0.08)",
              borderColor: "rgba(139,92,246,0.50)",
              boxShadow: "0 0 24px rgba(139,92,246,0.30)",
            }
          : {
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.10)",
            }
      }
      onMouseEnter={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.10)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(255,255,255,0.20)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow =
            "0 8px 24px rgba(139,92,246,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "rgba(255,255,255,0.10)";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }
      }}
    >
      {/* Avatar con gradient único por teléfono */}
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white text-sm font-medium"
        style={{ background: avatarGradient }}
      >
        {avatarLabel}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-sm font-medium text-white">
            {nombre}
          </span>
          {timestamp && (
            <span
              className="shrink-0 text-[11px]"
              style={{ color: "rgba(255,255,255,0.40)" }}
            >
              {timestamp}
            </span>
          )}
        </div>

        <p
          className="mt-0.5 line-clamp-1 text-xs"
          style={{ color: "rgba(255,255,255,0.60)" }}
        >
          {preview || "Sin mensajes"}
        </p>

        {/* Tags de estado */}
        <div className="mt-1.5 flex flex-wrap gap-1">
          {chat.bot_pausado === true ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(250,224,184,0.12)",
                border: "1px solid rgba(250,224,184,0.30)",
                color: "#FAE0B8",
                backdropFilter: "blur(4px)",
              }}
            >
              Bot pausado
            </span>
          ) : (
            <span
              className="tag-bot-activo rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                background: "rgba(184,216,138,0.12)",
                border: "1px solid rgba(184,216,138,0.30)",
                color: "#B8D88A",
                backdropFilter: "blur(4px)",
              }}
            >
              Bot activo
            </span>
          )}
          {/* TODO: descomentar cuando exista columna requiere_intervencion en chats_activos
          {chat.requiere_intervencion && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium animate-pulse"
              style={{
                background: "rgba(244,168,166,0.15)",
                border: "1px solid rgba(244,168,166,0.40)",
                color: "#F4A8A6",
              }}
            >
              Requiere humano
            </span>
          )} */}
        </div>
      </div>
    </button>
  );
}
