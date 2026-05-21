import './globals.css';
import Sidebar from '../components/layout/sidebar';
import MobileDock from '../components/MobileDock';
import MiniPlayer from '../components/MiniPlayer';

export const metadata = {
  title: 'StreamVerse Premium',
  description: 'Unified premium streaming platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className="bg-black">
      <body className="min-h-screen bg-black text-white overflow-x-hidden">
        <Sidebar />

        <main className="min-h-screen bg-black text-white">
          {children}
        </main>

        <MiniPlayer />
        <MobileDock />
            </body>
    </html>
  );
}
