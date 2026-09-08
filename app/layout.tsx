import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { ToastProvider } from '@/components/ui/Toast';
import localFont from 'next/font/local';

const overused = localFont({
  src: '../public/fonts/OverusedGrotesk-VF.woff2',
  display: 'swap',
  variable: '--font-overused',
});

export const metadata: Metadata = {
  title: 'Makromedia Integrated System',
  description: 'Aplikasi Manajemen Proyek Terpadu CV. Makromedia Visual',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${overused.variable} font-sans h-full antialiased`}>
      <body className="min-h-full bg-white text-slate-900">
        <AuthProvider>
          <SidebarProvider>
            <ToastProvider />
            {children}
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}