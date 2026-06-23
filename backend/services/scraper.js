const FIRECRAWL_ENDPOINT = 'https://api.firecrawl.dev/v2/scrape';

/**
 * Extracts useful content (markdown, otherwise html) from the Firecrawl response.
 * Returns null if the request is unsuccessful or there is no content.
 */
function parseFirecrawlResponse(json) {
  if (!json || json.success !== true || !json.data) {
    return null;
  }
  const content = json.data.markdown || json.data.html;
  if (!content || content.trim().length === 0) {
    return null;
  }
  return content;
}

/**
 * Downloads the page via Firecrawl (https://www.firecrawl.dev),
 * which bypasses protections and returns clean markdown.
 * Returns the markdown content of the page or null upon error/blocking.
 */
async function fetchPageContent(url) {
  if (!url) {
    console.log('No URL provided to fetchPageContent');
    return null;
  }

  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    console.warn('FIRECRAWL_API_KEY is not set — unable to download the page via Firecrawl.');
    return null;
  }

  try {
    console.log(`Downloading page via Firecrawl: ${url}`);

    const response = await fetch(FIRECRAWL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
      signal: AbortSignal.timeout(120000), // Scraping via Firecrawl stealth proxies takes time
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn(`Firecrawl returned HTTP ${response.status}: ${errText.slice(0, 300)}`);
      return null;
    }

    const json = await response.json();
    const content = parseFirecrawlResponse(json);

    if (!content) {
      console.warn('Firecrawl did not return page content:', json?.error || 'empty response');
      return null;
    }

    console.log('Page successfully downloaded via Firecrawl.');
    return {
      success: true,
      content,
      rawResponseStructure: {
        success: json.success,
        data: {
          markdownLength: json.data?.markdown?.length || 0,
          htmlLength: json.data?.html?.length || 0,
          metadata: Object.keys(json.data?.metadata || {})
        }
      }
    };
  } catch (err) {
    console.warn(`Error downloading page via Firecrawl: ${err.message}`);
    return null;
  }
}

module.exports = {
  fetchPageContent
};
