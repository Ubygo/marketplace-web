"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { useVendor } from "@/contexts/VendorContext";
import { useIsProMode } from "@/hooks/useIsProMode";
import {
  getUserConversations,
  getVendorConversations,
} from "@/lib/conversations";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface UnreadMessagesContextValue {
  hasUnreadMessages: boolean;
  setHasUnreadMessages: (hasUnread: boolean) => void;
  refreshUnreadMessages: () => Promise<void>;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextValue | null>(
  null,
);

function hasUnreadConversations(
  conversations: { unreadCount: number }[],
): boolean {
  return conversations.some((conversation) => Number(conversation.unreadCount) > 0);
}

export function UnreadMessagesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { slug, tenantId } = useTenant();
  const { vendor } = useVendor();
  const isProMode = useIsProMode();
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  const refreshUnreadMessages = useCallback(async () => {
    if (!isAuthenticated) {
      setHasUnreadMessages(false);
      return;
    }

    try {
      if (isProMode && vendor?.id) {
        const response = await getVendorConversations(slug, tenantId, vendor.id);
        setHasUnreadMessages(hasUnreadConversations(response.data ?? []));
        return;
      }

      if (!user?.id) {
        setHasUnreadMessages(false);
        return;
      }

      const response = await getUserConversations(slug, tenantId, user.id);
      setHasUnreadMessages(hasUnreadConversations(response.data ?? []));
    } catch {
      setHasUnreadMessages(false);
    }
  }, [isAuthenticated, isProMode, slug, tenantId, user?.id, vendor?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refreshUnreadMessages();
  }, [isAuthLoading, refreshUnreadMessages]);

  const value = useMemo(
    () => ({
      hasUnreadMessages,
      setHasUnreadMessages,
      refreshUnreadMessages,
    }),
    [hasUnreadMessages, refreshUnreadMessages],
  );

  return (
    <UnreadMessagesContext.Provider value={value}>
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export function useUnreadMessages() {
  const context = useContext(UnreadMessagesContext);
  if (!context) {
    throw new Error(
      "useUnreadMessages must be used within UnreadMessagesProvider",
    );
  }
  return context;
}
