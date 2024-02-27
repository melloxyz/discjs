const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed } = require('discord.js');
const Database = require('../database/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statusvip')
        .setDescription('🌟 Verifica o status do seu VIP e informações sobre como adquiri-lo.'),
    async execute(interaction) {
        const user = interaction.user;
        const db = new Database('./database/repsystem.db');

        const sql = `SELECT * FROM user_vips WHERE user_id = ?;`;

        db.get(sql, [user.id])
            .then((vipInfo) => {
                if (vipInfo) {
                    // Usuário possui VIP
                    const expirationDate = new Date(vipInfo.expiration_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
                    const publicEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('🌟 Status VIP')
                        .setDescription(`Você possui status VIP!`)
                        .addFields(
                            { name: '💎 Nível do VIP', value: `${vipInfo.vip_level}`, inline: true },
                            { name: '⏰ Expira em', value: `${expirationDate}`, inline: true }
                        )
                        .setFooter({ text: '📬 Verifique suas DMs para mais informações!' });

                    interaction.reply({ embeds: [publicEmbed], ephemeral: false });

                    const privateEmbed = new MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('🌟 Detalhes do seu Status VIP')
                        .setDescription(`Aqui estão os detalhes completos do seu status VIP e como você pode estendê-lo.`)
                        .addFields(
                            { name: '💎 Nível do VIP', value: `${vipInfo.vip_level}`, inline: true },
                            { name: '⏰ Expira em', value: `${expirationDate}`, inline: true },
                            { name: '🧐 Como estender seu VIP', value: 'Visite nosso Discord oficial para mais informações sobre como adquirir ou estender seu status VIP.' }
                        );

                    user.send({ embeds: [privateEmbed] }).catch(error => console.error(`❌ Não foi possível enviar DM para o usuário: ${error}`));
                } else {
                    // Usuário não possui VIP
                    const publicEmbed = new MessageEmbed()
                        .setColor('#ff5555')
                        .setTitle('😱 Status VIP')
                        .setDescription(`Você não possui status VIP no momento.`)
                        .setFooter({ text: '📬 Verifique suas DMs para saber como adquiri-lo!' });

                    interaction.reply({ embeds: [publicEmbed], ephemeral: false });

                    const privateEmbed = new MessageEmbed()
                        .setColor('#ff5555')
                        .setTitle('🌟 Como Adquirir Status VIP')
                        .setDescription(`Parece que você ainda não tem status VIP. Aqui está como você pode adquirir:`)
                        .addFields(
                            { name: '🧐 Adquirir VIP', value: 'Visite nosso Discord oficial para mais informações sobre como adquirir status VIP.' }
                        );

                    user.send({ embeds: [privateEmbed] }).catch(error => console.error(`❌ Não foi possível enviar DM para o usuário: ${error}`));
                }
            })
            .catch(error => {
                console.error(error);
                interaction.reply({ content: '❌ Ocorreu um erro ao tentar verificar o status VIP.', ephemeral: true });
            });
    },
};
