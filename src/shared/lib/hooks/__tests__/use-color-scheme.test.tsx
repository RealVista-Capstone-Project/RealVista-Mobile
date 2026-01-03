import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';

describe('useColorScheme', () => {
  it('should return a color scheme', () => {
    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBeTruthy();
    expect(['light', 'dark', null]).toContain(result.current);
  });

  it('should return consistent value across re-renders', () => {
    const { result, rerender } = renderHook(() => useColorScheme());

    const firstValue = result.current;
    rerender({});
    const secondValue = result.current;

    expect(firstValue).toBe(secondValue);
  });
});
