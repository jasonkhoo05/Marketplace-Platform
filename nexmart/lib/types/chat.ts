export type Conversation = {
  id: string;
  buyer_uuid: string;
  seller_uuid: string;
  product_id: string | null;
  product_name: string | null;
  product_image: string | null;
  other_user_name: string;
  other_user_image: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_uuid: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type SendMessagePayload = {
  conversation_id: string;
  content: string;
};

export type CreateConversationPayload = {
  seller_uuid: string;
  product_id?: string;
};
