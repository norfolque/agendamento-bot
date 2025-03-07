const express = require('express');
const con = require('../config/db');

const router = express.Router();

router.get('/agendamentos', async (req, res) => {
    try {
        const [results] = await con.query('SELECT id, nome, data_agendamento, hora_agendamento, descricao FROM agendamentos');
        res.json(results);
    } catch (err) {
        console.error(err); 
        res.status(500).json({ error: 'Erro ao consultar agendamentos' });
    }
});

module.exports = router;