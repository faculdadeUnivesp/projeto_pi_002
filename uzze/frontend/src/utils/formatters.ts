const safe = (value: unknown): string => (value ?? '').toString();

export function formatCpf(value: string | null | undefined): string {
  const digits = safe(value).replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCnpj(value: string | null | undefined): string {
  return safe(value)
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatCep(value: string | null | undefined): string {
  return safe(value)
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatContato(value: string | null | undefined): string {
  const numeros = safe(value).replace(/\D/g, '').slice(0, 11);

  if (numeros.length === 0) {
    return '';
  }

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }

  return numeros
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCurrency(value: number | string): string {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Currency input mask: as the user types digits, formats as pt-BR
 * (1.234,56). Returns '' for empty input.
 *
 *   formatCurrencyInput('')         -> ''
 *   formatCurrencyInput('12345')    -> '123,45'
 *   formatCurrencyInput('1234567')  -> '12.345,67'
 */
export function formatCurrencyInput(value: string): string {
  const digits = safe(value).replace(/\D/g, '');
  if (digits === '') return '';
  const numero = Number(digits) / 100;
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Inverse of formatCurrencyInput: returns the value as a plain
 * decimal string ("1234.56") ready for the API.
 */
export function parseCurrencyInput(value: string): string {
  const digits = safe(value).replace(/\D/g, '');
  if (digits === '') return '';
  const numero = Number(digits) / 100;
  return numero.toFixed(2);
}

export function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('pt-BR');
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('pt-BR');
}
