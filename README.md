# Agendamento Bot

Este é um projeto de chatbot para agendamento de consultas utilizando Dialogflow e Node.js.

![agendamento-bot](assets/image.png)

## Acesso pelo GitHub Pages

Você também pode acessar o frontend do projeto através do GitHub Pages: [GitHub Pages]( https://norfolque.github.io/agendamento-bot/public/)

## Funcionalidades

- Verificação de horários disponíveis para agendamento.
- Agendamento de consultas.
- Exibição de agendamentos salvos.

## Configuração

1. Clone o repositório:
    ```sh
    git clone https://github.com/norfolque/agendamento-bot.git
    cd agendamento-bot
    ```

2. Instale as dependências:
    ```sh
    npm install
    ```

3. Configure as variáveis de ambiente:
    - Crie um arquivo `.env` na raiz do projeto com base no arquivo `.env.example` e preencha com suas informações:
    ```env
    DB_HOST=your_database_host
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_NAME=your_database_name
    PORT=your_port_number
    ```

## Execução

Para iniciar o servidor, execute:
```sh
npm start
```

## Endpoints

### Dialogflow Webhook

`POST /dialogflow`  
Rota para integração com o Dialogflow.

### API de Agendamentos

`GET /api/agendamentos`  
Retorna todos os agendamentos salvos no banco de dados.

## Frontend

O frontend está disponível em `public/index.html` e exibe os agendamentos salvos no banco de dados.

## Tecnologias Utilizadas

- Node.js
- Express
- Dialogflow
- MySQL
- HTML/CSS/JavaScript

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.