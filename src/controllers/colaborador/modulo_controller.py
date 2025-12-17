from flask import Blueprint, request, jsonify
from src.services.colaborador.modulo_service import ModuloService
from flask import Blueprint, render_template

modulo_bp = Blueprint("modulo_bp", __name__, url_prefix="/colaborador/modulo")

@modulo_bp.route("/pagina", methods=["GET"])
def pagina_modulo():
    return render_template("colaborador/modulo.html")


@modulo_bp.route('/modulo01')
def modulo01():
    return render_template('colaborador/modulos/modulo01.html')

@modulo_bp.route('/modulo02')
def modulo02():
    return render_template('colaborador/modulos/modulo02.html')

@modulo_bp.route('/modulo03')
def modulo03():
    return render_template('colaborador/modulos/modulo03.html')

@modulo_bp.route('/modulo04')
def modulo04():
    return render_template('colaborador/modulos/modulo04.html')

@modulo_bp.route('/modulo05')
def modulo05():
    return render_template('colaborador/modulos/modulo05.html')

@modulo_bp.route('/modulo06')
def modulo06():
    return render_template('colaborador/modulos/modulo06.html')

@modulo_bp.route('/modulo07')
def modulo07():
    return render_template('colaborador/modulos/modulo07.html')

@modulo_bp.route('/modulo08')
def modulo08():
    return render_template('colaborador/modulos/modulo08.html')

@modulo_bp.route('/modulo09')
def modulo09():
    
    return render_template('colaborador/modulos/modulo09.html')


@modulo_bp.route("/", methods=["GET", "POST"])
def gerenciar_modulos():
    if request.method == "POST":
       
        data = request.get_json()
        modulo = ModuloService.create_modulo(data)
        return jsonify(modulo.to_dict()), 201

   
    modulos = ModuloService.get_all_modulos()
    return jsonify([m.to_dict() for m in modulos]), 200


@modulo_bp.route("/<int:modulo_id>", methods=["GET", "PUT", "DELETE"])
def gerenciar_modulo_por_id(modulo_id):
    if request.method == "GET":
        
        modulo = ModuloService.get_modulo_by_id(modulo_id)
        if modulo:
            return jsonify(modulo.to_dict()), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "PUT":
       
        data = request.get_json()
        modulo = ModuloService.update_modulo(modulo_id, data)
        if modulo:
            return jsonify({"message": "Módulo atualizado com sucesso", "modulo": modulo.to_dict()}), 200
        return jsonify({"error": "Módulo não encontrado"}), 404

    elif request.method == "DELETE":
        
        modulo = ModuloService.delete_modulo(modulo_id)
        if modulo:
            return jsonify({"message": "Módulo deletado com sucesso"}), 200
        return jsonify({"error": "Módulo não encontrado"}), 404
        
    return jsonify({"error": "Método não permitido"}), 405