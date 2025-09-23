from src.config.database import db

class Equipe(db.Model):
    __tablename__ = "equipe"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(100), nullable=False)
    gestor_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)

    gestor = db.relationship("Usuario", backref="equipes", foreign_keys=[gestor_id])

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "gestor_id": self.gestor_id,
        }


class EquipeColaborador(db.Model):
    __tablename__ = "equipe_colaborador"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    equipe_id = db.Column(db.Integer, db.ForeignKey("equipe.id", ondelete="CASCADE"), nullable=False)
    colaborador_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False)

    equipe = db.relationship("Equipe", backref=db.backref("colaboradores", cascade="all, delete-orphan"))
    colaborador = db.relationship("Usuario", backref="equipes_colaborador")

    def to_dict(self):
        return {
            "id": self.id,
            "equipe_id": self.equipe_id,
            "colaborador_id": self.colaborador_id
        }
