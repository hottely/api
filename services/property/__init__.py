import os

from flask import Flask
from .models import *

basedir = os.path.abspath(os.path.dirname(__file__))


def create_app():
    app = Flask(__name__)
    # app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'db.sqlite')

    db.init_app(app)
    ma.init_app(app)
    with app.app_context():
        db.create_all()

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    return app
