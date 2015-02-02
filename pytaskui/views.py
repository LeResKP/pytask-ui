from pyramid.view import view_defaults
import pyramid.httpexceptions as exc
from sqlalchemy.orm import class_mapper
from sqlalchemy.exc import IntegrityError
import transaction
from pytask.models import DBSession, Task, Project
import sys
import inspect


def sqla_obj_to_dict(obj):
    """Get all the properties of an sqlalchemy objet and put them to a dict
    """
    mapper = class_mapper(obj.__class__)
    dic = {}
    for prop in mapper._props.values():
        # For now, don't get the relation properties
        if getattr(prop, 'columns', None):
            v = getattr(obj, prop.key, None)
            dic[prop.key] = v
    return dic


@view_defaults(renderer='json')
class API(object):

    # Should be defined by inheritance
    sqla_model = None
    route_prefix = None
    editable_fields = None

    def __init__(self, request):
        self.request = request

    def index(self):
        objs = self.sqla_model.query.all()
        return [sqla_obj_to_dict(o) for o in objs]

    def _response(self, code, msg):
        self.request.response.status_code = code
        return dict(msg=msg)

    def get(self):
        ident = self.request.matchdict['ident']
        obj = self.sqla_model.query.get(ident)
        if not obj:
            return self._response(404, 'task doesn\'t exist: %i' % ident)
        return sqla_obj_to_dict(obj)

    def update(self):
        ident = self.request.matchdict.get('ident')
        obj = self.sqla_model.query.get(ident)
        if not obj:
            raise exc.HTTPNotFound('Object doesn\'t exist: %i' % ident)
        with transaction.manager:
            for key, value in self.request.json_body.iteritems():
                if self.editable_fields and key not in self.editable_fields:
                    continue
                setattr(obj, key, value)
            DBSession.add(obj)
        DBSession.add(obj)
        return sqla_obj_to_dict(obj)

    def create(self):
        obj = self.sqla_model()
        try:
            with transaction.manager:
                for key, value in self.request.json_body.iteritems():
                    if (self.editable_fields and
                       key not in self.editable_fields):
                        continue
                    setattr(obj, key, value)
                DBSession.add(obj)
        except IntegrityError:
            raise exc.HTTPBadRequest('Some post data are missing')
        DBSession.add(obj)
        return sqla_obj_to_dict(obj)

    def partial_update(self):
        action = self.request.matchdict['action']
        if action == 'update':
            exc.HTTPNotAcceptable('Update method can\'t be partial')
        func = getattr(self, 'partial_%s' % action, None)
        if not func:
            exc.HTTPNotAcceptable('No action found for %s' % action)
        return func()


class TaskAPI(API):
    sqla_model = Task
    route_prefix = 'tasks'
    editable_fields = ['description', 'idproject']

    def partial_active(self):
        idtask = int(self.request.matchdict['ident'])
        task = Task.query.get(idtask)
        if not task:
            raise exc.HTTPNotFound('task doesn\'t exist: %i' % idtask)
        status = task.set_active()
        if not status:
            raise exc.HTTPConflict('The task is already active')
        DBSession.add(task)
        return sqla_obj_to_dict(task)

    def partial_toggle_close(self):
        idtask = int(self.request.matchdict['ident'])
        task = Task.query.get(idtask)
        if not task:
            raise exc.HTTPNotFound('task doesn\'t exist: %i' % idtask)
        if task.status == 'CLOSED':
            task.set_open()
        else:
            task.set_closed()
        DBSession.add(task)
        return sqla_obj_to_dict(task)


class ProjectAPI(API):
    sqla_model = Project
    route_prefix = 'projects'
    editable_fields = ['name']


def api_class_predicate(member):
    if not inspect.isclass(member):
        return False

    if member == API:
        return False

    if issubclass(member, API):
        return True

    return False


def includeme(config):
    classes = inspect.getmembers(sys.modules[__name__], api_class_predicate)
    for classname, cls in classes:
        route_name = 'api_%s_index' % cls.route_prefix
        config.add_route(route_name, '/%s.json' % cls.route_prefix)
        config.add_view(cls, route_name=route_name, attr='index',
                        request_method='GET')
        config.add_view(cls, route_name=route_name, attr='create',
                        request_method='POST')

        route_name = 'api_%s_get' % cls.route_prefix
        config.add_route(route_name, '/%s/{ident}.json' % cls.route_prefix)
        config.add_view(cls, route_name=route_name, attr='get',
                        request_method='GET')
        config.add_view(cls, route_name=route_name, attr='update',
                        request_method='PUT')

        route_name = 'api_%s_partial' % cls.route_prefix
        config.add_route(route_name, '/%s/{ident}/{action}.json' % cls.route_prefix)
        config.add_view(cls, route_name=route_name, attr='partial_update',
                        request_method='PATCH')
