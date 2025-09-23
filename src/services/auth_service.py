from src.config.database import db, bcrypt
from src.models.usuario import Usuario

class AuthService:
    def __init__(self):
        pass

    def registrar_usuario(self, re, nome, email, senha, tipo_acesso):
        if Usuario.query.filter(Usuario.re == re) | (Usuario.email == email).first():
            return None
        
        usuario = Usuario(
            re=re,
            nome=nome,
            email=email,
            tipo_acesso=tipo_acesso
        )

        usuario.set_password(senha)

        db.session.add(usuario)
        db.session.commit()
        return usuario
    
    def autenticar_usuario(self, email, senha):
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario and usuario.check_password(senha):
            return usuario
        return None