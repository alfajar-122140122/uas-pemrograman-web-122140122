from pyramid.config import Configurator
from pyramid.renderers import JSON


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.routes') # This will now include all routes (static, home, and API)
        config.include('.models')
        # config.include('pyramid_tm') # Already commented out or handled if necessary

        # Add JSON renderer for API responses
        config.add_renderer('json', JSON())

        # Include CORS configuration
        config.include('.cors')

        # Include authentication middleware
        config.include('.auth')

        config.scan('.views') # Scan direktori views yang baru dibuat
    return config.make_wsgi_app()
