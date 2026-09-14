/** A consumer-owned reading position, relative to a stable message row. */
export interface MessageListPosition {
  messageId: string;
  index?: number;
  offset: number;
  atLatest: boolean;
}
