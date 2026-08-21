"""
Main FastAPI Application Entrypoint for Hariyuka AI Backend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.articles import router as articles_router
from app.api.v1.stream import router as stream_router
from app.api.v1.projects import router as projects_router
from app.api.v1.settings import router as settings_router

app = FastAPI(
    title="Hariyuka AI - Engine API",
    description="Next-Generation AI SEO Writer Engine leveraging 9Router multi-model pipeline.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hariyuka.ai",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(articles_router, prefix=settings.API_V1_STR)
app.include_router(stream_router, prefix=settings.API_V1_STR)
app.include_router(projects_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "online",
        "service": "Hariyuka AI Backend",
        "version": "1.0.0",
        "models": {
            "serp_extractor": settings.MODEL_SERP_EXTRACTOR,
            "outline_generator": settings.MODEL_OUTLINE_GENERATOR,
            "section_writer": settings.MODEL_SECTION_WRITER,
            "seo_polisher": settings.MODEL_SEO_POLISHER,
        }
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Hariyuka AI Core Engine API.",
        "documentation": "/docs"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
