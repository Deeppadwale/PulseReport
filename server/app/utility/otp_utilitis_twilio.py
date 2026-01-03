# import random
# from datetime import datetime, timedelta
# from passlib.context import CryptContext
# import os

# # Twilio Credentials (set these in your environment)
# TWILIO_SID = os.getenv("TWILIO_SID")
# TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# TWILIO_PHONE = os.getenv("TWILIO_PHONE")

# # Enable DEBUG mode to print OTP instead of sending SMS
# DEBUG = True

# # Password hashing setup for OTP
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# # ------------------------
# # OTP Utilities
# # ------------------------

# def generate_otp(length: int = 6) -> str:
#     """Generate a numeric OTP of given length."""
#     return str(random.randint(10**(length-1), 10**length - 1))

# def build_otp_expiry(minutes: int = 1) -> datetime:
#     """Return UTC datetime after 'minutes' for OTP expiry."""
#     return datetime.utcnow() + timedelta(minutes=minutes)

# def hash_otp(otp: str) -> str:
#     """Hash the OTP using bcrypt."""
#     return pwd_context.hash(otp)

# def verify_otp_hash(plain_otp: str, hashed_otp: str) -> bool:
#     """Verify a plain OTP against a hashed OTP."""
#     return pwd_context.verify(plain_otp, hashed_otp)

# # ------------------------
# # Twilio SMS Sending
# # ------------------------



# # def normalize_mobile_number(mobile: str) -> str:
# #     """Convert mobile number to international format. Assumes India +91."""
# #     mobile = mobile.strip()
# #     if mobile.startswith("0"):
# #         mobile = mobile[1:]
# #     if not mobile.startswith("+"):
# #         mobile = "+91" + mobile
# #     return mobile

# # def send_otp_sms(mobile: str, otp: str):
# #     """
# #     Send OTP via Twilio. If DEBUG=True, just prints OTP.
# #     Returns True if sent successfully, False otherwise.
# #     """
# #     mobile_norm = normalize_mobile_number(mobile)

# #     if DEBUG:
# #         print(f"[DEBUG] OTP for {mobile_norm}: {otp}")
# #         return True

# #     if not all([TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE]):
# #         print("[ERROR] Twilio credentials missing")
# #         return False

# #     try:
# #         client = Client(TWILIO_SID, TWILIO_AUTH_TOKEN)
# #         message = client.messages.create(
# #             body=f"Your OTP is {otp}. It will expire in 1 minute.",
# #             from_=TWILIO_PHONE,
# #             to=mobile_norm
# #         )
# #         print(f"[INFO] OTP sent successfully: SID {message.sid}")
# #         return True
# #     except TwilioRestException as e:
# #         print(f"[ERROR] Failed to send OTP: {e}")
# #         return False

# # # ------------------------
# # # Example Usage
# # # ------------------------

# # if __name__ == "__main__":
# #     test_mobile = "7058105115"
# #     otp = generate_otp()
# #     expiry = build_otp_expiry()
# #     hashed_otp = hash_otp(otp)

# #     print("Generated OTP:", otp)
# #     print("OTP Expiry:", expiry)
# #     print("Hashed OTP:", hashed_otp)
# #     print("Verification Test:", verify_otp_hash(otp, hashed_otp))

# #     send_otp_sms(test_mobile, otp)
