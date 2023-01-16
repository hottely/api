import uuid

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy_utils.types.uuid import UUIDType
from sqlalchemy.orm import relationship

db = SQLAlchemy()
UUIDType.cache_ok = False


# class User(db.Model):
#     id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
#     email = db.Column(db.String(100))
#     password = db.Column(db.String(100), nullable=False)
#     first_name = db.Column(db.String(100), nullable=False)
#     last_name = db.Column(db.String(100), nullable=False)
#
#     def as_dict(self):
#         return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


class Property(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    landlord_id = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    address = db.Column(db.String)
    bedrooms = db.Column(db.Integer, nullable=False)
    bathrooms = db.Column(db.Integer, nullable=False)
    pets = db.Column(db.db.Boolean, nullable=False)
    price = db.Column(db.Float)

    # landlord = relationship('User', foreign_keys='Property.landlord_id')

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


class Favorite(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, nullable=False)
    property_id = db.Column(UUIDType, ForeignKey(Property.id))

    # user = relationship('User', foreign_keys='Favorite.user_id')
    property = relationship('Property', foreign_keys='Favorite.property_id')

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}
