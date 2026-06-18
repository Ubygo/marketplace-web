import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

export function initChatSocket(jwtToken: string): Socket | null {
  if (socket?.connected) {
    return socket;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error("API base URL is not defined");
    return null;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(`${baseUrl}/chat`, {
    auth: { token: jwtToken },
    transports: ["websocket"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  return socket;
}

export function joinConversation(conversationId: string): void {
  if (!socket?.connected) return;
  socket.emit("join_conversation", { conversationId });
}

export function leaveConversation(conversationId: string): void {
  if (!socket?.connected) return;
  socket.emit("leave_conversation", { conversationId });
}

export function sendMessageViaSocket(
  conversationId: string,
  content: string,
): void {
  if (!socket?.connected) return;
  socket.emit("send_message", { conversationId, content });
}

export function typing(conversationId: string, isTyping: boolean): void {
  if (!socket?.connected) return;
  socket.emit("typing", { conversationId, isTyping });
}

export function onNewMessage(
  callback: (message: unknown) => void,
): () => void {
  if (!socket) return () => {};

  socket.on("new_message", callback);
  return () => {
    socket?.off("new_message", callback);
  };
}

export function onMessageRead(
  callback: (data: { conversationId: string; messageId: string }) => void,
): () => void {
  if (!socket) return () => {};

  socket.on("message_read", callback);
  return () => {
    socket?.off("message_read", callback);
  };
}

export function onUserTyping(
  callback: (data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void,
): () => void {
  if (!socket) return () => {};

  socket.on("user_typing", callback);
  return () => {
    socket?.off("user_typing", callback);
  };
}

export function disconnectSocket(): void {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function getSocket(): Socket | null {
  return socket;
}
