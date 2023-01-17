import requests as requests
import werkzeug
from flask import Blueprint, render_template, request
from marshmallow import ValidationError
from . import db
from .models import Property, Favorite, PropertySchema

main = Blueprint('main', __name__)
graphql_url = 'http://localhost:4000/api'

property_schema = PropertySchema()


def query_graphql(query, token):
    headers = {}
    if token:
        headers['Authorization'] = token
    response = requests.post(graphql_url, data={'query': query}, headers=headers)
    return response.json()


def auth_graphql(token):  # return success, result (id in case of success)
    return_value = {}
    query = '''{
      me {
        id
      }
    }'''
    result = query_graphql(query, token)
    if 'error' in result or 'errors' in result or not result['data']['me']['id']:
        success = False
        current_user_id = None
    else:
        success = True
        current_user_id = result['data']['me']['id']

    return_value['success'] = success
    return_value['current_user_id'] = current_user_id
    return return_value


def is_authenticated(request):
    token = request.headers.get('Authorization')
    return auth_graphql(token)['success']


def get_current_user_id(request):
    token = request.headers.get('Authorization')
    return auth_graphql(token)['current_user_id']


def convert_input_to(class_):
    def wrap(f):
        def decorator(*args):
            obj = class_(**request.get_json())
            return f(obj)

        return decorator

    return wrap


@main.errorhandler(werkzeug.exceptions.BadRequest)
def handle_bad_request(e):
    return e, 400


@main.errorhandler(werkzeug.exceptions.BadRequest)
def handle_unauthorized():
    return '', 401


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/properties', methods=['GET'])
def get_properties():
    properties = Property.query.all()
    properties_dict = property_schema.dump(properties, many=True)
    return properties_dict


@main.route('/properties', methods=['POST'])
def add_property():
    current_user_id = get_current_user_id(request)
    if not current_user_id:
        return handle_unauthorized()

    json_data = request.get_json()
    if not json_data:
        return handle_bad_request('No input')
    try:
        json_data['landlord_id'] = current_user_id
        property = property_schema.load(json_data)
    except ValidationError as err:
        return err.messages, 422

    db.session.add(property)
    db.session.commit()
    return ''


@main.route('/amenities', methods=['GET'])
def get_amenities():
    amenities = ["pool", "washer"]
    return amenities


@main.route('/favorites', methods=['GET'])
def get_favorites():
    current_user_id = get_current_user_id(request)
    if not current_user_id:
        return handle_unauthorized()

    favorites = Favorite.query.filter_by(user_id=current_user_id)
    properties = [favorite.property for favorite in favorites]
    properties_dict = property_schema.dump(properties, many=True)
    return properties_dict


@main.route('/properties/<id>', methods=['GET'])
def get_property(id):
    current_user_id = get_current_user_id(request)
    property = Property.query.filter_by(id=id).first()
    property_dict = property_schema.dump(property)
    if current_user_id:
        favorite = Favorite.query.filter_by(property_id=property.id).first()
        favorite = favorite is not None
        property_dict['favorite'] = favorite
    return property_dict


@main.route('/properties/<id>/favorite', methods=['POST'])
def favorite_property(id):
    current_user_id = get_current_user_id(request)
    if not current_user_id:
        return handle_unauthorized()

    can_favorite = Favorite.query.filter_by(property_id=id, user_id=current_user_id).first() is None
    if can_favorite:
        property = Property.query.filter_by(id=id).first()
        if not property:
            handle_bad_request("property doesn't exist")
        favorite = Favorite(user_id=current_user_id, property_id=property.id)
        db.session.add(favorite)
        db.session.commit()
        return ''
    else:
        return handle_bad_request("duplicates")


@main.route('/properties/<id>/unfavorite', methods=['POST'])
def unfavorite_property(id):
    current_user_id = get_current_user_id(request)
    if not current_user_id:
        return handle_unauthorized()

    favorite = Favorite.query.filter_by(property_id=id, user_id=current_user_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
        return ''
    else:
        return handle_bad_request('is not favorite')


@main.route('/listings', methods=['GET'])
def listings():
    current_user_id = get_current_user_id(request)
    if not current_user_id:
        return handle_unauthorized()

    properties = Property.query.filter_by(landlord_id=current_user_id).all()
    properties_dict = property_schema.dump(properties, many=True)
    return properties_dict
