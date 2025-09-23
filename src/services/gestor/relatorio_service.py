from src.config.database import db
from src.models.relatorio import Relatorio

class RelatorioService:
    @staticmethod
    def get_all_relatorios():
        return Relatorio.query.all()
    
    @staticmethod
    def get_relatorio_by_id(relatorio_id):
        return Relatorio.query.get(relatorio_id)

    @staticmethod
    def create_relatorio(data):
        relatorio = Relatorio(**data)
        db.session.add(relatorio)
        db.session.commit()
        return relatorio
    
    @staticmethod
    def update_relatorio(relatorio_id, data):
        relatorio = Relatorio.query.get(relatorio_id)
        if not relatorio:
            return None
        
        allowed_fields = ["titulo", "conteudo"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(relatorio, key, value)

        db.session.commit()
        return relatorio
            
    @staticmethod
    def delete_relatorio(relatorio_id):
        relatorio = Relatorio.query.get(relatorio_id)
        if not relatorio:
            return None
        
        db.session.delete(relatorio)
        db.session.commit()
        return relatorio
