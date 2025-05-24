from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPConflict
from sqlalchemy import or_

from ..models import Surah, Ayah # Adjust path if necessary

@view_config(route_name='surahs_collection', request_method='POST', renderer='json', permission='admin') # Assuming admin permission
def create_surah_view(request):
    try:
        data = request.json_body
        required_fields = ['surah_number', 'name_arabic', 'name_english', 'number_of_ayahs']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            raise HTTPBadRequest(json_body={'error': f'Missing required fields: {", ".join(missing)}'})

        # Check for existing surah_number
        existing_surah = request.dbsession.query(Surah).filter_by(surah_number=data['surah_number']).first()
        if existing_surah:
            raise HTTPConflict(json_body={'error': f'Surah with number {data["surah_number"]} already exists.'})

        new_surah = Surah(
            surah_number=data['surah_number'],
            name_arabic=data['name_arabic'],
            name_english=data['name_english'],
            english_translation=data.get('english_translation'),
            number_of_ayahs=data['number_of_ayahs'],
            revelation_type=data.get('revelation_type')
        )
        request.dbsession.add(new_surah)
        request.dbsession.flush() # To get ID
        return new_surah.to_dict()
    except (HTTPBadRequest, HTTPConflict) as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='surahs_collection', request_method='GET', renderer='json')
def list_surahs_view(request):
    surahs = request.dbsession.query(Surah).order_by(Surah.surah_number).all()
    return [surah.to_dict() for surah in surahs]

def get_surah_by_id_or_number(request, surah_id_or_number):
    """Helper to get Surah by ID or surah_number."""
    try:
        surah_identifier = int(surah_id_or_number)
        # Try to find by ID first, then by surah_number if it's a plausible number for surah_number
        surah = request.dbsession.query(Surah).filter(
            or_(Surah.id == surah_identifier, Surah.surah_number == surah_identifier)
        ).first()
    except ValueError: # If not an int, assume it's a name (though route expects number/id)
        # This part might not be hit if route constrains to digits, but good for robustness
        surah = request.dbsession.query(Surah).filter(
            or_(Surah.name_english.ilike(f'%{surah_id_or_number}%'), Surah.name_arabic.ilike(f'%{surah_id_or_number}%'))
        ).first()

    if not surah:
        # If it was an integer, try specifically by surah_number if ID search failed
        if isinstance(surah_identifier, int):
             surah = request.dbsession.query(Surah).filter(Surah.surah_number == surah_identifier).first()

    return surah


@view_config(route_name='surah_detail', request_method='GET', renderer='json')
def get_surah_view(request):
    surah_id_or_number = request.matchdict.get('surah_id_or_number')
    surah = get_surah_by_id_or_number(request, surah_id_or_number)
    if not surah:
        raise HTTPNotFound(json_body={'error': f'Surah with identifier {surah_id_or_number} not found'})
    return surah.to_dict()

@view_config(route_name='surah_detail', request_method='PUT', renderer='json', permission='admin') # Assuming admin permission
def update_surah_view(request):
    surah_id_or_number = request.matchdict.get('surah_id_or_number')
    surah = get_surah_by_id_or_number(request, surah_id_or_number)
    if not surah:
        raise HTTPNotFound(json_body={'error': f'Surah with identifier {surah_id_or_number} not found'})

    try:
        data = request.json_body
        if 'surah_number' in data and data['surah_number'] != surah.surah_number:
            existing_surah = request.dbsession.query(Surah).filter_by(surah_number=data['surah_number']).first()
            if existing_surah:
                raise HTTPConflict(json_body={'error': f'Surah with number {data["surah_number"]} already exists.'})
            surah.surah_number = data['surah_number']

        if 'name_arabic' in data:
            surah.name_arabic = data['name_arabic']
        if 'name_english' in data:
            surah.name_english = data['name_english']
        if 'english_translation' in data:
            surah.english_translation = data.get('english_translation')
        if 'number_of_ayahs' in data:
            surah.number_of_ayahs = data['number_of_ayahs']
        if 'revelation_type' in data:
            surah.revelation_type = data.get('revelation_type')
        
        request.dbsession.flush()
        return surah.to_dict()
    except HTTPConflict as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='surah_detail', request_method='DELETE', renderer='json', permission='admin') # Assuming admin permission
def delete_surah_view(request):
    surah_id_or_number = request.matchdict.get('surah_id_or_number')
    surah = get_surah_by_id_or_number(request, surah_id_or_number)
    if not surah:
        raise HTTPNotFound(json_body={'error': f'Surah with identifier {surah_id_or_number} not found'})
    
    request.dbsession.delete(surah)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}

@view_config(route_name='surah_ayahs_collection', request_method='GET', renderer='json')
def list_surah_ayahs_view(request):
    surah_id_or_number = request.matchdict.get('surah_id_or_number')
    surah = get_surah_by_id_or_number(request, surah_id_or_number)
    if not surah:
        raise HTTPNotFound(json_body={'error': f'Surah with identifier {surah_id_or_number} not found'})

    ayahs = request.dbsession.query(Ayah).filter_by(surah_id=surah.id).order_by(Ayah.ayah_number_in_surah).all()
    return [ayah.to_dict() for ayah in ayahs]
