import os
from dotenv import load_dotenv

load_dotenv()


FLASK_ENV = os.getenv("FLASK_ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta")


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "plataforma_treinamento")
DB_PORT = os.getenv("DB_PORT", 3306)

SQLALCHEMY_DATABASE_URI = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

SQLALCHEMY_TRACK_MODIFICATIONS = False


APP_PORT = int(os.getenv("APP_PORT", 5000))
