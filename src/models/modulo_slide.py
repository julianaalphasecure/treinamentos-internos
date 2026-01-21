from src.config.database import db

class ModuloSlide(db.Model):
    __tablename__ = "modulo_slide"

    id = db.Column(db.Integer, primary_key=True)
    imagem_url = db.Column(db.String(255), nullable=False)
    modo = db.Column(db.String(10), nullable=False)
    ordem = db.Column(db.Integer, nullable=False)

    modulo_id = db.Column(
        db.Integer,
        db.ForeignKey("modulo.id"),
        nullable=False
    )

    modulo = db.relationship(
        "Modulo",
        back_populates="slides"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "imagem_url": self.imagem_url,
            "modo": self.modo,
            "modulo_id": self.modulo_id,
            "ordem": self.ordem
        }
