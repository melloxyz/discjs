const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toprank')
        .setDescription('🏆 Exibe os 10 usuários com mais reputação e sua posição.'),
    async execute(interaction) {
        // Recupera os 10 primeiros usuários ordenados por reputação
        const topUsers = await db.all(`SELECT username, reputation FROM users ORDER BY reputation DESC LIMIT 10`);
        
        // Encontra a posição do usuário atual
        const userPosition = await db.get(`SELECT COUNT(*) as position FROM users WHERE reputation > (SELECT reputation FROM users WHERE id = ?)`, [interaction.user.id]);
        const userReputation = await db.get(`SELECT reputation FROM users WHERE id = ?`, [interaction.user.id]);

        // Cria a Embed para exibir o top 10
        const topEmbed = new EmbedBuilder()
            .setColor('#2B2D31')
            .setTitle('🏆 Top 10 Maiores Reputações!')
            .setDescription('Veja quem são os usuários com mais reputação!')
            .setFooter({ text: '🧙‍♂️ Siga firma em sua jornada para alcançar o topo!' })
            .setTimestamp();


        // Adiciona os usuários ao campo da Embed
        topUsers.forEach((user, index) => {
            topEmbed.addFields({ name: `#${index + 1} ${user.username}`, value: `Reputação: ${user.reputation}`, inline: false });
        });

        // Adiciona a posição do usuário que executou o comando
        if (userPosition && userReputation) {
            topEmbed.addFields(
                { name: 'Sua Posição', value: `Você está na posição #${userPosition.position + 1} com ${userReputation.reputation} pontos de reputação.`, inline: false }
            );
        } else {
            topEmbed.addFields(
                { name: 'Sua Posição', value: 'Você ainda não está no ranking.', inline: false }
            );
        }

        await interaction.reply({ embeds: [topEmbed] });
    },
};
