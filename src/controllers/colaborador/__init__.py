from flask import Blueprint
from .configuracoes_controller import configuracoes_bp
from .feedback_controller import colab_feedback_bp
from .modulo_controller import modulo_bp
from .perfil_controller import perfil_bp
from .progresso_controller import progresso_bp

colaborador_bp = Blueprint("colaborador_bp", __name__, url_prefix="/colaborador")

colaborador_bp.register_blueprint(configuracoes_bp, url_prefix="/configuracoes")
colaborador_bp.register_blueprint(colab_feedback_bp, url_prefix="/feedback")
colaborador_bp.register_blueprint(modulo_bp, url_prefix="/modulos")
colaborador_bp.register_blueprint(perfil_bp, url_prefix="/perfil")
colaborador_bp.register_blueprint(progresso_bp, url_prefix="/progresso")
