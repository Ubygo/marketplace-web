"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { getAccessToken } from "@/lib/auth-session";
import {
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
import { useEffect, useRef, useState } from "react";

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
}

const stableChatSocketApi: ChatSocketApi = {
  isConnected: false,
  joinConversation,
  leaveConversation,
  sendMessageViaSocket,
  typing,
  onNewMessage,
  onMessageRead,
  onUserTyping,
  getSocket,
};

export function useChatSocket(
  options: UseChatSocketOptions = {},
): ChatSocketApi {
  const { enabled = true } = options;
  const { slug } = useTenant();
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(isSocketConnected());
  const apiRef = useRef(stableChatSocketApi);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      apiRef.current.isConnected = false;
      setIsConnected(false);
      return;
    }

    const token = getAccessToken(slug);
    if (!token) {
      apiRef.current.isConnected = false;
      setIsConnected(false);
      return;
    }

    const socketInstance = initChatSocket(token);
    if (!socketInstance) {
      apiRef.current.isConnected = false;
      setIsConnected(false);
      return;
    }

    const syncConnected = () => {
      const connected = socketInstance.connected;
      apiRef.current.isConnected = connected;
      setIsConnected(connected);
    };

    socketInstance.on("connect", syncConnected);
    socketInstance.on("disconnect", syncConnected);
    syncConnected();

    return () => {
      socketInstance.off("connect", syncConnected);
      socketInstance.off("disconnect", syncConnected);
    };
  }, [enabled, isAuthenticated, slug]);

  apiRef.current.isConnected = isConnected;

  return apiRef.current;
}
