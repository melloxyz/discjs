const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

// Preparando a lista de comandos para serem registrados
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Converte os comandos para o formato necessário e adiciona à lista de comandos
    commands.push(command.data.toJSON());
}

// Configura o cliente REST com a versão da API e o token do bot
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Iniciando o processo de registro de comandos...');

        // Realiza a requisição para registrar os comandos na aplicação do Discord
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log('Sucesso! Comandos registrados com sucesso!');
    } catch (error) {
        // Tratamento de erros com log mais detalhado para facilitar a depuração
        console.error('Erro! Falha ao registrar comandos:', error);
    }
})();
