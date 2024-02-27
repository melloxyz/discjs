const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const db = require('./database/database.js'); // database = MainBase.db
require('dotenv').config();

const cron = require('node-cron');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Função para carregar comandos
function loadCommands() {
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }
}

// Função para carregar eventos
function loadEvents() {
    const eventsPath = path.join(__dirname, 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client, db)); // Passando db como argumento
        } else {
            client.on(event.name, (...args) => event.execute(...args, client, db)); // Passando db como argumento
        }
    }
}

// Agendar a tarefa para ser executada à meia-noite todos os dias
cron.schedule('0 */6 * * *', async () => {
    console.log('LIMPEZA DE DADOS: Executando a tarefa de limpeza de anúncios expirados.');

    try {
        // Substitua '24 hours' pelo período apropriado conforme sua lógica de expiração
        const result = await db.run(`DELETE FROM anuncios WHERE data_publicacao <= datetime('now', '-24 hours') AND status = 'ativo'`);
        console.log(`LIMPEZA DE DADOS: ${result.changes} anúncios expirados foram excluídos.`);
    } catch (error) {
        console.error('LIMPEZA DE DADOS: Erro ao excluir anúncios expirados:', error);
    }
});

// Executando as funções de carregamento e login do bot
loadCommands();
loadEvents();
client.login(process.env.TOKEN);
