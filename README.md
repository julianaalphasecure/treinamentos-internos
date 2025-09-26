# Treinamentos Internos - API

Plataforma de treinamentos internos desenvolvida para o setor de monitoramento da empresa Alpha Secure.

---

API desenvolvida em **Flask + SQLAlchemy** para gerenciamento de usuários, módulos de treinamento, progresso e feedbacks de colaboradores.

---

## Tecnologias
- Python 3.13
- Flask
- Flask SQLAlchemy
- MySQL
- Bcrypt (autenticação)
- JWT
- Postman (testes)

---

## Como rodar o projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/treinamentos-internos.git
   cd treinamentos-internos

2. Crie e ative um ambiente virtual:
   python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows

3. Instale as dependências:
   pip install -r requirements.txt

4. Configure o banco de dados em src/config/config.py:
5. Rode as migrations/crie tabelas:
   flask db upgrade
6. Inicie a aplicação:
   flask run
---

## Teste das rotas com Postman
Importe o arquivo postman/treinamentos.postman_collection
