from src.config.database import db

class Progresso(db.Model):
    __tablename__ = "progresso"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id", ondelete="CASCADE"), nullable=False, index=True)
    modulo_id = db.Column(db.Integer, db.ForeignKey("modulo.id", ondelete="CASCADE"), nullable=False, index=True)

    status = db.Column(
        db.Enum('nao_iniciado', 'em_andamento', 'concluido', name='progresso_status_enum'),
        default='nao_iniciado',
        nullable=False
    )
    nota_final = db.Column(db.Numeric(5, 2), nullable=True)
    data_inicio = db.Column(db.DateTime, nullable=True)
    data_conclusao = db.Column(db.DateTime, nullable=True)

    usuario = db.relationship("Usuario", backref=db.backref("progresso", cascade="all, delete-orphan"))
    modulo = db.relationship("Modulo", backref=db.backref("progresso", cascade="all, delete-orphan"))

    __table_args__ = (db.UniqueConstraint('usuario_id', 'modulo_id', name='uix_progresso_usuario_modulo'),)

    def to_dict(self):
        return {
            "id": self.id,
            "usuario_id": self.usuario_id,
            "modulo_id": self.modulo_id,
            "status": self.status,
            "nota_final": float(self.nota_final) if self.nota_final is not None else None,
            "data_inicio": self.data_inicio,
            "data_conclusao": self.data_conclusao
        }
