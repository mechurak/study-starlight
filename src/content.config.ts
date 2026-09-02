import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
			schema: docsSchema({
				extend: z.object({
					// 덱 내 사이드바 그룹. index와 topic 밖 페이지는 생략한다.
					deckGroup: z.string().optional(),
					// Thesis 규칙 도입 전 페이지의 ratchet. Thesis를 추가하면 제거한다.
					legacyThesis: z.literal(true).optional(),
					// 검색할 때 떠올릴 법한 옛 이름·약어·동의어.
					aliases: z.array(z.string()).optional(),
					// 단순 수정일이 아니라 내용의 현재성을 마지막으로 확인한 날짜.
					reviewedAt: z.coerce.date().optional(),
					// 생략을 stable로 간주하지 않는다. 날짜만 있으면 표시 단에서 stable로 해석한다.
					status: z.enum(['unreviewed', 'stable', 'review', 'stale']).optional(),
				}),
		}),
	}),
};
