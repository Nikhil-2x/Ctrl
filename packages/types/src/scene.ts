import { z } from 'zod';

export const VisualPromptSchema = z.object({
  type: z.enum(['video', 'image', 'motion-graphics']),
  prompt: z.string(),
  negativePrompt: z.string().optional(),
  camera: z.string().optional(),
  style: z.string().optional(),
  duration: z.number().positive().optional(),
  dimensions: z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    fps: z.number().positive()
  }).optional()
});

export const SceneSchema = z.object({
  id: z.string(),
  order: z.number().int().positive(),
  duration: z.number().positive(),
  narration: z.string(),
  visual: VisualPromptSchema,
  dependencies: z.array(z.string()).default([])
});

export const SceneDAGSchema = z.object({
  id: z.string(),
  title: z.string(),
  hook: z.string(),
  duration: z.number().positive(),
  scenes: z.array(SceneSchema),
  createdAt: z.date().optional(),
  metadata: z.record(z.unknown()).optional()
});

export type VisualPrompt = z.infer<typeof VisualPromptSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type SceneDAG = z.infer<typeof SceneDAGSchema>;
