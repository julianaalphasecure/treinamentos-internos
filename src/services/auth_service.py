from src.config.database import db, bcrypt
from src.models.usuario import Usuario
from sqlalchemy import or_

class AuthService:
    def registrar_usuario(self, re, nome, email, senha, tipo_acesso):
        # Validação básica de campos
        if not all([re, nome, email, senha, tipo_acesso]):
            return None, "Todos os campos são obrigatórios."

        # Garantir que o tipo de acesso seja válido
        tipo_acesso = tipo_acesso.lower().strip()
        if tipo_acesso not in ["colaborador", "gestor"]:
            return None, "Tipo de acesso inválido. Escolha 'colaborador' ou 'gestor'."

        # Verifica se já existe usuário com mesmo RE ou email
        existente = Usuario.query.filter(
            or_(Usuario.re == re, Usuario.email == email)
        ).first()
        if existente:
            return None, "Usuário já existe."

        try:
            # Cria o usuário
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
            print("Erro ao cadastrar usuário:", e)  # Para debug no terminal
            return None, "Erro interno no servidor."

    def autenticar_usuario(self, email, senha):
        if not email or not senha:
            return None
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario and usuario.check_password(senha):
            return usuario
        return None
