export type ClassValue =
  | string
  | number
  | ClassValue[]
  | Record<string, boolean | string | number | null | undefined>
  | boolean
  | null
  | undefined;

function normalize(value: ClassValue): string[] {
  if (!value && value !== 0) {
    return [];
  }

  if (typeof value === 'string' || typeof value === 'number') {
    return [`${value}`];
  }

  if (Array.isArray(value)) {
    return value.flatMap(normalize);
  }

  if (typeof value === 'object') {
    const entries: string[] = [];
    for (const [key, enabled] of Object.entries(value)) {
      if (enabled) {
        entries.push(key);
      }
    }
    return entries;
  }

  return [];
}

export function cn(...inputs: ClassValue[]): string {
  const classes = inputs.flatMap(normalize);
  return classes.filter(Boolean).join(' ');
}
