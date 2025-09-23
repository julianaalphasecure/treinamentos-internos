from src.config.database import db
from src.models.modulos import Modulo

class ModuloService:
    @staticmethod
    def get_all_modulos():
        return Modulo.query.all()
    
    @staticmethod
    def get_modulo_by_id(modulo_id):
        return Modulo.query.get(modulo_id)
    
    @staticmethod
    def create_modulo(data):
        modulo = Modulo(**data)
        db.session.add(modulo)
        db.session.commit()
        return modulo
    
    @staticmethod
    def update_modulo(modulo_id, data):
        modulo = Modulo.query.get(modulo_id)
        if not modulo:
            return None
        
        allowed_fields = ["titulo", "descricao", "carga_horaria", "ativo"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(modulo, key, value)

        db.session.commit()
        return modulo
    
    @staticmethod
    def delete_modulo(modulo_id):
        modulo = Modulo.query.get(modulo_id)
        if not modulo:
            return None
        
        db.session.delete(modulo)
        db.session.commit()
        return modulo
