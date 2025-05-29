from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPNotFound
import json

from ..utils.jwt_helper import create_token
from ..models import User

@view_config(route_name='login', request_method='POST', renderer='json')
def login_view(request):
    try:
        data = request.json_body
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            raise HTTPBadRequest(json_body={'error': 'Email and password are required'})

        # Find user by email
        user = request.dbsession.query(User).filter_by(email=email).first()
        if not user:
            raise HTTPUnauthorized(json_body={'error': 'Invalid email or password'})

        # Check password
        if not user.check_password(password):
            raise HTTPUnauthorized(json_body={'error': 'Invalid email or password'})

        # Create JWT token
        token = create_token(user.id, user.username)

        return {
            'token': token,
            'user': user.to_dict()
        }
    except (HTTPBadRequest, HTTPUnauthorized) as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='register', request_method='POST', renderer='json')
def register_view(request):
    # This function will reuse the create_user_view from user_views.py
    # In a real-world application, you might want to add specific registration logic here
    # such as email verification, initial profile setup, etc.
    from .user_views import create_user_view
    response = create_user_view(request)
    
    # If user creation was successful, generate a token and log them in
    if isinstance(response, dict) and 'id' in response:
        # Create JWT token
        token = create_token(response['id'], response['username'])
        
        return {
            'token': token,
            'user': response
        }
    
    # If there was an error, return the error response as is
    return response
