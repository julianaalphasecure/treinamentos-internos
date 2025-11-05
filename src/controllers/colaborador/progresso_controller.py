from flask import Blueprint, jsonify, request
# Remova a importação de flask_login se você não a usa em outras partes
# from flask_login import current_user 

# >>> ADICIONE ESTAS DUAS IMPORTAÇÕES DO FLASK-JWT-EXTENDED <<<
from flask_jwt_extended import jwt_required, get_jwt_identity 

from src.services.colaborador.progresso_service import ProgressoService
from src.services.colaborador.colaborador_service import ColaboradorService

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")


@progresso_bp.route("/frontend", methods=["GET"])
# >>> ADICIONE O DECORADOR DE PROTEÇÃO JWT AQUI <<<
@jwt_required() 
def progresso_frontend():
    # >>> MUDANÇA: Use get_jwt_identity() para obter o ID do token <<<
    usuario_id = get_jwt_identity() 
    
    if not usuario_id:
        # Tecnicamente, se @jwt_required() passar, get_jwt_identity() não deve ser None, 
        # mas mantemos a verificação para segurança.
        return jsonify({"error": "Token inválido ou expirado"}), 401

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
# >>> MUDANÇA: Proteger esta rota também, se o front-end envia o token <<<
@jwt_required()
def finalizar_modulo(usuario_id, modulo_id):
    # Verificação de segurança (opcional, mas recomendado)
    # user_do_token = get_jwt_identity()
    # if user_do_token != usuario_id:
    #     return jsonify({"error": "Acesso negado: ID do token não corresponde ao URL"}), 403
    
    data = request.get_json() or {}
    nota_final = data.get("nota_final", 100)
    progresso = ProgressoService.finalizar_modulo(usuario_id, modulo_id, nota_final)
    return jsonify({
        "modulo_id": progresso.modulo_id,
        "usuario_id": progresso.usuario_id,
        "status": progresso.status,
        "percent": float(progresso.nota_final)
    }), 200

