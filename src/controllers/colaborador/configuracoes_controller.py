from flask import Blueprint, request, jsonify
from src.services.colaborador.configuracoes_service import ConfiguracoesService

configuracoes_bp = Blueprint("configuracoes_bp", __name__)

@configuracoes_bp.route("/<int:usuario_id>", methods=["PUT"])
def atualizar_configuracoes(usuario_id):
    data = request.get_json()
    usuario = ConfiguracoesService.atualizar_configuracoes(usuario_id, data)
    if usuario:
        return jsonify({"message": "Configurações atualizadas com sucesso", "usuario": usuario.to_dict()}), 200
    return jsonify({"error": "Usuário não encontrado"}), 404