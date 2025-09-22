from flask import Blueprint, request, jsonify
from src.services.colaborador.perfil_service import PerfilService

perfil_bp = Blueprint("perfil_bp", __name__, url_prefix="/colaborador/perfil")

@perfil_bp.route("/<int:usuario_id", methods=["GET"])
def obter_perfil(usuario_id):
    usuario = PerfilService.get_perfil(usuario_id)
    if usuario:
        return jsonify(usuario.to_dict()), 200
    return jsonify({"error": "Usuário não encontrado"}), 404

@perfil_bp.route("/<int:usuario_id>", methods=["PUT"])
def atualizar_perfil(usuario_id):
    data = request.get_json()
    usuario = PerfilService.update_perfil(usuario_id, data)
    if usuario:
        return jsonify({"message": "Perfil atualizado com sucesso", "usuario": usuario.to_dict()}), 200
    return jsonify({"error": "Usuário não encontrado"}), 404