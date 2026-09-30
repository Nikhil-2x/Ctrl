import { z } from 'zod';

export const WorkerStatusSchema = z.enum([
  'HEALTHY',
  'DEGRADED',
  'UNHEALTHY',
  'OFFLINE'
]);

export const WorkerSchema = z.object({
  id: z.string(),
  type: z.enum(['IMAGE', 'VIDEO', 'AUDIO', 'ASSEMBLY', 'QA']),
  status: WorkerStatusSchema,
  currentJobId: z.string().nullable(),
  lastHeartbeat: z.date(),
  gpuInfo: z.object({
    available: z.boolean(),
    model: z.string().optional(),
    memory: z.number().optional(),
    utilizationPercent: z.number().optional()
  }).nullable(),
  successCount: z.number().int().nonnegative(),
  failureCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type WorkerStatus = z.infer<typeof WorkerStatusSchema>;
export type Worker = z.infer<typeof WorkerSchema>;
