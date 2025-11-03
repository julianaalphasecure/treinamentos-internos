from datetime import datetime, timedelta
from src.models.colaborador import Colaborador
from src.config.database import db

class ColaboradorService:

    TIMEOUT_SECONDS = 15  # tempo de inatividade para marcar offline (teste rápido)

    @staticmethod
    def get_all_colaboradores():
        colaboradores = Colaborador.query.all()
        now = datetime.utcnow()

        for c in colaboradores:
            if c.status == "online" and c.ultimo_login:
                diff = now - c.ultimo_login
                if diff.total_seconds() > ColaboradorService.TIMEOUT_SECONDS:
                    c.status = "offline"
        db.session.commit()
        return colaboradores

    @staticmethod
    def get_colaborador_by_id(colaborador_id):
        return Colaborador.query.get(colaborador_id)

    @staticmethod
    def set_status(colaborador_id, status):
        colaborador = Colaborador.query.get(colaborador_id)
        if not colaborador:
            return None
        colaborador.status = status
        if status == "online":
            colaborador.ultimo_login = datetime.utcnow()
        db.session.commit()
        return colaborador
