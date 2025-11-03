from flask import Blueprint, jsonify
from src.services.colaborador.progresso_service import ProgressoService
from src.models.modulos import Modulo
from flask_login import current_user # type: ignore

progresso_bp = Blueprint("progresso_bp", __name__, url_prefix="/colaborador/progresso")

@progresso_bp.route("/frontend", methods=["GET"])
def progresso_frontend():
    # Pega o usuário logado (ou 1º usuário se quiser teste sem login)
    usuario_id = getattr(current_user, 'id', 1)

    progresso_list = ProgressoService.get_all_progresso_usuario(usuario_id)
    modulos_dict = {}

    # Garante que todos os módulos apareçam
    for modulo in Modulo.query.all():
        progresso = next((p for p in progresso_list if p.modulo_id == modulo.id), None)
        percent = float(progresso.nota_final) if progresso and progresso.nota_final else 0
        status = progresso.status if progresso else 'nao_iniciado'
        modulos_dict[modulo.id] = {
            "nome": modulo.nome,
            "percent": percent,
            "nota": percent,
            "status": status
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

    # contadores
    total_modulos = len(modulos)
    concluidos = sum(1 for m in modulos if m['status'] == 'concluido')
    nao_iniciados = total_modulos - concluidos

    return jsonify({
        "modulos": modulos,
        "badges": badges,
        "concluidos": concluidos,
        "nao_iniciados": nao_iniciados
    })
