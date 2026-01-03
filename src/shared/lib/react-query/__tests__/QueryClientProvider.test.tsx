import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { ReactQueryProvider } from '../QueryClientProvider';
import { useQuery } from '@tanstack/react-query';

// Test component to verify the provider works
function TestComponent() {
  const { data } = useQuery({
    queryKey: ['test'],
    queryFn: async () => 'test-data',
  });

  return <>{data}</>;
}

describe('ReactQueryProvider', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <ReactQueryProvider>
        <TestComponent />
      </ReactQueryProvider>
    );

    expect(getByText('test-data')).toBeTruthy();
  });

  it('should provide QueryClient to children', async () => {
    const { getByText } = render(
      <ReactQueryProvider>
        <TestComponent />
      </ReactQueryProvider>
    );

    await waitFor(() => {
      expect(getByText('test-data')).toBeTruthy();
    });
  });

  it('should configure QueryClient with default options', () => {
    const TestComponent2 = () => {
      const queryClient = useQuery({
        queryKey: ['test2'],
        queryFn: async () => {
          throw new Error('Test error');
        },
      });

      return null;
    };

    // Provider should not crash with configured options
    expect(() => {
      render(
        <ReactQueryProvider>
          <TestComponent2 />
        </ReactQueryProvider>
      );
    }).not.toThrow();
  });
});
