export type InterlocutorType = "VENDOR" | "CUSTOMER";

export interface Interlocutor {
  id: string;
  name: string;
  photoUrl?: string;
  avatar?: string;
  type: InterlocutorType;
  images: string[];
}

export interface LastMessage {
  content?: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  interlocutor: Interlocutor;
  lastMessage: LastMessage | null;
  lastMessageDate: string;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConversationsResponse {
  data: Conversation[];
  meta?: PaginationMeta;
}

export interface Message {
  id: string;
  content: string;
  messageType: "TEXT" | "IMAGE" | "DOCUMENT" | "VIDEO";
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
  };
}

export interface MessageResponse {
  data: Message[];
  meta: PaginationMeta;
}
