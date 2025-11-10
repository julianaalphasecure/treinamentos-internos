from flask import Blueprint, request, jsonify
from src.services.colaborador.feedback_service import FeedbackService
from flask_jwt_extended import jwt_required, get_jwt_identity

colab_feedback_bp = Blueprint("colab_feedback_bp", __name__, url_prefix="/colaborador/feedback")

@colab_feedback_bp.route("/meus-feedbacks", methods=["GET"])
@jwt_required() # Protege a rota
def listar_feedbacks_colaborador():
    """Rota para listar feedbacks DESTE colaborador."""
    # Extrai o ID do usuário logado do token JWT
    colaborador_id = get_jwt_identity() 
    
    # 🚨 LINHA DE DEBUG ADICIONADA:
    print(f"\n--- DEBUG (BUSCA): Colaborador logado buscando feedback com ID: {colaborador_id} ---\n") 
    
    feedbacks = FeedbackService.get_feedbacks_by_colaborador(colaborador_id)
    return jsonify([f.to_dict() for f in feedbacks]), 200

# ROTA PARA MARCAR COMO LIDO
@colab_feedback_bp.route("/marcar-lido/<int:feedback_id>", methods=["PUT"])
@jwt_required()
def marcar_feedback_lido(feedback_id):
    feedback = FeedbackService.marcar_como_lido(feedback_id)
    if feedback:
        return jsonify({"message": "Feedback marcado como lido", "lido": feedback.lido}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404


@colab_feedback_bp.route("/", methods=["POST"])
def criar_feedback():
    data = request.get_json()
    # ATENÇÃO: Esta rota / é a rota PÚBLICA do Colaborador. A criação DEVE ser protegida no /gestor/relatorio/
    feedback = FeedbackService.create_feedback(data)
    return jsonify(feedback.to_dict()), 201

@colab_feedback_bp.route("/", methods=["GET"])
def listar_feedbacks():
    feedbacks = FeedbackService.get_all_feedbacks()
    return jsonify([f.to_dict() for f in feedbacks]), 200

@colab_feedback_bp.route("/<int:feedback_id>", methods=["GET"])
def obter_feedback(feedback_id):
    feedback = FeedbackService.get_feedback_by_id(feedback_id)
    if feedback:
        return jsonify(feedback.to_dict()), 200
    return jsonify({"error": "Feedback não encontrado"}), 404


@colab_feedback_bp.route("/<int:feedback_id>", methods=["PUT"])
def atualizar_feedback(feedback_id):
    data = request.get_json()
    feedback = FeedbackService.update_feedback(feedback_id, data)
    if feedback:
        return jsonify({"message": "Feedback atualizado com sucesso", "feedback": feedback.to_dict()}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404

@colab_feedback_bp.route("/<int:feedback_id>", methods=["DELETE"])
def deletar_feedback(feedback_id):
    feedback = FeedbackService.delete_feedback(feedback_id)
    if feedback:
        return jsonify({"message": "Feedback deletado com sucesso"}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404