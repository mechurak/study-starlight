import { z } from 'astro/zod';

export const toneSchema = z.enum(['key', 'ok', 'warn', 'bad', 'mute', 'zone']);

const idSchema = z.string().regex(/^[a-z0-9-]+$/u);

export const catalogSchema = z
	.object({
		categories: z.array(
			z.object({ id: idSchema, title: z.string().min(1), desc: z.string().min(1), tone: toneSchema }).strict(),
		),
		tagAxes: z.array(z.object({ id: idSchema, label: z.string().min(1) }).strict()),
		tags: z.array(
			z.object({ id: idSchema, label: z.string().min(1), axis: idSchema }).strict(),
		),
	})
	.strict();

const mapStepSchema = z
	.object({
		label: z.string().min(1),
		title: z.string().min(1),
		href: z.string().startsWith('/').optional(),
		badge: z.string().min(1).optional(),
		desc: z.string().min(1).optional(),
		note: z.string().min(1).optional(),
		items: z.array(z.tuple([z.string().min(1), z.string().startsWith('/')])).optional(),
		tone: toneSchema.optional(),
	})
	.strict();

export const deckConfigSchema = z
	.object({
		navOrder: z.number().int().nonnegative(),
		catalogOrder: z.number().int().nonnegative(),
		label: z.string().min(1),
		title: z.string().min(1),
		icon: z.string().min(1),
		aliases: z.array(z.string().min(1)).default([]),
		description: z.string().min(1),
		category: z.string().min(1),
		tags: z.array(z.string().min(1)).min(1),
		termIntro: z.enum(['required', 'not-required', 'legacy']),
		reviewIntervalDays: z.number().int().positive().default(180),
		groups: z
			.array(
				z
					.object({
						id: idSchema,
						label: z.string().min(1),
					})
					.strict(),
			)
			.min(1),
		map: z.array(mapStepSchema).min(1),
	})
	.strict();
