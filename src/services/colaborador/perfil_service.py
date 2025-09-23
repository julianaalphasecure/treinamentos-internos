from src.config.database import db
from src.models.usuario import Usuario

class PerfilService:
    @staticmethod
    def get_perfil(usuario_id):
        return Usuario.query.get(usuario_id)
    
    @staticmethod
    def update_perfil(usuario_id, data):
        usuario = Usuario.query(usuario_id)
        if not usuario:
            return None
        
        allowed_fields = ["nome", "email"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(usuario, key, value)

            db.session.commit()
            return usuario