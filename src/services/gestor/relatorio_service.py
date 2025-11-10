from src.config.database import db
from src.models.relatorio import Relatorio


class RelatorioService:
    @staticmethod
    def create_relatorio(data):
        # O modelo Relatorio agora tem colaborador_id, então o data deve conter essa chave.
        relatorio = Relatorio(**data) 
        db.session.add(relatorio)
        db.session.commit()
        return relatorio
    
    @staticmethod
    def update_relatorio(relatorio_id, data):
        relatorio = Relatorio.query.get(relatorio_id)
        if not relatorio:
            return None
        
        # AJUSTE: Adicione colaborador_id se a edição de destino for permitida
        allowed_fields = ["titulo", "conteudo", "colaborador_id"] 
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
