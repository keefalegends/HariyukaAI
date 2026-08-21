"""
SERP Scraper & Competitor Context Extractor for Hariyuka AI.
Fetches top search results, competitor headings, and semantic context.
"""
import logging
try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None
from typing import List, Dict, Any, Optional
import urllib.parse

logger = logging.getLogger("hariyuka.serp_scraper")


class SerpScraperService:
    def __init__(self, serper_api_key: Optional[str] = None):
        self.serper_api_key = serper_api_key
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        }

    async def search_and_extract(
        self,
        keyword: str,
        language: str = "id",
        limit: int = 5
    ) -> Dict[str, Any]:
        """
        Search for the top competitor pages and extract headings/content snippets.
        """
        # If Serper API key is provided, use Google Serper API
        if self.serper_api_key:
            return await self._search_via_serper(keyword, language, limit)
        
        # Free Web Fallback (DuckDuckGo HTML / Organic scraping)
        return await self._search_via_duckduckgo(keyword, limit)

    async def _search_via_serper(self, keyword: str, language: str, limit: int) -> Dict[str, Any]:
        try:
            url = "https://google.serper.dev/search"
            payload = {
                "q": keyword,
                "gl": "id" if language == "id" else "us",
                "hl": language,
                "num": limit
            }
            headers = {
                "X-API-KEY": self.serper_api_key,
                "Content-Type": "application/json"
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    organic = data.get("organic", [])[:limit]
                    paa = [item.get("question") for item in data.get("peopleAlsoAsk", [])]
                    
                    results = []
                    for item in organic:
                        results.append({
                            "title": item.get("title", ""),
                            "snippet": item.get("snippet", ""),
                            "link": item.get("link", ""),
                            "position": item.get("position", 0)
                        })
                    
                    return {
                        "results": results,
                        "paa_questions": paa,
                        "competitor_summary": "\n".join([f"- Title: {r['title']}\n  Snippet: {r['snippet']}" for r in results])
                    }
        except Exception as e:
            logger.warning(f"Serper API failed, falling back to intrinsic scraping: {e}")
        
        return await self._search_via_duckduckgo(keyword, limit)

    async def _search_via_duckduckgo(self, keyword: str, limit: int) -> Dict[str, Any]:
        try:
            encoded_query = urllib.parse.quote_plus(keyword)
            url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            
            async with httpx.AsyncClient(headers=self.headers, timeout=8.0, follow_redirects=True) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    results = []
                    for r in soup.select(".result")[:limit]:
                        title_el = r.select_one(".result__title")
                        snippet_el = r.select_one(".result__snippet")
                        if title_el and snippet_el:
                            title = title_el.get_text(strip=True)
                            snippet = snippet_el.get_text(strip=True)
                            results.append({"title": title, "snippet": snippet})
                    
                    if results:
                        return {
                            "results": results,
                            "paa_questions": [],
                            "competitor_summary": "\n".join([f"- Title: {r['title']}\n  Snippet: {r['snippet']}" for r in results])
                        }
        except Exception as e:
            logger.warning(f"DuckDuckGo search fallback failed: {e}")
        
        # Return fallback empty summary for LLM intrinsic knowledge
        return {
            "results": [],
            "paa_questions": [],
            "competitor_summary": f"Search landscape analysis for keyword: '{keyword}'."
        }

    async def scrape_page_content(self, url: str) -> Optional[str]:
        """Scrape article text and headings from a specific competitor URL."""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=10.0, follow_redirects=True) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    soup = BeautifulSoup(res.text, "html.parser")
                    # Remove scripts and styles
                    for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                        tag.decompose()
                    
                    headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])]
                    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 40]
                    
                    summary = f"Headings:\n" + "\n".join(f"- {h}" for h in headings[:10])
                    summary += f"\n\nSample Content:\n" + "\n".join(paragraphs[:5])
                    return summary
        except Exception as e:
            logger.error(f"Failed to scrape URL {url}: {e}")
            return None


serp_scraper = SerpScraperService()
