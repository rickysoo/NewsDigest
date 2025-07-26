import OpenAI from "openai";
import { type NewsArticle } from "@shared/schema";

export class AIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key";
    this.openai = new OpenAI({ apiKey });
  }

  async generateDigest(articles: NewsArticle[]): Promise<{ title: string; content: string; wordCount: number }> {
    try {
      const articlesText = articles
        .map((article, index) => `${index + 1}. ${article.title}\n${article.content}\n`)
        .join("\n");

      const prompt = `You are a professional news editor creating a comprehensive daily digest for Malaysian readers. 

Please analyze the following ${articles.length} news articles from Free Malaysia Today and create a cohesive 500-word digest that:

1. Provides a compelling title that captures the day's key themes
2. Summarizes the most important stories while maintaining factual accuracy
3. Groups related stories into coherent sections
4. Uses clear, engaging language suitable for email newsletters
5. Maintains an objective, journalistic tone

Articles to summarize:
${articlesText}

Please respond with JSON in this exact format:
{
  "title": "Your compelling digest title here",
  "content": "Your 500-word digest content here, formatted with proper paragraphs and sections"
}`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert news editor specializing in creating engaging, accurate news digests. Always respond with valid JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.title || !result.content) {
        throw new Error("Invalid response format from OpenAI");
      }

      const wordCount = result.content.split(/\s+/).length;

      return {
        title: result.title,
        content: result.content,
        wordCount
      };
    } catch (error) {
      console.error("Error generating AI digest:", error);
      throw new Error("Failed to generate AI digest: " + (error as Error).message);
    }
  }
}
