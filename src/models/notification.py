from src.config.database import db

class Notification(db.Model):
    __tablename__ = "notification"

id = db.Column(db.Integer, primary_key=True, autoincrement=True)
usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
titulo = db.Column(db.String(200), nullable=False)
mensagem = db.Column(db.Text, nullable=True)
lida = db.Column(db.Boolean, default=False, nullable=False)
data_criacao = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

usuario = db.relationship("Usuario", backref=db.backref("notifications", cascade="all, delete-orphan"))

def to_dict(self):
    return {
        "id": self.id,
        "usuario_id": self.usuario_id,
        "titulo": self.titulo,
        "mensagem": self.mensagem,
        "lida": self.lida,
        "data_criacao": self.data_criacao
    }
