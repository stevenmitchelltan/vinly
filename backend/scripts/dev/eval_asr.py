"""
Evaluate ASR metrics before vs after by version for a handle or date range.
Usage:
  python scripts/eval_asr.py [handle]
"""
import asyncio
import sys
import os
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings


async def eval_asr(username: str = None, days: int = 30):
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client.vinly

    since = datetime.now(timezone.utc) - timedelta(days=days)
    query = {
        "transcription_status": "success",
        "transcription_date": {"$gte": since}
    }
    if username:
        query["tiktok_handle"] = username

    docs = []
    async for d in db.processed_videos.find(query):
        docs.append(d)

    if not docs:
        print("No transcribed videos found in range.")
        client.close()
        return

    by_version = {}
    for d in docs:
        m = d.get("asr_metrics", {}) or {}
        v = m.get("version", "unknown")
        by_version.setdefault(v, []).append(m)

    def agg(ms):
        n = len(ms)
        if n == 0:
            return {}
        def avg(key):
            vals = [x.get(key, 0) for x in ms]
            return sum(vals)/max(1, len(vals))
        pass2_used = sum(1 for x in ms if x.get('pass2_used'))/max(1, n)
        return {
            'count': n,
            'avg_lexicon_hits': avg('lexicon_hits'),
            'avg_hits_per_1k': avg('lexicon_hits_per_1k'),
            'avg_oov_rate': avg('oov_rate'),
            'avg_runtime_ms': avg('runtime_ms'),
            'pass2_used_rate': pass2_used
        }

    print("\nASR Metrics by version (last %d days)" % days)
    for v, ms in by_version.items():
        a = agg(ms)
        print("- %s: count=%d, hits/1k=%.2f, oov=%.3f, pass2=%.1f%%, runtime=%.0fms" % (
            v, a['count'], a['avg_hits_per_1k'], a['avg_oov_rate'], a['pass2_used_rate']*100.0, a['avg_runtime_ms']
        ))

    client.close()


if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(eval_asr(username=username))


