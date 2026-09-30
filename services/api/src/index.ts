import Fastify from 'fastify';
import cors from '@fastify/cors';
import { PrismaClient } from '@prisma/client';
import { QueueManager } from '@queue/qoneqt';
import { healthRoutes } from './routes/health';

const API_PORT = parseInt(process.env.API_PORT || '3000', 10);
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
const DB_USER = process.env.DB_USER || 'qoneqt';
const DB_PASSWORD = process.env.DB_PASSWORD || 'qoneqt-dev';
const DB_NAME = process.env.DB_NAME || 'qoneqt_videoforge';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_DB = parseInt(process.env.REDIS_DB || '0', 10);

const fastify = Fastify({
  logger: true
});

const prisma = new PrismaClient();

let queueManager: QueueManager;

fastify.register(cors, { origin: true });

fastify.register(async (fastify) => {
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));

  fastify.get('/health/db', async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', service: 'database' };
    } catch (error) {
      return { status: 'error', service: 'database', error: String(error) };
    }
  });

  fastify.get('/health/redis', async () => {
    try {
      const redis = require('ioredis');
      const client = new redis.default({ host: REDIS_HOST, port: REDIS_PORT });
      await client.ping();
      await client.quit();
      return { status: 'ok', service: 'redis' };
    } catch (error) {
      return { status: 'error', service: 'redis', error: String(error) };
    }
  });

  fastify.get('/health/queues', async () => {
    try {
      const storyQueue = await queueManager.getQueue('story');
      const counts = await storyQueue?.getJobCounts();
      return { status: 'ok', service: 'queues', counts };
    } catch (error) {
      return { status: 'error', service: 'queues', error: String(error) };
    }
  });
});

async function start() {
  try {
    console.log('Initializing Queue Manager...');
    queueManager = new QueueManager({
      host: REDIS_HOST,
      port: REDIS_PORT,
      db: REDIS_DB,
      maxRetries: 3
    });
    await queueManager.initialize();

    console.log('Connecting to database...');
    await prisma.$connect();

    console.log('Starting API server...');
    await fastify.listen({ port: API_PORT, host: '0.0.0.0' });

    console.log(`✓ API running on http://localhost:${API_PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  await fastify.close();
  await prisma.$disconnect();
  await queueManager.closeConnection();
  process.exit(0);
});

start();
