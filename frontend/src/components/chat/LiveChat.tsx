import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';

export function LiveChat() {
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isOpen, isTyping, toggleChat, sendMessage } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(
      message.trim(),
      user?.id || 'guest',
      user?.name || 'Khách'
    );
    setMessage('');
  };

  return (
    <>
      {/* Chat toggle button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border flex flex-col" style={{ height: '480px' }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">VP Shop Hỗ trợ</h3>
                <p className="text-xs opacity-80">Thường trả lời trong vài phút</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-3">
              {/* Welcome message */}
              <div className="flex gap-2">
                <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0">
                  VP
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-foreground">Xin chào! 👋 Chào mừng bạn đến VP Shop. Tôi có thể giúp gì cho bạn?</p>
                </div>
              </div>

              {messages.slice(-20).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.senderRole === 'customer' ? 'flex-row-reverse' : ''}`}
                >
                  {msg.senderRole === 'admin' && (
                    <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0">
                      VP
                    </div>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.senderRole === 'customer'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-gray-100 text-foreground'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.senderRole === 'customer' ? 'opacity-70' : 'text-muted-foreground'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shrink-0">
                    VP
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                Vui lòng <a href="/login" className="text-primary underline">đăng nhập</a> để chat
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
