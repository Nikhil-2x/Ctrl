import { z } from 'zod';

export const QueueNameSchema = z.enum([
  'story',
  'image',
  'video',
  'audio',
  'assembly',
  'qa',
  'retry',
  'publish',
  'dead-letter'
]);

export const JobPayloadSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string().optional(),
  idempotencyKey: z.string(),
  priority: z.number().int().min(1).max(10),
  attempt: z.number().int().positive(),
  maxAttempts: z.number().int().positive(),
  data: z.record(z.unknown())
});

export type QueueName = z.infer<typeof QueueNameSchema>;
export type JobPayload = z.infer<typeof JobPayloadSchema>;
