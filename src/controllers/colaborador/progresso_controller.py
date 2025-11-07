from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity 
from src.services.colaborador.progresso_service import ProgressoService 
from src.services.colaborador.colaborador_service import ColaboradorService
# A linha 'from src.config.database import db' foi removida, pois não é necessária aqui.

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")


@progresso_bp.route("/frontend", methods=["GET"])
@jwt_required() 
def progresso_frontend():
    # Usamos try...except para garantir que qualquer erro interno seja capturado e reportado.
    try:
        # Garante que o ID do usuário seja lido como inteiro
        usuario_id = int(get_jwt_identity())
        
        if not usuario_id:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        # ====================================================================
        # >>> LÓGICA DE SERVIÇO RESTAURADA E ATIVADA <<<
        # ====================================================================
        ProgressoService.inicializar_progresso_usuario(usuario_id)
        progresso_list = ProgressoService.get_all_progresso_usuario(usuario_id)
        
        modulos_dict = {}
        for p in progresso_list:
            # Garante a robustez do nome
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
        
        # Retorna 200 para indicar sucesso
        return jsonify({
            "modulos": modulos,
            "stats": {"concluidos": concluidos, "nao_iniciados": nao_iniciados}
        }), 200

    except Exception as e:
        # Se houver qualquer erro no serviço (DB, etc.), reporte 500
        print(f"!!!! ERRO NO PROCESSAMENTO DO PROGRESSO: {e}")
        return jsonify({"error": "Erro interno ao processar progresso."}), 500


@progresso_bp.route("/finalizar/<int:usuario_id>/<int:modulo_id>", methods=["POST"])
# >>> Rota de Finalizar Mantida e Protegida <<<
@jwt_required()
def finalizar_modulo(usuario_id, modulo_id):
    try:
        data = request.get_json() or {}
        nota_final = data.get("nota_final", 100)
        
        # Garante que o usuário no token é o mesmo que está tentando finalizar
        token_usuario_id = int(get_jwt_identity())
        if token_usuario_id != usuario_id:
             return jsonify({"error": "Acesso negado para finalizar outro usuário."}), 403

        progresso = ProgressoService.finalizar_modulo(usuario_id, modulo_id, nota_final)
        return jsonify({
            "modulo_id": progresso.modulo_id,
            "usuario_id": progresso.usuario_id,
            "status": progresso.status,
            "percent": float(progresso.nota_final)
        }), 200
        
    except Exception as e:
        print(f"!!!! ERRO AO FINALIZAR MÓDULO: {e}")
        return jsonify({"error": "Erro interno ao finalizar módulo."}), 500