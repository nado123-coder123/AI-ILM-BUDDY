"""
FastAPI dependencies that verify a Firebase ID token from the
Authorization header and expose the caller's uid / admin status to
route handlers. The mobile app gets this token from the Firebase Auth
client SDK after sign-in; the backend never issues or stores passwords
itself — Firebase Auth is the identity provider end to end.
"""
from fastapi import Header, HTTPException
from firebase_admin import auth as firebase_auth


class AuthenticatedUser:
    def __init__(self, uid: str, is_admin: bool, claims: dict):
        self.uid = uid
        self.is_admin = is_admin
        self.claims = claims


def _extract_token(authorization: str | None) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or malformed Authorization header. Expected 'Bearer <id_token>'.",
        )
    return authorization.removeprefix("Bearer ").strip()


def get_current_user(authorization: str | None = Header(None)) -> AuthenticatedUser:
    token = _extract_token(authorization)
    try:
        decoded = firebase_auth.verify_id_token(token)
    except firebase_auth.ExpiredIdTokenError:
        raise HTTPException(status_code=401, detail="Session expired, please sign in again.")
    except Exception as exc:  # noqa: BLE001 — any verification failure is an auth failure
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {exc}")

    return AuthenticatedUser(
        uid=decoded["uid"],
        is_admin=bool(decoded.get("admin", False)),
        claims=decoded,
    )


def require_admin(user: AuthenticatedUser) -> AuthenticatedUser:
    if not user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Admin privileges required. Set the 'admin' custom claim via Firebase Admin SDK.",
        )
    return user
