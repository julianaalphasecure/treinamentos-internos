from flask import Blueprint, request, jsonify
from src.services.colaborador.feedback_service import FeedbackService # Importação correta
from flask_jwt_extended import jwt_required, get_jwt_identity 

relatorio_bp = Blueprint("relatorio_bp", __name__)

@relatorio_bp.route("/", methods=["POST"])
@jwt_required()
def criar_relatorio():
    data_raw = request.get_json()
    gestor_id = get_jwt_identity()


    feedback_data = {
        "mensagem": data_raw.get("mensagem"), 
        "colaborador_id": data_raw.get("colaborador_id"), 
        "gestor_id": gestor_id 
        }

    if not feedback_data["colaborador_id"] or not feedback_data["mensagem"]:
        return jsonify({"error": "Colaborador e mensagem são obrigatórios"}), 400


    feedback = FeedbackService.create_feedback(feedback_data)
    return jsonify(feedback.to_dict()), 201

# [Rotas PUT e DELETE...]
@relatorio_bp.route("/<int:relatorio_id>", methods=["PUT"])
def atualizar_relatorio(relatorio_id):
    data = request.get_json()
    feedback = FeedbackService.update_feedback(relatorio_id, data)
    if feedback:
        return jsonify({"message": "Feedback atualizado com sucesso", "feedback": feedback.to_dict()}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404

@relatorio_bp.route("/<int:relatorio_id>", methods=["DELETE"])
def deletar_relatorio(relatorio_id):
    feedback = FeedbackService.delete_feedback(relatorio_id)
    if feedback:
        return jsonify({"message": "Feedback deletado com sucesso"}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404