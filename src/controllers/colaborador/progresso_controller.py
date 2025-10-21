from flask import Blueprint, request, jsonify
from src.services.colaborador.progresso_service import ProgressoService
from flask_login import current_user # type: ignore

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")

# Rota padrão CRUD
@progresso_bp.route("/", methods=["GET"])
def listar_progresso():
    progresso = ProgressoService.get_all_progresso()
    return jsonify([p.to_dict() for p in progresso]), 200

@progresso_bp.route("/<int:progresso_id>", methods=["GET"])
def obter_progresso(progresso_id):
    progresso = ProgressoService.get_progresso_by_id(progresso_id)
    if progresso:
        return jsonify(progresso.to_dict()), 200
    return jsonify({"error": "Progresso não encontrado"}), 404

@progresso_bp.route("/", methods=["POST"])
def criar_progresso():
    data = request.get_json()
    progresso = ProgressoService.create_progresso(data)
    return jsonify(progresso.to_dict()), 201

@progresso_bp.route("/<int:progresso_id>", methods=["PUT"])
def atualizar_progresso(progresso_id):
    data = request.get_json()
    progresso = ProgressoService.update_progresso(progresso_id, data)
    if progresso:
        return jsonify({"message": "Progresso atualizado com sucesso", "progresso": progresso.to_dict()}), 200
    return jsonify({"error": "Progresso não encontrado"}), 404

@progresso_bp.route("/<int:progresso_id>", methods=["DELETE"])
def deletar_progresso(progresso_id):
    progresso = ProgressoService.delete_progresso(progresso_id)
    if progresso:
        return jsonify({"message": "Progresso deletado com sucesso"}), 200
    return jsonify({"error": "Progresso não encontrado"}), 404


# Rota específica para o frontend
@progresso_bp.route("/frontend", methods=["GET"])
def progresso_frontend():
    # Se usar login: filtrar pelo usuário
    # progresso = Progresso.query.filter_by(usuario_id=current_user.id).all()
    progresso = ProgressoService.get_all_progresso()

    modulos_dict = {}
    for p in progresso:
        nome_modulo = p.modulo.nome
        percent = float(p.nota_final) if p.nota_final is not None else 0
        modulos_dict[p.modulo_id] = {
            "nome": nome_modulo,
            "percent": percent,
            "nota": percent
        }

    modulos = list(modulos_dict.values())

    # badges
    badges = []
    if any(m['percent'] > 0 for m in modulos):
        badges.append({"titulo": "Primeira Certificação", "descricao": "Complete seu primeiro módulo"})
    if any(m['nota'] == 100 for m in modulos):
        badges.append({"titulo": "Nota Máxima", "descricao": "Obtenha 100% em um exercício"})
    if all(m['nota'] >= 90 for m in modulos):
        badges.append({"titulo": "Perfeccionista", "descricao": "Complete todos os módulos com 90%"})

    return jsonify({"modulos": modulos, "badges": badges})
