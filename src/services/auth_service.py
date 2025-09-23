from src.config.database import db, bcrypt
from src.models.usuario import Usuario
from sqlalchemy import or_

class AuthService:
    def registrar_usuario(self, re, nome, email, senha, tipo_acesso):
        existente = Usuario.query.filter(
            or_(Usuario.re == re, Usuario.email == email)
        ).first()
        if existente:
            return None, "Usuário já existe."

        try:
            usuario = Usuario(
                re=re,
                nome=nome,
                email=email,
                tipo_acesso=tipo_acesso
            )
            usuario.set_password(senha)

            db.session.add(usuario)
            db.session.commit()
            return usuario, None
        except Exception as e:
            db.session.rollback()
            return None, str(e)
    
    def autenticar_usuario(self, email, senha):
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario and usuario.check_password(senha):
            return usuario
        return None
