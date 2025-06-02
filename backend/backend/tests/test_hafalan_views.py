import pytest
import json
from pyramid import testing

from backend.models.mymodel import User, Hafalan, HafalanStatusEnum
from backend.views.hafalan_views import (
    create_user_hafalan_view, 
    list_user_hafalan_view, 
    get_hafalan_view, 
    update_hafalan_view, 
    delete_hafalan_view
)
from .factories import UserFactory, HafalanFactory, BaseFactory


@pytest.fixture
def setup_factory_session(dbsession, app):
    # Configure factory session before each test
    BaseFactory._meta.sqlalchemy_session = dbsession
    # Also configure the session factory
    session_factory = app.registry['dbsession_factory']
    BaseFactory._meta.sqlalchemy_session_factory = session_factory
    return dbsession

@pytest.fixture
def auth_request(dummy_request, setup_factory_session):
    dbsession = setup_factory_session
    # Create authenticated request with user attached - manually create user instead of using factory
    user = User(
        username='test_hafalan_user',
        email='test_hafalan@example.com'
    )
    user.set_password('SecurePassword123!')
    dbsession.add(user)
    dbsession.flush()
    
    dummy_request.user = {'user_id': user.id}
    return dummy_request, user

class TestHafalanViews:
    
    def test_create_hafalan_success(self, setup_factory_session, auth_request):
        dbsession = setup_factory_session
        dummy_request, user = auth_request

        # Prepare request
        dummy_request.matchdict = {'user_id': str(user.id)}
        dummy_request.json_body = {
            'surah_name': 'Al-Fatihah',
            'ayah_range': '1-7',
            'status': 'sedang'  # Changed from 'Sedang Menghafal'
        }

        # Call the view
        response = create_user_hafalan_view(dummy_request)
        
        # Verify response
        assert 'id' in response
        assert response['user_id'] == str(user.id) # Cast user.id to string
        assert response['surah_name'] == 'Al-Fatihah'
        assert response['ayah_range'] == '1-7'
        assert response['status'] == 'sedang'
        
        # Verify database
        hafalan = dbsession.query(Hafalan).get(response['id'])
        assert hafalan is not None
        assert hafalan.user_id == user.id
        assert hafalan.surah_name == 'Al-Fatihah'
        assert hafalan.status == HafalanStatusEnum.sedang
    
    def test_list_user_hafalan(self, setup_factory_session, dummy_request):
        dbsession = setup_factory_session
        # Create a test user manually
        user = User(
            username='hafalan_list_user',
            email='hafalan_list@example.com'
        )
        user.set_password('SecurePassword123!')
        dbsession.add(user)
        dbsession.flush()
        
        # Create test hafalans for the user manually
        for i in range(3):
            hafalan = Hafalan(
                user_id=user.id,
                surah_name=f'Al-Test-{i}',
                ayah_range=f'{i+1}-{i+5}',
                status=HafalanStatusEnum.sedang
            )
            dbsession.add(hafalan)
        dbsession.flush()
        
        # Set up request
        dummy_request.matchdict = {'user_id': str(user.id)}
        
        # Call the view
        response = list_user_hafalan_view(dummy_request)
        
        # Verify response
        assert len(response) == 3
        assert all('id' in h for h in response)
        assert all('surah_name' in h for h in response)
    
    def test_get_hafalan_by_id(self, setup_factory_session, auth_request):
        dbsession = setup_factory_session
        dummy_request, user = auth_request
        
        # Create a test hafalan
        hafalan = Hafalan(
            user_id=user.id,
            surah_name='Al-Ikhlas',
            ayah_range='1-4',
            status=HafalanStatusEnum.sedang
        )
        dbsession.add(hafalan)
        dbsession.flush()
          # Prepare request
        dummy_request.matchdict = {'hafalan_id': str(hafalan.id)}
        
        # Call the view
        response = get_hafalan_view(dummy_request)
        
        # Verify response
        assert response['id'] == hafalan.id
        assert response['user_id'] == user.id
        assert response['surah_name'] == 'Al-Ikhlas'
        assert response['status'] == 'sedang'
    
    def test_update_hafalan(self, setup_factory_session, auth_request):
        dbsession = setup_factory_session
        dummy_request, user = auth_request
        
        # Create a test hafalan
        hafalan = Hafalan(
            user_id=user.id,
            surah_name='Al-Ikhlas',
            ayah_range='1-4',
            status=HafalanStatusEnum.sedang
        )
        dbsession.add(hafalan)
        dbsession.flush()
        
        # Set up request
        dummy_request.matchdict = {'hafalan_id': str(hafalan.id)}
        dummy_request.json_body = {
            'status': 'selesai'  # Updated from 'completed'
        }
        
        # Call the view
        response = update_hafalan_view(dummy_request)
        
        # Verify response
        assert response['id'] == hafalan.id
        assert response['status'] == 'selesai'  # Updated from 'completed'
        
        # Verify database
        updated_hafalan = dbsession.query(Hafalan).get(hafalan.id)
        assert updated_hafalan.status.value == 'selesai'  # Updated from 'completed'
    
    def test_delete_hafalan(self, setup_factory_session, auth_request):
        dbsession = setup_factory_session
        dummy_request, user = auth_request
        
        # Create a test hafalan
        hafalan = Hafalan(
            user_id=user.id,
            surah_name='Al-Ikhlas',
            ayah_range='1-4',
            status=HafalanStatusEnum.belum
        )
        dbsession.add(hafalan)
        dbsession.flush()
        hafalan_id = hafalan.id
        
        # Prepare request
        dummy_request.matchdict = {'hafalan_id': str(hafalan_id)}
        
        # Call the view
        response = delete_hafalan_view(dummy_request)

        # Verify response
        # assert dummy_request.response.status_code == 200 # Or 204 if that's what your view returns
        assert dummy_request.response.status_code == 204
        # response_json = response # No JSON response for 204
        # assert 'message' not in response_json # Ensure no message for 204

        # Verify in database
        deleted_hafalan = dbsession.query(Hafalan).filter_by(id=hafalan_id).first()
        assert deleted_hafalan is None

    def test_get_nonexistent_hafalan(self, setup_factory_session, auth_request):
        dbsession = setup_factory_session
        dummy_request, _ = auth_request
        
        # Prepare request with non-existent ID
        dummy_request.matchdict = {'hafalan_id': '9999'}
        
        # Call the view and expect 404
        with pytest.raises(Exception) as excinfo:
            get_hafalan_view(dummy_request)
        
        # Verify it's a 404 exception
        assert excinfo.value.status_code == 404
