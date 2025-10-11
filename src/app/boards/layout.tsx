import AppLayout from '@/components/layout/AppLayout';

export default function BoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
