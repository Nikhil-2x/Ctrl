import { z } from 'zod';

export const ModelHealthSchema = z.object({
  available: z.boolean(),
  successRate: z.number().min(0).max(1),
  averageLatency: z.number().nonnegative(),
  timeoutRate: z.number().min(0).max(1),
  oomRate: z.number().min(0).max(1),
  qualityScore: z.number().min(0).max(1),
  lastHealthCheck: z.date()
});

export const ModelCapabilitySchema = z.enum([
  'TEXT_TO_VIDEO',
  'IMAGE_TO_VIDEO',
  'TEXT_TO_IMAGE',
  'AUDIO_GENERATION',
  'TRANSCRIPTION'
]);

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  capabilities: z.array(ModelCapabilitySchema),
  health: ModelHealthSchema,
  config: z.record(z.unknown()).optional()
});

export type ModelHealth = z.infer<typeof ModelHealthSchema>;
export type ModelCapability = z.infer<typeof ModelCapabilitySchema>;
export type Model = z.infer<typeof ModelSchema>;
