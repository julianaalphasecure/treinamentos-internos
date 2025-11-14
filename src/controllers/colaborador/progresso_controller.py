from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.colaborador.progresso_service import ProgressoService
from src.services.colaborador.colaborador_service import ColaboradorService
# from src.services.gestor.equipe_service import EquipeService  # Caso precise validar gestor

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")


@progresso_bp.route("/frontend", methods=["GET"])
@jwt_required()
def progresso_frontend():
    """
    Rota para o próprio colaborador ver seu progresso.
    Mantida a lógica original para o frontend do colaborador.
    """
    try:
        usuario_id = int(get_jwt_identity())

        if not usuario_id:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        ProgressoService.inicializar_progresso_usuario(usuario_id)
        progresso_list = ProgressoService.get_all_progresso_usuario(usuario_id)

        modulos_dict = {}
        for p in progresso_list:
            nome_modulo = p.modulo.nome if p.modulo else f"Módulo {p.modulo_id}"

            # Mantido o cálculo original (inconsistente) para não quebrar a view do colaborador
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

    except Exception as e:
        print(f"!!!! ERRO NO PROCESSAMENTO DO PROGRESSO: {e}")
        return jsonify({"error": "Erro interno ao processar progresso."}), 500


# ====================================================================
# >>> ROTA GESTOR AJUSTADA (Separa Percentual de Nota Final) <<<
# ====================================================================
@progresso_bp.route("/gestor/colaborador/<int:colaborador_id>", methods=["GET"])
@jwt_required()
def progresso_colaborador_gestor(colaborador_id):
    """
    Rota para o gestor visualizar o progresso de um colaborador específico.
    """
    try:
        gestor_id = int(get_jwt_identity())

        ProgressoService.inicializar_progresso_usuario(colaborador_id)
        progresso_list = ProgressoService.get_all_progresso_usuario(colaborador_id)

        modulos_dict = {}
        for p in progresso_list:
            nome_modulo = p.modulo.nome if p.modulo else f"Módulo {p.modulo_id}"

            # 1. Percentual de progresso (0–100)
            if p.status == 'concluido':
                percent_progresso = 100.0
            elif p.status == 'em_andamento':
                percent_progresso = 50.0
            else:
                percent_progresso = 0.0

            # 2. Nota real obtida (nota_final)
            nota_obtida = float(p.nota_final) if p.nota_final is not None else None

            modulos_dict[p.modulo_id] = {
                "modulo_id": p.modulo_id,
                "nome": nome_modulo,
                "percent": percent_progresso,
                "status": p.status,
                "nota_final": nota_obtida
            }

        modulos = list(modulos_dict.values())

        concluidos = sum(1 for m in modulos if m["status"] == "concluido")
        nao_iniciados = sum(1 for m in modulos if m["status"] == "nao_iniciado")

        return jsonify({
            "modulos": modulos,
            "stats": {"concluidos": concluidos, "nao_iniciados": nao_iniciados}
        }), 200

    except Exception as e:
        print(f"!!!! ERRO NO PROCESSAMENTO DO PROGRESSO PARA GESTOR: {e}")
        return jsonify({"error": "Erro interno ao processar progresso do colaborador."}), 500


# ====================================================================
# >>> FINALIZAR MÓDULO (CORRIGIDA) <<<
# ====================================================================
@progresso_bp.route("/finalizar/<int:usuario_id>/<int:modulo_id>", methods=["POST"])
@jwt_required()
def finalizar_modulo(usuario_id, modulo_id):
    try:
        data = request.get_json() or {}

        # CORRIGIDO: Lê a nota real (float)
        nota_final = float(data.get("nota_final", 0.0))

        # Garante que o usuário no token é o mesmo que está tentando finalizar
        token_usuario_id = int(get_jwt_identity())
        if token_usuario_id != usuario_id:
            return jsonify({"error": "Acesso negado para finalizar outro usuário."}), 403

        # Finaliza módulo passando nota real
        progresso = ProgressoService.finalizar_modulo(usuario_id, modulo_id, nota_final)

        return jsonify({
            "modulo_id": progresso.modulo_id,
            "usuario_id": progresso.usuario_id,
            "status": progresso.status,
            "percent": 100.0  # Módulo finalizado → barra sempre 100%
        }), 200

    except Exception as e:
        print(f"!!!! ERRO AO FINALIZAR MÓDULO: {e}")
        return jsonify({"error": "Erro interno ao finalizar módulo."}), 500
