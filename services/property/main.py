import werkzeug
from flask import Blueprint, render_template, redirect, url_for, jsonify, request, current_app
import json
from .models import User, Property, Favorite
from . import db

main = Blueprint('main', __name__)


def current_user_temp():
    current_user = User.query.first()  # temp workaround
    return current_user


def convert_input_to(class_):
    def wrap(f):
        def decorator(*args):
            obj = class_(**request.get_json())
            return f(obj)
        return decorator
    return wrap


def model_list_to_dict_list(model_list):
    dict_list = [model.as_dict() for model in model_list]
    return dict_list


@main.errorhandler(werkzeug.exceptions.BadRequest)
def handle_bad_request(e):
    return e, 400


@main.route('/')
def index():
    return render_template('index.html')


@main.route('/properties', methods=['GET'])
def get_properties():
    properties = Property.query.all()
    properties_dict = [property.as_dict() for property in properties]
    return properties_dict


@main.route('/properties', methods=['POST'])
@convert_input_to(Property)
def add_property(property):
    db.session.add(property)
    db.session.commit()
    return ''


@main.route('/amenities', methods=['GET'])
def get_amenities():
    amenities = ["pool", "washer"]
    return amenities


@main.route('/favorites', methods=['GET'])
def get_favorites():
    current_user = current_user_temp()
    if current_user:
        favorites = Favorite.query.filter_by(user_id=current_user.id)
        return model_list_to_dict_list(favorites)
    else:
        return handle_bad_request('no current user')


@main.route('/properties/<id>', methods=['GET'])
def get_property(id):
    current_user = current_user_temp()
    property = Property.query.filter_by(id=id).first()
    property_dict = property.as_dict()
    if current_user:
        favorite = Favorite.query.filter_by(property_id=property.id).first()
        favorite = favorite is not None
        property_dict['favorite'] = favorite
    return property_dict


@main.route('/properties/<id>/favorite', methods=['POST'])
def favorite_property(id):
    current_user = current_user_temp()
    can_favorite = Favorite.query.filter_by(property_id=id, user_id=current_user.id).first() is None
    if can_favorite:
        property = Property.query.filter_by(id=id).first()
        if not property:
            handle_bad_request("property doesn't exist")
        favorite = Favorite(user_id=current_user.id, property_id=property.id)
        db.session.add(favorite)
        db.session.commit()
        return ''
    else:
        return handle_bad_request("duplicates")


@main.route('/properties/<id>/unfavorite', methods=['POST'])
def unfavorite_property(id):
    current_user = current_user_temp()
    favorite = Favorite.query.filter_by(property_id=id, user_id=current_user.id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
        return ''
    else:
        return handle_bad_request('is not favorite')


# @main.route('/test', methods=['POST'])
# def test():
#     #user = User(email='a', password='a', first_name='a', last_name='a')
#     #db.session.add(user)
#
#     user = current_user_temp()
#     property = Property.query.first()
#
#     favorite = Favorite(user_id=user.id, property_id=property.id)
#     db.session.add(favorite)
#
#     db.session.commit()
#     return ''
