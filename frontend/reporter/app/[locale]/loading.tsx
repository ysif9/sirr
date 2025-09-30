import React from 'react';

// This component will be used by Next.js's Suspense mechanism for page transitions.
export default function Loading() {
  return (
    <div className="loader-overlay">
      <span className="loader"></span>
    </div>
  );
}