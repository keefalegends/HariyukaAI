/**
 * Hariyuka AI - 9Router Proxy AI Client (TypeScript / Next.js)
 * Configured with OpenAI SDK targeting self-hosted 9Router instance.
 */

import OpenAI from 'openai';

export interface SerpAnalysisResult {
  search_intent: 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';
  primary_audience: string;
  core_angle: string;
  lsi_keywords: string[];
  semantic_entities: string[];
  paa_questions: string[];
  content_gaps: string[];
  suggested_title: string;
}

export interface OutlineSection {
  id: string;
  heading: string;
  level: 'h2' | 'h3';
  target_word_count: number;
  key_points: string[];
  keywords_to_include: string[];
  subsections?: OutlineSection[];
}

export interface ArticleOutline {
  title: string;
  estimated_total_words: number;
  sections: OutlineSection[];
}

export class NineRouterClient {
  private openai: OpenAI;
  public modelSerp: string;
  public modelOutline: string;
  public modelWriter: string;
  public modelSeo: string;

  constructor(config?: { baseURL?: string; apiKey?: string }) {
    const baseURL =
      config?.baseURL ||
      process.env.NINEROUTER_BASE_URL ||
      'http://202.10.47.200:20128/v1';
    const apiKey =
      config?.apiKey ||
      process.env.NINEROUTER_API_KEY ||
      'placeholder_key';

    this.openai = new OpenAI({
      baseURL,
      apiKey,
    });

    this.modelSerp = process.env.MODEL_SERP_EXTRACTOR || 'gemini-3.7';
    this.modelOutline = process.env.MODEL_OUTLINE_GENERATOR || 'gemini-3.7';
    this.modelWriter = process.env.MODEL_SECTION_WRITER || 'claude-4.6';
    this.modelSeo = process.env.MODEL_SEO_POLISHER || 'claude-4.6';
  }

  /**
   * Helper: Parse JSON output with fallback for markdown code fences.
   */
  private parseJSON<T>(raw: string): T {
    let clean = raw.trim();
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match) {
      clean = match[1].trim();
    }
    return JSON.parse(clean) as T;
  }

  /**
   * Step 1: SERP & Intent Analysis via Gemini 3.7
   */
  async analyzeSerpAndIntent(params: {
    targetKeyword: string;
    competitorContent?: string;
    language?: string;
  }): Promise<SerpAnalysisResult> {
    const response = await this.openai.chat.completions.create({
      model: this.modelSerp,
      messages: [
        {
          role: 'system',
          content:
            'You are an Elite SEO Strategist and Intent Classifier. Return strictly valid JSON.',
        },
        {
          role: 'user',
          content: `Analyze keyword "${params.targetKeyword}" in language "${params.language || 'en'}". Competitor crawl:\n${
            params.competitorContent || 'Intrinsic SERP search model.'
          }`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return this.parseJSON<SerpAnalysisResult>(content);
  }

  /**
   * Step 2: Interactive Outline Generation via Gemini 3.7
   */
  async generateOutline(params: {
    title: string;
    targetKeyword: string;
    serpData: SerpAnalysisResult;
    targetLength?: number;
    tone?: string;
  }): Promise<ArticleOutline> {
    const response = await this.openai.chat.completions.create({
      model: this.modelOutline,
      messages: [
        {
          role: 'system',
          content:
            'You are a Master Content Architect creating outranking long-form SEO outlines. Return strictly valid JSON.',
        },
        {
          role: 'user',
          content: `Title: ${params.title}
Target Keyword: ${params.targetKeyword}
Target Words: ${params.targetLength || 2000}
Tone: ${params.tone || 'authoritative'}
LSI Keywords: ${params.serpData.lsi_keywords.join(', ')}
Entities: ${params.serpData.semantic_entities.join(', ')}
PAA: ${params.serpData.paa_questions.join(', ')}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return this.parseJSON<ArticleOutline>(content);
  }

  /**
   * Step 3: Multi-Pass Section Writer via Claude 4.6
   */
  async writeSection(params: {
    articleTitle: string;
    targetKeyword: string;
    section: OutlineSection;
    tone: string;
    previousSectionsSummary?: string;
  }): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.modelWriter,
      messages: [
        {
          role: 'system',
          content:
            'You are a Pulitzer-caliber Technical & SEO Writer. Write human-grade, engaging content with zero robotic AI cliches. Output strictly Markdown.',
        },
        {
          role: 'user',
          content: `Article: ${params.articleTitle}
Keyword: ${params.targetKeyword}
Tone: ${params.tone}
Section: ${params.section.heading} (${params.section.level})
Target Words: ~${params.section.target_word_count}
Key Points: ${params.section.key_points.join(' | ')}
Keywords to weave: ${params.section.keywords_to_include.join(', ')}
Previous Context: ${params.previousSectionsSummary || 'First section.'}`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Step 5: Real-time Streaming Helper
   */
  async *streamCompletion(params: {
    model: string;
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
    temperature?: number;
  }): AsyncGenerator<string, void, unknown> {
    const stream = await this.openai.chat.completions.create({
      model: params.model,
      messages: params.messages,
      temperature: params.temperature ?? 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        yield delta;
      }
    }
  }
}

// Export singleton instance
export const aiRouter = new NineRouterClient();
