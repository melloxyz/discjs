const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('debug')
        .setDescription('ADMIN | 👾 Uso somente para usuário autorizados.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário que você deseja ajustar a reputação.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('ação')
                .setDescription('Adicionar ou remover pontos de reputação.')
                .setRequired(true)
                .addChoices(
                    { name: 'adicionar', value: 'add' },
                    { name: 'remover', value: 'remove' }))
        .addIntegerOption(option =>
            option.setName('quantidade')
                .setDescription('A quantidade de pontos de reputação para ajustar.')
                .setRequired(true)),
    async execute(interaction) {
        // Verificação de permissão
        if (interaction.user.id !== '298217216858521612') {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const user = interaction.options.getUser('usuario');
        const action = interaction.options.getString('ação');
        const amount = interaction.options.getInteger('quantidade');

        // Não permitir ajuste de reputação de bots
        if (user.bot) {
            return interaction.reply({ content: '❌ Não é possível ajustar a reputação de bots.', ephemeral: true });
        }

        try {
            // Verifica se o usuário já existe na base de dados
            const userData = await db.get(`SELECT * FROM users WHERE id = ?`, [user.id]);

            // Se o usuário não existir, insere com reputação inicial 0
            if (!userData) {
                await db.run(`INSERT INTO users (id, username, reputation) VALUES (?, ?, 0)`, [user.id, user.username]);
            }

            // Lógica de adição ou remoção de reputação
            const newReputation = action === 'add' ? (userData ? userData.reputation + amount : amount) : (userData ? Math.max(0, userData.reputation - amount) : 0);

            // Atualiza a reputação do usuário
            await db.run(`UPDATE users SET reputation = ? WHERE id = ?`, [newReputation, user.id]);

            await interaction.reply({ content: `⚙️ A reputação de **${user.username}** foi ${action === 'add' ? '**➕ Aumentada**' : '**➖ Diminuída**'} em **${amount}**.` });

        } catch (err) {
            console.error('Erro ao ajustar a reputação:', err);
            await interaction.reply({ content: '❌ Ocorreu um erro ao ajustar a reputação.', ephemeral: true });
        }
    },
};
