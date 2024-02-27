const { ButtonInteraction, InteractionType, ModalSubmitInteraction, MessageActionRow, MessageButton, ButtonStyle, Modal, TextInputComponent, showModal } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        // Trata interações de comandos
        if (interaction.isCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`Comando não encontrado: ${interaction.commandName}`);
                return interaction.reply({ content: 'Desculpe, esse comando não existe.', ephemeral: true });
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Erro ao executar o comando ${interaction.commandName}:`, error);
                return interaction.reply({ content: 'Desculpe, ocorreu um erro ao processar seu comando.', ephemeral: true });
            }
        }
        // Trata interações de botões
        else if (interaction.isButton()) {
            await handleButtonInteraction(interaction);
        }
        // Trata submissões de modal
        else if (interaction.isModalSubmit()) {
            await handleSubmitModal(interaction);
        }
    },
};

