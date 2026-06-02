'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, options: {
            type?: 'standard' | 'icon';
            theme?: 'outline' | 'filled_blue' | 'filled_black';
            size?: 'large' | 'medium' | 'small';
            text?: string;
            shape?: 'rectangular' | 'pill' | 'circle' | 'square';
            width?: number;
          }) => void;
        };
      };
    };
  }
}

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

export default function GoogleLoginButton({ onSuccess, onError, isLoading }: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.('No credential returned');
      }
    },
    [onSuccess, onError]
  );

  useEffect(() => {
    if (initialized.current) return;

    const initGoogle = () => {
      if (!window.google?.accounts) {
        setTimeout(initGoogle, 300);
        return;
      }

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        onError?.('Google Client ID not configured');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: 320,
        });
      }

      initialized.current = true;
    };

    initGoogle();

    return () => {
      initialized.current = false;
    };
  }, [handleCredentialResponse, onError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-12 rounded-lg border border-white/10 bg-white/[0.02]">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
        <span className="text-sm text-gray-400">Connecting with Google...</span>
      </div>
    );
  }

  return (
    <div ref={buttonRef} className="flex justify-center" />
  );
}
