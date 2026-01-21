from src.controllers.auth_controller import *

from src.controllers.colaborador.configuracoes_controller import *
from src.controllers.colaborador.feedback_controller import *
from src.controllers.colaborador.modulo_controller import *
from src.controllers.colaborador.perfil_controller import *
from src.controllers.colaborador.progresso_controller import *

from src.controllers.gestor.equipe_controller import *
from src.controllers.gestor.gestor_feedback_controller import *
from src.controllers.gestor.relatorio_controller import *
from src.controllers.gestor.exercicio_controller import *

__all__ = [
    "auth_controller",

    "configuracoes_controller",
    "feedback_controller",
    "modulo_controller",
    "perfil_controller",
    "progresso_controller",

    "equipe_controller",
    "gestor_feedback_controller",
    "relatorio_controller",
]
