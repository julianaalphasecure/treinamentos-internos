from src.config.database import db

class PasswordReset(db.Model):
    __tablename__ = "password_reset"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
    token = db.Column(db.String(255), nullable=False, unique=True)
    data_expiracao = db.Column(db.DateTime, nullable=False)
    usado = db.Column(db.Boolean, default=False, nullable=False)

    usuario = db.relationship("Usuario", backref=db.backref("password_resets", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "token": self.token,
            "data_expiracao": self.data_expiracao,
            "usado": self.usado
        }
