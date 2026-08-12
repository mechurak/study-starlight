import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				// 검색할 때 떠올릴 법한 옛 이름·약어·동의어.
				aliases: z.array(z.string()).optional(),
				// 단순 수정일이 아니라 내용의 현재성을 마지막으로 확인한 날짜.
				reviewedAt: z.coerce.date().optional(),
				status: z.enum(['stable', 'review', 'stale']).default('stable'),
			}),
		}),
	}),
};
