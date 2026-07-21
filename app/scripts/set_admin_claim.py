"""
Run this ONCE, locally, with your real service account JSON in place,
to grant admin access to the Ilm Buddy admin dashboard.

This is intentionally a standalone script, not an API endpoint — never
expose an HTTP route that lets a client grant itself the admin claim.

Usage:
    python -m app.scripts.set_admin_claim nadirbutt0101@gmail.com

Prerequisites:
  1. FIREBASE_SERVICE_ACCOUNT_PATH in your .env points to a real,
     freshly-generated service account JSON (see README on rotating
     any key that was ever pasted somewhere insecure).
  2. The email must already exist as a Firebase Auth user. If you
     haven't signed up with this email yet, either:
       a) Go to /admin on your deployed site and try to sign in — it'll
          fail with "user not found", or
       b) Create the user directly in Firebase Console → Authentication
          → Add user (set a password there).
     Then re-run this script.
"""
import sys

from firebase_admin import auth as firebase_auth

from app.services.firebase_service import get_firebase_service


def main(email: str) -> None:
    get_firebase_service()  # ensures firebase_admin.initialize_app() has run

    try:
        user = firebase_auth.get_user_by_email(email)
    except firebase_auth.UserNotFoundError:
        print(
            f"No user found for {email}. Create the account first "
            "(sign in once via the app, or add it in Firebase Console → "
            "Authentication), then re-run this script."
        )
        sys.exit(1)

    firebase_auth.set_custom_user_claims(user.uid, {"admin": True})
    print(f"Granted admin claim to {email} (uid: {user.uid}).")
    print("They must sign out and back in (or refresh their ID token) to see it take effect.")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python -m app.scripts.set_admin_claim <email>")
        sys.exit(1)
    main(sys.argv[1])
