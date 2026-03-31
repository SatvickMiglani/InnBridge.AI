import asyncio
import json
import sys

async def test_diversity():
    print("=" * 70)
    print("  DIVERSITY TEST: 'mental health chatbot'")
    print("=" * 70)

    from app.api.routes.projects import _generate_ai_projects

    prompt = "mental health chatbot"
    try:
        projects = await _generate_ai_projects(prompt, "intermediate")
    except Exception as e:
        print(f"\n[FAIL] GENERATION FAILED: {e}")
        sys.exit(1)

    print(f"\nGenerated {len(projects)} projects.\n")

    # Check diversity across key fields
    titles = []
    problems = []
    audiences = []
    solutions = []

    for i, p in enumerate(projects):
        t = p.get("title", "???")
        prob = p.get("problem_statement", "N/A")
        aud = p.get("target_audience", "N/A")
        sol = p.get("proposed_solution", "N/A")

        titles.append(t)
        problems.append(prob)
        audiences.append(aud)
        solutions.append(sol)

        print(f"[{i+1}] {t}")
        print(f"    PROBLEM:  {prob[:120]}")
        print(f"    AUDIENCE: {aud[:120]}")
        print(f"    SOLUTION: {sol[:150]}")
        print(f"    FEATURES: {', '.join(f[:40] for f in p.get('core_features', []))}")
        print()

    # Naive similarity check: flag if any two problem_statements share >60% words
    print("-" * 70)
    print("DIVERSITY ANALYSIS:")
    dupes_found = False
    for i in range(len(problems)):
        words_i = set(problems[i].lower().split())
        for j in range(i+1, len(problems)):
            words_j = set(problems[j].lower().split())
            if not words_i or not words_j:
                continue
            overlap = len(words_i & words_j) / min(len(words_i), len(words_j))
            if overlap > 0.6:
                print(f"  [WARN] Projects {i+1} & {j+1} problem_statements share {overlap:.0%} words!")
                dupes_found = True

    for i in range(len(audiences)):
        words_i = set(audiences[i].lower().split())
        for j in range(i+1, len(audiences)):
            words_j = set(audiences[j].lower().split())
            if not words_i or not words_j:
                continue
            overlap = len(words_i & words_j) / min(len(words_i), len(words_j))
            if overlap > 0.7:
                print(f"  [WARN] Projects {i+1} & {j+1} target_audiences share {overlap:.0%} words!")
                dupes_found = True

    if not dupes_found:
        print("  [OK] All projects appear sufficiently distinct!")

    unique_titles = len(set(titles))
    print(f"\n  Unique titles: {unique_titles}/{len(titles)}")
    print("=" * 70)
    if unique_titles == len(titles) and not dupes_found and len(projects) >= 6:
        print("  [PASS] DIVERSITY TEST PASSED")
    else:
        print("  [WARN] Some overlap detected (see above)")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(test_diversity())
