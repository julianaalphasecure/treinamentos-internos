from src.config.database import db
from src.models.progresso import Progresso

class ProgressoService:
    @staticmethod
    def get_all_progresso():
        return Progresso.query.all()
    
    @staticmethod
    def get_progresso_by_id(progresso_id):
        return Progresso.query.get(progresso_id)
    
    @staticmethod
    def create_progresso(data):
        progresso = Progresso(**data)
        db.session.add(progresso)
        db.session.commit()
        return progresso
    
    @staticmethod
    def update_progresso(progresso_id, data):
        progresso = Progresso.query.get(progresso_id)
        if not progresso:
            return None
        
        allowed_fields = ["status", "nota_final", "data_inicio", "data_conclusao"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(progresso, key, value)

        db.session.commit()
        return progresso

    @staticmethod
    def delete_progresso(progresso_id):
        progresso = Progresso.query.get(progresso_id)
        if not progresso:
            return None
        db.session.delete(progresso)
        db.session.commit()
        return progresso
