'use client';

export default function ScrumRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Scrum pages use ScrumLayout component within each page
  // This layout prevents AppLayout from wrapping Scrum pages
  // By being a client component, it ensures consistent rendering
  return <>{children}</>;
}
