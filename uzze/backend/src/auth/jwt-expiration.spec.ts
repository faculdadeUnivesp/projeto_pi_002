import jwt from 'jsonwebtoken';
import { parseExpiresIn } from './jwt-expiration.js';

const duracaoEmSegundos = (expiresIn: jwt.SignOptions['expiresIn']) => {
  const payload = jwt.decode(
    jwt.sign({ sub: 'teste' }, 'segredo', { expiresIn }),
  ) as { exp: number; iat: number };
  return payload.exp - payload.iat;
};

describe('parseExpiresIn', () => {
  it('converte texto numérico do .env em segundos (number)', () => {
    expect(parseExpiresIn('3600', 60)).toBe(3600);
    expect(parseExpiresIn(' 604800 ', 60)).toBe(604800);
  });

  it('mantém formatos com unidade, como "1h" e "7d"', () => {
    expect(parseExpiresIn('1h', 60)).toBe('1h');
    expect(parseExpiresIn('7d', 60)).toBe('7d');
  });

  it('gera tokens com a duração correta (regressão: "3600" virava 3 segundos)', () => {
    expect(duracaoEmSegundos(parseExpiresIn('3600', 60))).toBe(3600);
    expect(duracaoEmSegundos(parseExpiresIn('604800', 60))).toBe(604800);
  });

  it('usa o valor padrão quando a variável não está definida', () => {
    expect(parseExpiresIn(undefined, 3600)).toBe(3600);
    expect(parseExpiresIn('', 3600)).toBe(3600);
  });
});
