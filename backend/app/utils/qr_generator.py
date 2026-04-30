import qrcode
import base64
from io import BytesIO
import jwt
import random
import string
from datetime import datetime, timedelta
from app.config import settings

def generate_session_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

def generate_qr_jwt(session_id: str, course_id: str, expiry_time: datetime = None) -> str:
    from datetime import datetime, timedelta, timezone
    # Enforce exactly 2-minute expiration from NOW for dynamic secure QR
    exp_time = datetime.now(timezone.utc) + timedelta(minutes=2)
    payload = {
        "session_id": session_id,
        "course_id": course_id,
        "exp": int(exp_time.timestamp())
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"
