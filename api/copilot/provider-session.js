import { handleProviderSessionRequest } from '../../server/chatHandler.js';

export default async function handler(req, res) {
  return handleProviderSessionRequest(req, res);
}
