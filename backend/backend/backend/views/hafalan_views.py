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

    # Di aplikasi nyata, tambahkan cek otorisasi di sini (misal, hanya user pemilik atau admin)
    # if authenticated_user_id != hafalan.user_id and not is_admin(authenticated_user_id):
    #     raise HTTPForbidden(json_body={'error': 'Not authorized to update this hafalan'})
        
    try:
        data = request.json_body
        if 'surah_name' in data:
            hafalan.surah_name = data['surah_name']
        if 'ayah_range' in data:
            hafalan.ayah_range = data['ayah_range']
        if 'status' in data:
            try:
                hafalan.status = HafalanStatusEnum(data['status'])
            except ValueError:
                raise HTTPBadRequest(json_body={'error': f'Invalid status value: {data["status"]}. Valid values are: {", ".join([s.value for s in HafalanStatusEnum])}'})
        if 'catatan' in data:
            hafalan.catatan = data['catatan']
        if 'last_reviewed_at' in data: # Anda mungkin ingin ini di-set secara otomatis atau terpisah
            from datetime import datetime
            try:
                hafalan.last_reviewed_at = datetime.fromisoformat(data['last_reviewed_at'])
            except (ValueError, TypeError):
                 hafalan.last_reviewed_at = None # Atau handle error
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

    # Di aplikasi nyata, tambahkan cek otorisasi di sini
    # if authenticated_user_id != hafalan.user_id and not is_admin(authenticated_user_id):
    #     raise HTTPForbidden(json_body={'error': 'Not authorized to delete this hafalan'})

    request.dbsession.delete(hafalan)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}