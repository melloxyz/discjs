const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gerenciar')
        .setDescription('📝 Gerencie seus anúncios.')
        .addStringOption(option =>
            option.setName('excluir')
                .setDescription('ID do anúncio para excluir ou "all" para todos')
                .setRequired(false)),
    async execute(interaction) {
        const excluir = interaction.options.getString('excluir');

        if (excluir) {
            try {
                if (excluir.toLowerCase() === 'all') {
                    // Excluir todos os anúncios do usuário
                    const result = await db.run(`DELETE FROM anuncios WHERE user_id = ?`, [interaction.user.id]);
                    if (result.changes > 0) {
                        await interaction.reply({ content: '✅ Todos os seus anúncios foram excluídos.', ephemeral: true });
                    } else {
                        await interaction.reply({ content: '❌ Não foram encontrados anúncios para excluir.', ephemeral: true });
                    }
                } else {
                    // Tentativa de excluir anúncio específico pelo ID
                    const anuncioId = parseInt(excluir, 10);
                    if (isNaN(anuncioId)) {
                        return await interaction.reply({ content: '❔ Por favor, forneça um ID de anúncio válido ou "all" para excluir todos.', ephemeral: true });
                    }

                    const anuncio = await db.get(`SELECT * FROM anuncios WHERE anuncio_id = ?`, [anuncioId]);
                    if (!anuncio) {
                        return await interaction.reply({ content: `❌ Não foi encontrado um anúncio com o ID ${anuncioId}.`, ephemeral: true });
                    }

                    if (anuncio.user_id !== interaction.user.id) {
                        return await interaction.reply({ content: '❌ Você não tem permissão para excluir este anúncio.', ephemeral: true });
                    }

                    await db.run(`DELETE FROM anuncios WHERE anuncio_id = ?`, [anuncioId]);
                    await interaction.reply({ content: `✅ Anúncio com ID ${anuncioId} foi excluído.`, ephemeral: true });
                }
            } catch (error) {
                console.error('❌ Erro ao excluir anúncios:', error);
                await interaction.reply({ content: '❌ Ocorreu um erro ao tentar excluir os anúncios. Por favor, tente novamente mais tarde.', ephemeral: true });
            }
            return;
        }

        // Exibir anúncios ativos se não estiver excluindo
        try {
            const anuncios = await db.all(`SELECT anuncio_id, titulo, data_publicacao FROM anuncios WHERE user_id = ? AND status = 'ativo'`, [interaction.user.id]);
            if (anuncios.length === 0) {
                return interaction.reply({ content: '❌ Você não tem anúncios ativos no momento.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('📢 Seus Anúncios de Venda')
                .setDescription('Seus anúncios Ativos no Momento:')
                .setColor(0x0099FF);

            anuncios.forEach(anuncio => {
                embed.addFields({ name: `🔹${anuncio.titulo}`, value: `📅 **Data:** ${anuncio.data_publicacao}\n**🆔 do Anuncio:** ${anuncio.anuncio_id}` });
            });

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('❌ Erro ao buscar anúncios:', error);
            await interaction.reply({ content: '❌ Ocorreu um erro ao tentar buscar seus anúncios. Por favor, tente novamente mais tarde.', ephemeral: true });
        }
    },
};
