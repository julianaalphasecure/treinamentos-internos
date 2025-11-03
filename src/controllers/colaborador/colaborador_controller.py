from flask import Blueprint, request, jsonify
from src.services.colaborador.colaborador_service import ColaboradorService

colaborador_bp = Blueprint("colaborador_bp", __name__)

# ====== Listar todos colaboradores ======
@colaborador_bp.route("/", methods=["GET"])
def listar_colaboradores():
    colaboradores = ColaboradorService.get_all_colaboradores()
    return jsonify([c.to_dict() for c in colaboradores]), 200

# ====== Atualizar status ======
@colaborador_bp.route("/status/<int:colaborador_id>", methods=["PUT"])
def atualizar_status(colaborador_id):
    data = request.get_json()
    status = data.get("status")
    if status not in ["online", "offline"]:
        return jsonify({"error": "Status inválido"}), 400

    colaborador = ColaboradorService.set_status(colaborador_id, status)
    if not colaborador:
        return jsonify({"error": "Colaborador não encontrado"}), 404

    return jsonify(colaborador.to_dict()), 200
