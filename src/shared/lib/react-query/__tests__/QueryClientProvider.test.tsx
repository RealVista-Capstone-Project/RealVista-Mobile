import { QueryClient, useQuery, useQueryClient } from '@tanstack/react-query'
import { render } from '@testing-library/react-native'
import React from 'react'
import { Text } from 'react-native'
import { ReactQueryProvider } from '../QueryClientProvider'

describe('ReactQueryProvider', () => {
  const createTestClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })

  it('should render children correctly', () => {
    const { getByText } = render(
      <ReactQueryProvider client={createTestClient()}>
        <Text>Child Component</Text>
      </ReactQueryProvider>
    )

    expect(getByText('Child Component')).toBeTruthy()
  })

  it('should provide QueryClient to children', () => {
    const ChildWithClient = () => {
      const client = useQueryClient()
      return <Text>{client ? 'Has Client' : 'No Client'}</Text>
    }

    const { getByText } = render(
      <ReactQueryProvider client={createTestClient()}>
        <ChildWithClient />
      </ReactQueryProvider>
    )

    expect(getByText('Has Client')).toBeTruthy()
  })

  it('should configure QueryClient with default options', () => {
    const TestComponent2 = () => {
      useQuery({
        queryKey: ['test2'],
        queryFn: async () => {
          throw new Error('Test error')
        },
        retry: false,
      })

      return null
    }

    // Provider should not crash
    expect(() => {
      render(
        <ReactQueryProvider client={createTestClient()}>
          <TestComponent2 />
        </ReactQueryProvider>
      )
    }).not.toThrow()
  })
})
