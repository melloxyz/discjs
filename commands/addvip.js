const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed } = require('discord.js');
const Database = require('../database/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addvip')
        .setDescription('ADMIN | 🌟 Adiciona status VIP a um usuário.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário a receber o status VIP')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('nivel')
                .setDescription('O nível do VIP')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('duracao')
                .setDescription('Duração do status VIP em dias')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id !== '298217216858521612') {
            return interaction.reply({ content: '🚫 Você não tem permissão para usar este comando.', ephemeral: true });
        }

        const user = interaction.options.getUser('usuario');
        const vipLevel = interaction.options.getInteger('nivel');
        const duration = interaction.options.getInteger('duracao');
        const db = new Database('./database/repsystem.db');
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + duration);

        const sql = `
            INSERT INTO user_vips (user_id, vip_level, start_date, expiration_date)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                vip_level = excluded.vip_level,
                start_date = CURRENT_TIMESTAMP,
                expiration_date = excluded.expiration_date;
        `;

        db.run(sql, [user.id, vipLevel, expirationDate.toISOString()])
            .then(async () => {
                const adminEmbed = new MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('🌟 VIP Adicionado!')
                    .setDescription(`O status VIP foi concedido com sucesso ao usuário ${user.username}.`)
                    .addFields(
                        { name: '🧙‍♂️ Nível do VIP', value: `${vipLevel}`, inline: true },
                        { name: '⏰ Expira em', value: `${expirationDate.toDateString()}`, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: '💎 Parabéns por Adquirir seu VIP!' });

                await interaction.reply({ embeds: [adminEmbed], ephemeral: false });

                const userEmbed = new MessageEmbed()
                    .setColor('#ffaa00')
                    .setTitle('🎉 Parabéns! Você agora você é VIP!')
                    .setDescription(`Você recebeu o status VIP com nível ${vipLevel}!`)
                    .addFields(
                        { name: '📆 Duração', value: `${duration} dias`, inline: true },
                        { name: '⏰ Expira em', value: `${expirationDate.toDateString()}`, inline: true },
                    )
                    .setTimestamp()
                    .setFooter({ text: '🎊 Aproveite os benefícios!' });

                // Envia uma mensagem direta ao usuário com informações sobre seu status VIP
                user.send({ embeds: [userEmbed] }).catch(error => console.error(`❌ Não foi possível enviar DM para o usuário: ${error}`));
            })
            .catch(error => {
                console.error(error);
                interaction.reply({ content: '❌ Ocorreu um erro ao tentar adicionar o status VIP.', ephemeral: true });
            });
    },
};
