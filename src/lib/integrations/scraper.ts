import * as cheerio from "cheerio";
import type { ScraperConfig, ScraperSelector } from "@/types";

export interface ScrapeResult {
  success: boolean;
  url: string;
  data: Record<string, string | string[]>;
  timestamp: string;
  error?: string;
}

export async function scrapeUrl(config: ScraperConfig): Promise<ScrapeResult> {
  try {
    const response = await fetch(config.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        ...config.headers,
      },
    });

    if (!response.ok) {
      return {
        success: false,
        url: config.url,
        data: {},
        timestamp: new Date().toISOString(),
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const data: Record<string, string | string[]> = {};

    for (const selector of config.selectors) {
      data[selector.name] = extractData($, selector);
    }

    return {
      success: true,
      url: config.url,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scraper error";
    return {
      success: false,
      url: config.url,
      data: {},
      timestamp: new Date().toISOString(),
      error: message,
    };
  }
}

function extractData($: cheerio.CheerioAPI, selector: ScraperSelector): string | string[] {
  const elements = $(selector.selector);

  if (selector.multiple) {
    const results: string[] = [];
    elements.each((_, el) => {
      const value = selector.attribute ? $(el).attr(selector.attribute) : $(el).text().trim();
      if (value) results.push(value);
    });
    return results;
  } else {
    const el = elements.first();
    if (selector.attribute) {
      return el.attr(selector.attribute) || "";
    }
    return el.text().trim();
  }
}

export async function scrapeWithPagination(config: ScraperConfig): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];
  let currentUrl = config.url;
  const maxPages = config.pagination?.max_pages || 1;

  for (let page = 0; page < maxPages; page++) {
    const result = await scrapeUrl({ ...config, url: currentUrl });
    results.push(result);

    if (!result.success || !config.pagination) break;

    // Find next page URL
    try {
      const response = await fetch(currentUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          ...config.headers,
        },
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      const nextHref = $(config.pagination.next_selector).attr("href");

      if (!nextHref) break;

      // Handle relative URLs
      if (nextHref.startsWith("http")) {
        currentUrl = nextHref;
      } else {
        const base = new URL(config.url);
        currentUrl = new URL(nextHref, base.origin).toString();
      }
    } catch {
      break;
    }
  }

  return results;
}
