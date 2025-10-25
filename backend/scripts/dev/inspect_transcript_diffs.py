"""
Show before/after transcript snippets for videos re-transcribed recently.
Usage:
  python scripts/inspect_transcript_diffs.py [handle] [limit]
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


def shorten(s: str, n: int = 160) -> str:
    s = (s or '').strip().replace('\n', ' ')
    if len(s) <= n:
        return s
    return s[:n] + '…'


async def inspect(handle: str = None, limit: int = 5, days: int = 7):
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.winedb

    since = datetime.now(timezone.utc) - timedelta(days=days)
    q = {"transcription_date": {"$gte": since}}
    if handle:
        q["tiktok_handle"] = handle

    cur = db.processed_videos.find(q).sort("transcription_date", -1).limit(limit)
    docs = [d async for d in cur]
    if not docs:
        print("No recent transcriptions found.")
        client.close()
        return

    print(f"Showing {len(docs)} transcript diffs (last {days} days)")
    for i, d in enumerate(docs, 1):
        url = d.get('video_url')
        vid = url.split('/')[-1] if url else 'unknown'
        prev = d.get('transcription_prev') or ''
        curr = d.get('transcription') or ''
        print(f"\n{i}. {vid}")
        print("  BEFORE:")
        print("   ", shorten(prev))
        print("  AFTER:")
        print("   ", shorten(curr))

    client.close()


if __name__ == "__main__":
    handle = sys.argv[1] if len(sys.argv) > 1 else None
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 5
    asyncio.run(inspect(handle=handle, limit=limit))


