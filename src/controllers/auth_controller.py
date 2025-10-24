from flask import Blueprint, request, jsonify, render_template, current_app
import os
from werkzeug.utils import secure_filename
from src.services.auth_service import AuthService
from src.models.usuario import Usuario
from src.models.usuario_notificacao import UsuarioNotificacao
from src.config.database import db

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")
auth_service = AuthService()

# --- Cadastro via JSON ---
@auth_bp.route("/cadastro", methods=["POST"])
def registrar():
    dados = request.get_json()
    re = dados.get("re")
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    tipo_acesso = dados.get("tipo_acesso")

    usuario, erro = auth_service.registrar_usuario(
        re=re,
        nome=nome,
        email=email,
        senha=senha,
        tipo_acesso=tipo_acesso
    )

    if usuario:
        return jsonify({"success": True, "message": "Cadastro realizado com sucesso!"}), 200
    else:
        return jsonify({"success": False, "error": erro or "Falha ao registrar usuário"}), 400

# --- Atualizar preferências de notificações ---
@auth_bp.route("/usuario/<int:id>/notificacoes", methods=["POST"])
def atualizar_notificacoes(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"success": False, "error": "Usuário não encontrado."}), 404

    dados = request.get_json()
    tipo = dados.get("tipo")
    status = dados.get("status")

    if tipo not in ["email", "push"] or status is None:
        return jsonify({"success": False, "error": "Dados inválidos."}), 400

    pref = UsuarioNotificacao.query.filter_by(usuario_id=id, tipo=tipo).first()
    if pref:
        pref.ativo = bool(status)
    else:
        pref = UsuarioNotificacao(usuario_id=id, tipo=tipo, ativo=bool(status))
        db.session.add(pref)

    try:
        db.session.commit()
        return jsonify({"success": True, "tipo": tipo, "status": bool(status)}), 200
    except Exception as e:
        db.session.rollback()
        print("Erro ao atualizar notificações:", e)
        return jsonify({"success": False, "error": "Erro interno ao atualizar notificações"}), 500

# --- Buscar preferências existentes ---
@auth_bp.route("/usuario/<int:id>/notificacoes", methods=["GET"])
def buscar_notificacoes(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"success": False, "error": "Usuário não encontrado."}), 404

    prefs = UsuarioNotificacao.query.filter_by(usuario_id=id).all()
    return jsonify({"success": True, "preferencias": [p.to_dict() for p in prefs]}), 200

# --- Formulário de cadastro via GET ---
@auth_bp.route("/cadastro", methods=["GET"])
def registrar_form():
    return render_template("auth/cadastro.html")

# --- Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("senha")

    usuario = auth_service.autenticar_usuario(email=email, senha=senha)

    if usuario:
        return jsonify({"success": True, "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "tipo_acesso": usuario.tipo_acesso
        }}), 200
    else:
        return jsonify({"success": False, "error": "Email ou senha inválidos"}), 400

@auth_bp.route("/login", methods=["GET"])
def login_form():
    return render_template("auth/login.html")

# --- Alterar senha ---
@auth_bp.route("/usuario/<int:id>/alterar-senha", methods=["POST"])
def alterar_senha(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"success": False, "error": "Usuário não encontrado"}), 404

    dados = request.get_json()
    senha_atual = dados.get("senha_atual")
    nova_senha = dados.get("nova_senha")

    if not usuario.check_password(senha_atual):
        return jsonify({"success": False, "error": "Senha atual incorreta"}), 400

    usuario.set_password(nova_senha)

    try:
        db.session.commit()
        return jsonify({"success": True, "message": "Senha alterada com sucesso!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Erro ao alterar senha"}), 500

# --- Buscar dados do usuário por ID ---
@auth_bp.route("/usuario/<int:id>", methods=["GET"])
def obter_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"success": False, "error": "Usuário não encontrado."}), 404

    return jsonify({"success": True, "usuario": usuario.to_dict()}), 200

# --- Atualizar dados do usuário ---
@auth_bp.route("/usuario/<int:id>", methods=["PUT"])
def atualizar_usuario(id):
    usuario = Usuario.query.get(id)
    if not usuario:
        return jsonify({"success": False, "error": "Usuário não encontrado."}), 404

    dados = request.form.to_dict()  # Se vier multipart (com imagem)
    telefone = dados.get("telefone")
    departamento = dados.get("departamento")

    if telefone is not None:
        usuario.telefone = telefone
    if departamento is not None:
        usuario.departamento = departamento

    if "foto" in request.files:
        foto = request.files["foto"]
        if foto.filename != "":
            nome_arquivo = secure_filename(foto.filename)
            caminho_fotos = os.path.join(current_app.root_path, "static/uploads/fotos")
            os.makedirs(caminho_fotos, exist_ok=True)
            caminho_arquivo = os.path.join(caminho_fotos, nome_arquivo)
            foto.save(caminho_arquivo)
            usuario.foto = f"/static/uploads/fotos/{nome_arquivo}"

    try:
        db.session.commit()
        return jsonify({"success": True, "usuario": usuario.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        print("Erro ao atualizar usuário:", e)
        return jsonify({"success": False, "error": "Erro ao atualizar dados."}), 500
