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

    @staticmethod
    def inicializar_progresso_usuario(usuario_id):
        """Garante que o usuário tenha progresso para todos os módulos."""
        modulos = Modulo.query.all()
        for modulo in modulos:
            existente = Progresso.query.filter_by(
                usuario_id=usuario_id,
                modulo_id=modulo.id
            ).first()

            if not existente:
                novo = Progresso(
                    usuario_id=usuario_id,
                    modulo_id=modulo.id,
                    status="nao_iniciado",
                    nota_final=None,
                    tentativas=0
                )
                db.session.add(novo)

        db.session.commit()

    # >>> FUNÇÃO FINALIZAR MÓDULO CORRIGIDA <<<
    @staticmethod
    def finalizar_modulo(usuario_id, modulo_id, nota_final):
        progresso = Progresso.query.filter_by(
            usuario_id=usuario_id,
            modulo_id=modulo_id
        ).first()

        # Se não existe progresso, cria com tentativas = 0
        if not progresso:
            progresso = Progresso(
                usuario_id=usuario_id,
                modulo_id=modulo_id,
                status="em_andamento",
                nota_final=nota_final,
                data_inicio=datetime.utcnow(),
                tentativas=1   # primeira tentativa real
            )
            db.session.add(progresso)

        else:
            # Se ainda não tinha tentado antes
            if progresso.tentativas == 0:
                progresso.tentativas = 1
            else:
                progresso.tentativas += 1

            progresso.nota_final = nota_final

        # Se atingiu a nota, conclui
        if nota_final >= 80:
            progresso.status = "concluido"
            progresso.data_conclusao = datetime.utcnow()
        else:
            progresso.status = "em_andamento"
            progresso.data_conclusao = None

        db.session.commit()
        return progresso
