import { z } from 'zod';

export const GenerationStatusSchema = z.enum([
  'QUEUED',
  'PROCESSING',
  'COMPLETED',
  'FAILED',
  'RETRYING',
  'CANCELLED'
]);

export const GenerationTypeSchema = z.enum([
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'ASSEMBLY'
]);

export const FailureTypeSchema = z.enum([
  'TIMEOUT',
  'MODEL_ERROR',
  'GPU_OOM',
  'INVALID_OUTPUT',
  'WORKER_DISCONNECT',
  'QUALITY_FAILED',
  'SEMANTIC_MISMATCH',
  'UNKNOWN'
]);

export const GenerationJobSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  type: GenerationTypeSchema,
  status: GenerationStatusSchema,
  model: z.string(),
  provider: z.string(),
  attempt: z.number().int().positive(),
  maxAttempts: z.number().int().positive(),
  priority: z.number().int().min(1).max(10),
  idempotencyKey: z.string(),
  workerId: z.string().nullable(),
  startedAt: z.date().nullable(),
  completedAt: z.date().nullable(),
  failureType: FailureTypeSchema.nullable(),
  failureReason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  metadata: z.record(z.unknown()).optional()
});

export type GenerationStatus = z.infer<typeof GenerationStatusSchema>;
export type GenerationType = z.infer<typeof GenerationTypeSchema>;
export type FailureType = z.infer<typeof FailureTypeSchema>;
export type GenerationJob = z.infer<typeof GenerationJobSchema>;
