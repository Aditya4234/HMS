"use client";

import { useCallback, useEffect, useRef } from "react";

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (
            momentListener?: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
              getDismissedReason: () => string;
              getNotDisplayedReason: () => string;
              getSkippedMomentReason: () => string;
            }) => void
          ) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: string;
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export default function GoogleLoginButton({
  onSuccess,
  onError,
}: GoogleLoginButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  const handleCredentialResponse = useCallback(
    (response: { credential: string }) => {
      if (response.credential) {
        onSuccess(response.credential);
      } else {
        onError?.("No credential returned");
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
        onError?.("Google Client ID not configured");
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        cancel_on_tap_outside: false,
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-full max-w-xs">
        <div ref={buttonRef} className="flex justify-center" />
      </div>
      <p className="text-xs text-gray-400">
        Secured by Google Authentication
      </p>
    </div>
  );
}
