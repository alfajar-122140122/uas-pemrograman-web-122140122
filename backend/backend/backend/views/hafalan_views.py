from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPForbidden
import json

from ..models import Hafalan, User, HafalanStatusEnum # Sesuaikan path jika perlu

# --- Views for Hafalan related to a specific user ---
@view_config(route_name='user_hafalan_collection', request_method='POST', renderer='json')
def create_user_hafalan_view(request):
    user_id = request.matchdict.get('user_id')
    # Di aplikasi nyata, Anda mungkin mendapatkan user_id dari sesi autentikasi
    # dan memverifikasi bahwa user yang membuat hafalan adalah user yang terautentikasi
    # atau admin. Untuk saat ini, kita asumsikan user_id dari path valid.
    
    db_user = request.dbsession.query(User).filter_by(id=user_id).first()
    if not db_user:
        raise HTTPNotFound(json_body={'error': f'User with id {user_id} not found'})

    try:
        data = request.json_body
        surah_name = data.get('surah_name')
        ayah_range = data.get('ayah_range')
        status_str = data.get('status', 'belum') # default ke 'belum'
        catatan = data.get('catatan')
        ayah_id = data.get('ayah_id') # Optional

        if not surah_name or not ayah_range: # Minimal surah dan ayah_range
            raise HTTPBadRequest(json_body={'error': 'Missing required fields: surah_name, ayah_range'})

        try:
            status_enum = HafalanStatusEnum(status_str)
        except ValueError:
            raise HTTPBadRequest(json_body={'error': f'Invalid status value: {status_str}. Valid values are: {", ".join([s.value for s in HafalanStatusEnum])}'})

        new_hafalan = Hafalan(
            user_id=user_id,
            surah_name=surah_name,
            ayah_range=ayah_range,
            status=status_enum,
            catatan=catatan,
            ayah_id=ayah_id
        )
        request.dbsession.add(new_hafalan)
        request.dbsession.flush()
        return new_hafalan.to_dict()
    except HTTPBadRequest as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='user_hafalan_collection', request_method='GET', renderer='json')
def list_user_hafalan_view(request):
    user_id = request.matchdict.get('user_id')
    db_user = request.dbsession.query(User).filter_by(id=user_id).first()
    if not db_user:
        raise HTTPNotFound(json_body={'error': f'User with id {user_id} not found'})

    hafalan_list = request.dbsession.query(Hafalan).filter_by(user_id=user_id).all()
    return [h.to_dict() for h in hafalan_list]

# --- Views for specific Hafalan (by hafalan_id) ---
@view_config(route_name='hafalan_detail', request_method='GET', renderer='json')
def get_hafalan_view(request):
    hafalan_id = request.matchdict.get('hafalan_id')
    hafalan = request.dbsession.query(Hafalan).filter_by(id=hafalan_id).first()
    if not hafalan:
        raise HTTPNotFound(json_body={'error': 'Hafalan not found'})
    # Di aplikasi nyata, tambahkan cek otorisasi di sini
    return hafalan.to_dict()

@view_config(route_name='hafalan_detail', request_method='PUT', renderer='json')
def update_hafalan_view(request):
    hafalan_id = request.matchdict.get('hafalan_id')
    hafalan = request.dbsession.query(Hafalan).filter_by(id=hafalan_id).first()
    if not hafalan:
        raise HTTPNotFound(json_body={'error': 'Hafalan not found'})

    # Authorization check (ensure user owns this hafalan or is admin)
    # This relies on the AuthMiddleware having populated request.user
    if not request.user or ('user_id' in request.user and hafalan.user_id != request.user['user_id']):
        # Add admin check here if you have roles, e.g. and not request.user.is_admin()
        raise HTTPForbidden(json_body={'error': 'Not authorized to update this hafalan'})
        
    try:
        data = request.json_body
        if 'surah_name' in data:
            hafalan.surah_name = data['surah_name']
        if 'ayah_range' in data:
            hafalan.ayah_range = data['ayah_range']

        if 'status' in data:
            try:
                new_status = HafalanStatusEnum(data['status'])
                # If status is changing to 'selesai' and was not 'selesai' before
                if new_status == HafalanStatusEnum.selesai and hafalan.status != HafalanStatusEnum.selesai:
                    # If last_reviewed_at is not provided in payload or is null, set it to now
                    if not data.get('last_reviewed_at'):
                        from datetime import datetime, timezone
                        hafalan.last_reviewed_at = datetime.now(timezone.utc)
                hafalan.status = new_status
            except ValueError:
                raise HTTPBadRequest(json_body={'error': f'Invalid status value: {data["status"]}. Valid values are: {", ".join([s.value for s in HafalanStatusEnum])}'})
        
        if 'catatan' in data:
            hafalan.catatan = data['catatan']
        
        # Allow manual update of last_reviewed_at if provided
        if 'last_reviewed_at' in data and data['last_reviewed_at']:
            from datetime import datetime
            try:
                # Ensure it's parsed correctly, handling potential 'Z' for UTC
                dt_str = data['last_reviewed_at']
                if dt_str.endswith('Z'):
                    dt_str = dt_str[:-1] + '+00:00'
                hafalan.last_reviewed_at = datetime.fromisoformat(dt_str)
            except (ValueError, TypeError):
                 # Keep existing or set to None if parsing fails and it was intended to be cleared
                 hafalan.last_reviewed_at = hafalan.last_reviewed_at if hafalan.last_reviewed_at else None
        elif 'last_reviewed_at' in data and data['last_reviewed_at'] is None: # Allow explicitly setting to null
            hafalan.last_reviewed_at = None

        if 'ayah_id' in data:
            hafalan.ayah_id = data.get('ayah_id')

        request.dbsession.flush()
        return hafalan.to_dict()
    except HTTPBadRequest as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='hafalan_detail', request_method='DELETE', renderer='json')
def delete_hafalan_view(request):
    hafalan_id = request.matchdict.get('hafalan_id')
    hafalan = request.dbsession.query(Hafalan).filter_by(id=hafalan_id).first()
    if not hafalan:
        raise HTTPNotFound(json_body={'error': 'Hafalan not found'})

    # Authorization check
    if not request.user or ('user_id' in request.user and hafalan.user_id != request.user['user_id']):
        # Add admin check here
        raise HTTPForbidden(json_body={'error': 'Not authorized to delete this hafalan'})

    request.dbsession.delete(hafalan)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}