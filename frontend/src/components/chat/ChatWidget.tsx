import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth-store';
import { chatApi, type ChatMessage } from '@/lib/api-service';
import { getSocket } from '@/lib/socket';

export function ChatWidget() {
  const { isAuthenticated, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Don't show for admins/staff
  if (user?.role === 'admin' || user?.role === 'staff') return null;

  // Fetch initial messages when opened
  useEffect(() => {
    if (!open || !isAuthenticated) return;
    setLoading(true);
    chatApi.getMessages()
      .then(msgs => { setMessages(msgs); setUnreadCount(0); })
      .catch(() => {})
      .finally(() => setLoading(false));
    // Mark admin messages as read
    chatApi.markRead().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Subscribe to realtime messages via socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (msg: ChatMessage) => {
      // Only show msgs relevant to this customer conversation
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!open && msg.senderRole === 'admin') {
        setUnreadCount(c => c + 1);
      }
    };

    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [open]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');

    const socket = getSocket();
    if (socket?.connected) {
      socket.emit('send_message', { message: text });
    } else {
      // REST fallback
      try {
        await chatApi.sendMessage(text);
        const msgs = await chatApi.getMessages();
        setMessages(msgs);
      } catch {/* ignore */}
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat panel */}
      {open && (
        <div className="w-80 h-[420px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="font-semibold text-sm">Hỗ trợ trực tuyến</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/20">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm mt-8">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>Xin chào! Chúng tôi có thể giúp gì cho bạn?</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderRole === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      msg.senderRole === 'customer'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-background border rounded-bl-sm'
                    }`}
                  >
                    {msg.senderRole === 'admin' && (
                      <div className="text-xs font-medium text-muted-foreground mb-0.5">{msg.senderName}</div>
                    )}
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && void sendMessage()}
              placeholder="Nhập tin nhắn..."
              className="text-sm h-9"
            />
            <Button size="icon" className="h-9 w-9 shrink-0" onClick={() => void sendMessage()} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => { setOpen(o => !o); setUnreadCount(0); }}
        className="h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center relative"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}
