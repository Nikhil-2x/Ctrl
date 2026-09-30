import Redis from 'ioredis';
import { Queue, Worker } from 'bullmq';
import { QueueName, JobPayload } from '@types/qoneqt';

export interface QueueConfig {
  host: string;
  port: number;
  db: number;
  maxRetries: number;
}

export class QueueManager {
  private redis: Redis;
  private queues: Map<QueueName, Queue>;

  constructor(config: QueueConfig) {
    this.redis = new Redis({
      host: config.host,
      port: config.port,
      db: config.db,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.queues = new Map();
  }

  async initialize(): Promise<void> {
    const queueNames: QueueName[] = [
      'story',
      'image',
      'video',
      'audio',
      'assembly',
      'qa',
      'retry',
      'publish',
      'dead-letter'
    ];

    for (const name of queueNames) {
      this.queues.set(name, new Queue(name, { connection: this.redis }));
    }
  }

  async addJob(
    queueName: QueueName,
    payload: JobPayload,
    options?: Record<string, unknown>
  ): Promise<string> {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);

    const job = await queue.add(payload.id, payload, {
      jobId: payload.idempotencyKey,
      priority: payload.priority,
      attempts: payload.maxAttempts,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      ...options
    });

    return job.id;
  }

  async getQueue(queueName: QueueName): Promise<Queue | undefined> {
    return this.queues.get(queueName);
  }

  async getJobStatus(queueName: QueueName, jobId: string): Promise<string> {
    const queue = this.queues.get(queueName);
    if (!queue) throw new Error(`Queue ${queueName} not found`);

    const job = await queue.getJob(jobId);
    if (!job) return 'NOT_FOUND';

    if (await job.isCompleted()) return 'COMPLETED';
    if (await job.isFailed()) return 'FAILED';
    if (await job.isActive()) return 'ACTIVE';
    if (await job.isDelayed()) return 'DELAYED';
    if (await job.isWaiting()) return 'WAITING';

    return 'UNKNOWN';
  }

  async closeConnection(): Promise<void> {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    await this.redis.quit();
  }
}
