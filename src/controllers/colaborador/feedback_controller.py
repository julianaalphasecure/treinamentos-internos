from flask import Blueprint, request, jsonify
from src.services.colaborador.feedback_service import FeedbackService
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.usuario import Usuario

colab_feedback_bp = Blueprint("colab_feedback_bp", __name__)


# Lista feedback
@colab_feedback_bp.route("/", methods=["GET"])
@jwt_required()
def listar_feedbacks_colaborador():
    colaborador_id = get_jwt_identity()
    feedbacks = FeedbackService.get_feedbacks_para_colaborador(colaborador_id)
    return jsonify([f.to_dict() for f in feedbacks]), 200



# Marca feedback como lido
@colab_feedback_bp.route("/marcar-lido/<int:feedback_id>", methods=["PUT"])
@jwt_required()
def marcar_feedback_lido(feedback_id):
    colaborador_id = get_jwt_identity()

    feedback = FeedbackService.get_feedback_by_id(feedback_id)

    if not feedback:
        return jsonify({"error": "Feedback não encontrado"}), 404

    if int(feedback.colaborador_id) != int(colaborador_id):
        return jsonify({
            "error": "Você não tem permissão para marcar este feedback",
            "jwt_id": colaborador_id,
            "feedback_id": feedback.colaborador_id
        }), 403

    FeedbackService.marcar_como_lido(feedback_id)
    return jsonify({"message": "Feedback marcado como lido"}), 200


# Lista gestores ( para enviar dúvida)
@colab_feedback_bp.route("/gestores", methods=["GET"])
@jwt_required()
def listar_gestores():
    nome = (request.args.get("nome") or "").strip()

    query = Usuario.query.filter_by(tipo_acesso="gestor")

    if nome:
        query = query.filter(Usuario.nome.ilike(f"%{nome}%"))

    gestores = query.limit(50).all()

    return jsonify([{"id": g.id, "nome": g.nome} for g in gestores]), 200


# Colaborador envia dúvida
@colab_feedback_bp.route("/enviar", methods=["POST"])
@jwt_required()
def enviar_feedback():
    colaborador_id = get_jwt_identity()
    data = request.get_json()

    gestor_id = data.get("gestor_id")
    mensagem = data.get("mensagem")
    assunto = data.get("assunto")

    if not gestor_id or not mensagem:
        return jsonify({"error": "Gestor e mensagem são obrigatórios"}), 400

    novo_feedback = {
        "gestor_id": gestor_id,
        "colaborador_id": colaborador_id,
        "mensagem": f"[duvida-modulo] [{assunto}] {mensagem}"
    }

    feedback = FeedbackService.create_feedback(novo_feedback)
    return jsonify(feedback.to_dict()), 201



@colab_feedback_bp.route("/meus-feedbacks", methods=["GET"])
@jwt_required()
def meus_feedbacks():
    colaborador_id = get_jwt_identity()
    feedbacks = FeedbackService.get_feedbacks_para_colaborador(colaborador_id)
    return jsonify([f.to_dict() for f in feedbacks]), 200


# Lista dúvidas + respostas
@colab_feedback_bp.route("/duvidas", methods=["GET"])
@jwt_required()
def listar_duvidas_colaborador():
    colaborador_id = get_jwt_identity()
    duvidas = FeedbackService.get_duvidas_enviadas_por_colaborador(colaborador_id)
    return jsonify([d.to_dict() for d in duvidas]), 200
