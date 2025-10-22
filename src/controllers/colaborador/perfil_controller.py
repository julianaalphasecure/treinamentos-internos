from flask import Blueprint, request, jsonify, current_app, url_for
from werkzeug.utils import secure_filename
import os
from src.services.colaborador.perfil_service import PerfilService

perfil_bp = Blueprint("perfil_bp", __name__, url_prefix="/colaborador/perfil")

@perfil_bp.route("/<int:usuario_id>", methods=["GET"])
def obter_perfil(usuario_id):
    usuario = PerfilService.get_perfil(usuario_id)
    if usuario:
        return jsonify(usuario.to_dict()), 200
    return jsonify({"error": "Usuário não encontrado"}), 404

@perfil_bp.route("/", methods=["GET"])
def listar_colaboradores():
    """Lista todos os usuários do tipo colaborador"""
    try:
        from src.models.usuario import Usuario  # evita import circular
        colaboradores = Usuario.query.filter_by(tipo_acesso="colaborador").all()

        if not colaboradores:
            return jsonify({"message": "Nenhum colaborador encontrado"}), 200

        return jsonify([c.to_dict() for c in colaboradores]), 200

    except Exception as e:
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500


@perfil_bp.route("/<int:usuario_id>", methods=["PUT"])
def atualizar_perfil(usuario_id):
    usuario = PerfilService.get_perfil(usuario_id)
    if not usuario:
        return jsonify({"error": "Usuário não encontrado"}), 404

    try:
        nome = request.form.get("nome")
        email = request.form.get("email")
        telefone = request.form.get("telefone")
        departamento = request.form.get("departamento")
        foto = request.files.get("foto")

        dados = {
            "nome": nome,
            "email": email,
            "telefone": telefone,
            "departamento": departamento
        }

        # Salva foto se existir
        if foto:
            filename = secure_filename(foto.filename)
            pasta_fotos = os.path.join(current_app.static_folder, "fotos_perfil")
            os.makedirs(pasta_fotos, exist_ok=True)
            caminho_foto = os.path.join(pasta_fotos, filename)
            foto.save(caminho_foto)
            dados["foto"] = url_for("static", filename=f"fotos_perfil/" + filename, _external=False)

        usuario_atualizado = PerfilService.update_perfil(usuario_id, dados)
        if usuario_atualizado:
            return jsonify({
                "message": "Perfil atualizado com sucesso",
                "usuario": usuario_atualizado.to_dict()
            }), 200

        return jsonify({"error": "Falha ao atualizar perfil"}), 400

    except Exception as e:
        # Retorna o erro real para depuração
        return jsonify({"error": f"Erro interno: {str(e)}"}), 500
