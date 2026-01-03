from pydantic import BaseModel

class OTPCreateRequest(BaseModel):
    mobile: str

class OTPVerifyRequest(BaseModel):
    mobile: str
    otp_code: str
    


class OTPResponse(BaseModel):
    message: str
