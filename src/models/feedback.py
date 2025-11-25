from src.config.database import db


class Feedback(db.Model):
    __tablename__ = "feedback"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # GESTOR SEMPRE É O DESTINO DA DÚVIDA — NÃO DEVE SER NULL
    gestor_id = db.Column(
        db.Integer,
        db.ForeignKey("usuario.id"),
        nullable=False,
        index=True
    )

    # COLABORADOR QUE ENVIA — SEMPRE OBRIGATÓRIO
    colaborador_id = db.Column(
        db.Integer,
        db.ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # MENSAGEM NÃO PODE SER VAZIA
    mensagem = db.Column(db.Text, nullable=False)

    data_feedback = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    lido = db.Column(db.Boolean, default=False, nullable=False)

    gestor = db.relationship("Usuario", foreign_keys=[gestor_id])
    colaborador = db.relationship("Usuario", foreign_keys=[colaborador_id])

    def to_dict(self):
        return {
        "id": self.id,
        "gestor_id": self.gestor_id,
        "gestor_nome": self.gestor.nome if self.gestor else None,
        "colaborador_id": self.colaborador_id,
        "colaborador_nome": self.colaborador.nome if self.colaborador else None,
        "mensagem": self.mensagem,
        "data_feedback": self.data_feedback.isoformat() if self.data_feedback else None,
        "lido": self.lido
    }

