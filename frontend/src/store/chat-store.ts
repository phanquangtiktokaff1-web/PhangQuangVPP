import { create } from 'zustand';
import type { ChatMessage } from '@/lib/mock-data';
import { mockChatMessages } from '@/lib/mock-data';

interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isTyping: boolean;

  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (message: string, senderId: string, senderName: string) => void;
}

const autoReplies = [
  'Cảm ơn anh/chị đã liên hệ! Em sẽ kiểm tra và phản hồi ngay ạ.',
  'Dạ, sản phẩm này hiện còn hàng ạ. Anh/chị muốn đặt bao nhiêu ạ?',
  'Em xin gửi anh/chị bảng giá sỉ qua email nhé!',
  'Đơn hàng của anh/chị đang được xử lý, dự kiến giao trong 2-3 ngày ạ.',
  'Anh/chị có thể tham khảo thêm các sản phẩm khuyến mãi trên trang Flash Sale ạ!',
];

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [...mockChatMessages],
  isOpen: false,
  isTyping: false,

  toggleChat: () => set({ isOpen: !get().isOpen }),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  sendMessage: (message, senderId, senderName) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId,
      senderName,
      senderRole: 'customer',
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    set({ messages: [...get().messages, newMessage] });

    // Auto-reply after 1-2 seconds
    set({ isTyping: true });
    setTimeout(() => {
      const reply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        senderId: 'user-1',
        senderName: 'Admin VP Shop',
        senderRole: 'admin',
        message: autoReplies[Math.floor(Math.random() * autoReplies.length)],
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      set({ messages: [...get().messages, reply], isTyping: false });
    }, 1000 + Math.random() * 1000);
  },
}));
