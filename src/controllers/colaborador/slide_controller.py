from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from src.services.gestor.slide_service import SlideService

slide_colaborador_bp = Blueprint(
    "slide_colaborador_bp",
    __name__,
    url_prefix="/colaborador/slides"
)

@slide_colaborador_bp.route("/modulo/<int:modulo_id>", methods=["GET"])
@jwt_required()
def listar_slides_modulo(modulo_id):
    slides = SlideService.get_slides_por_modulo(modulo_id)

    return jsonify([
        {
            "id": s.id,
            "ordem": s.ordem,
            "imagem": s.imagem_url,
            "modo": s.modo  # "normal" ou "dark"
        }
        for s in slides
    ]), 200
