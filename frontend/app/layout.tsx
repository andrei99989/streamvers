import './globals.css';
import Sidebar from '../components/layout/sidebar';

export const metadata = {
  title: 'StreamVerse Premium',
  description: 'Unified premium streaming platform'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-black text-white overflow-x-hidden">
        <Sidebar />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
