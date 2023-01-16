import uuid
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_utils.types.uuid import UUIDType
import datetime


db = SQLAlchemy()
app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///databse.db"
db.init_app(app)


class Booking(db.Model):
    id = db.Column(UUIDType, primary_key=True, default=uuid.uuid4)
    property_id = db.Column(UUIDType, nullable=False)
    start = db.Column(db.DateTime, nullable=False)
    end = db.Column(db.DateTime, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    def as_dict(self):
        return {c.name: str(getattr(self, c.name)) for c in self.__table__.columns}


with app.app_context():
    db.create_all()


@app.route("/")
def main():
    return "<p>Welcome</p>"


@app.route("/bookings", methods=['GET'])
def get_bookings():
    bookings = [e.as_dict() for e in Booking.query.all()]
    return bookings


@app.route("/check_availability/<property_id>/<start>/<end>", methods=['GET'])
def check_availability(property_id, start, end):
    # ex: /check_availability/8EB525D34A884867BB8B55946242E77C/09-19-2022/09-21-2022
    all_bookings = Booking.query.filter_by(property_id=property_id)

    start = datetime.datetime.strptime(start, '%m-%d-%Y')
    end = datetime.datetime.strptime(end, '%m-%d-%Y')

    # check if starting date is between start&end dates for all the other bookings
    for b in all_bookings:
        if b.start < start and start < b.end:
            return "False"

    # check if ending date is between start&end dates for all the other bookings
    for b in all_bookings:
        if b.start < end and end < b.end:
            return "False"

    return "True"


@app.route("/create_booking/<property_id>/<start>/<end>/<name>", methods=['GET', 'POST'])
def create_booking(property_id, start, end, name):
    # ex: /create_booking/8EB525D34A884867BB8B55946242E77C/09-22-2022/09-30-2022/Gigel

    start = datetime.datetime.strptime(start, '%m-%d-%Y').date()
    end = datetime.datetime.strptime(end, '%m-%d-%Y').date()

    new = Booking(property_id=property_id, start=start, end=end, name=name)
    db.session.add(new)
    db.session.commit()
    return ''
