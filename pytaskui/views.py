from pyramid.view import view_config
import pyramid.httpexceptions as exc
from sqlalchemy.orm import class_mapper
from pytask.models import DBSession, Task


def sqla_obj_to_dict(obj):
    """Get all the properties of an sqlalchemy objet and put them to a dict
    """
    mapper = class_mapper(Task)
    dic = {}
    for prop in mapper._props.values():
        # For now, don't get the relation properties
        if getattr(prop, 'columns', None):
            v = getattr(obj, prop.key, None)
            dic[prop.key] = v
    return dic


@view_config(route_name='tasks', renderer='json')
def tasks(request):
    """Returns all the tasks as dict
    """
    tasks = Task.query.all()
    return [sqla_obj_to_dict(task) for task in tasks]


@view_config(route_name='tasks_action', renderer='json')
def tasks_action(request):
    """Returns all the tasks as dict
    """
    action = request.matchdict['action']
    if action != 'active':
        raise exc.HTTPBadRequest('action not supported: %s' % action)
    idtask = int(request.matchdict['idtask'])
    task = Task.query.get(idtask)
    if not task:
        raise exc.HTTPNotFound('task doesn\'t exist: %i' % idtask)
    status = task.set_active()
    if not status:
        raise exc.HTTPConflict('The task is already active')
    DBSession.add(task)
    return sqla_obj_to_dict(task)
