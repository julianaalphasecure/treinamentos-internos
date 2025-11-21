from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.colaborador.feedback_service import FeedbackService
from src.config.database import db
from src.models.feedback import Feedback
from sqlalchemy import func

# Blueprint SEM prefixo (o prefixo está no app.py)
relatorio_bp = Blueprint("relatorio_bp", __name__)

# 1. GESTOR ENVIA FEEDBACK PARA O COLABORADOR
@relatorio_bp.route("", methods=["POST"])
@jwt_required()
def criar_relatorio():
    data_raw = request.get_json()
    gestor_id = get_jwt_identity()

    feedback_data = {
        "mensagem": f"[FEEDBACK] {data_raw.get('mensagem')}",
        "colaborador_id": data_raw.get("colaborador_id"),
        "gestor_id": gestor_id
    }

    if not feedback_data["colaborador_id"] or not data_raw.get("mensagem"):
        return jsonify({"error": "Colaborador e mensagem são obrigatórios"}), 400

    feedback = FeedbackService.create_feedback(feedback_data)
    return jsonify(feedback.to_dict()), 201


# 2. GESTOR RECEBE DÚVIDAS DO COLABORADOR
@relatorio_bp.route("/recebidos", methods=["GET"])
@jwt_required()
def listar_duvidas_recebidas():
    gestor_id = get_jwt_identity()

    duvidas = FeedbackService.get_duvidas_para_gestor(gestor_id)

    # =============================== DEBUG ===============================
    print("\n=== DEBUG DÚVIDAS RECEBIDAS ===")
    print(f"Gestor logado: {gestor_id}")
    print(f"Total encontradas: {len(duvidas)}")
    for d in duvidas:
        print({
            "id": d.id,
            "mensagem": d.mensagem,
            "colaborador_id": d.colaborador_id,
            "gestor_id": d.gestor_id,
            "lido": d.lido
        })
    print("==================================================================\n")
    # ====================================================================

    return jsonify([d.to_dict() for d in duvidas]), 200


# 3. MARCAR DÚVIDA COMO LIDA
@relatorio_bp.route("/marcar-lido/<int:feedback_id>", methods=["PUT"])
@jwt_required()
def marcar_lido(feedback_id):
    feedback = db.session.query(Feedback).get(feedback_id)

    if not feedback:
        return jsonify({"error": "Feedback não encontrado"}), 404

    # opcional: garantir que só o gestor destinatário pode marcar como lido
    gestor_id = get_jwt_identity()
    if feedback.gestor_id is not None and int(feedback.gestor_id) != int(gestor_id):
        return jsonify({"error": "Não autorizado"}), 403

    feedback.lido = True
    db.session.commit()

    return jsonify({"message": "Marcado como lido", "id": feedback.id}), 200


# 4. CONTAR DÚVIDAS NÃO LIDAS (BADGE)
@relatorio_bp.route("/nao-lidos/contagem", methods=["GET"])
@jwt_required()
def contar_nao_lidos():
    gestor_id = get_jwt_identity()

    # contar dúvidas direcionadas a este gestor que ainda não foram lidas
    qtd = (
        db.session.query(func.count(Feedback.id))
        .filter(
            Feedback.gestor_id == gestor_id,
            Feedback.mensagem.like("[duvida-modulo]%"),
            Feedback.lido.is_(False)
        )
        .scalar() or 0
    )

    return jsonify({"nao_lidos": int(qtd)}), 200


# 5. ATUALIZAR FEEDBACK (MANTIDO)
@relatorio_bp.route("/<int:relatorio_id>", methods=["PUT"])
def atualizar_relatorio(relatorio_id):
    data = request.get_json()
    feedback = FeedbackService.update_feedback(relatorio_id, data)
    if feedback:
        return jsonify({"message": "Feedback atualizado com sucesso", "feedback": feedback.to_dict()}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404


# 6. DELETAR FEEDBACK (MANTIDO)
@relatorio_bp.route("/<int:relatorio_id>", methods=["DELETE"])
def deletar_relatorio(relatorio_id):
    feedback = FeedbackService.delete_feedback(relatorio_id)
    if feedback:
        return jsonify({"message": "Feedback deletado com sucesso"}), 200
    return jsonify({"error": "Feedback não encontrado"}), 404
