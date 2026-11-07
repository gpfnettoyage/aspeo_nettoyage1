// Using globals (no imports from vitest)
describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with strings', () => {
    expect('hello world').toContain('world')
  })

  it('should work with objects', () => {
    const obj = { name: 'GPF Nettoyage', active: true }
    expect(obj).toHaveProperty('name')
    expect(obj.active).toBeTruthy()
  })
})
