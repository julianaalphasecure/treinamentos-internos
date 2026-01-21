# src/models/__init__.py

# Importação direta de cada modelo
from src.models.usuario import Usuario
from src.models.configuracoes import Configuracoes
from src.models.equipe import Equipe
from src.models.exercicio import Exercicio
from src.models.feedback import Feedback
from src.models.modulos import Modulo
from src.models.modulo_slide import ModuloSlide
from src.models.modulo_exercicio import ModuloExercicio
from src.models.notification import Notification
from src.models.password_reset import PasswordReset
from src.models.progresso import Progresso
from src.models.relatorio import Relatorio


__all__ = [
    "Usuario",
    "Configuracoes",
    "Equipe",
    "Exercicio",
    "Feedback",
    "Modulo",
    "ModuloSlide",
    "ModuloExercicio",
    "Notification",
    "PasswordReset",
    "Progresso",
    "Relatorio",
]
