import os
from dotenv import load_dotenv


load_dotenv()


FLASK_ENV = os.getenv("FLASK_ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "chave_secreta")


db_config = {
"host": os.getenv("DB_HOST", "localhost"),
"user": os.getenv("DB_USER", "root"),
"password": os.getenv("DB_PASSWORD", ""),
"database": os.getenv("DB_NAME", "plataforma_treinamento"),
"port": int(os.getenv("DB_PORT", 3306))
}


APP_PORT = int(os.getenv("APP_PORT", 5000))
