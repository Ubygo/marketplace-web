"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { getAccessToken } from "@/lib/auth-session";
import {
  disconnectSocket,
  getSocket,
  initChatSocket,
  isSocketConnected,
  joinConversation,
  leaveConversation,
  onMessageRead,
  onNewMessage,
  onUserTyping,
  sendMessageViaSocket,
  typing,
} from "@/lib/chat-socket";
import { useEffect, useMemo, useState } from "react";

export interface ChatSocketApi {
  isConnected: boolean;
  joinConversation: typeof joinConversation;
  leaveConversation: typeof leaveConversation;
  sendMessageViaSocket: typeof sendMessageViaSocket;
  typing: typeof typing;
  onNewMessage: typeof onNewMessage;
  onMessageRead: typeof onMessageRead;
  onUserTyping: typeof onUserTyping;
  getSocket: typeof getSocket;
}

interface UseChatSocketOptions {
  enabled?: boolean;
  disconnectOnUnmount?: boolean;
}

export function useChatSocket(
  options: UseChatSocketOptions = {},
): ChatSocketApi {
  const { enabled = true, disconnectOnUnmount = true } = options;
  const { slug } = useTenant();
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(isSocketConnected());

  const token =
    enabled && isAuthenticated && typeof window !== "undefined"
      ? getAccessToken(slug)
      : null;

  if (token) {
    initChatSocket(token);
  }

  useEffect(() => {
    if (!enabled || !isAuthenticated || !token) {
      setIsConnected(false);
      return;
    }

    const socketInstance = getSocket();
    if (!socketInstance) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socketInstance.on("connect", handleConnect);
    socketInstance.on("disconnect", handleDisconnect);
    setIsConnected(socketInstance.connected);

    return () => {
      socketInstance.off("connect", handleConnect);
      socketInstance.off("disconnect", handleDisconnect);

      if (disconnectOnUnmount) {
        disconnectSocket();
      }
    };
  }, [disconnectOnUnmount, enabled, isAuthenticated, token]);

  return useMemo(
    () => ({
      isConnected: getSocket()?.connected ?? isConnected,
      joinConversation,
      leaveConversation,
      sendMessageViaSocket,
      typing,
      onNewMessage,
      onMessageRead,
      onUserTyping,
      getSocket,
    }),
    [isConnected],
  );
}
