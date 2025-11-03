from src.config.database import db, bcrypt
from src.models.usuario import Usuario
from src.models.colaborador import Colaborador
from src.models.progresso import Progresso
from src.models.modulos import Modulo
from sqlalchemy import or_
from datetime import datetime

class AuthService:
    # --- Registrar usuário ---
    def registrar_usuario(self, re, nome, email, senha, tipo_acesso):
        if not all([re, nome, email, senha, tipo_acesso]):
            return None, "Todos os campos são obrigatórios."

        tipo_acesso = tipo_acesso.lower().strip()
        if tipo_acesso not in ["colaborador", "gestor"]:
            return None, "Tipo de acesso inválido. Escolha 'colaborador' ou 'gestor'."

        existente = Usuario.query.filter(
            or_(Usuario.re == re, Usuario.email == email)
        ).first()
        if existente:
            return None, "Usuário já existe."

        try:
            usuario = Usuario(re=re, nome=nome, email=email, tipo_acesso=tipo_acesso)
            usuario.set_password(senha)

            db.session.add(usuario)
            db.session.flush()  # garante que o id seja gerado

            # --- Se for colaborador ---
            if tipo_acesso == "colaborador":
                # Cria registro na tabela Colaborador
                colaborador = Colaborador(
                    id=usuario.id,
                    nome=nome,
                    email=email,
                    re=re,
                    status="offline",
                    ultimo_login=datetime.utcnow()
                )
                db.session.add(colaborador)

                # Cria registros de progresso inicial para todos os módulos
                modulos = Modulo.query.all()
                for modulo in modulos:
                    progresso = Progresso(
                        usuario_id=usuario.id,
                        modulo_id=modulo.id,
                        status='nao_iniciado',
                        nota_final=0
                    )
                    db.session.add(progresso)

            db.session.commit()
            return usuario, None
        except Exception as e:
            db.session.rollback()
            print("Erro ao cadastrar usuário:", e)
            return None, "Erro interno no servidor."

    # --- Autenticar usuário ---
    def autenticar_usuario(self, email, senha):
        if not email or not senha:
            return None
        usuario = Usuario.query.filter_by(email=email).first()
        if usuario and usuario.check_password(senha):
            return usuario
        return None
