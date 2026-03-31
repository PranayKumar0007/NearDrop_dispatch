from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


async def send_sms(to_phone: str, message: str) -> bool:
    """Send SMS via Azure Communication Services. Returns True on success."""
    connection_string = os.getenv("AZURE_COMMUNICATION_CONNECTION_STRING")
    if not connection_string:
        logger.warning("AZURE_COMMUNICATION_CONNECTION_STRING not set — SMS skipped")
        return False
    try:
        from azure.communication.sms import SmsClient
        client = SmsClient.from_connection_string(connection_string)
        from_number = os.getenv("AZURE_SMS_FROM_NUMBER", "+15550000000")
        client.send(
            from_=from_number,
            to=[to_phone],
            message=message,
        )
        logger.info(f"SMS sent to {to_phone}")
        return True
    except Exception as e:
        logger.warning(f"Azure SMS failed: {e}")
        return False
