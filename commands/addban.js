// addban.js completo com Embeds estilizados
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Certifique-se de que o caminho esteja correto

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addban')
        .setDescription('ADMIN | 🚫 Bane um usuário do uso dos comandos.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('O usuário a ser banido')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('razao')
                .setDescription('A razão do banimento')
                .setRequired(true)),
    async execute(interaction) {
        const executorId = interaction.user.id; // ID do usuário que executou o comando
        const authorizedUserId = '298217216858521612'; // ID do administrador autorizado a banir usuários

        // Verifica se o executor do comando tem permissão para usar este comando
        if (executorId !== authorizedUserId) {
            await interaction.reply({ content: '🛑 Você não tem permissão para usar este comando.', ephemeral: true });
            return;
        }

        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razao');
        const logChannelId = '1208119324846456882'; // ID do canal de logs

        try {
            // Verifica se o usuário já está banido
            const existingBan = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [user.id]);
            if (existingBan) {
                await interaction.reply({ content: `⚠️ Usuário ${user.tag} já está banido.`, ephemeral: true });
                return;
            }

            // Insere o banimento no banco de dados
            await db.run(`INSERT INTO ban_list (user_id, reason, banido_por) VALUES (?, ?, ?)`, [user.id, reason, executorId]);

            // Remove todos os anúncios do usuário banido
            await db.run(`DELETE FROM anuncios WHERE user_id = ?`, [user.id]);

            // Envia DM para o usuário informando sobre o banimento
            const dmEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚠️ Você foi banido')
                .setDescription(`Você foi banido por violar as regras do sistema.`)
                .addFields(
                    { name: '📋 Razão do Banimento:', value: reason },
                    { name: '🧐 Quer contestar o banimento?', value: 'Se você acredita que isso foi um erro, por favor entre em contato conosco, pelo nosso discord oficial.' }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            await user.send({ embeds: [dmEmbed] }).catch(console.error);

            // Prepara o Embed para o canal de logs
            const logEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('🚫 Usuário Banido')
                .setDescription(`O usuário **${user.tag}** foi banido do sistema.`)
                .addFields(
                    { name: '🥸 Usuário:', value: `${user.tag} (${user.id})`, inline: true },
                    { name: '🧙‍♂️ Banido Por:', value: `<@${executorId}>`, inline: true },
                    { name: '📋 Razão:', value: reason, inline: false },
                    { name: '🧹 Anúncios Removidos:', value: 'Todos os anúncios relacionados a este usuário foram removidos.', inline: false }
                )
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();

            // Envia a mensagem embed ao canal de logs
            const logChannel = await interaction.guild.channels.fetch(logChannelId);
            if (logChannel) {
                await logChannel.send({ embeds: [logEmbed] });
            }

            // Confirma o banimento para o executor do comando
            await interaction.reply({ content: `🚫 Usuário ${user.tag} foi banido com sucesso. Razão: ${reason}. Todos os anúncios relacionados foram removidos.`, ephemeral: true });

        } catch (error) {
            console.error('Erro ao executar o comando /addban:', error);
            await interaction.reply({ content: 'Houve um erro ao tentar banir o usuário e remover seus anúncios. Por favor, tente novamente mais tarde.', ephemeral: true });
        }
    },
};
