from pyramid.config import Configurator


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_chameleon')
    config.add_static_view('/bower_components',
                           'angular_static/bower_components')
    config.add_static_view('/', 'angular_static/app')
    config.add_route('home', '/api')
    config.scan()
    return config.make_wsgi_app()
