from pyramid.view import view_config
from pyramid.response import Response

from .. import models


@view_config(route_name='home', renderer='backend:templates/mytemplate.jinja2')
def my_view(request):
    return {'project': 'backend'}  # Return a simple dictionary
