from __future__ import annotations

import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


async def geocode_address(address: str) -> Optional[dict]:
    """Geocode an address using Azure Maps REST API. Returns {lat, lng} or None."""
    key = os.getenv("AZURE_MAPS_SUBSCRIPTION_KEY")
    if not key:
        logger.warning("AZURE_MAPS_SUBSCRIPTION_KEY not set — geocoding skipped")
        return None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                "https://atlas.microsoft.com/search/address/json",
                params={
                    "api-version": "1.0",
                    "subscription-key": key,
                    "query": address,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            results = data.get("results", [])
            if results:
                pos = results[0]["position"]
                return {"lat": pos["lat"], "lng": pos["lon"]}
    except Exception as e:
        logger.warning(f"Azure Maps geocoding failed: {e}")
    return None
