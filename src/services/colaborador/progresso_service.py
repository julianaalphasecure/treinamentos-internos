from datetime import datetime
from src.config.database import db
from src.models.progresso import Progresso
from src.models.modulos import Modulo


class ProgressoService:

    @staticmethod
    def get_all_progresso():
        return Progresso.query.all()

    @staticmethod
    def get_all_progresso_usuario(usuario_id):
        return Progresso.query.filter_by(usuario_id=usuario_id).all()

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

    # ✅ AGORA DENTRO DA CLASSE
    @staticmethod
    def inicializar_progresso_usuario(usuario_id):
        modulos = Modulo.query.all()

        for modulo in modulos:
            existe = Progresso.query.filter_by(
                usuario_id=usuario_id,
                modulo_id=modulo.id
            ).first()

            if not existe:
                novo = Progresso(
                    usuario_id=usuario_id,
                    modulo_id=modulo.id,
                    status="nao_iniciado",
                    tentativas=0
                )
                db.session.add(novo)

        db.session.commit()

 
    @staticmethod
    def finalizar_modulo(usuario_id, modulo_id, nota_final):
        progresso = Progresso.query.filter_by(
            usuario_id=usuario_id,
            modulo_id=modulo_id
        ).first()

        if not progresso:
            progresso = Progresso(
                usuario_id=usuario_id,
                modulo_id=modulo_id,
                status="nao_iniciado",
                nota_final=nota_final,
                data_inicio=datetime.utcnow(),
                tentativas=1
            )
            db.session.add(progresso)
        else:
            progresso.tentativas += 1
            progresso.nota_final = nota_final

        if nota_final >= 80:
            progresso.status = "concluido"
            progresso.data_conclusao = datetime.utcnow()
        else:
            progresso.status = "em_andamento"
            progresso.data_conclusao = None

        db.session.commit()
        return progresso
