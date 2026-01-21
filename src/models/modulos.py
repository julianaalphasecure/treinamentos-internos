from src.config.database import db

class Modulo(db.Model):
    __tablename__ = "modulo"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nome = db.Column(db.String(255), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    descricao = db.Column(db.Text, nullable=True)
    carga_horaria = db.Column(db.Integer, nullable=True)
    ativo = db.Column(db.Boolean, default=True, nullable=False)
    imagem_capa = db.Column(db.String(255), nullable=True)
    
    # Relacionamentos
    exercicios = db.relationship(
        "ModuloExercicio",
        back_populates="modulo",
        cascade="all, delete-orphan"
    )

    slides = db.relationship(
        "ModuloSlide",
        back_populates="modulo",
        cascade="all, delete-orphan"
    )
    
    exercicios_colaborador = db.relationship(
        "Exercicio",
        back_populates="modulo",
        cascade="all, delete-orphan"
    )

def to_dict(self):
    if self.imagem_capa:
        imagem_url = f"/static/uploads/modulos/capas/{self.imagem_capa}"
    else:
        imagem_url = None

    return {
        "id": self.id,
        "nome": self.nome,
        "titulo": self.titulo,
        "descricao": self.descricao,
        "carga_horaria": self.carga_horaria,
        "ativo": self.ativo,
        "imagem_capa": imagem_url
    }


