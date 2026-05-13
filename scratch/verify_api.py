import httpx
import time
import json
import os
from datetime import datetime

BASE_URL = "http://127.0.0.1:8002"

ENDPOINTS = [
    ("/health", "GET"),
    ("/drivers", "GET"),
    ("/drivers/hamilton", "GET"),
    ("/drivers/hamilton/career", "GET"),
    ("/constructors", "GET"),
    ("/constructors/mercedes", "GET"),
    ("/constructors/mercedes/history", "GET"),
    ("/races", "GET"),
    ("/standings", "GET"),
    ("/standings?season=2023", "GET"),
    ("/search?q=hamilton", "GET"),
    ("/predictions/race", "POST", {"race_id": 1144}),
]

async def verify_endpoints():
    log_path = "/Users/subhasish/apex-f1/docs/api-verification.log"
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    
    with open(log_path, "w") as f:
        f.write(f"API VERIFICATION LOG - {datetime.now().isoformat()}\n")
        f.write("-" * 80 + "\n")
        f.write(f"{'Endpoint':<40} | {'Status':<6} | {'Time (ms)':<10} | {'Size (kb)':<10}\n")
        f.write("-" * 80 + "\n")
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            for ep_data in ENDPOINTS:
                path = ep_data[0]
                method = ep_data[1]
                payload = ep_data[2] if len(ep_data) > 2 else None
                
                start_time = time.time()
                try:
                    if method == "GET":
                        res = await client.get(f"{BASE_URL}{path}")
                    else:
                        res = await client.post(f"{BASE_URL}{path}", json=payload)
                    
                    duration = (time.time() - start_time) * 1000
                    status = res.status_code
                    size = len(res.content) / 1024
                    
                    f.write(f"{path:<40} | {status:<6} | {duration:<10.2f} | {size:<10.2f}\n")
                except Exception as e:
                    f.write(f"{path:<40} | ERROR  | {'N/A':<10} | {'N/A':<10} | {str(e)}\n")

if __name__ == "__main__":
    import asyncio
    asyncio.run(verify_endpoints())
