import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChatStore } from '@/store/chat-store';
import { useAuthStore } from '@/store/auth-store';

export function LiveChat() {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isOpen, isTyping, toggleChat, sendMessage } = useChatStore();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
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
        className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-3.5 shadow-xl hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-2"
        aria-label="Hỗ trợ trực tuyến"
      >
        {isOpen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium pr-1">Chat hỗ trợ</span>
          </>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col"
          style={{ height: '460px' }}
        >
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 rounded-t-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-1.5">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Hỗ trợ QuangVPP</h3>
                <p className="text-xs opacity-75">Trả lời trong vài phút</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="opacity-70 hover:opacity-100 transition-opacity p-1 rounded"
              aria-label="Đóng chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Welcome message */}
            <div className="flex gap-2">
              <div className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                VP
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                <p className="text-sm text-foreground">Xin chào! 👋 Tôi có thể giúp gì cho bạn?</p>
              </div>
            </div>

            {messages.slice(-20).map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.senderRole === 'customer' ? 'flex-row-reverse' : ''}`}
              >
                {msg.senderRole === 'admin' && (
                  <div className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    VP
                  </div>
                )}
                <div
                  className={`rounded-2xl px-3 py-2 max-w-[80%] ${
                    msg.senderRole === 'customer'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-gray-100 text-foreground rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-[10px] mt-0.5 ${msg.senderRole === 'customer' ? 'opacity-60 text-right' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="bg-primary text-primary-foreground rounded-full h-7 w-7 flex items-center justify-center text-[10px] font-bold shrink-0">
                  VP
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t shrink-0">
            {isAuthenticated ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tin nhắn..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 rounded-full text-sm"
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!message.trim()}
                  className="rounded-full shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-1">
                Vui lòng{' '}
                <a href="/login" className="text-primary font-medium hover:underline">đăng nhập</a>
                {' '}để nhắn tin hỗ trợ
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
