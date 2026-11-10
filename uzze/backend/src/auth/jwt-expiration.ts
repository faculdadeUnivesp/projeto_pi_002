import type { SignOptions } from 'jsonwebtoken';

/**
 * Converte o valor de expiração lido do .env para o formato do jsonwebtoken.
 *
 * Variáveis de ambiente sempre chegam como texto, e o jsonwebtoken interpreta
 * um texto só com dígitos ("3600") como MILISSEGUNDOS. Por isso, valores
 * numéricos são convertidos para number (segundos). Textos como "1h" ou "7d"
 * são repassados sem alteração.
 */
export function parseExpiresIn(
  value: string | undefined,
  fallbackSeconds: number,
): SignOptions['expiresIn'] {
  const trimmed = value?.trim();
  if (!trimmed) return fallbackSeconds;
  if (/^\d+$/.test(trimmed)) return Number(trimmed);
  return trimmed as SignOptions['expiresIn'];
}
