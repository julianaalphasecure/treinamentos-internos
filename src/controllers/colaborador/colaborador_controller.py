from flask import Blueprint, request, jsonify
from src.services.colaborador.colaborador_service import ColaboradorService
from src.models.colaborador import Colaborador

colaborador_bp = Blueprint("colaborador_bp", __name__)


@colaborador_bp.route("", methods=["GET"])
@colaborador_bp.route("/", methods=["GET"])
def listar_colaboradores():
    colaboradores = ColaboradorService.get_all_colaboradores()
    return jsonify([c.to_dict() for c in colaboradores]), 200



@colaborador_bp.route("/status/<int:colaborador_id>", methods=["GET"])
def obter_status(colaborador_id):
    colaborador = Colaborador.query.get(colaborador_id)
    if not colaborador:
        return jsonify({"error": "Colaborador não encontrado"}), 404

    return jsonify({
        "id": colaborador.id,
        "nome": colaborador.nome,
        "status": colaborador.status
    }), 200


@colaborador_bp.route("/status/<int:colaborador_id>", methods=["PUT"])
def atualizar_status(colaborador_id):
    data = request.get_json()
    status = data.get("status")

    if status not in ["online", "offline"]:
        return jsonify({"error": "Status inválido"}), 400

    colaborador = ColaboradorService.set_status(colaborador_id, status)
    if not colaborador:
        return jsonify({"error": "Colaborador não encontrado"}), 404

    return jsonify({
        "id": colaborador.id,
        "nome": colaborador.nome,
        "status": colaborador.status
    }), 200


@colaborador_bp.route("/progresso/<int:colaborador_id>", methods=["GET"])
def obter_progresso(colaborador_id):
    progresso = ColaboradorService.get_progresso(colaborador_id)
    if progresso is None:
        return jsonify({"error": "Progresso não encontrado"}), 404
    return jsonify(progresso), 200
