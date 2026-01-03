import os
import requests
import random
from datetime import datetime, timedelta
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of given length."""
    return str(random.randint(10**(length-1), 10**length - 1))

def build_otp_expiry(minutes: int = 1) -> datetime:
    """Return UTC datetime after 'minutes' for OTP expiry."""
    return datetime.utcnow() + timedelta(minutes=minutes)

def hash_otp(otp: str) -> str:
    """Hash the OTP using bcrypt."""
    return pwd_context.hash(otp)

def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
    """Verify a plain OTP against a hashed OTP."""
    return pwd_context.verify(plain_otp, hashed_otp)








WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN")
WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")

WHATSAPP_URL = (
    f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
)

HEADERS = {
    "Authorization": f"Bearer {WHATSAPP_TOKEN}",
    "Content-Type": "application/json"
}


def send_whatsapp_otp(mobile: str, otp: str, expiry_minutes: int = 1) -> bool:
    payload = {
        "messaging_product": "whatsapp",
        "to": mobile,
        "type": "template",
        "template": {
            "name": "otp_verification",  # APPROVED TEMPLATE NAME
            "language": {"code": "en_US"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": otp},
                        {"type": "text", "text": str(expiry_minutes)}
                    ]
                }
            ]
        }
    }

    response = requests.post(
        WHATSAPP_URL,
        headers=HEADERS,
        json=payload,
        timeout=10
    )

    if response.status_code == 200:
        return True

    print("[ERROR] WhatsApp OTP failed:", response.text)
    return False







import os
import requests

D360_API_KEY = os.getenv("D360_API_KEY")
D360_WABA_URL = os.getenv("D360_WABA_URL")
TEMPLATE_NAMESPACE = os.getenv("D360_TEMPLATE_NAMESPACE")
TEMPLATE_NAME = os.getenv("D360_TEMPLATE_NAME")

def send_whatsapp_otp(mobile: str, otp: str) -> bool:
    payload = {
        "messaging_product": "whatsapp",
        "to": mobile,
        "type": "template",
        "template": {
            "namespace": TEMPLATE_NAMESPACE,
            "name": TEMPLATE_NAME,
            "language": {
                "code": "en",
                "policy": "deterministic"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": otp}
                    ]
                }
            ]
        }
    }

    headers = {
        "Content-Type": "application/json",
        "D360-API-KEY": D360_API_KEY
    }

    response = requests.post(
        D360_WABA_URL,
        json=payload,
        headers=headers,
        timeout=10
    )

    if response.status_code in (200, 201):
        return True

    print("[360D ERROR]", response.text)
    return False
