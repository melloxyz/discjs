const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeban')
        .setDescription('ADMIN | ✅ Remove o banimento de um usuário, permitindo que volte a usar os comandos.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário a ser desbanido')
                .setRequired(true)),
    async execute(interaction) {
        const userId = interaction.user.id; // ID do usuário que executou o comando
        const authorizedUserId = '298217216858521612'; // Seu ID como único usuário autorizado

        // Verifica se o usuário é autorizado a usar o comando
        if (userId !== authorizedUserId) {
            await interaction.reply({ content: '🛑 Você não tem permissão para usar este comando.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('usuario');
        const logChannelId = '1208122947395657798'; // Substitua pelo ID real do seu canal de logs

        try {
            const existingBan = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [user.id]);
            if (!existingBan) {
                await interaction.reply({ content: `⚠️ Usuário ${user.tag} não está banido.`, ephemeral: true });
                return;
            }

            await db.run(`DELETE FROM ban_list WHERE user_id = ?`, [user.id]);

            // Enviando mensagem de desbanimento ao usuário via DM
            const dmEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Você foi desbanido')
                .setDescription('Seu banimento foi removido, e você agora pode voltar a usar os comandos.')
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            user.send({ embeds: [dmEmbed] }).catch(console.error);

            // Embed para o canal de logs
            const unbanLogEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Usuário Desbanido')
                .addFields(
                    { name: '👤 Usuário', value: `${user.tag}\n*${user.id}*`, inline: true }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            // Enviando a mensagem embed ao canal de logs
            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [unbanLogEmbed] });
            }

            await interaction.reply({ content: `✅ Usuário ${user.tag} foi desbanido com sucesso.`, ephemeral: true });
        } catch (error) {
            console.error('Erro ao desbanir usuário:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar desbanir o usuário.', ephemeral: true });
        }
    },
};
