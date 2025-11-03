from flask import Blueprint, request, jsonify, render_template
from src.services.auth_service import AuthService
from src.services.colaborador.colaborador_service import ColaboradorService

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")
auth_service = AuthService()

# --- Cadastro ---
@auth_bp.route("/cadastro", methods=["POST"])
def registrar():
    dados = request.get_json()
    re = dados.get("re")
    nome = dados.get("nome")
    email = dados.get("email")
    senha = dados.get("senha")
    tipo_acesso = dados.get("tipo_acesso")

    usuario, erro = auth_service.registrar_usuario(re, nome, email, senha, tipo_acesso)

    if usuario:
        return jsonify({
            "success": True,
            "message": "Cadastro realizado com sucesso!",
            "usuario": usuario.to_dict()
        }), 200
    else:
        return jsonify({"success": False, "error": erro or "Falha ao registrar usuário"}), 400

# --- Login ---
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    usuario = auth_service.autenticar_usuario(
        data.get("email"),
        data.get("senha")
    )

    if not usuario:
        return jsonify({"error": "Credenciais inválidas"}), 401

    # Se for colaborador, atualiza status para online
    if usuario.tipo_acesso.lower() == "colaborador":
        ColaboradorService.set_status(usuario.id, "online")

    return jsonify({"success": True, "usuario": usuario.to_dict()}), 200

# --- Logout ---
@auth_bp.route("/logout", methods=["POST"])
def logout():
    data = request.get_json()
    email = data.get("email")

    usuario = auth_service.autenticar_usuario(email, "")  # pega usuário pelo email
    if usuario and usuario.tipo_acesso.lower() == "colaborador":
        ColaboradorService.set_status(usuario.id, "offline")

    return jsonify({"message": "Logout realizado com sucesso"}), 200

# --- Formulário de cadastro/login (HTML) ---
@auth_bp.route("/cadastro", methods=["GET"])
def cadastro_form():
    return render_template("auth/cadastro.html")

@auth_bp.route("/login", methods=["GET"])
def login_form():
    return render_template("auth/login.html")
