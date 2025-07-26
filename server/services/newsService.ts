import * as cheerio from "cheerio";
import { type NewsArticle } from "@shared/schema";

export class NewsService {
  private readonly FMT_BASE_URL = "https://www.freemalaysiatoday.com";

  async fetchLatestNews(limit = 10): Promise<NewsArticle[]> {
    try {
      const response = await fetch(this.FMT_BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const articles: NewsArticle[] = [];

      // FMT news article selectors - these may need adjustment based on actual site structure
      $("article, .news-item, .post-item").slice(0, limit).each((_, element) => {
        const $element = $(element);
        const titleElement = $element.find("h1, h2, h3, .title, .headline").first();
        const linkElement = $element.find("a").first();
        
        const title = titleElement.text().trim();
        const relativeUrl = linkElement.attr("href");
        
        if (title && relativeUrl) {
          const url = relativeUrl.startsWith("http") ? relativeUrl : `${this.FMT_BASE_URL}${relativeUrl}`;
          
          articles.push({
            title,
            url,
            content: "", // Will be filled by fetchArticleContent
            publishedAt: new Date().toISOString()
          });
        }
      });

      // Fetch full content for each article
      const articlesWithContent = await Promise.all(
        articles.map(async (article) => {
          try {
            const content = await this.fetchArticleContent(article.url);
            return { ...article, content };
          } catch (error) {
            console.error(`Error fetching content for ${article.url}:`, error);
            return { ...article, content: article.title }; // Fallback to title
          }
        })
      );

      return articlesWithContent.filter(article => article.title.length > 10);
    } catch (error) {
      console.error("Error fetching FMT news:", error);
      throw new Error("Failed to fetch news articles from FMT");
    }
  }

  private async fetchArticleContent(url: string): Promise<string> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $("script, style, nav, header, footer, .advertisement, .ads, .social-share").remove();

      // Extract main content - adjust selectors based on FMT's structure
      const contentSelectors = [
        ".entry-content",
        ".post-content",
        ".article-content", 
        ".content",
        "main article",
        ".story-body"
      ];

      let content = "";
      for (const selector of contentSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          content = element.text().trim();
          break;
        }
      }

      // If no content found, try paragraph tags
      if (!content) {
        content = $("p").map((_, el) => $(el).text().trim()).get().join(" ");
      }

      return content.slice(0, 2000); // Limit content length
    } catch (error) {
      console.error(`Error fetching article content from ${url}:`, error);
      return "";
    }
  }
}
