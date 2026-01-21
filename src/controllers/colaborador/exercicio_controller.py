from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.gestor.exercicio_service import ExercicioService

exercicio_bp = Blueprint(
    "exercicio_colaborador_bp",
    __name__,
    url_prefix="/colaborador/exercicio"
)


@exercicio_bp.route("/modulo/<int:modulo_id>", methods=["GET"])
@jwt_required()
def listar_exercicios_colaborador(modulo_id):
    exercicios = ExercicioService.listar_por_modulo(modulo_id)


    return jsonify([
        {
            "id": e.id,
            "enunciado": e.enunciado,
            "alternativa_a": e.alternativa_a,
            "alternativa_b": e.alternativa_b,
            "alternativa_c": e.alternativa_c,
            "alternativa_d": e.alternativa_d,
            "correta": e.correta  # pode manter, você já controla no front
        }
        for e in exercicios
    ])

@exercicio_bp.route("/responder", methods=["POST"])
@jwt_required()
def responder_exercicio():
    """
    Recebe a resposta do colaborador para um exercício
    """

    data = request.get_json()
    usuario_id = int(get_jwt_identity())

    exercicio_id = data.get("exercicio_id")
    resposta = data.get("resposta")

    if not exercicio_id or resposta is None:
        return jsonify({"error": "Dados incompletos"}), 400

    resultado = ExercicioService.corrigir_exercicio(
        usuario_id=usuario_id,
        exercicio_id=exercicio_id,
        resposta=resposta
    )

    return jsonify(resultado), 200
