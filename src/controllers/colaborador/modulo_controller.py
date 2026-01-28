from flask import Blueprint, request, jsonify
from src.services.colaborador.modulo_service import ModuloService
from flask import Blueprint, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.services.gestor.slide_service import SlideService
from src.services.gestor.exercicio_service import ExercicioService
from src.models.modulos import Modulo
from src.models.progresso import Progresso

modulo_bp = Blueprint("modulo_bp", __name__, url_prefix="/colaborador/modulo")

@modulo_bp.route("/pagina", methods=["GET"])
def pagina_modulo():
    return render_template("colaborador/modulo.html")


@modulo_bp.route("/api/modulos", methods=["GET"])
@jwt_required()
def listar_modulos_colaborador():
    modulos = ModuloService.get_all_modulos()

    return jsonify([
    {
        "id": m.id,
        "titulo": m.titulo,
        "descricao": m.descricao,
        "imagem_capa": m.imagem_capa,
        "carga_horaria": m.carga_horaria
    }
    for m in modulos
]), 200


@modulo_bp.route("/<int:modulo_id>")
def visualizar_modulo(modulo_id):
    modulo = ModuloService.get_modulo_ativo_by_id(modulo_id)

    if not modulo:
        return render_template("errors/403.html"), 403
      

    return render_template(
        "colaborador/modules.html",
        modulo_id=modulo_id
    )


@modulo_bp.route("/", methods=["GET", "POST"])
def gerenciar_modulos():
    if request.method == "POST":
       
        data = request.get_json()
        modulo = ModuloService.create_modulo(data)
        return jsonify(modulo.to_dict()), 201

   
    modulos = ModuloService.get_all_modulos()
    return jsonify([m.to_dict() for m in modulos]), 200


@modulo_bp.route("/api/modulos/<int:modulo_id>", methods=["GET", "PUT", "DELETE"])
def gerenciar_modulo_por_id(modulo_id):
    if request.method == "GET":
        modulo = ModuloService.get_modulo_ativo_by_id(modulo_id)
        if modulo:
            return jsonify(modulo.to_dict()), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "PUT":
        data = request.get_json()
        modulo = ModuloService.update_modulo(modulo_id, data)
        if modulo:
            return jsonify(modulo.to_dict()), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "DELETE":
        modulo = ModuloService.delete_modulo(modulo_id)
        if modulo:
            return jsonify({"message": "Módulo deletado com sucesso"}), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    return jsonify({"error": "Método não permitido"}), 405

@modulo_bp.route("/<int:modulo_id>/conteudo", methods=["GET"])
@jwt_required()
def conteudo_modulo_colaborador(modulo_id):

    usuario_id = int(get_jwt_identity())

    modulo = ModuloService.get_modulo_ativo_by_id(modulo_id)
    if not modulo:
        return jsonify({"error": "Módulo indisponível"}), 403

    slides = SlideService.listar_por_modulo(modulo_id)
    exercicios = ExercicioService.listar_por_modulo(modulo_id)

    # 🔹 BUSCA REAL DO PROGRESSO
    progresso = Progresso.query.filter_by(
        usuario_id=usuario_id,
        modulo_id=modulo_id
    ).first()

    return jsonify({
        "modulo": {
            "id": modulo.id,
            "nome": modulo.nome,
            "titulo": modulo.titulo,
            "descricao": modulo.descricao,
            "carga_horaria": modulo.carga_horaria,
            "imagem_capa": modulo.imagem_capa,
            "ativo": modulo.ativo,
            "ultimo_acesso": (
                progresso.ultimo_acesso.isoformat()
                if progresso and progresso.ultimo_acesso
                else None
            )
        },
        "slides": [s.to_dict() for s in slides],
        "exercicios": [e.to_dict() for e in exercicios]
    }), 200
