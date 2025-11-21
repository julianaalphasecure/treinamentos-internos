from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.colaborador.progresso_service import ProgressoService
from src.services.colaborador.colaborador_service import ColaboradorService
# from src.services.gestor.equipe_service import EquipeService  # Caso precise validar gestor

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")


# ... (Rota progresso_frontend e progresso_colaborador_gestor permanecem inalteradas)
# A rota /frontend e /gestor/colaborador/<int:colaborador_id> foram omitidas aqui
# para focar na mudança, mas o seu código acima está correto para elas.
# ...

@progresso_bp.route("/frontend", methods=["GET"])
@jwt_required()
def progresso_frontend():
    """
    Rota para o próprio colaborador ver seu progresso.
    Ajustada para calcular o percentual de progresso com base no status.
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

            # >>> AJUSTE AQUI: Calcular o percentual de progresso (0, 50, 100)
            if p.status == 'concluido':
                percent_progresso = 100.0
            elif p.status == 'em_andamento':
                percent_progresso = 50.0 
            else:
                percent_progresso = 0.0
            # <<< Fim do Ajuste

            modulos_dict[p.modulo_id] = {
                "modulo_id": p.modulo_id,
                "nome": nome_modulo,
                "percent": percent_progresso, # Usando o progresso de 0-100
                "status": p.status,
                "nota_final": float(p.nota_final) if p.nota_final is not None else None, # Opcional: manter nota
                "tentativas": p.tentativas
            }

        modulos = list(modulos_dict.values())

        concluidos = sum(1 for m in modulos if m["status"] == "concluido")
        nao_iniciados = sum(1 for m in modulos if m["status"] == "nao_iniciado")

        total_modulos = len(modulos)
        
        return jsonify({
            "modulos": modulos,
            "stats": {
                "concluidos": concluidos, 
                "nao_iniciados": nao_iniciados,
                "total_modulos": total_modulos
            }
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
        gestor_id = int(get_jwt_identity()) # Mantido para futura verificação de permissão

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
                "nota_final": nota_obtida,
                "tentativas": p.tentativas
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
# >>> FINALIZAR MÓDULO (REFATORADA: Usuário pego do Token) <<<
# ====================================================================
# ROTA REFATORADA: Remove o usuario_id da URL
@progresso_bp.route("/finalizar/<int:modulo_id>", methods=["POST"])
@jwt_required()
def finalizar_modulo(modulo_id):
    try:
        data = request.get_json() or {}

        # 1. Obtém o ID do usuário diretamente do token (SEGURANÇA)
        usuario_id = int(get_jwt_identity())
        
        # 2. Lê a nota real (float)
        nota_final = float(data.get("nota_final", 0.0))

        # 3. Finaliza módulo
        progresso = ProgressoService.finalizar_modulo(usuario_id, modulo_id, nota_final)

        return jsonify({
            "modulo_id": progresso.modulo_id,
            "usuario_id": progresso.usuario_id,
            "status": progresso.status,
            "percent": 100.0 
        }), 200

    except Exception as e:
        print(f"!!!! ERRO AO FINALIZAR MÓDULO: {e}")
        return jsonify({"error": "Erro interno ao finalizar módulo."}), 500