from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPConflict
import json

from ..models import User # Sesuaikan path jika perlu
from ..models.mymodel import pwd_context # Untuk password hashing

@view_config(route_name='users_collection', request_method='POST', renderer='json')
def create_user_view(request):
    try:
        data = request.json_body
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not all([username, email, password]):
            raise HTTPBadRequest(json_body={'error': 'Missing required fields: username, email, password'})

        # Check if user already exists
        existing_user_email = request.dbsession.query(User).filter_by(email=email).first()
        if existing_user_email:
            raise HTTPConflict(json_body={'error': f'User with email {email} already exists'})
        
        existing_user_username = request.dbsession.query(User).filter_by(username=username).first()
        if existing_user_username:
            raise HTTPConflict(json_body={'error': f'User with username {username} already exists'})


        new_user = User(username=username, email=email)
        new_user.set_password(password) # Hash password
        request.dbsession.add(new_user)
        request.dbsession.flush() # Untuk mendapatkan ID
        return new_user.to_dict()
    except HTTPConflict as e:
        request.response.status_code = e.code
        return e.json_body
    except HTTPBadRequest as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='users_collection', request_method='GET', renderer='json')
def list_users_view(request):
    users = request.dbsession.query(User).all()
    return [user.to_dict() for user in users]

@view_config(route_name='user_detail', request_method='GET', renderer='json')
def get_user_view(request):
    user_id = request.matchdict.get('user_id')
    user = request.dbsession.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPNotFound(json_body={'error': 'User not found'})
    return user.to_dict()

@view_config(route_name='user_detail', request_method='PUT', renderer='json')
def update_user_view(request):
    user_id = request.matchdict.get('user_id')
    user = request.dbsession.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPNotFound(json_body={'error': 'User not found'})

    try:
        data = request.json_body
        if 'username' in data:
            # Check if new username already exists for another user
            new_username = data['username']
            if new_username != user.username:
                existing_user_username = request.dbsession.query(User).filter_by(username=new_username).first()
                if existing_user_username:
                    raise HTTPConflict(json_body={'error': f'Username {new_username} already taken'})
            user.username = new_username
        if 'email' in data:
            # Check if new email already exists for another user
            new_email = data['email']
            if new_email != user.email:
                existing_user_email = request.dbsession.query(User).filter_by(email=new_email).first()
                if existing_user_email:
                    raise HTTPConflict(json_body={'error': f'Email {new_email} already taken'})
            user.email = new_email
        if 'password' in data and data['password']: # Only update password if provided and not empty
            user.set_password(data['password'])
        
        request.dbsession.flush()
        return user.to_dict()
    except HTTPConflict as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}


@view_config(route_name='user_detail', request_method='DELETE', renderer='json')
def delete_user_view(request):
    user_id = request.matchdict.get('user_id')
    user = request.dbsession.query(User).filter_by(id=user_id).first()
    if not user:
        raise HTTPNotFound(json_body={'error': 'User not found'})
    
    request.dbsession.delete(user)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}