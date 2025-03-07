const con = require('../config/db');
const { formatDate, daysOfWeek, horariosDisponiveis, diasDisponiveis } = require('../utils/helpers');

async function verificaHorarioDisponivel(agent) {
    let number = agent.parameters["number"];
    let date;

    if (!isNaN(number) && number.toString().length <= 2) {
        let day = parseInt(number);
        let now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth();

        if (day < now.getDate()) {
            month += 1;
            if (month > 11) {
                month = 0;
                year += 1;
            }
        }

        let maxDaysInMonth = new Date(year, month + 1, 0).getDate();
        if (day > 0 && day <= maxDaysInMonth) {
            date = new Date(year, month, day);
        } else {
            agent.add("Desculpe, esse dia não é válido. Por favor, forneça uma data válida.");
            return;
        }
    } else {
        agent.add("Desculpe, não entendi a data. Por favor, forneça novamente.");
        return;
    }

    let dayOfWeek = daysOfWeek[date.getDay()];

    if (!diasDisponiveis.includes(dayOfWeek)) {
        agent.add(`Desculpe, não agendamos consultas para ${dayOfWeek}. Por favor, escolha um dia útil.`);
        return;
    }

    let formattedDate = date.toISOString().split("T")[0];

    try {
        const [results] = await con.query(
            "SELECT hora_agendamento FROM agendamentos WHERE data_agendamento = ?",
            [formattedDate]
        );

        const bookedHours = results.map(result => result.hora_agendamento.substring(0, 5));
        const availableHours = horariosDisponiveis.filter(hora => !bookedHours.includes(hora));

        const formattedDatePtBR = formatDate(date);

        if (availableHours.length === 0) {
            agent.add(`Todos os horários para o dia ${formattedDatePtBR} já estão preenchidos. Por favor, escolha outro dia.`);
        } else {
            let intervals = [];
            let start = availableHours[0];
            let end = start;

            for (let i = 1; i < availableHours.length; i++) {
                let currentHour = availableHours[i];
                let previousHour = availableHours[i - 1];

                if (parseInt(currentHour.split(":")[0]) === parseInt(previousHour.split(":")[0]) + 1) {
                    end = currentHour;
                } else {
                    if (start === end) {
                        intervals.push(start);
                    } else {
                        intervals.push(`${start} até ${end}`);
                    }
                    start = currentHour;
                    end = start;
                }
            }

            if (start === end) {
                intervals.push(start);
            } else {
                intervals.push(`${start} até ${end}`);
            }

            agent.add(`O dia ${formattedDatePtBR} está disponível para agendamento.`);
            agent.add(`Para qual horário você deseja agendar a consulta? Os horários disponíveis são:`);
            agent.add(`${intervals.join(', ')}.`);

            if (agent.context) {
                agent.context.set({
                    name: "agendar_consulta_hour",
                    lifespan: 2,
                    parameters: {
                        dateTimeValue: date,
                        intervals: intervals.join(', '),
                    }
                });
            } else {
                console.error("agent.context is undefined");
            }
        }
    } catch (err) {
        console.error(err);
        agent.add("Desculpe, houve um erro ao verificar os agendamentos.");
    }
}

