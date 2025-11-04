from flask import Blueprint, jsonify, request
from flask_login import current_user
from src.services.colaborador.progresso_service import ProgressoService
from src.services.colaborador.colaborador_service import ColaboradorService

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")


@progresso_bp.route("/frontend", methods=["GET"])
def progresso_frontend():
    usuario_id = getattr(current_user, "id", None)
    if not usuario_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    ProgressoService.inicializar_progresso_usuario(usuario_id)
    progresso_list = ProgressoService.get_all_progresso_usuario(usuario_id)

    modulos_dict = {}
    for p in progresso_list:
        nome_modulo = p.modulo.nome if p.modulo else f"Módulo {p.modulo_id}"
        percent = float(p.nota_final or 0)
        modulos_dict[p.modulo_id] = {
            "modulo_id": p.modulo_id,
            "nome": nome_modulo,
            "percent": percent,
            "status": p.status
        }

    modulos = list(modulos_dict.values())

    concluidos = sum(1 for m in modulos if m["status"] == "concluido")
    nao_iniciados = sum(1 for m in modulos if m["status"] == "nao_iniciado")

    return jsonify({
        "modulos": modulos,
        "stats": {"concluidos": concluidos, "nao_iniciados": nao_iniciados}
    }), 200


@progresso_bp.route("/finalizar/<int:usuario_id>/<int:modulo_id>", methods=["POST"])
def finalizar_modulo(usuario_id, modulo_id):
    data = request.get_json() or {}
    nota_final = data.get("nota_final", 100)
    progresso = ProgressoService.finalizar_modulo(usuario_id, modulo_id, nota_final)
    return jsonify({
        "modulo_id": progresso.modulo_id,
        "usuario_id": progresso.usuario_id,
        "status": progresso.status,
        "percent": float(progresso.nota_final)
    }), 200
