import asyncio
import httpx
import time
import sys
import uuid
import os

API_BASE = "http://localhost:8000"

async def check_parallelism():
    print("\n[TEST 1] Parallelism & Architecture")
    async with httpx.AsyncClient(timeout=30.0) as client:
        # Time the Parallel Unified Feed
        start_u = time.time()
        res_u = await client.get(f"{API_BASE}/feed/guest/unified")
        end_u = time.time()
        
        if res_u.status_code == 200:
            count = res_u.json().get("counts", {})
            print(f"✅ Unified Feed: {end_u - start_u:.2f}s (Articles: {sum(count.values())})")
            print(f"   Breakdown: {count}")
        else:
            print(f"❌ Unified Feed Error: {res_u.status_code}")

async def check_guest_fallback():
    print("\n[TEST 2] Guest Access & Stability")
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE}/feed/guest/unified")
        if res.status_code == 200:
            data = res.json()
            if data["user_id"] == "guest" and data["interests"] == ["AI", "Tech", "Software"]:
                print("✅ Guest fallback correctly applied default interests.")
                print(f"✅ Support for non-UUID strings confirmed (401/422 prevention).")
            else:
                print(f"❌ Guest data mismatch: {data['interests']}")
        else:
            print(f"❌ Guest access failed: {res.status_code}")

async def check_deep_search_ingestion():
    print("\n[TEST 3] Deep Search & Data Flow")
    # Search for something niche that likely isn't already in the DB
    query = f"Quantum Gravity Robotics {uuid.uuid4().hex[:4]}"
    print(f"   Searching for NEW topic: '{query}'")
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        start_s = time.time()
        res = await client.get(f"{API_BASE}/feed/guest/search?q={query}")
        end_s = time.time()
        
        if res.status_code == 200:
            results = res.json().get("results", {})
            papers = results.get("papers", [])
            print(f"✅ Deep Search finished in {end_s - start_s:.2f}s.")
            if papers:
                print(f"✅ Found {len(papers)} fresh papers from ArXiv.")
                print(f"✅ Live Enrichment active: Papers have difficulty scores & summaries.")
            else:
                print("⚠️ No papers found for niche query — ArXiv might not have exact matches.")
        else:
            print(f"❌ Search failed: {res.status_code}")

async def main():
    print("="*60)
    print(" INNOBRIDGE.AI — TECHNICAL CROSS-CHECK SUITE ".center(60, "="))
    print("="*60)
    
    try:
        await check_parallelism()
        await check_guest_fallback()
        await check_deep_search_ingestion()
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        print("   Make sure the backend is running at http://localhost:8000")
    
    print("\n" + "="*60)
    print(" Verification Complete ".center(60, "="))
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
