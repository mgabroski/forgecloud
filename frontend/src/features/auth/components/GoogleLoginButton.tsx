import { useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL as string;

export function GoogleLoginButton() {
  const handleClick = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  }, []);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width: '100%',
        padding: '0.7rem 0.9rem',
        borderRadius: '9999px',
        border: '1px solid var(--fc-border-strong)',
        backgroundColor: '#0f172a',
        color: '#f9fafb',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        boxShadow: '0 10px 24px rgba(15,23,42,0.35)',
      }}
    >
      {/* Google icon */}
      <span
        aria-hidden="true"
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" style={{ display: 'block' }}>
          <path
            fill="#EA4335"
            d="M12 10.2v3.8h5.3c-.2 1.2-.9 2.3-1.9 3.1l3.1 2.4c1.8-1.7 2.8-4.1 2.8-6.9 0-.7-.1-1.4-.2-2H12z"
          />
          <path
            fill="#34A853"
            d="M6.5 14.3l-.8.6-2.5 1.9C4.4 19.8 7 21 10 21c2.4 0 4.4-.8 5.9-2.2l-3.1-2.4c-.8.5-1.8.8-2.8.8-2.2 0-4.1-1.5-4.7-3.6z"
          />
          <path
            fill="#FBBC05"
            d="M3.2 7.8C2.4 9.1 2 10.5 2 12s.4 2.9 1.2 4.2c0 0 1.1-2.1 1.3-2.5C4.1 13.1 4 12.6 4 12c0-.6.1-1.1.3-1.7L3.2 7.8z"
          />
          <path
            fill="#4285F4"
            d="M10 5.5c1.3 0 2.4.4 3.3 1.2l2.5-2.5C14.4 2.8 12.4 2 10 2 7 2 4.4 3.2 2.7 5.3L5.5 7C6.1 5.3 7.9 5.5 10 5.5z"
          />
        </svg>
      </span>

      <span>Continue with Google</span>
    </button>
  );
}
