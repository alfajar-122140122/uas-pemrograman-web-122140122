from pyramid.response import Response
from pyramid.httpexceptions import HTTPUnauthorized, HTTPForbidden
import json

from .utils.jwt_helper import get_user_from_request

class AuthMiddleware:
    """
    Middleware to check if the user is authenticated for protected routes
    """

    def __init__(self, handler, registry):
        self.handler = handler
        self.registry = registry

    def __call__(self, request):
        # List of paths that don't need authentication
        public_paths = [
            '/api/v1/auth/login',
            '/api/v1/auth/register',
            '/',
            '/static/',
            # Add other public paths as needed
        ]

        # Check if the path is public
        if any(request.path.startswith(path) for path in public_paths):
            return self.handler(request)

        # Check for user in request
        user = get_user_from_request(request)
        if not user:
            return HTTPUnauthorized(json_body={'error': 'Authentication required'})

        # Add user to request for use in views
        request.user = user

        # If the path includes a user_id, check if it matches the authenticated user
        # This prevents users from accessing resources of other users
        if 'user_id' in request.matchdict and str(request.user['user_id']) != request.matchdict['user_id']:
            return HTTPForbidden(json_body={'error': 'You do not have permission to access this resource'})

        return self.handler(request)


def includeme(config):
    """
    Add the auth middleware to the pyramid config
    """
    config.add_tween('backend.auth.AuthMiddleware')
