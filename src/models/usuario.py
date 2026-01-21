from src.config.database import db, bcrypt


class Usuario(db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    re = db.Column(db.String(20), unique=True, nullable=False, index=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=True, index=True)
    senha_hash = db.Column(db.String(255), nullable=False)
    tipo_acesso = db.Column(
        db.Enum("colaborador", "gestor", name="tipo_acesso_enum"),
        nullable=False
    )
    telefone = db.Column(db.String(20))
    departamento = db.Column(db.String(100))
    foto = db.Column(db.String(255))

    data_criacao = db.Column(db.DateTime, server_default=db.func.now(), nullable=False)

    def set_password(self, senha):
        self.senha_hash = bcrypt.generate_password_hash(senha).decode("utf-8")

    def check_password(self, senha):
        return bcrypt.check_password_hash(self.senha_hash, senha)

    def to_dict(self):
        return {
            "id": self.id,
            "re": self.re,
            "nome": self.nome,
            "email": self.email,
            "tipo_acesso": self.tipo_acesso,
            "data_criacao": self.data_criacao,
            "telefone": self.telefone,
            "departamento": self.departamento,
            "foto": self.foto,
            
        }
