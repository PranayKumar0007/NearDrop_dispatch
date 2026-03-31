from __future__ import annotations

import json
import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

_firebase_app = None
_firebase_initialized = False


def _get_app():
    global _firebase_app, _firebase_initialized
    if _firebase_initialized:
        return _firebase_app
    _firebase_initialized = True
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if not service_account_json:
        logger.warning("FIREBASE_SERVICE_ACCOUNT_JSON not set — FCM push notifications disabled")
        return None
    try:
        import firebase_admin
        from firebase_admin import credentials
        cred_dict = json.loads(service_account_json)
        cred = credentials.Certificate(cred_dict)
        _firebase_app = firebase_admin.initialize_app(cred)
        return _firebase_app
    except Exception as e:
        logger.warning(f"Firebase init failed: {e}")
        return None


async def send_hub_accepted_to_driver(
    fcm_token: Optional[str],
    pickup_code: str,
    hub_name: str,
) -> None:
    """Send push notification to driver when a hub accepts their delivery. Fire-and-forget."""
    if not fcm_token:
        return
    app = _get_app()
    if app is None:
        return
    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(
                title="Hub Accepted Your Package!",
                body=f"{hub_name} will hold your package. Pickup code: {pickup_code}",
            ),
            data={
                "type": "hub_accepted",
                "hub_name": hub_name,
                "pickup_code": pickup_code,
            },
            token=fcm_token,
            android=messaging.AndroidConfig(priority="high"),
        )
        messaging.send(message)
        logger.info(f"FCM sent to driver token ...{fcm_token[-6:]}")
    except Exception as e:
        logger.warning(f"FCM send_hub_accepted_to_driver failed: {e}")


async def send_broadcast_to_hub(
    fcm_token: Optional[str],
    delivery_address: str,
    package_size: str,
) -> None:
    """Send push notification to hub owner when a new broadcast arrives. Fire-and-forget."""
    if not fcm_token:
        return
    app = _get_app()
    if app is None:
        return
    try:
        from firebase_admin import messaging
        message = messaging.Message(
            notification=messaging.Notification(
                title="New Package Incoming!",
                body=f"{package_size.capitalize()} package for {delivery_address[:60]}",
            ),
            data={
                "type": "hub_broadcast",
                "address": delivery_address,
                "package_size": package_size,
            },
            token=fcm_token,
            android=messaging.AndroidConfig(priority="high"),
        )
        messaging.send(message)
        logger.info(f"FCM broadcast sent to hub token ...{fcm_token[-6:]}")
    except Exception as e:
        logger.warning(f"FCM send_broadcast_to_hub failed: {e}")
