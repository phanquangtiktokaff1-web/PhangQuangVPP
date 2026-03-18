import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { LiveChat } from '@/components/chat/LiveChat';

export function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <LiveChat />
    </div>
  );
}
