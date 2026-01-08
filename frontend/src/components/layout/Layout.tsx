import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-6 mt-auto w-full flex justify-center">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SaByeJai. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
