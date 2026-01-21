import os
from pathlib import Path
from datetime import timedelta
import traceback
  

from flask import Flask, jsonify
from werkzeug.exceptions import HTTPException
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask import request

from src.config.database import db, bcrypt
from src.config.config import (
    SECRET_KEY,
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_PORT,
    APP_PORT
)

# --- Controllers Auth ---
from src.controllers.auth_controller import auth_bp

# --- Controllers Colaborador ---
from src.controllers.colaborador.colaborador_controller import colaborador_bp
from src.controllers.colaborador.perfil_controller import perfil_bp as colab_perfil_bp
from src.controllers.colaborador.feedback_controller import colab_feedback_bp
from src.controllers.colaborador.progresso_controller import progresso_bp
from src.controllers.colaborador.modulo_controller import modulo_bp
from src.controllers.colaborador.exercicio_controller import exercicio_bp

# --- Controllers Gestor ---
from src.controllers.gestor.equipe_controller import equipe_bp
from src.controllers.gestor.gestor_feedback_controller import gestor_feedback_bp
from src.controllers.gestor.relatorio_controller import relatorio_bp
from src.controllers.gestor.gerenciar_controller import gerenciar_bp
from src.controllers.gestor.exercicio_controller import exercicio_bp






def create_app():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    template_dir = os.path.join(base_dir, "src/templates")
    static_dir = os.path.join(base_dir, "src/static")

    app = Flask(
        __name__,
        template_folder=template_dir,
        static_folder=static_dir
    )

    

    BASE_DIR = Path(base_dir)

    UPLOAD_FOLDER = BASE_DIR / "src" / "static" / "uploads" / "modulos"

    app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
    app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg", "webp"}

    # Garante que a pasta exista
    UPLOAD_FOLDER.mkdir(parents=True, exist_ok=True)


   
    app.url_map.strict_slashes = False

   
    CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)


    
    app.config["SECRET_KEY"] = SECRET_KEY.strip()
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

 
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)



    @app.route("/", methods=["GET"])
    def home():
        return jsonify({
            "status": "online",
            "api": "Treinamentos Internos",
            "mensagem": "API rodando com sucesso"
        }), 200

    
    @app.errorhandler(Exception)
    def handle_unhandled_exception(e):
        if isinstance(e, HTTPException):
            return e

        print('==================================================================')
        print('!!! ERRO CRÍTICO NÃO TRATADO (STACK TRACE ABAIXO) !!!')
        traceback.print_exc()
        print('==================================================================')

        return "Erro interno do servidor.", 500


    app.config["JWT_SECRET_KEY"] = SECRET_KEY.strip()
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=30)
    app.config["JWT_TOKEN_LOCATION"] = ["headers"]
    app.config["JWT_HEADER_NAME"] = "Authorization"
    app.config["JWT_HEADER_TYPE"] = "Bearer"

    jwt = JWTManager(app)

    

    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return "", 200



    @jwt.invalid_token_loader
    @jwt.unauthorized_loader
    def handle_auth_error(error):
        return jsonify(error=str(error)), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify(
            error="O token de acesso expirou. Por favor, refaça o login."
        ), 401


 
    app.register_blueprint(auth_bp, url_prefix="/auth")

    app.register_blueprint(colaborador_bp, url_prefix="/colaborador")
    app.register_blueprint(colab_perfil_bp, url_prefix="/colaborador/perfil")
    app.register_blueprint(colab_feedback_bp, url_prefix="/colaborador/feedback")
    app.register_blueprint(progresso_bp, url_prefix="/colaborador/progresso")
    app.register_blueprint(modulo_bp, url_prefix="/colaborador/modulo")
    app.register_blueprint(exercicio_bp)

    app.register_blueprint(equipe_bp, url_prefix="/gestor/equipe")
    app.register_blueprint(gestor_feedback_bp, url_prefix="/gestor/feedback")
    app.register_blueprint(relatorio_bp, url_prefix="/gestor/relatorio")
    app.register_blueprint(gerenciar_bp)


    
    with app.app_context():
        print("\n=== ROTAS REGISTRADAS ===")
        for rule in app.url_map.iter_rules():
            print(rule)
        print("==========================\n")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=APP_PORT)
