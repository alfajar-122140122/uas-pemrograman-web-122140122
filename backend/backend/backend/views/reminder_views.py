from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPBadRequest, HTTPForbidden
from datetime import datetime

from ..models import Reminder, User # Adjust path if necessary

@view_config(route_name='user_reminders_collection', request_method='POST', renderer='json')
def create_user_reminder_view(request):
    user_id_from_path = request.matchdict.get('user_id')

    # Authorization: Ensure the authenticated user is creating a reminder for themselves
    if not request.user or str(request.user['user_id']) != user_id_from_path:
        raise HTTPForbidden(json_body={'error': 'Not authorized to create reminder for this user'})

    db_user = request.dbsession.query(User).filter_by(id=user_id_from_path).first()
    if not db_user:
        raise HTTPNotFound(json_body={'error': f'User with id {user_id_from_path} not found'})

    try:
        data = request.json_body
        required_fields = ['surat', 'ayat', 'due_date']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            raise HTTPBadRequest(json_body={'error': f'Missing required fields: {", ".join(missing)}'})

        try:
            due_date_dt = datetime.fromisoformat(data['due_date'])
        except ValueError:
            raise HTTPBadRequest(json_body={'error': 'Invalid due_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS).'})

        new_reminder = Reminder(
            user_id=user_id_from_path,
            surat=data['surat'],
            ayat=data['ayat'],
            due_date=due_date_dt,
            is_completed=data.get('is_completed', False)
        )
        request.dbsession.add(new_reminder)
        request.dbsession.flush()
        return new_reminder.to_dict()
    except HTTPBadRequest as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='user_reminders_collection', request_method='GET', renderer='json')
def list_user_reminders_view(request):
    user_id_from_path = request.matchdict.get('user_id')

    # Authorization: Ensure the authenticated user is listing their own reminders
    if not request.user or str(request.user['user_id']) != user_id_from_path:
        raise HTTPForbidden(json_body={'error': 'Not authorized to view reminders for this user'})

    db_user = request.dbsession.query(User).filter_by(id=user_id_from_path).first()
    if not db_user:
        raise HTTPNotFound(json_body={'error': f'User with id {user_id_from_path} not found'})

    # Optional filtering: ?completed=true or ?completed=false
    completed_filter_str = request.params.get('completed')
    query = request.dbsession.query(Reminder).filter_by(user_id=user_id_from_path)
    if completed_filter_str:
        if completed_filter_str.lower() == 'true':
            query = query.filter_by(is_completed=True)
        elif completed_filter_str.lower() == 'false':
            query = query.filter_by(is_completed=False)
            
    reminders = query.order_by(Reminder.due_date).all()
    return [reminder.to_dict() for reminder in reminders]

@view_config(route_name='reminder_detail', request_method='GET', renderer='json')
def get_reminder_view(request):
    reminder_id = request.matchdict.get('reminder_id')
    reminder = request.dbsession.query(Reminder).filter_by(id=reminder_id).first()
    if not reminder:
        raise HTTPNotFound(json_body={'error': f'Reminder with id {reminder_id} not found'})

    # Authorization: Ensure the authenticated user owns this reminder
    if not request.user or reminder.user_id != request.user['user_id']:
        raise HTTPForbidden(json_body={'error': 'Not authorized to view this reminder'})
    
    return reminder.to_dict()

@view_config(route_name='reminder_detail', request_method='PUT', renderer='json')
def update_reminder_view(request):
    reminder_id = request.matchdict.get('reminder_id')
    reminder = request.dbsession.query(Reminder).filter_by(id=reminder_id).first()
    if not reminder:
        raise HTTPNotFound(json_body={'error': f'Reminder with id {reminder_id} not found'})

    # Authorization: Ensure the authenticated user owns this reminder
    if not request.user or reminder.user_id != request.user['user_id']:
        raise HTTPForbidden(json_body={'error': 'Not authorized to update this reminder'})

    try:
        data = request.json_body
        if 'surat' in data:
            reminder.surat = data['surat']
        if 'ayat' in data:
            reminder.ayat = data['ayat']
        if 'due_date' in data:
            try:
                reminder.due_date = datetime.fromisoformat(data['due_date'])
            except ValueError:
                raise HTTPBadRequest(json_body={'error': 'Invalid due_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS).'})
        if 'is_completed' in data:
            reminder.is_completed = bool(data['is_completed'])
        
        request.dbsession.flush()
        return reminder.to_dict()
    except HTTPBadRequest as e:
        request.response.status_code = e.code
        return e.json_body
    except Exception as e:
        request.response.status_code = 500
        return {'error': str(e)}

@view_config(route_name='reminder_detail', request_method='DELETE', renderer='json')
def delete_reminder_view(request):
    reminder_id = request.matchdict.get('reminder_id')
    reminder = request.dbsession.query(Reminder).filter_by(id=reminder_id).first()
    if not reminder:
        raise HTTPNotFound(json_body={'error': f'Reminder with id {reminder_id} not found'})

    # Authorization: Ensure the authenticated user owns this reminder
    if not request.user or reminder.user_id != request.user['user_id']:
        raise HTTPForbidden(json_body={'error': 'Not authorized to delete this reminder'})

    request.dbsession.delete(reminder)
    request.dbsession.flush()
    request.response.status_code = 204 # No Content
    return {}
