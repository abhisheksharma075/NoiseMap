import { handleChatApiRequest } from '../server/chatHandler.js';

export default async function handler(req, res) {
  return handleChatApiRequest(req, res);
}
