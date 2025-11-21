from src.config.database import db
from src.models.feedback import Feedback
from sqlalchemy import func


class FeedbackService:

    # =============================
    # CRUD BÁSICO
    # =============================
    @staticmethod
    def get_all_feedbacks():
        return Feedback.query.all()
    
    @staticmethod
    def get_feedback_by_id(feedback_id):
        return Feedback.query.get(feedback_id)
    
    @staticmethod
    def create_feedback(data):
        feedback = Feedback(**data)
        db.session.add(feedback)
        db.session.commit()
        return feedback
    
    @staticmethod
    def update_feedback(feedback_id, data):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return None
        
        allowed_fields = ["gestor_id", "colaborador_id", "mensagem"]
        for key, value in data.items():
            if key in allowed_fields:
                setattr(feedback, key, value)

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
    

    # =============================
    # FILTRAGEM CORRETA
    # =============================
    @staticmethod
    def get_feedbacks_by_colaborador(colaborador_id):
        """
        Lista somente FEEDBACKS enviados por gestores.
        O prefixo deve ser: [FEEDBACK]
        """
        return Feedback.query.filter(
            Feedback.colaborador_id == colaborador_id,
            Feedback.mensagem.like('[FEEDBACK]%')
        ).order_by(Feedback.data_feedback.desc()).all()


    @staticmethod
    def get_feedbacks_by_gestor(gestor_id):
        """
        Lista somente DÚVIDAS enviadas por colaboradores.
        O prefixo deve ser: [DÚVIDA]
        """
        return Feedback.query.filter(
            Feedback.gestor_id == gestor_id,
            Feedback.mensagem.like('[DÚVIDA]%')
        ).order_by(Feedback.data_feedback.desc()).all()


    # =============================
    # MARCAR COMO LIDO
    # =============================
    @staticmethod
    def marcar_como_lido(feedback_id):
        feedback = Feedback.query.get(feedback_id)
        if not feedback:
            return None

        feedback.lido = True
        db.session.commit()
        return feedback
