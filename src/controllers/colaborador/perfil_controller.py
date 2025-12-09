from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
import os
from src.services.colaborador.perfil_service import PerfilService

perfil_bp = Blueprint("perfil_bp", __name__, url_prefix="/colaborador/perfil")

@perfil_bp.route("/<int:usuario_id>", methods=["GET"])
def obter_perfil(usuario_id):
    usuario = PerfilService.get_perfil(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    usuario_dict = usuario.to_dict()
    usuario_dict["foto"] = usuario_dict.get("foto") or "/src/static/img/foto.png"
    usuario_dict["telefone"] = usuario_dict.get("telefone") or ""
    usuario_dict["departamento"] = usuario_dict.get("departamento") or ""
    usuario_dict["nome"] = usuario_dict.get("nome") or ""
    usuario_dict["email"] = usuario_dict.get("email") or ""
    return jsonify({"usuario": usuario_dict}), 200

@perfil_bp.route("/<int:usuario_id>", methods=["PUT"])
def atualizar_perfil(usuario_id):
    usuario = PerfilService.get_perfil(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    try:
        dados = {
            "nome": request.form.get("nome"),
            "email": request.form.get("email"),
            "telefone": request.form.get("telefone"),
            "departamento": request.form.get("departamento")
        }

        foto = request.files.get("foto")
        if foto:
            filename = secure_filename(foto.filename)
            pasta_fotos = os.path.join(current_app.static_folder, "fotos_perfil")
            os.makedirs(pasta_fotos, exist_ok=True)
            caminho_foto = os.path.join(pasta_fotos, filename)
            foto.save(caminho_foto)
            dados["foto"] = url_for("static", filename=f"fotos_perfil/" + filename, _external=False)

        usuario_atualizado = PerfilService.update_perfil(usuario_id, dados)
        if usuario_atualizado:
            usuario_dict = usuario_atualizado.to_dict()
            usuario_dict["foto"] = usuario_dict.get("foto") or "/src/static/img/foto.png"
            usuario_dict["telefone"] = usuario_dict.get("telefone") or ""
            usuario_dict["departamento"] = usuario_dict.get("departamento") or ""
            usuario_dict["nome"] = usuario_dict.get("nome") or ""
            usuario_dict["email"] = usuario_dict.get("email") or ""
            return jsonify({"message": "Perfil atualizado com sucesso", "usuario": usuario_dict}), 200

        return jsonify({"error": "Falha ao atualizar perfil"}), 400
    except Exception as e:
        print("Erro ao atualizar perfil:", e)
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
