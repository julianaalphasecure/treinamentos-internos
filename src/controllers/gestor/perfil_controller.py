from flask import Blueprint,request, jsonify
from src.services.gestor.perfil_service import PerfilService

perfil_bp = Blueprint("perfil_gestor_bp", __name__, url_prefix="/gestor/perfil")

@perfil_bp.route("/<int:gestor_id>", methods=["GET"])
def obter_perfil(gestor_id):
    gestor = PerfilService.get_perfil(gestor_id)
    if gestor:
        return jsonify(gestor.to_dict()), 200
    return jsonify({"error": "Gestor não encontrado"}), 404

@perfil_bp.route("/<int:gestor_id>", methods=["PUT"])
def atualizar_perfil(gestor_id):
    data = request.get_json
    gestor = PerfilService.update_perfil(gestor_id, data)
    if gestor:
        return jsonify({"message": "Perfil atualizado com sucesso", "gestor": gestor.to_dict()}), 200
    return jsonify({"error": "Gestor não encontrado"}), 404
