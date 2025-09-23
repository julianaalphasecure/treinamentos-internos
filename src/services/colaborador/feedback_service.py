from src.config.database import db
from src.models.feedback import Feedback

class FeedbackService:
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
        
        allowed_fields = ["id_gestor", "id_colaborador", "mensagem"]
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