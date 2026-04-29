import { Navbar } from '@/components/layout/navbar';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
