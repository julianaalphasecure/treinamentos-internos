from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def init_db(app):
    db.init_app(app)
    bcrypt.init_app(app)
