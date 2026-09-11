"""
SERP Scraper & Competitor Context Extractor for Hariyuka AI.
Fetches top search results, competitor headings, and semantic context for Google Page 1.
"""
import logging
import re
import urllib.parse
from typing import List, Dict, Any, Optional

import httpx

try:
    from bs4 import BeautifulSoup
except ImportError:
    BeautifulSoup = None

from app.config import settings

logger = logging.getLogger("hariyuka.serp_scraper")


class SerpScraperService:
    def __init__(
        self,
        serper_api_key: Optional[str] = None,
        tavily_api_key: Optional[str] = None,
    ):
        self.serper_api_key = serper_api_key or settings.SERPER_API_KEY
        self.tavily_api_key = tavily_api_key or settings.TAVILY_API_KEY
        self.headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

    async def search_and_extract(
        self,
        keyword: str,
        language: str = "id",
        limit: int = 6
    ) -> Dict[str, Any]:
        """
        Search for top competitor pages on Google Page 1 and extract headings/content snippets.
        Prioritizes Serper API -> Tavily API -> Bing Web Scraping -> DuckDuckGo.
        """
        # 1. Try Serper API (Google Search API)
        if self.serper_api_key:
            res = await self._search_via_serper(keyword, language, limit)
            if res.get("results"):
                logger.info(f"[SERP] Successfully retrieved {len(res['results'])} Google results via Serper")
                return res

        # 2. Try Tavily API
        if self.tavily_api_key:
            res = await self._search_via_tavily(keyword, limit)
            if res.get("results"):
                logger.info(f"[SERP] Successfully retrieved {len(res['results'])} results via Tavily")
                return res

        # 3. Organic Web Scraping: Try Bing Search (reliable & non-blocked for ID SERP)
        bing_res = await self._search_via_bing(keyword, limit)
        if bing_res.get("results"):
            logger.info(f"[SERP] Successfully retrieved {len(bing_res['results'])} organic results via Bing")
            return bing_res

        # 4. Fallback Organic Web Scraping: DuckDuckGo
        ddg_res = await self._search_via_duckduckgo(keyword, limit)
        if ddg_res.get("results"):
            logger.info(f"[SERP] Successfully retrieved {len(ddg_res['results'])} organic results via DuckDuckGo")
            return ddg_res

        # 5. Safe Fallback
        logger.warning(f"[SERP] All search scrapers returned empty for keyword '{keyword}', using intrinsic modeling.")
        return {
            "results": [],
            "paa_questions": [],
            "competitor_summary": f"Target Keyword: '{keyword}' (Focus on Indonesian top-ranking informational and commercial search intent).",
        }

    async def _search_via_serper(self, keyword: str, language: str, limit: int) -> Dict[str, Any]:
        try:
            url = "https://google.serper.dev/search"
            payload = {
                "q": keyword,
                "gl": "id" if language == "id" else "us",
                "hl": language,
                "num": limit,
            }
            headers = {
                "X-API-KEY": self.serper_api_key,
                "Content-Type": "application/json",
            }
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    organic = data.get("organic", [])[:limit]
                    paa = [item.get("question") for item in data.get("peopleAlsoAsk", []) if item.get("question")]

                    results = []
                    for item in organic:
                        results.append({
                            "title": item.get("title", ""),
                            "snippet": item.get("snippet", ""),
                            "link": item.get("link", ""),
                            "position": item.get("position", 0),
                        })

                    summary_lines = ["Top Google Page 1 Competitor Results:"]
                    for idx, r in enumerate(results, 1):
                        summary_lines.append(f"{idx}. Judul: {r['title']}\n   Ringkasan Isi: {r['snippet']}\n   URL: {r['link']}")

                    if paa:
                        summary_lines.append("\nPertanyaan Populer di Google (People Also Ask):")
                        for q in paa[:4]:
                            summary_lines.append(f"- {q}")

                    return {
                        "results": results,
                        "paa_questions": paa,
                        "competitor_summary": "\n".join(summary_lines),
                    }
        except Exception as e:
            logger.warning(f"Serper API failed: {e}")
        return {"results": [], "paa_questions": [], "competitor_summary": ""}

    async def _search_via_tavily(self, keyword: str, limit: int) -> Dict[str, Any]:
        try:
            url = "https://api.tavily.com/search"
            payload = {
                "api_key": self.tavily_api_key,
                "query": keyword,
                "search_depth": "basic",
                "max_results": limit,
            }
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    raw_results = data.get("results", [])[:limit]
                    results = []
                    summary_lines = ["Top Google / Web Competitor Results:"]
                    for idx, r in enumerate(raw_results, 1):
                        t = r.get("title", "")
                        c = r.get("content", "")
                        u = r.get("url", "")
                        results.append({"title": t, "snippet": c, "link": u, "position": idx})
                        summary_lines.append(f"{idx}. Judul: {t}\n   Ringkasan Isi: {c}\n   URL: {u}")

                    return {
                        "results": results,
                        "paa_questions": [],
                        "competitor_summary": "\n".join(summary_lines),
                    }
        except Exception as e:
            logger.warning(f"Tavily API failed: {e}")
        return {"results": [], "paa_questions": [], "competitor_summary": ""}

    async def _search_via_bing(self, keyword: str, limit: int) -> Dict[str, Any]:
        """Scrapes organic top search results from Bing for Indonesian queries."""
        try:
            encoded_query = urllib.parse.quote_plus(keyword)
            url = f"https://www.bing.com/search?q={encoded_query}&setlang=id&cc=ID"
            async with httpx.AsyncClient(headers=self.headers, timeout=9.0, follow_redirects=True, verify=False) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    results = []
                    if BeautifulSoup:
                        soup = BeautifulSoup(res.text, "html.parser")
                        items = soup.select("li.b_algo")[:limit]
                        for idx, item in enumerate(items, 1):
                            title_el = item.select_one("h2 a")
                            snippet_el = item.select_one(".b_caption p, .b_lineclamp2, .b_snippet")
                            if title_el:
                                t = title_el.get_text(strip=True)
                                l = title_el.get("href", "")
                                s = snippet_el.get_text(strip=True) if snippet_el else ""
                                if t:
                                    results.append({"title": t, "snippet": s, "link": l, "position": idx})
                    else:
                        matches = re.findall(r'<li class="b_algo"[^>]*>.*?<h2><a[^>]+href="([^"]+)"[^>]*>(.*?)</a>.*?<p[^>]*>(.*?)</p>', res.text, re.DOTALL)
                        for idx, m in enumerate(matches[:limit], 1):
                            l = m[0]
                            t = re.sub(r'<[^>]+>', '', m[1]).strip()
                            s = re.sub(r'<[^>]+>', '', m[2]).strip()
                            if t:
                                results.append({"title": t, "snippet": s, "link": l, "position": idx})

                    if results:
                        summary_lines = ["Top Search Engine Competitor Results (Page 1):"]
                        for idx, r in enumerate(results, 1):
                            summary_lines.append(f"{idx}. Judul: {r['title']}\n   Ringkasan: {r['snippet']}")

                        return {
                            "results": results,
                            "paa_questions": [],
                            "competitor_summary": "\n".join(summary_lines),
                        }
        except Exception as e:
            logger.warning(f"Bing search scraping failed: {e}")
        return {"results": [], "paa_questions": [], "competitor_summary": ""}

    async def _search_via_duckduckgo(self, keyword: str, limit: int) -> Dict[str, Any]:
        """DuckDuckGo HTML fallback."""
        try:
            encoded_query = urllib.parse.quote_plus(keyword)
            url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
            async with httpx.AsyncClient(headers=self.headers, timeout=8.0, follow_redirects=True, verify=False) as client:
                res = await client.get(url)
                if res.status_code == 200 and "result__title" in res.text:
                    results = []
                    if BeautifulSoup:
                        soup = BeautifulSoup(res.text, "html.parser")
                        for idx, r in enumerate(soup.select(".result")[:limit], 1):
                            title_el = r.select_one(".result__title")
                            snippet_el = r.select_one(".result__snippet")
                            if title_el and snippet_el:
                                t = title_el.get_text(strip=True)
                                s = snippet_el.get_text(strip=True)
                                results.append({"title": t, "snippet": s, "position": idx})
                    if results:
                        summary_lines = ["Top Competitor Results:"]
                        for idx, r in enumerate(results, 1):
                            summary_lines.append(f"{idx}. Judul: {r['title']}\n   Ringkasan: {r['snippet']}")
                        return {
                            "results": results,
                            "paa_questions": [],
                            "competitor_summary": "\n".join(summary_lines),
                        }
        except Exception as e:
            logger.warning(f"DuckDuckGo search fallback failed: {e}")

        return {"results": [], "paa_questions": [], "competitor_summary": ""}

    async def scrape_page_content(self, url: str) -> Optional[str]:
        """Scrape article text and headings from a specific competitor URL."""
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=10.0, follow_redirects=True, verify=False) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    if BeautifulSoup:
                        soup = BeautifulSoup(res.text, "html.parser")
                        for tag in soup(["script", "style", "nav", "footer", "header", "aside"]):
                            tag.decompose()
                        headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])]
                        paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 40]
                        summary = "Headings:\n" + "\n".join(f"- {h}" for h in headings[:10])
                        summary += "\n\nSample Content:\n" + "\n".join(paragraphs[:5])
                        return summary
                    else:
                        headings = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', res.text, re.IGNORECASE)
                        clean_headings = [re.sub(r'<[^>]+>', '', h).strip() for h in headings if len(h.strip()) > 3]
                        return "Headings:\n" + "\n".join(f"- {h}" for h in clean_headings[:10])
        except Exception as e:
            logger.error(f"Failed to scrape URL {url}: {e}")
            return None


serp_scraper = SerpScraperService()