async function verificaHoraDisponivel(agent) {
    let dateTimeValue = agent.context.get("agendar_consulta_hour")?.parameters?.["dateTimeValue"];
    let intervals = agent.context.get("agendar_consulta_hour")?.parameters?.["intervals"];
    let hourValue = agent.parameters["hour"];
    let date;

    if (!dateTimeValue || !hourValue) {
        agent.add("Desculpe, não entendi a data ou o horário. Por favor, forneça novamente.");
        return;
    }

    const normalizeHour = (hour) => {
        return hour.padStart(5, "0");
    };

    const hourNormalized = normalizeHour(hourValue[0]);

    date = new Date(dateTimeValue);
    let hour = parseInt(hourNormalized.split(":")[0]);
    date.setHours(hour);

    if (!horariosDisponiveis.includes(hourNormalized)) {
        agent.add(`Desculpe, o horário ${hourNormalized} não está disponível para agendamento. Os horários disponíveis são:`);
        agent.add(`${intervals}.`);
        agent.context.set({
            name: "agendar_consulta",
            lifespan: 10,
            parameters: {
                dateTimeValue: dateTimeValue,
                intervals: intervals
            }
        });
        return;
    }

    let formattedDate = date.toISOString().split("T")[0];
    let formattedTime = date.toTimeString().split(" ")[0].substring(0, 5);

    let dayOfWeek = daysOfWeek[date.getDay()];

    try {
        const [results] = await con.query(
            "SELECT hora_agendamento FROM agendamentos WHERE data_agendamento = ?",
            [formattedDate]
        );

        let bookedHours = results.map(result => result.hora_agendamento.substring(0, 5));
        if (bookedHours.includes(formattedTime)) {
            let availableHours = horariosDisponiveis.filter(hora => !bookedHours.includes(hora));

            let intervals = [];
            let start = availableHours[0];
            let end = start;

            for (let i = 1; i < availableHours.length; i++) {
                let currentHour = availableHours[i];
                let previousHour = availableHours[i - 1];

                if (parseInt(currentHour.split(":")[0]) === parseInt(previousHour.split(":")[0]) + 1) {
                    end = currentHour;
                } else {
                    if (start === end) {
                        intervals.push(start);
                    } else {
                        intervals.push(`${start} até ${end}`);
                    }
                    start = currentHour;
                    end = start;
                }
            }

            if (start === end) {
                intervals.push(start);
            } else {
                intervals.push(`${start} até ${end}`);
            }

            if (availableHours.length > 0) {
                agent.add(`O horário de ${formattedTime} não está disponível. Os horários disponíveis são:`);
                agent.add(`${intervals.join(', ')}.`);
                agent.add("Por favor, forneça um novo horário.");

                agent.context.set({
                    name: "agendar_consulta",
                    lifespan: 5,
                    parameters: {
                        date: formattedDate,
                        cpf: agent.context.get("agendar_consulta-hour-yes-cpf")?.parameters?.cpf,
                        name: agent.context.get("agendar_consulta-hour-yes-cpf-name")?.parameters?.name
                    }
                });
            } else {
                agent.add(`Não há horários disponíveis para o dia ${formattedDate}. Por favor, escolha outro dia.`);
            }
        } else {
            agent.add(`O horário ${formattedTime} do dia ${formatDate(date)} (${dayOfWeek}) está disponível para agendamento.`);
            agent.add(`Gostaria de confirmar o agendamento?`);

            agent.context.set({
                name: "agendar_consulta_hour_yes",
                lifespan: 10,
                parameters: {
                    dateTimeValue: date,
                }
            });
        }
    } catch (err) {
        console.error(err);
        agent.add("Desculpe, houve um erro ao verificar os horários disponíveis.");
    }
}

async function agendarConsulta(agent) {
    let nome = agent.parameters["person"].name;
    let cpf = agent.context.get("agendar_consulta_hour_yes_cpf")?.parameters?.["cpf"];
    let dateTimeValue = agent.context.get("agendar_consulta_hour_yes_cpf")?.parameters?.["dateTimeValue"];
    let descricao = "Consulta";

    if (!cpf || !nome || !dateTimeValue) {
        agent.add("Desculpe, não consegui obter todas as informações necessárias para agendar a consulta. Por favor, tente novamente.");
        return;
    }

    if (!nome || !nome.includes(" ")) {
        agent.add("Por favor, forneça seu nome e sobrenome.");
        return;
    }

    if (typeof dateTimeValue === "string") {
        dateTimeValue = new Date(dateTimeValue);
    }

    let formattedDate = dateTimeValue.toISOString().split("T")[0];
    let formattedTime = dateTimeValue.toTimeString().split(" ")[0].substring(0, 5);

    try {
        await con.query(
            "INSERT INTO agendamentos (cpf, nome, data_agendamento, hora_agendamento, descricao, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, NOW(), NOW())",
            [cpf, nome, formattedDate, formattedTime, descricao]
        );

        agent.add(`Obrigado, ${nome}. Sua consulta foi agendada com sucesso para o dia  ${formatDate(dateTimeValue)} às ${formattedTime}.`);
        agent.add(`Se precisar agendar ou desmarcar a consulta, é só me chamar.`);
    } catch (err) {
        console.error(err);
        agent.add("Desculpe, houve um erro ao agendar a consulta. Por favor, tente novamente.");
    }
}

module.exports = {
    verificaHorarioDisponivel,
    verificaHoraDisponivel,
    agendarConsulta
};