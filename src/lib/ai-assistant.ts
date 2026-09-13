import { prisma, serializeData } from './prisma';
import { SoftwareItemData } from '@/types';

export interface AIChatResponse {
  message: string;
  suggestedItems: SoftwareItemData[];
  categoryRecommendations?: string[];
}

/**
 * AI Assistant Service grounded on the live database catalog.
 * Performs RAG retrieval against the database and constructs contextual responses.
 */
export async function processAIChatQuery(userQuery: string): Promise<AIChatResponse> {
  const cleanQuery = userQuery.trim().toLowerCase();

  // 1. Extract potential filters from natural language query
  let categoryFilter: string | undefined;
  if (cleanQuery.includes('game') || cleanQuery.includes('rpg') || cleanQuery.includes('fps') || cleanQuery.includes('cyberpunk')) {
    if (cleanQuery.includes('mobile') || cleanQuery.includes('android') || cleanQuery.includes('ios')) {
      categoryFilter = 'mobile-games';
    } else {
      categoryFilter = 'computer-games';
    }
  } else if (cleanQuery.includes('software') || cleanQuery.includes('editor') || cleanQuery.includes('code') || cleanQuery.includes('ide') || cleanQuery.includes('tool') || cleanQuery.includes('video') || cleanQuery.includes('security') || cleanQuery.includes('password')) {
    categoryFilter = 'computer-software';
  } else if (cleanQuery.includes('mobile app') || cleanQuery.includes('apk') || cleanQuery.includes('planner') || cleanQuery.includes('camera')) {
    categoryFilter = 'mobile-apps';
  }

  let platformFilter: string | undefined;
  if (cleanQuery.includes('mac') || cleanQuery.includes('macos') || cleanQuery.includes('apple')) {
    platformFilter = 'MACOS';
  } else if (cleanQuery.includes('windows') || cleanQuery.includes('pc')) {
    platformFilter = 'WINDOWS';
  } else if (cleanQuery.includes('linux') || cleanQuery.includes('ubuntu')) {
    platformFilter = 'LINUX';
  } else if (cleanQuery.includes('android') || cleanQuery.includes('apk')) {
    platformFilter = 'ANDROID';
  } else if (cleanQuery.includes('ios') || cleanQuery.includes('iphone')) {
    platformFilter = 'IOS';
  }

  // Parse size constraints (e.g. "under 200mb", "less than 1gb")
  let maxSizeLimitBytes: bigint | undefined;
  const mbMatch = cleanQuery.match(/(?:under|below|less than|<)\s*(\d+)\s*(?:mb|megabytes)/i);
  const gbMatch = cleanQuery.match(/(?:under|below|less than|<)\s*(\d+(?:\.\d+)?)\s*(?:gb|gigabytes)/i);
  if (mbMatch) {
    maxSizeLimitBytes = BigInt(parseInt(mbMatch[1], 10) * 1024 * 1024);
  } else if (gbMatch) {
    maxSizeLimitBytes = BigInt(Math.floor(parseFloat(gbMatch[1]) * 1024 * 1024 * 1024));
  }

  // 2. Query Postgres/SQLite database catalog for relevant candidates
  const keywords = cleanQuery
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['find', 'give', 'show', 'best', 'free', 'under', 'with', 'what', 'where', 'how', 'the', 'for', 'and'].includes(w));

  const whereClause: Record<string, unknown> = {
    isPublished: true,
  };

  if (categoryFilter) {
    whereClause.category = { slug: categoryFilter };
  }

  if (keywords.length > 0) {
    whereClause.OR = [
      ...keywords.map((kw) => ({ title: { contains: kw } })),
      ...keywords.map((kw) => ({ tagline: { contains: kw } })),
      ...keywords.map((kw) => ({ description: { contains: kw } })),
    ];
  }

  const rawCandidates = await prisma.softwareItem.findMany({
    where: whereClause,
    include: {
      category: true,
      downloadFiles: true,
      tags: { include: { tag: true } },
    },
    take: 6,
    orderBy: [{ averageRating: 'desc' }, { downloadCount: 'desc' }],
  });

  // Filter candidates by platform and size if specified
  let matchedItems = rawCandidates;
  if (platformFilter) {
    matchedItems = matchedItems.filter((item) =>
      item.downloadFiles.some((f) => f.platform === platformFilter)
    );
  }

  if (maxSizeLimitBytes) {
    matchedItems = matchedItems.filter((item) =>
      item.downloadFiles.some((f) => f.fileSize <= maxSizeLimitBytes!)
    );
  }

  // Fallback to top rated items if no exact keyword match
  if (matchedItems.length === 0) {
    matchedItems = await prisma.softwareItem.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        downloadFiles: true,
        tags: { include: { tag: true } },
      },
      take: 3,
      orderBy: { averageRating: 'desc' },
    });
  }

  const serializedItems = serializeData(matchedItems) as unknown as SoftwareItemData[];

  // 3. If Gemini API Key or OpenAI API Key is provided, call the LLM with grounded context
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are Zenith AI, the intelligent catalog guide for Zenith Software Hub.
A user asked: "${userQuery}"

Here are real items from our verified database catalog:
${serializedItems
  .map(
    (item, idx) =>
      `${idx + 1}. **${item.title}** (v${item.version}, Category: ${item.category?.name}, Rating: ⭐ ${item.averageRating}/5, Downloads: ${item.downloadCount})\n   - Summary: ${item.tagline}\n   - Available on: ${item.downloadFiles?.map((f) => f.platform).join(', ')}\n   - Link slug: /software/${item.slug}`
  )
  .join('\n')}

Instructions:
- Provide a helpful, concise, and enthusiastic response directly answering the user query.
- Mention the relevant items above with specific highlights on why they fit the user's needs.
- Never make up software that is not in the list.
- Keep the response formatted nicely in markdown with bullet points where appropriate.`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          return {
            message: generatedText,
            suggestedItems: serializedItems,
          };
        }
      }
    } catch (llmErr) {
      console.warn('Gemini API call encountered error, using grounded deterministic generator:', llmErr);
    }
  }

  // 4. Deterministic Intelligent Response Generator (Offline-first & Grounded)
  let responseMessage = '';
  if (serializedItems.length > 0) {
    const itemNames = serializedItems.map((i) => `**${i.title}**`).join(', ');
    responseMessage = `Here are the best matches from our verified catalog for your request: ${itemNames}.\n\n` +
      serializedItems
        .map(
          (item) =>
            `• **[${item.title}](/software/${item.slug})** (⭐ ${item.averageRating.toFixed(1)}/5) — ${item.tagline} (Platform: ${item.downloadFiles?.map((f) => f.platform).join(', ') || 'All'})`
        )
        .join('\n\n') +
      `\n\nClick any card below to view system requirements, download signed binaries, or add them directly to your **Download Basket**!`;
  } else {
    responseMessage = `I searched our catalog for "${userQuery}" but couldn't find exact matches. You can browse through our main categories: **Computer Games**, **Computer Software**, **Mobile Apps**, and **Mobile Games**, or check out the highlighted recommendations below!`;
  }

  return {
    message: responseMessage,
    suggestedItems: serializedItems,
  };
}
