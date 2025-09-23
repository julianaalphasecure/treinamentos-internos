from src.config.database import db
from src.models.equipe import Equipe

class EquipeService:
    @staticmethod
    def get_all_equipes():
        return Equipe.query.all()
    
    @staticmethod
    def get_equipe_by_id(equipe_id):
        return Equipe.query.get(equipe_id)
    
    @staticmethod
    def create_equipe(data):
        equipe = Equipe(**data)
        db.session.add(equipe)
        db.session.commit()
        return equipe
    
    @staticmethod
    def update_equipe(equipe_id, data):
        equipe = Equipe.query.get(equipe_id)
        if not equipe:
            return None
        
        allowed_fields = ["id_gestor", "id_colaborador"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(equipe, key, value)

        db.session.commit()
        return equipe
            
    @staticmethod
    def delete_equipe(equipe_id):
        equipe = Equipe.query.get(equipe_id)
        if not equipe:
            return None
        
        db.session.delete(equipe)
        db.session.commit()
        return equipe
