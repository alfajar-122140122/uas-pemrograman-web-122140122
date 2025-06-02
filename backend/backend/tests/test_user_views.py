import pytest
import json
import transaction
from pyramid import testing

from backend.models.mymodel import User
from backend.views.user_views import create_user_view, get_user_view, update_user_view, delete_user_view, list_users_view
from .factories import UserFactory, BaseFactory


@pytest.fixture
def setup_factory_session(dbsession, app):
    # Configure factory session before each test
    BaseFactory._meta.sqlalchemy_session = dbsession
    # Also configure the session factory
    session_factory = app.registry['dbsession_factory']
    BaseFactory._meta.sqlalchemy_session_factory = session_factory
    return dbsession

class TestUserViews:
    
    def test_create_user_success(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Prepare test data
        dummy_request.json_body = {
            'username': 'new_test_user',
            'email': 'new_test_user@example.com',
            'password': 'SecurePassword123!'
        }
        
        # Call the view
        response = create_user_view(dummy_request)
        
        # Verify response
        assert 'id' in response
        assert response['username'] == 'new_test_user'
        assert response['email'] == 'new_test_user@example.com'
        
        # Verify database
        user = dbsession.query(User).filter_by(username='new_test_user').one()
        assert user is not None
        assert user.email == 'new_test_user@example.com'

    def test_create_user_duplicate_email(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create a user with known email - manually create instead of using factory
        existing_user = User(
            username='existing_user',
            email='existing@example.com'
        )
        existing_user.set_password('SecurePassword123!')
        dbsession.add(existing_user)
        dbsession.flush()
        
        # Try to create another user with the same email
        dummy_request.json_body = {
            'username': 'different_username',
            'email': 'existing@example.com',
            'password': 'SecurePassword123!'
        }
        
        # Call the view
        response = create_user_view(dummy_request)
        
        # Verify response indicates conflict
        assert dummy_request.response.status_code == 409  # Conflict
        assert 'error' in response
        assert 'already exists' in response['error']

    def test_list_users(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create test users manually
        for i in range(3):
            user = User(
                username=f'test_user_{i}',
                email=f'test_user_{i}@example.com'
            )
            user.set_password('SecurePassword123!')
            dbsession.add(user)
        dbsession.flush()
        
        # Call the view
        response = list_users_view(dummy_request)
        
        # Verify response
        assert len(response) == 3
        assert all('id' in user for user in response)
        assert all('username' in user for user in response)

    def test_get_user_by_id(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create a test user manually
        user = User(
            username='get_test_user',
            email='get_test_user@example.com'
        )
        user.set_password('SecurePassword123!')
        dbsession.add(user)
        dbsession.flush()
        
        # Set up request
        dummy_request.matchdict = {'user_id': str(user.id)}
        
        # Call the view
        response = get_user_view(dummy_request)
        
        # Verify response
        assert response['id'] == user.id
        assert response['username'] == user.username
        assert response['email'] == user.email

    def test_get_nonexistent_user(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Set up request with non-existent ID
        dummy_request.matchdict = {'user_id': '9999'}
        
        # Call the view and expect 404
        with pytest.raises(Exception) as excinfo:
            get_user_view(dummy_request)
        
        # Verify it's a 404 exception
        assert excinfo.value.status_code == 404

    def test_update_user(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create a test user manually
        user = User(
            username='old_username',
            email='old@example.com'
        )
        user.set_password('SecurePassword123!')
        dbsession.add(user)
        dbsession.flush()
        
        # Set up request
        dummy_request.matchdict = {'user_id': str(user.id)}
        dummy_request.json_body = {
            'username': 'new_username',
            'email': 'new@example.com'
        }
        
        # Call the view
        response = update_user_view(dummy_request)
        
        # Verify response
        assert response['username'] == 'new_username'
        assert response['email'] == 'new@example.com'
        
        # Verify database
        updated_user = dbsession.query(User).get(user.id)
        assert updated_user.username == 'new_username'
        assert updated_user.email == 'new@example.com'

    def test_delete_user(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create a test user manually
        user = User(
            username='delete_test_user',
            email='delete_test_user@example.com'
        )
        user.set_password('SecurePassword123!')
        dbsession.add(user)
        dbsession.flush()
        user_id = user.id
        
        # Set up request
        dummy_request.matchdict = {'user_id': str(user_id)}
        
        # Call the view
        response = delete_user_view(dummy_request)

        # Verify response
        assert dummy_request.response.status_code == 204
        # Optionally, verify the user is deleted from the database
        assert dbsession.query(User).get(user_id) is None
