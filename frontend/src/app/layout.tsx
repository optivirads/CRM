import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';
import { ToastProvider } from '@/lib/toast-context';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OptiVir CRM | Performance Marketing CRM & Operating System',
  description: 'OptiVir CRM agency operating system managing full performance marketing, campaigns, clients, onboarding, projects, and finance.',
  icons: {
    icon: '/images/optivir-logo.png',
    shortcut: '/images/optivir-logo.png',
    apple: '/images/optivir-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('optivir_theme');
                if (saved === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.className} h-full antialiased selection:bg-[#DC2626] selection:text-white transition-colors duration-200`}>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
