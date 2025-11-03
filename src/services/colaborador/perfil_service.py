from src.config.database import db
from src.models.usuario import Usuario

class PerfilService:
    @staticmethod
    def get_perfil(usuario_id):
        """Retorna o usuário pelo ID"""
        return Usuario.query.get(usuario_id)

    @staticmethod
    def update_perfil(usuario_id, data):
        """Atualiza os dados permitidos do usuário"""
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return None

        # Campos permitidos para atualização
        allowed_fields = ["nome", "email", "telefone", "departamento", "foto"]
        alterou = False

        for key, value in data.items():
            if key in allowed_fields and value is not None:  # aceita valores vazios
                setattr(usuario, key, value)
                alterou = True

        if alterou:
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
                return None

        return usuario
