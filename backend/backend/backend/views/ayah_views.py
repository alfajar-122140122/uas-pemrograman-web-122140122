from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPConflict

from ..models import Ayah, Surah # Adjust path if necessary

@view_config(route_name='ayahs_collection', request_method='POST', renderer='json', permission='admin') # Assuming admin permission
def create_ayah_view(request):
    try:
        data = request.json_body
        required_fields = ['surah_id', 'ayah_number_in_surah', 'text_uthmani']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            raise HTTPBadRequest(json_body={'error': f'Missing required fields: {", ".join(missing)}'})

        # Check if surah exists
        surah = request.dbsession.query(Surah).filter_by(id=data['surah_id']).first()
        if not surah:
            raise HTTPBadRequest(json_body={'error': f'Surah with id {data["surah_id"]} not found.'})
        
        # Check if ayah number already exists in this surah
        existing_ayah = request.dbsession.query(Ayah).filter_by(surah_id=data['surah_id'], ayah_number_in_surah=data['ayah_number_in_surah']).first()
        if existing_ayah:
            raise HTTPConflict(json_body={'error': f'Ayah number {data["ayah_number_in_surah"]} already exists in Surah {data["surah_id"]}.'})


        new_ayah = Ayah(
            surah_id=data['surah_id'],
            ayah_number_in_surah=data['ayah_number_in_surah'],
            text_uthmani=data['text_uthmani'],
            translation_id=data.get('translation_id'),
            translation_en=data.get('translation_en')
        )
        request.dbsession.add(new_ayah)
        request.dbsession.flush() # To get ID
        return new_ayah.to_dict()
    except (HTTPBadRequest, HTTPConflict) as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='ayahs_collection', request_method='GET', renderer='json')
def list_ayahs_view(request):
    # Consider pagination for large number of ayahs
    # Example: GET /api/v1/ayahs?surah_id=1&page=1&limit=30
    surah_id_filter = request.params.get('surah_id')
    query = request.dbsession.query(Ayah)
    if surah_id_filter:
        query = query.filter(Ayah.surah_id == surah_id_filter)
    
    ayahs = query.order_by(Ayah.surah_id, Ayah.ayah_number_in_surah).all()
    return [ayah.to_dict() for ayah in ayahs]

@view_config(route_name='ayah_detail', request_method='GET', renderer='json')
def get_ayah_view(request):
    ayah_id = request.matchdict.get('ayah_id')
    ayah = request.dbsession.query(Ayah).filter_by(id=ayah_id).first()
    if not ayah:
        raise HTTPNotFound(json_body={'error': f'Ayah with id {ayah_id} not found'})
    return ayah.to_dict()

@view_config(route_name='ayah_detail', request_method='PUT', renderer='json', permission='admin') # Assuming admin permission
def update_ayah_view(request):
    ayah_id = request.matchdict.get('ayah_id')
    ayah = request.dbsession.query(Ayah).filter_by(id=ayah_id).first()
    if not ayah:
        raise HTTPNotFound(json_body={'error': f'Ayah with id {ayah_id} not found'})

    try:
        data = request.json_body
        if 'surah_id' in data and data['surah_id'] != ayah.surah_id:
            # If changing surah_id, ensure new surah exists
            new_surah = request.dbsession.query(Surah).filter_by(id=data['surah_id']).first()
            if not new_surah:
                raise HTTPBadRequest(json_body={'error': f'Target Surah with id {data["surah_id"]} not found.'})
            ayah.surah_id = data['surah_id']
        
        if 'ayah_number_in_surah' in data and data['ayah_number_in_surah'] != ayah.ayah_number_in_surah:
            # Check for conflict if ayah number in surah changes
            target_surah_id = data.get('surah_id', ayah.surah_id)
            existing_ayah = request.dbsession.query(Ayah).filter(
                Ayah.id != ayah_id, # Exclude current ayah
                Ayah.surah_id == target_surah_id,
                Ayah.ayah_number_in_surah == data['ayah_number_in_surah']
            ).first()
            if existing_ayah:
                raise HTTPConflict(json_body={'error': f'Ayah number {data["ayah_number_in_surah"]} already exists in Surah {target_surah_id}.'})
            ayah.ayah_number_in_surah = data['ayah_number_in_surah']

        if 'text_uthmani' in data:
            ayah.text_uthmani = data['text_uthmani']
        if 'translation_id' in data:
            ayah.translation_id = data.get('translation_id')
        if 'translation_en' in data:
            ayah.translation_en = data.get('translation_en')
        
        request.dbsession.flush()
        return ayah.to_dict()
    except (HTTPBadRequest, HTTPConflict) as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='ayah_detail', request_method='DELETE', renderer='json', permission='admin') # Assuming admin permission
def delete_ayah_view(request):
    ayah_id = request.matchdict.get('ayah_id')
    ayah = request.dbsession.query(Ayah).filter_by(id=ayah_id).first()
    if not ayah:
        raise HTTPNotFound(json_body={'error': f'Ayah with id {ayah_id} not found'})
    
    request.dbsession.delete(ayah)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}
