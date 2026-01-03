import { cn } from '../cn'

describe('cn (className utility)', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', true && 'conditional-class', false && 'removed-class')).toBe(
      'base-class conditional-class'
    )
  })

  it('should handle undefined and null values', () => {
    expect(cn('base-class', undefined, null, 'another-class')).toBe('base-class another-class')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle Tailwind class conflicts with proper precedence', () => {
    // Later classes should override earlier ones for the same property
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('should handle arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz')
  })

  it('should handle objects with boolean values', () => {
    expect(cn({ 'class-a': true, 'class-b': false, 'class-c': true })).toBe('class-a class-c')
  })

  it('should handle complex mixed inputs', () => {
    expect(
      cn(
        'base',
        ['derived-1', 'derived-2'],
        { 'conditional-1': true, 'conditional-2': false },
        null,
        'final'
      )
    ).toBe('base derived-1 derived-2 conditional-1 final')
  })
})
