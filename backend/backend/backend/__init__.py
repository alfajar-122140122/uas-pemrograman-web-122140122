from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    with Configurator(settings=settings) as config:
        config.include('pyramid_jinja2')
        config.include('.routes') # This will now include all routes (static, home, and API)
        config.include('.models')
        # config.include('pyramid_tm') # Already commented out or handled if necessary

        # Tambahkan renderer JSON jika belum ada - This should ideally be here or in routes.py if specific to API
        # For now, assuming it's general enough or handled by pyramid's default JSON renderer if applicable
        # config.add_renderer('json', 'pyramid.renderers.JSON')


        # API route definitions have been moved to routes.py

        config.scan('.views') # Scan direktori views yang baru dibuat
    return config.make_wsgi_app()
