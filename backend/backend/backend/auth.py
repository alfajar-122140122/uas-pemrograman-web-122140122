from pyramid.response import Response
from pyramid.httpexceptions import HTTPUnauthorized, HTTPForbidden
import json
from pyramid.tweens import EXCVIEW, MAIN

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
            # Consider if you have a non-API root path like '/index.html' or similar
            # If '/' was intended for a specific root file, be more explicit.
            # For now, let's assume API paths like /api/v1/hafalan/* are NOT public.
            # '/', # This was too broad, causing all paths to be treated as public.
            '/static/',
        ]

        # Exact match for root path if it should be public
        if request.path == '/':
            return self.handler(request)

        # Check if the path starts with other defined public prefixes
        for public_path_prefix in public_paths:
            if request.path.startswith(public_path_prefix):
                return self.handler(request)

        # Check for user in request
        user = get_user_from_request(request)
        if not user:
            return HTTPUnauthorized(json_body={'error': 'Authentication required'})

        # Add user to request for use in views
        request.user = user

        # If the path includes a user_id, check if it matches the authenticated user
        # This prevents users from accessing resources of other users
        if request.matchdict and 'user_id' in request.matchdict and str(request.user['user_id']) != request.matchdict['user_id']:
            return HTTPForbidden(json_body={'error': 'You do not have permission to access this resource'})

        return self.handler(request)


def includeme(config):
    """
    Add the auth middleware to the pyramid config
    """
    config.add_tween(
        'backend.auth.AuthMiddleware',
        under=EXCVIEW,  # Run AuthMiddleware AFTER the exception view tween
        over=MAIN       # Run AuthMiddleware BEFORE the main application processing (router/views)
    )
