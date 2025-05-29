import jwt
from datetime import datetime, timedelta
import os

# Secret key for JWT encoding/decoding - this should be in env variables in production
JWT_SECRET = os.environ.get('JWT_SECRET', 'hafalan-quran-secret-key-122140122')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DELTA = timedelta(days=1)  # Token expires after 1 day by default

def create_token(user_id, username, expiration=JWT_EXPIRATION_DELTA):
    """
    Create a JWT token for a user
    """
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.utcnow() + expiration,
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_token(token):
    """
    Decode a JWT token and return the payload
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Invalid token
        return None

def get_token_from_request(request):
    """
    Extract the JWT token from the request
    """
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        token = auth_header[7:]  # Remove 'Bearer ' prefix
        return token
    return None

def get_user_from_request(request):
    """
    Get the user information from the JWT token in the request
    """
    token = get_token_from_request(request)
    if token:
        payload = decode_token(token)
        if payload:
            return {
                'user_id': payload.get('user_id'),
                'username': payload.get('username')
            }
    return None
