const { SlashCommandBuilder, EmbedBuilder, userMention } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sellerview')
        .setDescription('🔍 Mostra os anúncios ativos de um usuário.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário que você quer ver os anúncios')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;

        try {
            const anuncios = await db.all(`SELECT * FROM anuncios WHERE user_id = ? AND status = 'ativo'`, [user.id]);
            
            if (anuncios.length === 0) {
                return interaction.reply({ content: `🚫 Não há anúncios ativos para ${user === interaction.user ? "você" : "este usuário"}.`, ephemeral: true });
            }

            const embeds = anuncios.map((anuncio, index) => {
                const embed = new EmbedBuilder()
                    .setTitle(`${anuncio.titulo} 📢`)
                    .setDescription(`👤 **Vendedor:** ${userMention(anuncio.user_id)}`)
                    .addFields(
                        { name: '💰 Valor', value: `R$${anuncio.valor}`, inline: true },
                        { name: '📦 Estoque', value: anuncio.estoque.toString(), inline: true },
                        { name: '🏷️ Tipo', value: anuncio.tipo, inline: true },
                        { name: '🗓️ Data de Publicação', value: `<t:${Math.floor(new Date(anuncio.data_publicacao).getTime() / 1000)}:d>`, inline: false }
                    )
                    .setFooter({ text: `🆔 Anúncio ID: ${anuncio.anuncio_id}` })
                    .setColor(index % 2 === 0 ? '#0099ff' : '#ff99c8');

                if (anuncio.venda_minima) {
                    embed.addFields({ name: '🛒 Venda Mínima', value: anuncio.venda_minima.toString(), inline: true });
                }

                if (anuncio.imagem_url) {
                    embed.setThumbnail(anuncio.imagem_url);
                }

                return embed;
            });

            await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: false }); // Limita a 10 embeds por mensagem
        } catch (error) {
            console.error(`❌ Erro ao buscar anúncios: ${error}`);
            await interaction.reply({ content: '❌ Houve um erro ao tentar buscar os anúncios. Por favor, tente novamente mais tarde.', ephemeral: true });
        }
    },
};
