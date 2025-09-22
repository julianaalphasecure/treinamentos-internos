from src.config.database import db

class Feedback(db.Model):
    __tablename__ = "feedback"

id = db.Column(db.Integer, primary_key=True, autoincrement=True)
gestor_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="SET NULL"), nullable=True, index=True)
colaborador_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
mensagem = db.Column(db.Text, nullable=True)
data_feedback = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

gestor = db.relationship("Usuario", foreign_keys=[gestor_id], backref="feedbacks_dados")
colaborador = db.relationship("Usuario", foreign_keys=[colaborador_id], backref="feedbacks_recebidos")

def to_dict(self):
    return {
        "id": self.id,
        "gestor_id": self.gestor_id,
        "colaborador_id": self.colaborador_id,
        "mensagem": self.mensagem,
        "data_feedback": self.data_feedback
    }
