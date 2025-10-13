from src.config.database import db
from src.models.usuario import Usuario

class PerfilService:
    @staticmethod
    def get_perfil(usuario_id):
        return Usuario.query.get(usuario_id)

    @staticmethod
    def update_perfil(usuario_id, data):
        usuario = Usuario.query.get(usuario_id)
        if not usuario:
            return None

        allowed_fields = ["nome", "email", "telefone", "departamento", "foto"]
        alterou = False

        for key, value in data.items():
            if key in allowed_fields and value:
                setattr(usuario, key, value)
                alterou = True

        if alterou:
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
                return None

        return usuario



