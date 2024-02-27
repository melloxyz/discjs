const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🏓 Responde com Pong e a latência do bot.'),
    async execute(interaction) {
        // Inicia o cálculo da latência enviando uma mensagem temporária
        const sent = await interaction.reply({ content: 'Calculando latência...', fetchReply: true });
        const timeDiff = sent.createdTimestamp - interaction.createdTimestamp;

        // Calcula a latência da API do Discord
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Cria uma Embed para exibir as informações de forma atraente
        const embed = new EmbedBuilder()
            .setColor('#0099ff') // Define a cor da barra lateral da Embed
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Latência do Bot', value: `${timeDiff}ms`, inline: true },
                { name: 'Latência da API', value: `${apiLatency}ms`, inline: true }
            )
            .setTimestamp() // Adiciona um carimbo de data/hora à Embed
            .setFooter({ text: 'Informações de latência do bot' });

        // Edita a mensagem de resposta com a Embed criada
        await interaction.editReply({ content: ' ', embeds: [embed] });
    },
};
