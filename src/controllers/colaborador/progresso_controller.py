from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.colaborador.progresso_service import ProgressoService
from src.services.colaborador.colaborador_service import ColaboradorService
from datetime import datetime
from src.config.database import db
from src.models.progresso import Progresso

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")



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


            if p.status == 'concluido':
                percent_progresso = 100.0
            elif p.status == 'em_andamento':
                percent_progresso = 50.0 
            else:
                percent_progresso = 0.0
           

            modulos_dict[p.modulo_id] = {
                "modulo_id": p.modulo_id,
                "nome": nome_modulo,
                "percent": percent_progresso, 
                "status": p.status,
                "nota_final": float(p.nota_final) if p.nota_final is not None else None, # Opcional: manter nota
                "tentativas": p.tentativas
                
            }

        modulos = list(modulos_dict.values())

        concluidos = sum(1 for m in modulos if m["status"] == "concluido")
        em_andamento = sum(1 for m in modulos if m["status"] == "em_andamento")
        nao_iniciados = sum(1 for m in modulos if m["status"] == "nao_iniciado")

        total_modulos = len(modulos)
        
        return jsonify({
            "modulos": modulos,
            "stats": {
                "concluidos": concluidos,
                "em_andamento": em_andamento, 
                "nao_iniciados": nao_iniciados,
                "total_modulos": total_modulos
            }
        }), 200

    except Exception as e:
        print(f"!!!! ERRO NO PROCESSAMENTO DO PROGRESSO: {e}")
        return jsonify({"error": "Erro interno ao processar progresso."}), 500



@progresso_bp.route("/gestor/colaborador/<int:colaborador_id>", methods=["GET"])
@jwt_required()
def progresso_colaborador_gestor(colaborador_id):
    """
    Rota para o gestor visualizar o progresso de um colaborador específico,
    incluindo módulos recém-criados que ainda não foram iniciados.
    """
    try:
        gestor_id = int(get_jwt_identity())

        # Inicializa o progresso para todos os módulos do colaborador (mesmo que novos)
        ProgressoService.inicializar_progresso_usuario(colaborador_id)
        progresso_list = ProgressoService.get_all_progresso_usuario(colaborador_id)

        modulos_dict = {}
        for p in progresso_list:
            nome_modulo = p.modulo.nome if p.modulo else f"Módulo {p.modulo_id}"

            # Percentual baseado no status
            percent_progresso = {
                'concluido': 100.0,
                'em_andamento': 50.0,
                'nao_iniciado': 0.0
            }.get(p.status, 0.0)

            modulos_dict[p.modulo_id] = {
                "modulo_id": p.modulo_id,
                "nome": nome_modulo,
                "percent": percent_progresso,
                "status": p.status,
                "nota_final": float(p.nota_final) if p.nota_final is not None else None,
                "tentativas": p.tentativas
            }

        modulos = list(modulos_dict.values())

        # Stats incluindo novos módulos
        concluidos = sum(1 for m in modulos if m["status"] == "concluido")
        em_andamento = sum(1 for m in modulos if m["status"] == "em_andamento")
        nao_iniciados = sum(1 for m in modulos if m["status"] == "nao_iniciado")

        return jsonify({
            "modulos": modulos,
            "stats": {
                "concluidos": concluidos,
                "em_andamento": em_andamento,
                "nao_iniciados": nao_iniciados
            }
        }), 200

    except Exception as e:
        print(f"!!!! ERRO NO PROCESSAMENTO DO PROGRESSO PARA GESTOR: {e}")
        return jsonify({"error": "Erro interno ao processar progresso do colaborador."}), 500


@progresso_bp.route("/finalizar/<int:modulo_id>", methods=["POST"])
@jwt_required()
def finalizar_modulo(modulo_id):
    try:
        data = request.get_json() or {}
        usuario_id = int(get_jwt_identity())
        nota_final = float(data.get("nota_final", 0.0))
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

@progresso_bp.route("/iniciar/<int:modulo_id>", methods=["POST"])
@jwt_required()
def iniciar_modulo(modulo_id):
    usuario_id = int(get_jwt_identity())

    progresso = Progresso.query.filter_by(
        usuario_id=usuario_id,
        modulo_id=modulo_id
    ).first()

    if not progresso:
        return jsonify({"error": "Progresso não encontrado"}), 404


    progresso.ultimo_acesso = datetime.utcnow()

    if progresso.status == "nao_iniciado":
        progresso.status = "em_andamento"
        progresso.data_inicio = datetime.utcnow()
        db.session.commit()


    return jsonify({
        "modulo_id": modulo_id,
        "status": progresso.status
    }), 200
