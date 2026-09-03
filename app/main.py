"""
FinShield FastAPI Main Application Entrypoint
AI-Assisted Financial Distress Intervention Engine
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.api.routes import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.PROJECT_DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", summary="Root API Information", tags=["System"])
async def root():
    """Returns basic service metadata and links to OpenAPI documentation."""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "endpoints": {
            "health": f"{settings.API_V1_STR}/health",
            "demo_customer": f"{settings.API_V1_STR}/demo-customer/{{name}}",
            "diagnose_distress": f"{settings.API_V1_STR}/diagnose-distress",
            "analyze": f"{settings.API_V1_STR}/analyze"
        }
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Fallback global exception handler ensuring clean JSON error responses."""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": str(request.url)
        }
    )
