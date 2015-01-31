from pyramid.view import view_config
from pytask.models import Task
from sqlalchemy.orm import class_mapper


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
