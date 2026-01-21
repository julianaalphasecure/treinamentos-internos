from src.config.database import db
from src.models.modulo_slide import ModuloSlide

class SlideService:

    @staticmethod
    def listar_por_modulo(modulo_id):
        return (
            ModuloSlide.query
            .filter_by(modulo_id=modulo_id)
            .order_by(ModuloSlide.ordem)
            .all()
        )

    @staticmethod
    def adicionar_slide(modulo_id, imagem_url, modo):
        ultima_ordem = (
            db.session.query(db.func.max(ModuloSlide.ordem))
            .filter(ModuloSlide.modulo_id == modulo_id)
            .scalar()
    )

        nova_ordem = (ultima_ordem or 0) + 1

        slide = ModuloSlide(
        modulo_id=modulo_id,
        imagem_url=imagem_url,
        modo=modo,
        ordem=nova_ordem
    )

        db.session.add(slide)
        db.session.commit()

        return slide


    @staticmethod
    def remover_slide(slide_id):
        slide = ModuloSlide.query.get_or_404(slide_id)
        db.session.delete(slide)
        db.session.commit()
