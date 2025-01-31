const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const DATA_FILE = 'data.json';

// Função para ler o arquivo JSON
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) return { lojas: {} };
    return JSON.parse(fs.readFileSync(DATA_FILE));
};

// Função para escrever no arquivo JSON
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// Endpoint para registrar uma venda
app.post('/registrar-venda', (req, res) => {
    const { loja, data, cliente, aparelho, valor, pagamento, entrega } = req.body;
    let db = readData();
    
    if (!db.lojas[loja]) {
        db.lojas[loja] = { vendas: [], objetivo: {} };
    }
    
    db.lojas[loja].vendas.push({ data, cliente, aparelho, valor, pagamento, entrega });
    writeData(db);
    res.json({ message: 'Venda registrada com sucesso!' });
});

// Endpoint para obter dados da loja
app.get('/loja/:nome', (req, res) => {
    const { nome } = req.params;
    let db = readData();
    res.json(db.lojas[nome] || { vendas: [], objetivo: {} });
});

// Endpoint para definir objetivos de venda
app.post('/definir-objetivo', (req, res) => {
    const { loja, mes, objetivo } = req.body;
    let db = readData();
    
    if (!db.lojas[loja]) {
        db.lojas[loja] = { vendas: [], objetivo: {} };
    }
    
    db.lojas[loja].objetivo[mes] = objetivo;
    writeData(db);
    res.json({ message: 'Objetivo definido com sucesso!' });
});

// Endpoint para estatísticas gerais
app.get('/estatisticas', (req, res) => {
    let db = readData();
    let totalVendas = 0;
    let vendasPorLoja = {};
    
    for (let loja in db.lojas) {
        let totalLoja = db.lojas[loja].vendas.reduce((sum, venda) => sum + venda.valor, 0);
        vendasPorLoja[loja] = totalLoja;
        totalVendas += totalLoja;
    }
    
    res.json({ totalVendas, vendasPorLoja });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
