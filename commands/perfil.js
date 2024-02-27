const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../database/database.js');

const ranks = [
    { threshold: 10, name: "📘 Aprendiz" },
    { threshold: 25, name: "🔎 Detetive" },
    { threshold: 50, name: "📖 Historiador" },
    { threshold: 75, name: "🛡️ Guardião" },
    { threshold: 100, name: "🏹 Arqueiro" },
    { threshold: 150, name: "⚔️ Guerreiro" },
    { threshold: 200, name: "🧙‍♂️ Feiticeiro" },
    { threshold: 250, name: "🔮 Vidente" },
    { threshold: 300, name: "👨‍🔬 Cientista" },
    { threshold: 350, name: "🧪 Alquimista" },
    { threshold: 400, name: "🎓 Erudito" },
    { threshold: 450, name: "🌌 Explorador Espacial" },
    { threshold: 500, name: "🛡️ Cavaleiro" },
    { threshold: 550, name: "🐉 Caçador de Dragões" },
    { threshold: 600, name: "🌟 Estrela Ascendente" },
    { threshold: 650, name: "🚀 Astronauta" },
    { threshold: 700, name: "🎩 Mágico" },
    { threshold: 750, name: "👑 Nobre" },
    { threshold: 800, name: "🏰 Senhor do Castelo" },
    { threshold: 850, name: "🔱 Tridente de Poseidon" },
    { threshold: 900, name: "⚡ Deus do Trovão" },
    { threshold: 950, name: "🌪️ Mestre dos Elementos" },
    { threshold: 1000, name: "🔥 Lendário" },
    { threshold: 1050, name: "🌈 Mestre do Universo" },
    { threshold: 1100, name: "🛸 Viajante Interestelar" },
    { threshold: 1150, name: "🌍 Guardião do Planeta" },
    { threshold: 1200, name: "🌌 Conquistador Galáctico" },
    { threshold: 1250, name: "⏳ Senhor do Tempo" },
    { threshold: 1300, name: "🌟 Entidade Cósmica" },
    { threshold: 1350, name: "✨ Iluminado" },
    { threshold: 1400, name: "🧿 Oráculo" },
    { threshold: 1450, name: "💫 Viajante Dimensional" },
    { threshold: 1500, name: "🏔️ Conquistador de Mundos" },
    { threshold: 1550, name: "🕊️ Embaixador da Paz" },
    { threshold: 1600, name: "👽 Contato Extraterrestre" },
    { threshold: 1650, name: "🌪️ Senhor dos Ventos" },
    { threshold: 1700, name: "🔥 Flamejante" },
    { threshold: 1750, name: "🌊 Mestre dos Mares" },
    { threshold: 1800, name: "🗻 Gigante da Montanha" },
    { threshold: 1850, name: "☀️ Filho do Sol" },
    { threshold: 1900, name: "🌙 Guardião Lunar" },
    { threshold: 1950, name: "🌌 Tecelão do Cosmos" },
    { threshold: 2000, name: "⚛️ Mestre Quântico" },
    { threshold: 2050, name: "🎇 Arquiteto do Destino" },
    { threshold: 2100, name: "🌐 Soberano do Multiverso" },
    { threshold: 2150, name: "👑 Monarca Cósmico" },
    { threshold: 2200, name: "🚀 Comandante Interestelar" },
    { threshold: 2250, name: "⌛ Guardião do Tempo" },
    { threshold: 2300, name: "🧬 Engenheiro Genético" },
    { threshold: 2350, name: "💍 Senhor dos Anéis" },
    { threshold: 2400, name: "🔮 Orbe da Visão" },
    { threshold: 2450, name: "🌟 Estrela Polar" },
    { threshold: 2500, name: "🦉 Sábio Eterno" },
    { threshold: 2550, name: "🔵 Pioneiro do Infinito" },
    { threshold: 2600, name: "🌈 Arco-Íris Cósmico" },
    { threshold: 2650, name: "🛡️ Defensor do Universo" },
    { threshold: 2700, name: "🕯️ Guardião da Chama Eterna" },
    { threshold: 2750, name: "💠 Diamante Espacial" },
    { threshold: 2800, name: "🌀 Vórtice Supremo" },
    { threshold: 2850, name: "⚖️ Equilibrador de Mundos" },
    { threshold: 2900, name: "🌺 Harmonizador Galáctico" },
    { threshold: 2950, name: "🪐 Dançarino dos Planetas" },
    { threshold: 3000, name: "🌌 Lenda Universal" },
    { threshold: 3000, name: "🪐 Descobridor de Mundos" },
    { threshold: 3200, name: "🌙 Cultivador Lunar" },
    { threshold: 3400, name: "☀️ Mestre Solar" },
    { threshold: 3600, name: "🌌 Guardião Galáctico" },
    { threshold: 3800, name: "🛸 Viajante do Vácuo" },
    { threshold: 4000, name: "🌠 Sonhador Cósmico" },
    { threshold: 4200, name: "⚛️ Físico Quântico" },
    { threshold: 4400, name: "🌐 Unificador de Galáxias" },
    { threshold: 4600, name: "🌠 Nebulosa" },
    { threshold: 4800, name: "🛸 Satélite" },
    { threshold: 5000, name: "🌀 Minhoca" },
    { threshold: 5200, name: "🪐 Exoplaneta" },
    { threshold: 5400, name: "🌑 Matéria Escura" },
    { threshold: 5600, name: "🔭 Estrelar" },
    { threshold: 5800, name: "🌌 Quasar" },
    { threshold: 6000, name: "🌐 Megaestrutura" }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('perfil')
        .setDescription('🥷 Mostra o perfil e a reputação de um usuário.')
        .addUserOption(option => option.setName('usuario').setDescription('O usuário que você quer ver o perfil (opcional).')),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;

        if (user.bot) {
            await interaction.reply({ content: '🤖 Bots não têm perfil de reputação.', ephemeral: true });
            return;
        }

        try {
            // Verifica se o usuário está banido
            const banInfo = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [user.id]);
            if (banInfo) {
                const banEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Aviso de Banimento')
                    .setColor('#FF0000')
                    .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`**${user.username} está banido(a)**.\nCaso discorde desta decisão, sinta-se a vontade para entrar em contato com nossa equipe admistrativa para solicitar a reavaliação do banito.`)
                    .addFields(
                        { name: '🔨 Banido Por:', value: `<@${banInfo.banido_por}>`, inline: true },
                        { name: '📝 Motivo:', value: banInfo.reason || 'Não especificado' }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [banEmbed], ephemeral: false });
                return;
            }

            const row = await db.get(`SELECT * FROM users WHERE id = ?`, [user.id]);
            if (!row) {
                await interaction.reply({ content: '`😮 Este usuário ainda não tem perfil de reputação.`', ephemeral: true });
                return;
            }

            const reputation = row.reputation || 0;
            const lastGiven = row.last_given_reputation ? new Date(row.last_given_reputation).toLocaleDateString("pt-BR") : 'N/A';
            const totalGiven = row.reputations_given || 0;
            let userRank = ranks.slice().reverse().find(rank => reputation >= rank.threshold)?.name || "🌱 Novato";

            const profileEmbed = new EmbedBuilder()
                .setTitle(`🛡️ Perfil de Reputação: ${user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setDescription('```Este sistema busca criar um ambiente justo e seguro para comunidades de comércio online. Oferece um sistema de reputação e interação entre os usuários, permitindo que verifiquem as atividades uns dos outros para promover transparência e confiança nas transações.```')
                .setColor('#0099ff')
                .addFields(
                    { name: ' ', value: ` `, inline: true },
                    { name: ' ', value: ` `, inline: true },
                    { name: ' ', value: ` `, inline: true },
                    { name: '🥷 Usuário:', value: `${user.username}`, inline: true },
                    { name: '✨ Reputação:', value: `${reputation} pontos`, inline: true },
                    { name: '🏆 Rank:', value: userRank, inline: true },
                    { name: '📅 Última Reputação:', value: `${lastGiven}`, inline: true },
                    { name: '🔢 Reputações Dadas:', value: `${totalGiven} pontos`, inline: true },
                    { name: ' ', value: ` `, inline: true }
                )
                .setFooter({ text: `Use o comando /sellerview ${user.username}, para ver os anuncios ativos desse usuário.` })
                .setTimestamp();

            await interaction.reply({ embeds: [profileEmbed], ephemeral: false });
        } catch (error) {
            console.error('Erro ao acessar o banco de dados:', error);
            await interaction.reply({ content: '❗Ocorreu um erro ao acessar o perfil.', ephemeral: true });
        }
    },
};
