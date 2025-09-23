from flask import Flask
from src.config.database import db, bcrypt
from src.config.config import SECRET_KEY, db_config, APP_PORT

from src.controllers.auth_controller import auth_bp
from src.controllers.colaborador.perfil_controller import perfil_bp
from src.controllers.colaborador.feddback_controller import colab_feedback_bp
from src.controllers.colaborador.progresso_controller import progresso_bp
from src.controllers.colaborador.modulo_controller import modulo_bp
from src.controllers.colaborador.configuracoes_controller import configuracoes_bp

from src.controllers.gestor.equipe_controller import equipe_bp
from src.controllers.gestor.feedback_controller import gestor_feedback_bp
from src.controllers.gestor.relatorio_controller import relatorio_bp
from src.controllers.gestor.perfil_controller import perfil_bp as gestor_perfil_bp


def create_app():
    app = Flask(__name__)

    
    app.config['SECRET_KEY'] = SECRET_KEY
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"mysql+pymysql://{db_config['user']}:{db_config['password']}"
        f"@{db_config['host']}:{db_config['port']}/{db_config['database']}"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    
    db.init_app(app)
    bcrypt.init_app(app)

  
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(perfil_bp, url_prefix="/colaborador/perfil")
    app.register_blueprint(colab_feedback_bp)
    app.register_blueprint(progresso_bp)
    app.register_blueprint(modulo_bp)
    app.register_blueprint(configuracoes_bp)

    app.register_blueprint(equipe_bp)
    app.register_blueprint(gestor_feedback_bp)
    app.register_blueprint(relatorio_bp)
    app.register_blueprint(gestor_perfil_bp, url_prefix="/gestor/perfil")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=APP_PORT)
