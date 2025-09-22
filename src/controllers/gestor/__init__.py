from flask import Blueprint

gestor_bp = Blueprint("gestor", __name__, url_prefix="/gestor")

from .import equipe_controller, feedback_controller, perfil_controller, relatorio_controller
