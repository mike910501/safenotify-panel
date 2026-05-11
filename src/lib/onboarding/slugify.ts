const MAX_SLUG_ATTEMPTS = 10;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export type NegocioIdExistsPredicate = (candidateId: string) => Promise<boolean>;

export async function findAvailableNegocioId(
  baseName: string,
  exists: NegocioIdExistsPredicate
): Promise<string> {
  const baseSlug = slugify(baseName);

  if (!baseSlug) {
    throw new Error("El nombre del negocio no produjo un identificador válido");
  }

  for (let attempt = 1; attempt <= MAX_SLUG_ATTEMPTS; attempt++) {
    const candidate = attempt === 1 ? baseSlug : `${baseSlug}-${attempt}`;
    const taken = await exists(candidate);
    if (!taken) {
      return candidate;
    }
  }

  throw new Error(
    `No fue posible generar un negocio_id único para "${baseName}" tras ${MAX_SLUG_ATTEMPTS} intentos`
  );
}
