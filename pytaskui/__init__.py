from pyramid.config import Configurator
from pyramid.renderers import JSON
import datetime


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')
    config.add_static_view('/bower_components',
                           'angular_static/bower_components')

    config.include('pytaskui.views', route_prefix='api')
    config.add_static_view('/', 'angular_static/app')

    # Since JSON render doesn't support datetime we create an adapter
    json_renderer = JSON()

    def datetime_adapter(obj, request):
        return obj.isoformat()

    json_renderer.add_adapter(datetime.datetime,
                              datetime_adapter)
    config.add_renderer('json', json_renderer)
    return config.make_wsgi_app()
