'use client';

// This page renders when a route is requested that doesn't match the
// middleware, e.g. `/api/nonexistent` or `/favicon.ico`.
import Error from 'next/error';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <Error statusCode={404} />
      </body>
    </html>
  );
}