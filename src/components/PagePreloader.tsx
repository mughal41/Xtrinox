import React from 'react';

export const PagePreloader: React.FC<{ message?: string; status?: string }> = ({
  message = 'Loading...',
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9ff',
        gap: '16px',
      }}
    >
      {/* Simple CSS spinner — no transforms on parent elements */}
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e1e2ec',
          borderTopColor: '#0058be',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {message && (
        <p
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#727785',
            fontFamily: 'Inter, sans-serif',
            margin: 0,
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};
