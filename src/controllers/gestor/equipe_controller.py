from flask import Blueprint, request, jsonify
from src.services.gestor.equipe_service import EquipeService
from src.services.colaborador.colaborador_service import ColaboradorService 
from flask_jwt_extended import jwt_required, get_jwt_identity 
from flask import Blueprint, render_template
from src.models.colaborador import Colaborador 

equipe_bp = Blueprint("equipe_bp", __name__)

@equipe_bp.route("/pagina", methods=["GET"])
def pagina_equipe():
    return render_template("gestor/equipe.html")


@equipe_bp.route("/", methods=["GET"])
@jwt_required()
def listar_equipe_colaboradores():
    colaboradores = Colaborador.query.order_by(Colaborador.nome.asc()).all()

    return jsonify([
        {
            "id": c.id,
            "nome": c.nome,
            "email": c.email,
            "re": c.re,
            "status": c.status,
            "foto": c.foto
        }
        for c in colaboradores
    ]), 200
   
@equipe_bp.route("/<int:equipe_id>", methods=["GET"])
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