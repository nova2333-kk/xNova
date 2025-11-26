import { AppRoot } from '@telegram-apps/telegram-ui';
import { miniApp, useLaunchParams, useSignal } from '@tma.js/sdk-react';

import { App } from '@/app/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === 'string'
              ? error
              : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <AppRoot
        appearance={isDark ? 'dark' : 'light'}
        className={isDark ? 'dark' : undefined}
        platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
      >
        <App/>
      </AppRoot>
    </ErrorBoundary>
  );
}
