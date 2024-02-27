module.exports = {
    name: 'error',
    execute: async (error, client) => {
        console.error(`Um erro não tratado foi capturado: ${error.message}\nStack: ${error.stack || "No stack trace available."}`);

        const logChannelId = '1207757290132865064'; // Substitua pelo ID real do seu canal de logs no Discord

        try {
            const channel = await client.channels.fetch(logChannelId);
            if (!channel) {
                console.error("Canal de logs não encontrado.");
                return;
            }
            
            // Verifica se o canal permite envio de mensagens
            if (channel.isText()) {
                await channel.send({
                    content: `⚠️ **Erro Capturado:**\n\`\`\`js\n${error.message}\n\`\`\`\nStack: \`\`\`js\n${error.stack || "No stack trace available."}\n\`\`\``
                });
            }
        } catch (err) {
            console.error("Erro ao enviar mensagem de log no canal:", err);
        }
    },
};
