import os
from fastapi_mail import FastMail, ConnectionConfig
from dotenv import load_dotenv

load_dotenv()

MAIL_FROM = os.getenv("MAIL_FROM")
MAIL_PORT = os.getenv("MAIL_PORT")

if not MAIL_FROM:
    raise RuntimeError("MAIL_FROM is missing in .env")

if not MAIL_PORT:
    raise RuntimeError("MAIL_PORT is missing in .env")

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=MAIL_FROM,
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_PORT=int(MAIL_PORT),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

fast_mail = FastMail(conf)
