from src.config.database import db

class Exercicio(db.Model):
    __tablename__ = "exercicio"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    modulo_id = db.Column(db.Integer, db.ForeignKey("modulo.id", ondelete="CASCADE"), nullable=False, index=True)
    titulo = db.Column(db.String(150), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    tipo = db.Column(db.Enum("multipla_escolha", "dissertativo", "pratico", name="exercicio_tipo_enum"), nullable=True)
    resposta_correta = db.Column(db.Text, nullable=True)

    modulo = db.relationship(
        "Modulo",
        back_populates="exercicios_colaborador"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "modulo_id": self.modulo_id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "tipo": self.tipo,
            "resposta_correta": self.resposta_correta,
        }

