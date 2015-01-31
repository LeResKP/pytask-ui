from pyramid.view import view_config
import pyramid.httpexceptions as exc
from sqlalchemy.orm import class_mapper
from sqlalchemy.exc import IntegrityError
import transaction
from pytask.models import DBSession, Task


EDITABLE_TASK_FIELDS = ['description']


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
@view_config(route_name='task', renderer='json', request_method='GET')
def tasks(request):
    """Returns all the tasks as dict
    """
    idtask = request.matchdict.get('idtask')
    if idtask:
        task = Task.query.get(idtask)
        if not task:
            raise exc.HTTPNotFound('task doesn\'t exist: %i' % idtask)
        return sqla_obj_to_dict(task)
    tasks = Task.query.all()
    return [sqla_obj_to_dict(t) for t in tasks]


@view_config(route_name='task', renderer='json', request_method='POST')
def update(request):
    """Returns all the tasks as dict
    """
    idtask = request.matchdict.get('idtask')
    task = Task.query.get(idtask)
    if not task:
        raise exc.HTTPNotFound('task doesn\'t exist: %i' % idtask)
    with transaction.manager:
        for field in EDITABLE_TASK_FIELDS:
            if field in request.json_body:
                setattr(task, field, request.json_body[field])
        DBSession.add(task)
    DBSession.add(task)
    return sqla_obj_to_dict(task)


@view_config(route_name='task_new', renderer='json', request_method='POST')
def new(request):
    """Returns all the tasks as dict
    """
    task = Task()
    try:
        with transaction.manager:
            for field in EDITABLE_TASK_FIELDS:
                if field in request.json_body:
                    setattr(task, field, request.json_body[field])
            DBSession.add(task)
    except IntegrityError:
        raise exc.HTTPBadRequest('Some post data are missing')
    DBSession.add(task)
    return sqla_obj_to_dict(task)


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
