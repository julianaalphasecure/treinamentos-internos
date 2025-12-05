from src.config.database import db
from src.models.feedback import Feedback
from sqlalchemy import desc

PREFIXO_DUVIDA = "[duvida-modulo]"


class FeedbackService:

    # ===============================
    # COLABORADOR → RECEBE FEEDBACK
    # ===============================
    @staticmethod
    def get_feedbacks_para_colaborador(colaborador_id):
        """Feedbacks reais recebidos pelo colaborador (não inclui dúvidas)."""
        return Feedback.query.filter(
            Feedback.colaborador_id == colaborador_id,
            ~Feedback.mensagem.like(f"{PREFIXO_DUVIDA}%")
        ).order_by(Feedback.data_feedback.desc()).all()

    # ===============================
    # COLABORADOR → ENVIA DÚVIDA
    # ===============================
    @staticmethod
    def get_duvidas_enviadas_por_colaborador(colaborador_id):
        return Feedback.query.filter(
            Feedback.colaborador_id == colaborador_id,
            Feedback.mensagem.like(f"{PREFIXO_DUVIDA}%")
        ).order_by(Feedback.data_feedback.desc()).all()

    # ===============================
    # GESTOR → RECEBE DÚVIDAS
    # ===============================
    @staticmethod
    def get_duvidas_para_gestor(gestor_id):
        return Feedback.query.filter(
            Feedback.gestor_id == gestor_id,
            Feedback.mensagem.like(f"{PREFIXO_DUVIDA}%")
        ).order_by(Feedback.data_feedback.desc()).all()

    # ===============================
    # GESTOR → RESPONDE DÚVIDA
    # ===============================
    @staticmethod
    def responder_duvida(feedback_original, resposta, gestor_id):
        """
        Cria um novo feedback como resposta à dúvida.
        A resposta é enviada APENAS ao colaborador que enviou a dúvida.
        """

        novo_feedback = Feedback(
            colaborador_id=feedback_original.colaborador_id,    # ← envia para o colaborador correto
            gestor_id=gestor_id,                               # ← resposta veio de qual gestor
            mensagem=resposta,                                 # ← sem prefixo
            lido=False
        )

        db.session.add(novo_feedback)
        db.session.commit()
        return novo_feedback

    # ===============================
    # GESTOR → ENVIA FEEDBACK (genérico)
    # ===============================
    @staticmethod
    def create_feedback(data):
        if "lido" not in data:
            data["lido"] = False
        feedback = Feedback(**data)
        db.session.add(feedback)
        db.session.commit()
        return feedback

    # ===============================
    # FERRAMENTAS GERAIS
    # ===============================
    @staticmethod
    def get_feedback_by_id(feedback_id):
        """Busca um feedback específico pelo ID."""
        return Feedback.query.get(feedback_id)

    @staticmethod
    def marcar_como_lido(feedback_id):
        feedback = Feedback.query.get(feedback_id)
        if feedback and not feedback.lido:
            feedback.lido = True
            db.session.commit()
        return feedback

    @staticmethod
    def delete_feedback(feedback_id):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return None

        db.session.delete(feedback)
        db.session.commit()
        return feedback
