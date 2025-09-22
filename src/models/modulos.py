from src.config.database import db

class Modulo(db.Model):
    __tablename__ = "modulo"

id = db.Column(db.Integer, primary_key=True, autoincrement=True)
titulo = db.Column(db.String(200), nullable=False)
descricao = db.Column(db.Text, nullable=True)
carga_horaria = db.Column(db.Integer, nullable=True)
ativo = db.Column(db.Boolean, default=True, nullable=False)

def to_dict(self):
    return {
        "id": self.id,
        "titulo": self.titulo,
        "descricao": self.descricao,
        "carga_horaria": self.carga_horaria,
        "ativo": self.ativo
    }
