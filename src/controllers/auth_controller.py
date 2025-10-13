from flask import Blueprint, request, redirect, url_for, flash, render_template
from src.services.auth_service import AuthService

auth_bp = Blueprint("auth_bp", __name__, url_prefix="/auth")
auth_service = AuthService()

@auth_bp.route("/registrar", methods=["POST"])
def registrar():
    re = request.form.get("re")
    nome = request.form.get("nome")
    email = request.form.get("email")
    senha = request.form.get("senha")
    tipo_acesso = request.form.get("tipo_acesso")

    usuario, erro = auth_service.registrar_usuario(
        re=re,
        nome=nome,
        email=email,
        senha=senha,
        tipo_acesso=tipo_acesso
    )

    if usuario:
        flash("Usuário registrado com sucesso!", "success")
        return redirect(url_for("auth_bp.login_form"))  
    else:
        flash(erro or "Falha ao registrar usuário", "danger")
        return redirect(url_for("auth_bp.registrar_form"))  


@auth_bp.route("/login", methods=["POST"])
def login():
    email = request.form.get("email")
    senha = request.form.get("senha")

    usuario = auth_service.autenticar_usuario(email=email, senha=senha)

    if usuario:
       
        return redirect(url_for("modulos"))  
    else:
        flash("Email ou senha inválidos", "danger")
        return redirect(url_for("auth_bp.login_form"))  


@auth_bp.route("/registrar", methods=["GET"])
def registrar_form():
    return render_template("registrar.html")

@auth_bp.route("/login", methods=["GET"])
def login_form():
    return render_template("login.html")
