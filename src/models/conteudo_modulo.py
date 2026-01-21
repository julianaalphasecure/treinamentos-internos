from src.config.database import db

class ConteudoModulo(db.Model):
    __tablename__ = "conteudo_modulo"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    modulo_id = db.Column(
        db.Integer,
        db.ForeignKey("modulo.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    tipo = db.Column(
        db.Enum("texto", "imagem", "video", "arquivo", name="conteudo_tipo_enum"),
        nullable=False
    )

    conteudo = db.Column(db.Text, nullable=False)
    ordem = db.Column(db.Integer, nullable=False, default=1)

    modulo = db.relationship(
        "Modulo",
        backref=db.backref(
            "conteudos",
            cascade="all, delete-orphan",
            order_by="ConteudoModulo.ordem"
        )
    )

    def to_dict(self):
        return {
            "id": self.id,
            "modulo_id": self.modulo_id,
            "tipo": self.tipo,
            "conteudo": self.conteudo,
            "ordem": self.ordem
        }
