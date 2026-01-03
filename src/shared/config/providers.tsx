import { ReactQueryProvider } from '@/shared/lib/react-query/QueryClientProvider';
import { ReactElement, ReactNode } from 'react';

type Provider = ({ children }: { children: ReactNode }) => ReactElement;

export function combineProviders(...providers: Provider[]) {
  return function CombinedProviders({ children }: { children: ReactNode }) {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as ReactElement
    );
  };
}

export const AppProviders = combineProviders(
  ReactQueryProvider
  // Add more providers here (Theme, Auth, etc.)
);
