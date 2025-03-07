const { isValidCPF } = require('../utils/helpers');

async function verificarCPF(agent) {
    let dateTimeValue = agent.context.get("agendar_consulta_hour_yes")?.parameters?.["dateTimeValue"];
    let cpf = agent.parameters["cpf"];

    if (!dateTimeValue) {
        agent.add("Desculpe, não consegui obter a data e horário da consulta. Por favor, tente novamente.");
        return;
    }

    if (!cpf || !isValidCPF(cpf)) {
        agent.add("Por favor, forneça um CPF válido.");
        return;
    } else {
        agent.add("Ok, qual seu nome e sobrenome?");
        agent.context.set({
            name: "agendar_consulta_hour_yes_cpf",
            lifespan: 10,
            parameters: {
                dateTimeValue: dateTimeValue,
                cpf: cpf
            }
        });
    }
}

module.exports = {
    verificarCPF
};