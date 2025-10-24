# models/usuario_notificacao.py
from src.config.database import db

class UsuarioNotificacao(db.Model):
    __tablename__ = "usuario_notificacao"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)
    tipo = db.Column(db.Enum("email", "push", name="tipo_notificacao_enum"), nullable=False)
    ativo = db.Column(db.Boolean, default=True, nullable=False)

    usuario = db.relationship("Usuario", backref=db.backref("preferencias_notificacao", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "tipo": self.tipo,
            "ativo": self.ativo
        }
