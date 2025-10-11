'use client';

import { QueryProvider } from '@/components/providers/QueryProvider';

export default function ScrumRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Scrum pages use ScrumLayout component within each page
  // Wrap with QueryProvider since we bypass the root layout
  return <QueryProvider>{children}</QueryProvider>;
}
