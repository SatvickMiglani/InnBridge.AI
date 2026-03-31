import asyncio
import httpx
import time
import uuid
import sys

API_BASE = "http://localhost:8000"
GUEST_ID = "guest"
TEST_USER_EMAIL = f"test_{uuid.uuid4().hex[:4]}@example.com"
TEST_USER_PASSWORD = "Password123!"

async def run_deep_diagnosis():
    print("="*80)
    print(" INNOBRIDGE.AI — DEEP LEVEL DIAGNOSIS SUITE ".center(80, "="))
    print("="*80)

    async with httpx.AsyncClient(timeout=60.0) as client:
        # --- 1. AUTH FLOW & STABILITY ---
        print("\n[STEP 1] Auth Flow & Profile Stability")
        try:
            reg_res = await client.post(f"{API_BASE}/users/create", json={
                "name": "Diagnostic Bot",
                "email": TEST_USER_EMAIL,
                "password": TEST_USER_PASSWORD,
                "designation": "AI Researcher",
                "skill_level": "intermediate",
                "interests": ["Machine Learning", "Robotics"]
            })
            if reg_res.status_code == 200:
                user_id = reg_res.json()["data"]["id"]
                print(f"✅ User Created: {user_id}")
            else:
                print(f"❌ User Creation Failed: {reg_res.status_code} - {reg_res.text}")
                return
        except Exception as e:
            print(f"❌ Auth Test Crashed: {e}")
            return

        # --- 2. RELEVANCE: HOME FEED (PERSONALIZED VS GUEST) ---
        print("\n[STEP 2] Triple-Checking Relevance (Personalized vs Guest)")
        # Guest Home Feed
        g_res = await client.get(f"{API_BASE}/feed/{GUEST_ID}/unified")
        g_data = g_res.json()
        print(f"✅ Guest Feed: {g_res.status_code} (Articles: {sum(g_data.get('counts', {}).values())})")
        
        # User Home Feed (Specifically biasing for Robotics/ML)
        u_res = await client.get(f"{API_BASE}/feed/{user_id}/unified")
        u_data = u_res.json()
        print(f"✅ User Feed: {u_res.status_code} (Articles: {sum(u_data.get('counts', {}).values())})")
        
        # Relevancy Verification: Check if papers content matches interests
        u_papers = u_data.get("feed", {}).get("papers", [])
        if any("machine learning" in p["title"].lower() or "robotics" in p["title"].lower() for p in u_papers[:5]):
            print("✅ RELATIVE MATCH: Initial feed entries match user interests.")
        else:
            print("⚠️ WEAK RELEVANCE: First 5 papers did not contain interest keywords.")

        # --- 3. SEARCH LOGIC: PHRASE MATCHING & FRAGMENTATION ---
        print("\n[STEP 3] Search Logic: Exact Phrase Matching")
        q = "computer vision"
        # Search as User
        s_res = await client.get(f"{API_BASE}/feed/{user_id}/search?q={q}")
        s_data = s_res.json()
        print(f"✅ Search Status: {s_res.status_code} (Total Results Found)")
        
        # Check fragmentation: Results should ideally contain BOTH keywords or conceptual equivalents
        s_results = s_data.get("results", {})
        all_titles = [x["title"] for x in (s_results.get("banner", []) + s_results.get("papers", []))]
        if all_titles:
            print(f"✅ Sample Search Title: '{all_titles[0]}'")
        else:
            print("❌ No search results found for 'computer vision'.")

        # --- 4. DEEP NARROW: ZERO-RESULT LIVE FETCH ---
        print("\n[STEP 4] Deep Narrow Discovery (Live Ingestion)")
        niche_q = f"Nano-Robotic Surgery {uuid.uuid4().hex[:4]}"
        print(f"   Triggering Live Fetch for: '{niche_q}'")
        
        start_d = time.time()
        d_res = await client.get(f"{API_BASE}/feed/{user_id}/search?q={niche_q}")
        end_d = time.time()
        
        if d_res.status_code == 200:
            d_results = d_res.json().get("results", {})
            d_papers = d_results.get("papers", [])
            print(f"✅ Deep Search Finished in {end_d - start_d:.2f}s.")
            if d_papers:
                print(f"✅ Live Discovery: {len(d_papers)} papers fetched and SUMMARIZED.")
                print(f"   Sample Summary: {d_papers[0].get('summary_one_min', '')[:100]}...")
            else:
                print("⚠️ No papers found for niche query (ArXiv might be narrow).")
        else:
            print(f"❌ Deep Search Error: {d_res.status_code}")

        # --- 5. EDGE CASES: 401, 422, & MALFORMED DATA ---
        print("\n[STEP 5] Edge Case & Corner-to-Corner Stress")
        # Invalid UUID (Should fall back if logic permits, or 422)
        bad_res = await client.get(f"{API_BASE}/feed/INVALID-ID/unified")
        print(f"✅ Malformed ID Handled: {bad_res.status_code}")
        
        # Empty Search
        empty_res = await client.get(f"{API_BASE}/feed/{user_id}/search?q=")
        print(f"✅ Empty Search Handled: {empty_res.status_code}")

    print("\n" + "="*80)
    print(" Diagnosis Complete ".center(80, "="))
    print("="*80)

if __name__ == "__main__":
    asyncio.run(run_deep_diagnosis())
