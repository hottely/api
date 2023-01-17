import uuid

from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy_utils.types.uuid import UUIDType
from sqlalchemy.orm import relationship

db = SQLAlchemy()
ma = Marshmallow()

UUIDType.cache_ok = False


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

    property_images = relationship('PropertyImage', backref='property')
    amenities = relationship('Amenities', backref='property')


class PropertyImage(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    url = db.Column(db.String)
    property_id = db.Column(UUIDType, ForeignKey(Property.id))


class Amenities(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String)
    property_id = db.Column(UUIDType, ForeignKey(Property.id))


class Favorite(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, nullable=False)
    property_id = db.Column(UUIDType, ForeignKey(Property.id))

    property = relationship('Property', foreign_keys='Favorite.property_id')

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


class PropertyImageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = PropertyImage
        load_instance = True


class AmenitiesSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Amenities
        load_instance = True


class PropertySchema(ma.SQLAlchemyAutoSchema):
    property_images = ma.Nested(PropertyImageSchema, many=True)
    amenities = ma.Nested(AmenitiesSchema, many=True)

    class Meta:
        model = Property
        load_instance = True
