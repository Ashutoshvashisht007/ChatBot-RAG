import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => console.log("✅ Redis connected"));

/** Save message to session history (list) */
export async function pushMessage(sessionId: string, role: 'user' | 'assistant' | 'system', text: string) {
  const key = `sess:${sessionId}:history`;
  const item = JSON.stringify({ role, text, ts: Date.now() });
  await redis.rpush(key, item);
  const ttl = Number(process.env.SESSION_TTL || 3600);
  await redis.expire(key, ttl);
}

export async function getHistory(sessionId: string) {
  const key = `sess:${sessionId}:history`;
  const arr = await redis.lrange(key, 0, -1);
  return arr.map(a => JSON.parse(a));
}

export async function clearHistory(sessionId: string) {
  const key = `sess:${sessionId}:history`;
  await redis.del(key);
}


export default redis;