"""
Pydantic Schemas for Hariyuka AI Articles, Outlines, and Generation Pipeline.
Updated with Salna's Yoast WordPress SEO SOP (Pillar, Backlink Article, Backlink Product).
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


# ==============================================================================
# OUTLINE SCHEMAS
# ==============================================================================
class OutlineSectionItem(BaseModel):
    id: str = Field(..., description="Unique section identifier e.g. 'section-1'")
    heading: str = Field(..., description="Section title / heading")
    level: Literal["h2", "h3"] = Field("h2", description="Heading level (Strictly H2 or H3)")
    target_word_count: int = Field(200, description="Target words for this section")
    key_points: List[str] = Field(default_factory=list, description="Crucial arguments or takeaways")
    keywords_to_include: List[str] = Field(default_factory=list, description="LSI and primary keywords")
    subsections: Optional[List["OutlineSectionItem"]] = Field(default_factory=list, description="Nested H3 subheadings")


OutlineSectionItem.model_rebuild()


class ArticleOutlineSchema(BaseModel):
    title: str = Field(..., description="SEO Optimized article title")
    estimated_total_words: int = Field(..., description="Total target word count")
    sections: List[OutlineSectionItem] = Field(..., description="List of H2/H3 sections")


# ==============================================================================
# SERP ANALYSIS SCHEMA
# ==============================================================================
class SerpAnalysisSchema(BaseModel):
    search_intent: Literal["Informational", "Commercial", "Transactional", "Navigational"]
    primary_audience: str
    core_angle: str
    lsi_keywords: List[str]
    semantic_entities: List[str]
    paa_questions: List[str]
    content_gaps: List[str]
    suggested_title: str


# ==============================================================================
# ARTICLE CREATION & GENERATION REQUESTS
# ==============================================================================
class GenerateOutlineRequest(BaseModel):
    target_keyword: str = Field(..., min_length=2, description="Target primary SEO keyword")
    title: Optional[str] = Field(None, description="Custom title if user already has one")
    article_type: Literal["pillar", "backlink_article", "backlink_product"] = Field(
        "backlink_article",
        description="Type of article: 'pillar' (1500-1599 words), 'backlink_article' (500-599 words), 'backlink_product' (500-599 words + product push)"
    )
    language: str = Field("id", description="Target language (e.g. 'id', 'en')")
    tone: str = Field("authoritative", description="Tone of voice")
    target_length: Optional[int] = Field(None, description="Target word count (auto-adjusted based on article_type)")
    secondary_keywords: Optional[List[str]] = Field(default_factory=list)
    project_id: Optional[str] = None
    brand_voice_instructions: Optional[str] = None
    competitor_urls: Optional[List[str]] = Field(default_factory=list)

    # Link injection parameters (Salna SOP)
    target_link_1_url: Optional[str] = Field(None, description="Contextual link 1 URL (e.g. blog link)")
    target_link_1_anchor: Optional[str] = Field(None, description="Anchor text for link 1")
    target_link_2_url: Optional[str] = Field(None, description="Brand/Product link 2 URL (e.g. homepage/product link)")
    target_link_2_anchor: Optional[str] = Field(None, description="Anchor text for link 2")
    product_name: Optional[str] = Field(None, description="Target product name for commercial push")
    product_promotion_context: Optional[str] = Field(None, description="Key features or benefits of the product")


class ContinueWritingRequest(BaseModel):
    outline: ArticleOutlineSchema = Field(..., description="Edited/approved outline")
    title: Optional[str] = None
    article_type: Optional[Literal["pillar", "backlink_article", "backlink_product"]] = None
    tone: Optional[str] = None
    brand_voice_instructions: Optional[str] = None
    target_link_1_url: Optional[str] = None
    target_link_1_anchor: Optional[str] = None
    target_link_2_url: Optional[str] = None
    target_link_2_anchor: Optional[str] = None
    product_name: Optional[str] = None
    product_promotion_context: Optional[str] = None


class ArticleResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    project_id: Optional[str] = None
    title: str
    target_keyword: str
    article_type: Optional[str] = "backlink_article"
    secondary_keywords: List[str] = []
    language: str
    tone: str
    target_length: int
    outline_json: Optional[Dict[str, Any]] = None
    serp_data: Optional[Dict[str, Any]] = None
    content_markdown: Optional[str] = None
    content_html: Optional[str] = None
    status: str
    word_count: int = 0
    seo_score: int = 0
    seo_audit: Optional[Dict[str, Any]] = None
    target_link_1_url: Optional[str] = None
    target_link_1_anchor: Optional[str] = None
    target_link_2_url: Optional[str] = None
    target_link_2_anchor: Optional[str] = None
    product_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UpdateArticleContentRequest(BaseModel):
    content_markdown: Optional[str] = None
    content_html: Optional[str] = None
    title: Optional[str] = None


class JobStatusResponse(BaseModel):
    id: str
    article_id: str
    current_step: int
    total_steps: int = 5
    step_name: str
    progress_percentage: int
    status: str
    logs: List[Dict[str, Any]]
    error_message: Optional[str] = None
