from src.config.database import db

class ModuloExercicio(db.Model):
    __tablename__ = "modulo_exercicio"

    id = db.Column(db.Integer, primary_key=True)

    enunciado = db.Column(db.Text, nullable=False)

    alternativa_a = db.Column(db.String(255), nullable=False)
    alternativa_b = db.Column(db.String(255), nullable=False)
    alternativa_c = db.Column(db.String(255), nullable=False)
    alternativa_d = db.Column(db.String(255), nullable=False)

    correta = db.Column(db.String(1), nullable=False)
   

    modulo_id = db.Column(
        db.Integer,
        db.ForeignKey("modulo.id"),
        nullable=False
    )

    modulo = db.relationship(
        "Modulo",
        back_populates="exercicios"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "enunciado": self.enunciado,
            "alternativa_a": self.alternativa_a,
            "alternativa_b": self.alternativa_b,
            "alternativa_c": self.alternativa_c,
            "alternativa_d": self.alternativa_d,
            "correta": self.correta,
            "modulo_id": self.modulo_id
        }
