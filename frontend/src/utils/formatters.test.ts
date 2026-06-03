import { describe, it, expect } from 'vitest';
import { formatPrice, truncateText } from './formatters';

describe('formatPrice', () => {
  it('formats price as USD currency', () => {
    expect(formatPrice(10)).toBe('.00');
    expect(formatPrice(1000)).toBe(',000.00');
    expect(formatPrice(1234.56)).toBe(',234.56');
  });
});

describe('truncateText', () => {
  it('returns original text if within limit', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates text and adds ellipsis', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...');
  });

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });
});
