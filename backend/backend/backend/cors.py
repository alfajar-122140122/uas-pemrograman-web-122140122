def includeme(config):
    """
    Configure CORS settings to allow requests from the frontend
    """
    config.add_subscriber(add_cors_headers, 'pyramid.events.NewResponse')


def add_cors_headers(event):
    """
    Add CORS headers to the response
    """
    # Get settings from the registry (if any)
    settings = event.request.registry.settings
    cors_origins = settings.get('cors.origins', 'http://localhost:5173')
    cors_origins = [origin.strip() for origin in cors_origins.split(',')]

    # Check if request has an Origin header and if it's allowed
    origin = event.request.headers.get('Origin', '')
    if origin in cors_origins or '*' in cors_origins:
        # Add CORS headers
        headers = event.response.headers
        headers['Access-Control-Allow-Origin'] = origin
        headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
        headers['Access-Control-Allow-Credentials'] = 'true'
        headers['Access-Control-Max-Age'] = '86400'  # 24 hours

    # Handle preflight OPTIONS request
    if event.request.method == 'OPTIONS':
        event.response.status_int = 200
        return event.response
