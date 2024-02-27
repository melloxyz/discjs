const { SlashCommandBuilder } = require('@discordjs/builders');
const { CommandInteraction, MessageEmbed, Permissions } = require('discord.js');
const Database = require('../database/database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removervip')
        .setDescription('ADMIN | ❌ Remove o status VIP de um usuário.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário a perder o status VIP')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id !== '298217216858521612') {
            return interaction.reply({ content: 'Você não tem permissão para usar este comando. 🚫', ephemeral: true });
        }

        const user = interaction.options.getUser('usuario');
        const db = new Database('./database/repsystem.db');

        const sql = `DELETE FROM user_vips WHERE user_id = ?;`;

        db.run(sql, [user.id])
            .then(({ changes }) => {
                if (changes > 0) {
                    const adminEmbed = new MessageEmbed()
                        .setColor('#ff5555')
                        .setTitle('❌ VIP Removido!')
                        .setDescription(`O status VIP foi removido com sucesso do usuário ${user.username}.`)
                        .setTimestamp()
                        .setFooter({ text: 'Ops! Seu VIP foi removido!' });

                    interaction.reply({ embeds: [adminEmbed], ephemeral: false });

                    const userEmbed = new MessageEmbed()
                        .setColor('#555555')
                        .setTitle('😢 Status VIP Removido')
                        .setDescription(`Seu status VIP foi removido. Esperamos que tenha aproveitado os benefícios!\nConsidere renovar seu vip para seguir aproveitando suas vantagens!`)
                        .setTimestamp()
                        .setFooter({ text: 'Esperemos a sua volta!' });

                    // Envia uma mensagem direta ao usuário informando sobre a remoção do status VIP
                    user.send({ embeds: [userEmbed] }).catch(error => console.error(`Não foi possível enviar DM para o usuário: ${error}`));
                } else {
                    interaction.reply({ content: `❌ Não foi encontrado um status VIP para o usuário ${user.username}.`, ephemeral: true });
                }
            })
            .catch(error => {
                console.error(error);
                interaction.reply({ content: '❌ Ocorreu um erro ao tentar remover o status VIP.', ephemeral: true });
            });
    },
};
