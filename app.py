import os
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from src.config.database import db, bcrypt
from src.config.config import SECRET_KEY, DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT, APP_PORT


from src.controllers.auth_controller import auth_bp

# Colaborador
from src.controllers.colaborador.perfil_controller import perfil_bp as colab_perfil_bp
from src.controllers.colaborador.feedback_controller import colab_feedback_bp
from src.controllers.colaborador.progresso_controller import progresso_bp
from src.controllers.colaborador.modulo_controller import modulo_bp
from src.controllers.colaborador.configuracoes_controller import configuracoes_bp

# Gestor
from src.controllers.gestor.equipe_controller import equipe_bp
from src.controllers.gestor.gestor_feedback_controller import gestor_feedback_bp  # type: ignore
from src.controllers.gestor.gestor_perfil_controller import gestor_perfil_bp  # type: ignore
from src.controllers.gestor.relatorio_controller import relatorio_bp


def create_app():
   
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(base_dir, "src/templates")
    static_dir = os.path.join(base_dir, "src/static")

    app = Flask(__name__, template_folder=template_dir, static_folder=static_dir)
    CORS(app, resources={r"/*": {"origins": "*"}})  

    # Configurações
    app.config["SECRET_KEY"] = SECRET_KEY
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializa extensões
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)

    # Registra os blueprints
    app.register_blueprint(auth_bp, url_prefix="/auth")

    # Colaborador
    app.register_blueprint(colab_perfil_bp, url_prefix="/colaborador/perfil")
    app.register_blueprint(colab_feedback_bp, url_prefix="/colaborador/feedback")
    app.register_blueprint(progresso_bp, url_prefix="/colaborador/progresso")
    app.register_blueprint(modulo_bp, url_prefix="/colaborador/modulo")
    app.register_blueprint(configuracoes_bp, url_prefix="/colaborador/configuracoes")

    # Gestor
    app.register_blueprint(equipe_bp, url_prefix="/gestor/equipe")
    app.register_blueprint(gestor_feedback_bp, url_prefix="/gestor/feedback")
    app.register_blueprint(gestor_perfil_bp, url_prefix="/gestor/perfil")
    app.register_blueprint(relatorio_bp, url_prefix="/gestor/relatorio")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=APP_PORT)
