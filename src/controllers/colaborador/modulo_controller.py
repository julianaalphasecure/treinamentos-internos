from flask import Blueprint, request, jsonify
from src.services.colaborador.modulo_service import ModuloService

modulo_bp = Blueprint("modulo_bp", __name__, url_prefix="/colaborador/modulo")

# ROTA RAIZ UNIFICADA: Lida com GET (Listar Todos) e POST (Criar)
@modulo_bp.route("/", methods=["GET", "POST"])
def gerenciar_modulos():
    if request.method == "POST":
        # criar_modulo
        data = request.get_json()
        modulo = ModuloService.create_modulo(data)
        return jsonify(modulo.to_dict()), 201

    # GET: listar_modulos
    modulos = ModuloService.get_all_modulos()
    return jsonify([m.to_dict() for m in modulos]), 200

# ROTA COM ID UNIFICADA: Lida com GET, PUT e DELETE
@modulo_bp.route("/<int:modulo_id>", methods=["GET", "PUT", "DELETE"])
def gerenciar_modulo_por_id(modulo_id):
    if request.method == "GET":
        # obter_modulo
        modulo = ModuloService.get_modulo_by_id(modulo_id)
        if modulo:
            return jsonify(modulo.to_dict()), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "PUT":
        # atualizar_modulo
        data = request.get_json()
        modulo = ModuloService.update_modulo(modulo_id, data)
        if modulo:
            return jsonify({"message": "Módulo atualizado com sucesso", "modulo": modulo.to_dict()}), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "DELETE":
        # deletar_modulo
        modulo = ModuloService.delete_modulo(modulo_id)
        if modulo:
            return jsonify({"message": "Módulo deletado com sucesso"}), 200
        return jsonify({"error": "Módulo não encontrado"}), 404
        
    return jsonify({"error": "Método não permitido"}), 405