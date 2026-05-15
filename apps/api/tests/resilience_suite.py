import asyncio
import time
from httpx import AsyncClient, ASGITransport
from collections import defaultdict
from main import app

# Set up test client
transport = ASGITransport(app=app)

async def test_endpoint(client, name, method, url, params=None):
    start = time.perf_counter()
    try:
        response = await client.request(method, url, params=params)
        duration = (time.perf_counter() - start) * 1000
        status = response.status_code
        try:
            body = response.json()
        except:
            body = response.text
        return {
            "name": name,
            "status": status,
            "latency_ms": duration,
            "body": body,
            "error": None
        }
    except Exception as e:
        duration = (time.perf_counter() - start) * 1000
        return {
            "name": name,
            "status": None,
            "latency_ms": duration,
            "body": None,
            "error": str(e)
        }

async def run_concurrency_test(client, requests_count=50):
    print(f"\n--- Running Concurrency Load Test ({requests_count} requests) ---")
    tasks = []
    # Send requests to a fast endpoint like /races
    for _ in range(requests_count):
        tasks.append(test_endpoint(client, "Races Concurrency", "GET", "http://test/races"))
    
    start_time = time.time()
    results = await asyncio.gather(*tasks)
    total_time = time.time() - start_time
    
    statuses = defaultdict(int)
    latencies = []
    
    for r in results:
        statuses[r['status']] += 1
        latencies.append(r['latency_ms'])
        
    avg_latency = sum(latencies) / len(latencies)
    max_latency = max(latencies)
    
    print(f"Total Time: {total_time:.2f}s for {requests_count} reqs")
    print(f"Status Breakdown: {dict(statuses)}")
    print(f"Avg Latency: {avg_latency:.2f}ms | Max Latency: {max_latency:.2f}ms")
    return {
        "total_time": total_time,
        "statuses": dict(statuses),
        "avg_latency": avg_latency,
        "max_latency": max_latency
    }

async def run_fuzz_test(client):
    print("\n--- Running Fuzz / Contract Testing ---")
    test_cases = [
        ("Invalid Pagination Type", "/drivers", {"page": "abc", "limit": 10}),
        ("Pagination Bounds Exceeded", "/drivers", {"page": -1, "limit": 999999}),
        ("Invalid Driver Ref", "/drivers/!!INVALID_REF!!", None),
        ("SQL Injection Attempt", "/drivers/VER'; DROP TABLE drivers;--", None),
        ("Malformed Season Query", "/standings/drivers", {"season": "NOT_A_YEAR"}),
    ]
    
    for name, url, params in test_cases:
        res = await test_endpoint(client, name, "GET", f"http://test{url}", params=params)
        print(f"[{res['status']}] {name} - Latency: {res['latency_ms']:.2f}ms")
        
        if res['status'] == 422:
            print("  -> Safely caught by FastAPI validation (422)")
        elif res['status'] == 404:
            print("  -> Safely caught by ResourceNotFoundException (404)")
        elif res['status'] == 500:
            print("  -> 🚨 WARNING: 500 Internal Server Error leaked!")
        else:
            print(f"  -> Returned {res['status']}")

async def run_degradation_test(client):
    print("\n--- Running Degradation / State Semantics Test ---")
    # Live Leaderboard (Should fallback to historical if no live session)
    res = await test_endpoint(client, "Live Leaderboard (Fallback)", "GET", "http://test/live/leaderboard")
    print(f"[{res['status']}] Live Leaderboard - Latency: {res['latency_ms']:.2f}ms")
    
    if res['status'] == 200:
        body = res['body']
        state = body.get('state', {})
        print(f"  -> Freshness: {state.get('freshness')}")
        print(f"  -> Certification: {state.get('certification')}")
        print(f"  -> Degraded Flag: {state.get('degraded')}")

async def main():
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await run_concurrency_test(client, 100)
        await run_fuzz_test(client)
        await run_degradation_test(client)

if __name__ == "__main__":
    asyncio.run(main())
