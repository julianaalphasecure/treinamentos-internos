from src.config.database import db
from src.models.configuracoes import Configuracoes
from src.models.usuario import Usuario
from flask_mail import Message
from flask import current_app


class ConfiguracoesService:
    @staticmethod
    def atualizar_configuracoes(usuario_id, data):
        configuracoes = Configuracoes.query.filter_by(colaborador_id=usuario_id).first()
        usuario = Usuario.query.get(usuario_id)

        if not configuracoes or not usuario:
            return None

        allowed_fields = ["notificacoes_email", "notificacoes_push", "tema", "idioma", "privacidade_perfil"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(configuracoes, key, value)

        db.session.commit()
        return configuracoes
