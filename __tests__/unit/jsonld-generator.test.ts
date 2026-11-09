import { stringifyJsonLd } from '@/utils/jsonld-generator';

describe('JSON-LD stringification', () => {
  it('escapes characters that can break out of script tags', () => {
    const output = stringifyJsonLd({
      name: '</script><script>alert("xss")</script>',
      description: 'A & B',
    });

    expect(output).not.toContain('</script>');
    expect(output).not.toContain('<script>');
    expect(output).toContain('\\u003C/script\\u003E');
    expect(output).toContain('\\u0026');
  });
});
