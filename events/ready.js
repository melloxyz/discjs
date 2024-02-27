module.exports = {
    name: 'ready',
    once: true,
    execute(client, db = null) {
        console.log(`Bot está online! Logado como ${client.user.tag}`);

        // Outras inicializações podem ser feitas aqui
    },
};
