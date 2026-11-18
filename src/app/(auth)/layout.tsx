export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground justify-center py-2 sm:py-4 px-3 sm:px-6">
      <main id="main-content" className="w-full flex flex-col items-center justify-center my-auto">
        {children}
      </main>
    </div>
  );
}
