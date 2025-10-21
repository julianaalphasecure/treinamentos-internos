from flask_mail import Mail

mail = Mail()

def configure_mail(app):
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # ou outro SMTP
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USE_SSL'] = False
    app.config['MAIL_USERNAME'] = 'juliana.alphasecure@gmail.com'  
    app.config['MAIL_PASSWORD'] = 'SENHA_DE_APLICATIVO'  # Gerar senha de app
    mail.init_app(app)
