"""
Real-time Server-Sent Events (SSE) Streaming Endpoints for Hariyuka AI.
Streams live generation progress, multi-pass section writing, and SEO audits.
"""
import json
import asyncio
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.pipeline.orchestrator import orchestrator

logger = logging.getLogger("hariyuka.stream")
router = APIRouter(prefix="/stream", tags=["Streaming"])


@router.get("/{article_id}")
async def stream_article_generation(article_id: str):
    """
    SSE stream endpoint for an ongoing article generation job.
    Delivers live pipeline events, outline creation, section text chunks, and completion signals.
    """
    queue = orchestrator.get_event_queue(article_id)

    async def event_generator():
        # Send initial connection confirmation
        init_event = {
            "event": "connected",
            "data": {"article_id": article_id, "status": "listening"}
        }
        yield f"data: {json.dumps(init_event)}\n\n"

        while True:
            try:
                # Wait for next event in queue with timeout
                event = await asyncio.wait_for(queue.get(), timeout=60.0)
                payload = json.dumps(event)
                yield f"data: {payload}\n\n"

                # If generation is completed or failed, close the stream
                if event.get("event") in ["generation_completed", "error", "failed"]:
                    break
            except asyncio.TimeoutError:
                # Send heartbeat ping to keep SSE connection alive
                yield f"data: {json.dumps({'event': 'ping'})}\n\n"
            except Exception as e:
                logger.error(f"Error streaming events for article {article_id}: {e}")
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
