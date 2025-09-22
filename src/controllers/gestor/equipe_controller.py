from flask import Blueprint, request, jsonify
from src.services.gestor.equipe_service import EquipeService

equipe_bp = Blueprint("equipe_bp", __name__, url_prefix="/gestor/equipe")

@equipe_bp.route("/", methods=["GET"])
def listar_equies():
    equipes = EquipeService.get_equipe_all_equipes()
    return jsonify([e.to_dict() for e in equipes()]), 200

@equipe_bp.route("<int:equipe_id>", methods=["GET"])
def obter_equipe(equipe_id):
    equipe = EquipeService.get_equipe_by_id(equipe_id)
    if equipe:
        return jsonify(equipe.to_dict()), 200
    return jsonify({"error": "Equipe não encontrada"}), 404

@equipe_bp.route("/", methods=["POST"])
def criar_equipe():
    data = request.get_json()
    equipe = EquipeService.create_equipe(data)
    return jsonify(equipe.to_dict()), 201

@equipe_bp.route("/<int:equipe_id>", methods=["PUT"])
def atualizar_equipe(equipe_id):
    data = request.get_json()
    equipe = EquipeService.update_equipe(equipe_id, data)
    if equipe:
        return jsonify({"message": "Equipe atualizada com sucesso", "equipe": equipe.to_dict()}), 200
    return jsonify({"error": "Equipe não encontrada"}), 404

@equipe_bp.route("/<int:equipe_id>", methods=["DELETE"])
def deletar_equipe(equipe_id):
    equipe = EquipeService.delete_equipe(equipe_id)
    if equipe:
        return jsonify({"message": "Equipe deletada com sucesso"}), 200
    return jsonify({"error": "Equipe não encontrada"}), 404