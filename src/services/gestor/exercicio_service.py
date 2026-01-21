# src/services/gestor/exercicio_service.py

from src.models.modulo_exercicio import ModuloExercicio
from src.config.database import db

class ExercicioService:

    @staticmethod
    def listar_por_modulo(modulo_id):
        """Retorna todos os exercícios de um módulo"""
        return ModuloExercicio.query.filter_by(modulo_id=modulo_id).all()

    @staticmethod
    def criar_exercicio(modulo_id, enunciado, alternativa_a, alternativa_b,
                        alternativa_c, alternativa_d, correta):
        """Cria e salva um novo exercício"""
        exercicio = ModuloExercicio(
            enunciado=enunciado,
            alternativa_a=alternativa_a,
            alternativa_b=alternativa_b,
            alternativa_c=alternativa_c,
            alternativa_d=alternativa_d,
            correta=correta.upper(),
            modulo_id=modulo_id
        )
        db.session.add(exercicio)
        db.session.commit()
        return exercicio

    @staticmethod
    def atualizar_exercicio(exercicio_id, data):
        """Atualiza um exercício existente"""
        exercicio = ModuloExercicio.query.get_or_404(exercicio_id)
        exercicio.enunciado = data.get("enunciado", exercicio.enunciado)
        exercicio.alternativa_a = data.get("alternativa_a", exercicio.alternativa_a)
        exercicio.alternativa_b = data.get("alternativa_b", exercicio.alternativa_b)
        exercicio.alternativa_c = data.get("alternativa_c", exercicio.alternativa_c)
        exercicio.alternativa_d = data.get("alternativa_d", exercicio.alternativa_d)
        correta = data.get("correta", exercicio.correta).upper()
        if correta in ["A", "B", "C", "D"]:
            exercicio.correta = correta
        db.session.commit()
        return exercicio

    @staticmethod
    def remover_exercicio(exercicio_id):
        """Remove um exercício"""
        exercicio = ModuloExercicio.query.get_or_404(exercicio_id)
        db.session.delete(exercicio)
        db.session.commit()
        return True
