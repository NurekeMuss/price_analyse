import pyotp
import qrcode
import io
import base64

import qrcode.constants


class TOTPManager:
    def __init__(self):
        self.digits = 6
        self.interval = 30

    def generate_secret(self) -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()

    def verify_totp(self, secret: str, code: str) -> bool:
        """Verify a TOTP code against a secret"""
        totp = pyotp.TOTP(secret, digits=self.digits, interval=self.interval)
        return totp.verify(code)

    def generate_qr_code(self, secret: str, email: str, issuer_name: str = "YourApp") -> str:
        """Generate a QR code for the TOTP secret"""
        totp = pyotp.TOTP(secret, digits=self.digits, interval=self.interval)
        uri = totp.provisioning_uri(name=email, issuer_name=issuer_name)

        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffered = io.BytesIO()
        img.save(buffered)
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return f"data:image/png;base64,{img_str}"