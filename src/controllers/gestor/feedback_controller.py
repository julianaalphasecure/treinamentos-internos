from flask import Blueprint, request, jsonify
from src.services.gestor.feedback_service import FeedbackService

gestor_feedback_bp = Blueprint("gestor_feedback_bp", __name__, url_prefix="/gestor/feedback")

@gestor_feedback_bp.route("/", methods=["GET"])
def listar_feedbacks():
    feedbacks = FeedbackService.get_all_feedbacks()
    return jsonify([f.to_dict() for f in feedbacks]), 200

@gestor_feedback_bp.route("/<int:feedback_id>", methods=["GET"])
def obter_feedback(feedback_id):
    feedback = FeedbackService.get_feedback_by_id(feedback_id)
    if feedback:
        return jsonify(feedback.to_dict()), 200
    return jsonify({"error": "Feedback não encontrado"}), 404

@gestor_feedback_bp.route("<int:feedback_id>", methods=["PUT"])
def atualizar_feedback(feedback_id):
    data = request.get_json()
    feedback = FeedbackService.update_feedback(feedback_id, data)
    if feedback:
        return jsonify({"message": "Feedback atualizado com sucesso", "feedback": feedback.to_dict()}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404

@gestor_feedback_bp.route("/<int:feedback_id>", methods=["DELETE"])
def deletar_feedback(feedback_id):
    feedback = FeedbackService.delete_feedback(feedback_id)
    if feedback:
        return jsonify({"message": "Feedback deletado com sucesso"}), 200
    return jsonify({"error": "feedback não encontrado"}), 404


