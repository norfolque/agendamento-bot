const express = require('express');
const { WebhookClient } = require('dialogflow-fulfillment');
const { verificaHorarioDisponivel, verificaHoraDisponivel, agendarConsulta } = require('../controllers/appointmentController');
const { verificarCPF } = require('../controllers/validationController');

const router = express.Router();

router.post('/dialogflow', (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    let intentMap = new Map();
    intentMap.set("agendar_consulta", verificaHorarioDisponivel);
    intentMap.set("agendar_consulta - hour", verificaHoraDisponivel);
    intentMap.set("agendar_consulta - hour - yes - cpf", verificarCPF);
    intentMap.set("agendar_consulta - hour - yes - cpf - name", agendarConsulta);
    agent.handleRequest(intentMap);
});

module.exports = router;