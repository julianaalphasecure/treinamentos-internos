from flask import Blueprint, render_template, jsonify, request, current_app
from flask_jwt_extended import jwt_required
from werkzeug.utils import secure_filename
import os
from src.models.modulos import Modulo
from src.services.gestor.slide_service import SlideService
from src.utils.upload import allowed_file
from src.config.database import db


gerenciar_bp = Blueprint(
    "gerenciar_bp",
    __name__,
    url_prefix="/gestor"
)


@gerenciar_bp.route("/gerenciar-modulos", methods=["GET"])
def pagina_gerenciar_modulos():
    return render_template("gestor/gerenciar_modulos.html")


@gerenciar_bp.route("/modulo/<int:modulo_id>/editar", methods=["GET"])
def pagina_editar_modulo(modulo_id):
    return render_template(
        "gestor/editar_modulo.html",
        modulo_id=modulo_id
    )


@gerenciar_bp.route("/api/modulos", methods=["GET"])
@jwt_required()
def listar_modulos():
    modulos = Modulo.query.order_by(Modulo.id.asc()).all()

    return jsonify([
        {
            "id": m.id,
            "titulo": m.titulo,
            "ativo": m.ativo
        }
        for m in modulos
    ]), 200

@gerenciar_bp.route("/api/modulos", methods=["POST"])
@jwt_required()
def criar_modulo():
    data = request.get_json()
    titulo = data.get("titulo")
    nome = data.get("nome", titulo)
    descricao = data.get("descricao", "")

    if not titulo:
        return jsonify({"error": "Título obrigatório"}), 400

    novo_modulo = Modulo(
        titulo=titulo,
        nome=nome,
        descricao=descricao
    )

   
    db.session.add(novo_modulo)
    db.session.commit()

    return jsonify(novo_modulo.to_dict()), 201


@gerenciar_bp.route("/api/modulos/<int:modulo_id>", methods=["DELETE"])
@jwt_required()
def remover_modulo(modulo_id):
    modulo = Modulo.query.get_or_404(modulo_id)


    db.session.delete(modulo)
    db.session.commit()

    return jsonify({"message": "Módulo removido com sucesso"}), 200



@gerenciar_bp.route("/api/modulo/<int:modulo_id>", methods=["GET"])
@jwt_required()
def detalhes_modulo(modulo_id):
    modulo = Modulo.query.get_or_404(modulo_id)

    return jsonify({
        "id": modulo.id,
        "titulo": modulo.titulo,
        "slides": [s.to_dict() for s in modulo.slides],
        "exercicios": [e.to_dict() for e in modulo.exercicios]
    }), 200


# ==============================
# API - SLIDES
# ==============================
@gerenciar_bp.route("/api/modulos/<int:modulo_id>/slides", methods=["GET"])
@jwt_required()
def listar_slides(modulo_id):
    slides = SlideService.listar_por_modulo(modulo_id)
    return jsonify([s.to_dict() for s in slides]), 200


@gerenciar_bp.route("/api/slides/<int:slide_id>", methods=["DELETE"])
@jwt_required()
def remover_slide(slide_id):
    SlideService.remover_slide(slide_id)
    return jsonify({"message": "Slide removido com sucesso"}), 200


@gerenciar_bp.route("/api/modulos/<int:modulo_id>/slides/upload", methods=["POST"])
@jwt_required()
def upload_slide(modulo_id):
    """
    Upload real de imagem de slide
    """

    if "file" not in request.files:
        return {"error": "Arquivo não enviado"}, 400

    file = request.files["file"]
    modo = request.form.get("modo", "normal")

    if file.filename == "":
        return {"error": "Arquivo inválido"}, 400

    if not allowed_file(file.filename, {"png", "jpg", "jpeg", "webp"}):
        return {"error": "Formato não permitido"}, 400

    filename = secure_filename(file.filename)


    upload_root = os.path.join(
        current_app.static_folder,   # aponta para src/static
        "uploads",
        "modulos"
    )

    # Pasta do módulo
    pasta_modulo = os.path.join(upload_root, str(modulo_id))
    os.makedirs(pasta_modulo, exist_ok=True)

    # Salvar arquivo
    file.save(os.path.join(pasta_modulo, filename))

    # URL pública da imagem
    imagem_url = f"/static/uploads/modulos/{modulo_id}/{filename}"

    # Salvar no banco
    slide = SlideService.adicionar_slide(
        modulo_id=modulo_id,
        imagem_url=imagem_url,
        modo=modo
    )

    return jsonify(slide.to_dict()), 201
