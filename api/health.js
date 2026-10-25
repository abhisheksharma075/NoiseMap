export default function handler(_req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'NoiseMap AI Copilot API (Vercel Serverless)',
      model:
        process.env.GEMINI_MODEL === 'gemini-2.5-flash'
          ? 'gemini-3.8-flash'
          : process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      hasApiKey: !!(
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.OPENAI_API_KEY
      ),
      timestamp: new Date().toISOString(),
    })
  );
}
