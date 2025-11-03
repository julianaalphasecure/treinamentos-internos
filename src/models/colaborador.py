from datetime import datetime
from src.config.database import db

class Colaborador(db.Model):
    __tablename__ = "colaboradores"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(150), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    re = db.Column(db.String(20))
    foto = db.Column(db.String(250))
    status = db.Column(db.String(10), default="offline")  # online / offline
    ultimo_login = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "re": self.re,
            "foto": self.foto,
            "status": self.status,
            "ultimo_login": self.ultimo_login.isoformat() if self.ultimo_login else None
        }
