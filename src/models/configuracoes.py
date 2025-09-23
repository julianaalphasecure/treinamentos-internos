from src.config.database import db

class Configuracoes(db.Model):
    __tablename__ = "configuracoes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    colaborador_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
    notificacoes_email = db.Column(db.Boolean, default=True)
    notificacoes_push = db.Column(db.Boolean, default=True)
    tema = db.Column(db.String(20), default='claro')
    idioma = db.Column(db.String(10), default='pt-BR')
    privacidade_perfil = db.Column(db.Boolean, default=False)

    colaborador = db.relationship("Usuario", backref=db.backref("configuracoes", cascade="all, delete-orphan"))

    def to_dict(self):
        return {
            "id": self.id,
            "colaborador_id": self.colaborador_id,
            "notificacoes_email": self.notificacoes_email,
            "notificacoes_push": self.notificacoes_push,
            "tema": self.tema,
            "idioma": self.idioma,
            "privacidade_perfil": self.privacidade_perfil
        }
