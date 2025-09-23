from .equipe_controller import equipe_bp
from .gestor_feedback_controller import gestor_feedback_bp # type: ignore
from .gestor_perfil_controller import gestor_perfil_bp # type: ignore
from .relatorio_controller import relatorio_bp

__all__ = [
    "equipe_bp",
    "gestor_feedback_bp",
    "gestor_perfil_bp",
    "relatorio_bp",
]
