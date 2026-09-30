import { z } from 'zod';

export const ArtifactTypeSchema = z.enum([
  'IMAGE',
  'VIDEO',
  'AUDIO',
  'FRAME',
  'METADATA'
]);

export const ArtifactSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  sceneId: z.string(),
  jobId: z.string(),
  type: ArtifactTypeSchema,
  storageKey: z.string(),
  hash: z.string(),
  model: z.string(),
  promptHash: z.string(),
  seed: z.number().int().nullable(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CacheEntrySchema = z.object({
  id: z.string(),
  embedding: z.array(z.number()),
  prompt: z.string(),
  promptHash: z.string(),
  sceneType: z.string(),
  style: z.string().nullable(),
  model: z.string(),
  qualityScore: z.number().min(0).max(1),
  artifactId: z.string(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.date()
});

export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;
export type Artifact = z.infer<typeof ArtifactSchema>;
export type CacheEntry = z.infer<typeof CacheEntrySchema>;
