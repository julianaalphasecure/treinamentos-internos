from flask_mail import Message
from src.config.mail import mail

class ConfigFeedbackService:
    @staticmethod
    def enviar_feedback(colaborador_id, tipo, mensagem):
        try:
            msg = Message(
                subject=f"Novo feedback de configurações: {tipo}",
                sender="no-reply@plataforma.com",
                recipients=["seuemail@gmail.com"],  # SEU EMAIL
                body=f"Usuário {colaborador_id} enviou feedback:\n\n{mensagem}"
            )
            mail.send(msg)
            return True
        except Exception as e:
            print("Erro ao enviar email:", e)
            return False

