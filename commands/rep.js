const { SlashCommandBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

// Defina o cooldown em milissegundos (exemplo: 86400000 ms = 24 horas)
const COOLDOWN_PERIOD = 43200000; // 12 horas

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rep')
        .setDescription('🥳 Dá um ponto de reputação a um usuário.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('O usuário que receberá reputação')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: false });

        const recipient = interaction.options.getUser('user');
        const recipientId = recipient.id;
        const giverId = interaction.user.id;

        // Verificação de banimento para quem dá a reputação
        const giverBan = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [giverId]);
        if (giverBan) {
            return interaction.editReply('❌ Você está banido e não pode dar reputação.');
        }

        // Verificação de banimento para quem recebe a reputação
        const recipientBan = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [recipientId]);
        if (recipientBan) {
            return interaction.editReply('❌ O usuário destinatário está banido e não pode receber reputação.');
        }

        if (recipientId === giverId) {
            return interaction.editReply('❌ Você não pode dar reputação a si mesmo.');
        }

        if (recipient.bot) {
            return interaction.editReply('❌ Bots não podem receber reputação.');
        }

        try {
            // Verifica se o usuário já deu reputação recentemente
            const log = await db.get(`SELECT date_given FROM reputation_logs WHERE giver_id = ? AND receiver_id = ? ORDER BY date_given DESC LIMIT 1`, [giverId, recipientId]);
            if (log) {
                const lastGiven = new Date(log.date_given).getTime();
                const now = new Date().getTime();
                if (now - lastGiven < COOLDOWN_PERIOD) {
                    const timeLeft = ((COOLDOWN_PERIOD - (now - lastGiven)) / 3600000).toFixed(1); // Tempo restante em horas
                    return interaction.editReply(`❌ Você já deu reputação a este usuário recentemente. Por favor, espere mais ${timeLeft} hora(s) antes de tentar novamente.`);
                }
            }

            // Continua com a lógica de adicionar reputação...
            await db.run(`INSERT INTO users (id, username, reputation) VALUES (?, ?, 1) ON CONFLICT(id) DO UPDATE SET reputation = reputation + 1, username = ?`, [recipientId, recipient.username, recipient.username]);
            console.log(`Reputação do usuário ${recipient.username} atualizada com sucesso.`);

            // Insere um registro de doação de reputação na tabela de logs
            await db.run(`INSERT INTO reputation_logs (giver_id, receiver_id, date_given) VALUES (?, ?, ?)`, [giverId, recipientId, new Date().toISOString()]);
            console.log(`Log de reputação para ${recipient.username} registrado com sucesso.`);
            await interaction.editReply(`🥳 **${recipient.username}** recebeu **+1 ponto** de reputação!`);

        } catch (error) {
            console.error('Erro ao atualizar a reputação:', error);
            await interaction.editReply('❗Ocorreu um erro ao atualizar a reputação do usuário.');
        }
    },
};
