from flask import Blueprint, request, jsonify
from src.services.gestor.relatorio_service import RelatorioService

relatorio_bp = Blueprint("relatorio_bp", __name__)

@relatorio_bp.route("/", methods=["GET"])
def listar_relatorios():
    relatorios = RelatorioService.get_all_relatorio()
    return jsonify([r.to_dict() for r in relatorios]), 200

@relatorio_bp.route("/<int:relatorio_id>", methods=["GET"])
def obter_relatorio(relatorio_id):
    relatorio = RelatorioService.get_relatorio_by_id(relatorio_id)
    if relatorio:
        return jsonify(relatorio.to_dict()), 200
    return jsonify({"error": "Relatório não encontrado"}), 404

@relatorio_bp.route("/", methods=["POST"])
def criar_relatorio():
    data = request.get_json()
    relatorio = RelatorioService.create_relatorio(data)
    return jsonify(relatorio.to_dict()), 201

@relatorio_bp.route("/<int:relatorio_id>", methods=["PUT"])
def atualizar_relatorio(relatorio_id):
    data = request.get_json()
    relatorio = RelatorioService.update_relatorio(relatorio_id, data)
    if relatorio:
        return jsonify({"message": "Relatório atualizado com sucesso", "relatorio": relatorio.to_dict()}), 200
    return jsonify({"error": "Relatório não encontrado"}), 404

@relatorio_bp.route("/<int:relatorio_id>", methods=["DELETE"])
def deletar_relatorio(relatorio_id):
    relatorio = RelatorioService.delete_relatorio(relatorio_id)
    if relatorio:
        return jsonify({"message": "Relatório deletado com sucesso"}), 200
    return jsonify({"error": "Relatório não encontrado"}), 404
