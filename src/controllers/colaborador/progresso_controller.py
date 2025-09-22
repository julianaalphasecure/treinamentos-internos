#colaborador/progresso
from flask import Blueprint, request, jsonify
from src.services.colaborador.progresso_service import ProgressoService

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")

@progresso_bp.route("/", methods=["GET"])
def listar_progresso():
    progresso = ProgressoService.get_all_progresso()
    return jsonify([p.to_dict() for p in progresso]), 200

@progresso_bp.route("/<int:progresso_id>", methods=["GET"])
def obter_progresso(progresso_id):
    progresso = ProgressoService.get_progresso_by_id(progresso_id)
    if progresso:
        return jsonify(progresso.to_dict()), 200
    return jsonify({"error": "Progresso não encontrado"}), 404

@progresso_bp.route("/", methods=["POST"])
def criar_progresso():
    data = request.get_json()
    progresso = ProgressoService.create_progresso(data)
    return jsonify(progresso.to_dict()), 201

@progresso_bp.route("/<int:progresso_id>", methods=["PUT"])
def atualizar_progresso(progresso_id):
    data = request.get_json()
    progresso = ProgressoService.update_progresso(progresso_id, data)
    if progresso:
        return jsonify({"message": "Progresso atualizado com sucesso", "progresso": progresso.to_dict()}), 200
    return jsonify({"error": "Progresso não encontrado"}), 404

@progresso_bp.route("/<int:progresso_id>", methods=["DELETE"])
def deletar_progresso(progresso_id):
    progresso = ProgressoService.delete_progresso(progresso_id)
    if progresso:
       return jsonify({"message": "Progresso deletado com sucesso"}), 200
    return jsonify({"error": "Progresso não encontrado"}), 404
