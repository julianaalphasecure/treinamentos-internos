from src.config.database import db

class Relatorio(db.Model):
    __tablename__ = "relatorio"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    gestor_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="SET NULL"), nullable=True, index=True)
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    gestor = db.relationship("Usuario", foreign_keys=[gestor_id], backref="relatorios")

    def to_dict(self):
        return {
            "id": self.id,
            "gestor_id": self.gestor_id,
            "titulo": self.titulo,
            "conteudo": self.conteudo,
            "data_criacao": self.data_criacao
        }
