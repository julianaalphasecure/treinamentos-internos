# src/controllers/gestor/exercicio_controller.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from src.services.gestor.exercicio_service import ExercicioService

exercicio_bp = Blueprint(
    "exercicio_bp",
    __name__,
    url_prefix="/gestor"
)


@exercicio_bp.route("/api/modulos/<int:modulo_id>/exercicios", methods=["GET"])
@jwt_required()
def listar_exercicios(modulo_id):
    """Listar todos os exercícios de um módulo"""
    exercicios = ExercicioService.listar_por_modulo(modulo_id)
    return jsonify([e.to_dict() for e in exercicios]), 200


@exercicio_bp.route("/api/modulos/<int:modulo_id>/exercicios", methods=["POST"])
@jwt_required()
def criar_exercicio(modulo_id):
    """Criar novo exercício no módulo"""
    data = request.get_json()
    enunciado = data.get("enunciado")
    alternativa_a = data.get("alternativa_a")
    alternativa_b = data.get("alternativa_b")
    alternativa_c = data.get("alternativa_c")
    alternativa_d = data.get("alternativa_d")
    correta = data.get("correta", "").upper()

    # Validações básicas
    if not all([enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d]):
        return jsonify({"error": "Todos os campos são obrigatórios"}), 400
    if correta not in ["A", "B", "C", "D"]:
        return jsonify({"error": "Alternativa correta inválida"}), 400

    exercicio = ExercicioService.criar_exercicio(
        modulo_id, enunciado, alternativa_a, alternativa_b, alternativa_c, alternativa_d, correta
    )

    return jsonify(exercicio.to_dict()), 201


@exercicio_bp.route("/api/exercicios/<int:exercicio_id>", methods=["PUT"])
@jwt_required()
def atualizar_exercicio(exercicio_id):
    """Atualizar um exercício existente"""
    data = request.get_json()
    exercicio = ExercicioService.atualizar_exercicio(exercicio_id, data)
    return jsonify(exercicio.to_dict()), 200


@exercicio_bp.route("/api/exercicios/<int:exercicio_id>", methods=["DELETE"])
@jwt_required()
def remover_exercicio(exercicio_id):
    """Remover um exercício"""
    ExercicioService.remover_exercicio(exercicio_id)
    return jsonify({"message": "Exercício removido com sucesso"}), 200
