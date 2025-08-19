import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../hooks/useAuth';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SKN - Digital Network Marketing System',
  description: 'Join SKN and start earning from home with our digital network marketing system. Refer 2 people and start building your network today!',
  keywords: 'network marketing, MLM, digital business, home business, SKN, Pakistan',
  authors: [{ name: 'SKN Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
