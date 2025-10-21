from flask import Blueprint, request, jsonify
from src.services.colaborador.config_feedback_service import ConfigFeedbackService

config_feedback_bp = Blueprint("config_feedback_bp", __name__, url_prefix="/configuracoes/feedback")

@config_feedback_bp.route("/", methods=["POST"])
def enviar_feedback():
    data = request.get_json()
    colaborador_id = data.get("colaborador_id")
    tipo = data.get("tipo")
    mensagem = data.get("mensagem")
    
    if not colaborador_id or not tipo or not mensagem:
        return jsonify({"error": "Dados incompletos"}), 400
    
    sucesso = ConfigFeedbackService.enviar_feedback(colaborador_id, tipo, mensagem)
    if sucesso:
        return jsonify({"message": "Feedback enviado com sucesso!"}), 200
    return jsonify({"error": "Erro ao enviar feedback"}), 500
