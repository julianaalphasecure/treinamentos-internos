from flask import Blueprint, request, jsonify
from src.services.auth_service import AuthService

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")
auth_service = AuthService()

@auth_bp.route("/registrar", methods=["POST"])
def registrar():
    data = request.get_json()
    usuario, erro = auth_service.registrar_usuario(
        re=data.get("re"),
        nome=data.get("nome"),
        email=data.get("email"),
        senha=data.get("senha"),
        tipo_acesso=data.get("tipo_acesso")
    )

    if usuario:
        return jsonify({
            "message": "Usuário registrado com sucesso",
            "usuario": usuario.to_dict()
        }), 201
    else:
        return jsonify({"error": erro or "Falha ao registrar usuário"}), 400


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    usuario = auth_service.autenticar_usuario(
        email=data.get("email"),
        senha=data.get("senha")
    )

    if usuario:
        return jsonify({
            "message": "Login realizado com sucesso",
            "usuario": usuario.to_dict()
        }), 200
    return jsonify({"error": "Email ou senha inválidos"}), 401
