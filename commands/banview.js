const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('banview')
        .setDescription('🔍 Visualiza detalhes de um banimento.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário para verificar o banimento')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id;
        const authorizedUserId = '298217216858521612';

        if (userId !== authorizedUserId) {
            await interaction.reply({ content: '🛑 Você não tem permissão para usar este comando.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('usuario');

        try {
            const banDetails = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [user.id]);
            if (!banDetails) {
                await interaction.reply({ content: `⚠️ Não há registro de banimento para o usuário ${user.tag}.`, ephemeral: true });
                return;
            }

            const banDate = banDetails.ban_date ? `<t:${new Date(banDetails.ban_date).getTime() / 1000}:F>` : 'Data não disponível';
            const reason = banDetails.reason || 'Motivo não informado';
            const banidoPor = banDetails.banido_por || 'Autor não identificado';

            const banDetailsEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('Detalhes do Banimento')
                .setThumbnail(user.displayAvatarURL())
                .addFields(
                    { name: '👤 Usuário', value: `${user.tag}\n*${user.id}*` },
                    { name: '🚫 Banido Por', value: banidoPor },
                    { name: '📅 Data do Banimento', value: banDate },
                    { name: '📝 Motivo', value: reason }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [banDetailsEmbed] });
        } catch (error) {
            console.error('Erro ao buscar detalhes do banimento:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar buscar os detalhes do banimento.', ephemeral: true });
        }
    },
};
