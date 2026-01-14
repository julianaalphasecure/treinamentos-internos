from src.config.database import db
from src.models.modulos import Modulo
from src.models.exercicio import Exercicio
from src.models.conteudo_modulo import ConteudoModulo

def listar_modulos():
    """
    Retorna todos os módulos ordenados
    """
    modulos = Modulo.query.order_by(Modulo.id.asc()).all()

    return [
        {
            "id": m.id,
            "titulo": m.titulo,
            "descricao": m.descricao
        }
        for m in modulos
    ]


def buscar_modulo(modulo_id):
    """
    Retorna um módulo específico
    """
    modulo = Modulo.query.get(modulo_id)

    if not modulo:
        return None

    return {
        "id": modulo.id,
        "titulo": modulo.titulo,
        "descricao": modulo.descricao
    }



def listar_conteudos_modulo(modulo_id):
    """
    Lista conteúdos de um módulo
    """
    conteudos = (
        ConteudoModulo.query
        .filter_by(modulo_id=modulo_id)
        .order_by(ConteudoModulo.ordem.asc())
        .all()
    )

    return [
        {
            "id": c.id,
            "tipo": c.tipo,
            "conteudo": c.conteudo,
            "ordem": c.ordem
        }
        for c in conteudos
    ]


def adicionar_conteudo_modulo(modulo_id, tipo, conteudo, ordem=1):
    """
    Adiciona conteúdo ao módulo
    """
    novo = ConteudoModulo(
        modulo_id=modulo_id,
        tipo=tipo,
        conteudo=conteudo,
        ordem=ordem
    )

    db.session.add(novo)
    db.session.commit()

    return novo.id



def listar_exercicios_modulo(modulo_id):
    """
    Lista exercícios vinculados ao módulo
    """
    exercicios = Exercicio.query.filter_by(modulo_id=modulo_id).all()

    return [
        {
            "id": e.id,
            "pergunta": e.pergunta
        }
        for e in exercicios
    ]

def criar_modulo(titulo, descricao=None):
    """
    Cria um novo módulo
    """
    novo = Modulo(
        nome=titulo,     
        titulo=titulo,
        descricao=descricao,
        ativo=True
    )

    db.session.add(novo)
    db.session.commit()

    return {
        "id": novo.id,
        "titulo": novo.titulo,
        "descricao": novo.descricao,
        "ativo": novo.ativo
    }


def remover_modulo(modulo_id):
    """
    Remove um módulo e tudo relacionado (slides, exercícios, etc)
    """
    modulo = Modulo.query.get(modulo_id)

    if not modulo:
        return False

    db.session.delete(modulo)
    db.session.commit()
    return True
