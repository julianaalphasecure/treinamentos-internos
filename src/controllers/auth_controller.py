from flask import Blueprint, request, jsonify, render_template
from src.services.auth_service import AuthService

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")
auth_service = AuthService()

# --- Cadastro via JSON ---
@auth_bp.route("/cadastro", methods=["POST"])
def registrar():
    dados = request.get_json()  # Recebe JSON do fetch
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

# --- Formulário de cadastro via GET ---
@auth_bp.route("/cadastro", methods=["GET"])
def registrar_form():
    return render_template("auth/cadastro.html")

# --- Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    dados = request.get_json()  # Recebe JSON do fetch
    email = dados.get("email")
    senha = dados.get("senha")

    usuario = auth_service.autenticar_usuario(email=email, senha=senha)

    if usuario:
        # Retorna JSON com dados do usuário (pode incluir token JWT aqui)
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
