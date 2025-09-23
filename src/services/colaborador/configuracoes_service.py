from src.config.database import db
from src.models.configuracoes import Configuracoes

class ConfiguracoesService:
    @staticmethod
    def atualizar_configuracoes(usuario_id, data):
        configuracoes = ConfiguracoesService.filter_by(colaborador_id=usuario_id).first()
        if not configuracoes:
            return None
        
        allowed_fields = ["notificacoes_email", "notificacoes_push", "tema", "idioma", "privacidade_perfil"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(configuracoes, key, value)

                db.session.commit()
                return Configuracoes