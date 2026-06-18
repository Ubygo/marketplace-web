import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;
let lastToken: string | null = null;
let lifecycleHandlersAttached = false;

export function getChatApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.EXPO_PUBLIC_API_BASE_URL ??
    ""
  );
}

function attachLifecycleHandlers(sock: Socket): void {
  if (lifecycleHandlersAttached) {
    return;
  }

  lifecycleHandlersAttached = true;

  sock.on("connect", () => {
    console.log("Connecté au chat WebSocket");
  });

  sock.on("connected", (data) => {
    console.log("Connecté au chat:", data);
  });

  sock.on("connect_error", (error) => {
    console.error("Erreur de connexion WebSocket:", error.message);
  });

  sock.on("error", (err) => {
    console.error("WebSocket error:", err);
  });

  sock.on("disconnect", (reason) => {
    console.log("Déconnecté du chat:", reason);
  });
}

export function initChatSocket(jwtToken: string): Socket | null {
  const baseUrl = getChatApiBaseUrl();

  if (!baseUrl) {
    console.error("API base URL is not defined");
    return null;
  }

  if (socket && lastToken === jwtToken && !socket.disconnected) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
    lifecycleHandlersAttached = false;
  }

  lastToken = jwtToken;

  socket = io(`${baseUrl}/chat`, {
    auth: { token: jwtToken },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  attachLifecycleHandlers(socket);

  return socket;
}

export function joinConversation(conversationId: string): void {
  if (!socket?.connected) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[chat] join_conversation ignoré: socket non connecté",
        conversationId,
      );
    }
    return;
  }

  socket.emit("join_conversation", { conversationId });

  if (process.env.NODE_ENV === "development") {
    console.log("[chat] join_conversation", conversationId);
  }
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
  lastToken = null;
  lifecycleHandlersAttached = false;
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function getSocket(): Socket | null {
  return socket;
}
