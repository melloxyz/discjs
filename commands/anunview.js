const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunview')
        .setDescription('ADMIN | 📣 Visualiza o ID e o criador de todos os anúncios existentes em ordem.'),
    async execute(interaction) {
        // Verifica se o usuário é autorizado
        if (interaction.user.id !== '298217216858521612') {
            return interaction.reply({ content: '❌ Você não tem permissão para usar este comando.', ephemeral: true });
        }

        try {
            // Seleciona todos os anúncios ordenados pela data de publicação
            const anuncios = await db.all(`SELECT anuncio_id, user_id FROM anuncios ORDER BY data_publicacao DESC`);

            if (anuncios.length === 0) {
                return interaction.reply({ content: '🚫 Não há anúncios no momento.', ephemeral: true });
            }

            // Prepara as embeds
            const embeds = [];
            let embed = new EmbedBuilder()
                .setTitle('📣 Anúncios Ativos')
                .setColor(0x00AE86)
                .setDescription('Aqui estão todos os anúncios ativos ordenados pela data de publicação:');

            anuncios.forEach((anuncio, index) => {
                if (index % 25 === 0 && index !== 0) { // Cria uma nova embed a cada 25 anúncios
                    embeds.push(embed);
                    embed = new EmbedBuilder().setColor(0x00AE86);
                }
                embed.addFields(
                    { name: `🆔 Anúncio ID: ${anuncio.anuncio_id}`, value: `👤 Criador: <@${anuncio.user_id}>` }
                );
            });
            embeds.push(embed); // Adiciona a última embed à lista

            // Envia as embeds em resposta ao comando
            await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: true }); // Limita a 10 embeds por mensagem para evitar sobrecarga
        } catch (error) {
            console.error(`❌ Erro ao buscar anúncios: ${error}`);
            await interaction.reply({ content: '❌ Houve um erro ao tentar buscar os anúncios. Por favor, tente novamente mais tarde.', ephemeral: true });
        }
    },
};
