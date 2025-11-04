from datetime import datetime, timedelta
from src.models.colaborador import Colaborador
from src.config.database import db
from src.models.progresso import Progresso
from src.models.modulos import Modulo


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
    def get_progresso(colaborador_id):
        """Retorna o progresso de todos os módulos do colaborador com percentuais"""
        progresso = (
            db.session.query(Progresso, Modulo)
            .join(Modulo, Progresso.modulo_id == Modulo.id)
            .filter(Progresso.usuario_id == colaborador_id)
            .all()
        )

        if not progresso:
            # Caso ainda não exista progresso cadastrado, retorna todos como "não iniciado"
            modulos = Modulo.query.all()
            return [
                {
                    "modulo_id": m.id,
                    "modulo_nome": m.nome,
                    "status": "nao_iniciado",
                    "percent": 0
                }
                for m in modulos
            ]

        resultado = []
        for p, m in progresso:
            # Calcula a porcentagem baseada no status
            if p.status == "concluido":
                percent = 100
            elif p.status == "em_andamento":
                percent = 50
            else:
                percent = 0

            resultado.append({
                "modulo_id": p.modulo_id,
                "modulo_nome": m.nome,
                "status": p.status,
                "percent": percent,
                "nota_final": float(p.nota_final) if p.nota_final else None,
                "data_inicio": p.data_inicio.isoformat() if p.data_inicio else None,
                "data_conclusao": p.data_conclusao.isoformat() if p.data_conclusao else None
            })

        return resultado

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
