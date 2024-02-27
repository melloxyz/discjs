const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

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

// Configurações
const MAX_ANUNCIOS_POR_USUARIO = 10; // Máximo de anúncios ativos por usuário

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anunciar')
        .setDescription('💸 Cria um anúncio de venda.')
        .addStringOption(option =>
            option.setName('titulo')
                .setDescription('Título da venda')
                .setRequired(true))
        .addNumberOption(option =>
            option.setName('valor')
                .setDescription('Valor do item ou serviço')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('estoque')
                .setDescription('Quantidade de itens disponíveis ou horas para serviços')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('tipo')
                .setDescription('Tipo do anúncio')
                .setRequired(true)
                .addChoices(
                    { name: 'Itens', value: 'Itens' },
                    { name: 'Gold', value: 'Gold' },
                    { name: 'Saldo', value: 'Saldo' },
                    { name: 'Serviços', value: 'Servicos' },
                    { name: 'Contas', value: 'Contas' },
                    { name: 'Outros', value: 'Outros' }
                ))
        .addIntegerOption(option =>
            option.setName('venda_minima')
                .setDescription('Quantidade mínima para venda (opcional)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('imagem')
                .setDescription('URL da imagem do item ou serviço (opcional)')
                .setRequired(false)),
    async execute(interaction) {
        const userBanStatus = await db.get(`SELECT * FROM ban_list WHERE user_id = ?`, [interaction.user.id]);
        if (userBanStatus) {
            return interaction.reply({ content: '❌ Você está banido de fazer anúncios.', ephemeral: true });
        }

        const anunciosAtivos = await db.all(`SELECT * FROM anuncios WHERE user_id = ? AND status = 'ativo'`, [interaction.user.id]);
        if (anunciosAtivos.length >= MAX_ANUNCIOS_POR_USUARIO) {
            const anuncioMaisAntigo = anunciosAtivos[0]; // O primeiro anúncio na lista ordenada por data_publicacao
            await db.run(`DELETE FROM anuncios WHERE anuncio_id = ?`, [anuncioMaisAntigo.anuncio_id]);
        }

        const userAvatarUrl = interaction.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });

        const userReputation = await db.get(`SELECT reputation FROM users WHERE id = ?`, [interaction.user.id]) || { reputation: 0 };
        const totalGiven = await db.get(`SELECT reputations_given FROM users WHERE id = ?`,[interaction.user.id]) || { reputations_given: 0 };
        const vipStatus = await db.get(`SELECT * FROM user_vips WHERE user_id = ? AND expiration_date > datetime('now')`, [interaction.user.id]);

        const userRank = ranks.slice().reverse().find(rank => userReputation.reputation >= rank.threshold)?.name || "📘 Aprendiz";

        const stock = interaction.options.getInteger('estoque').toString();
        const value = interaction.options.getNumber('valor').toString();
        const minSaleOption = interaction.options.getInteger('venda_minima', false); // MinSale
        const minSale = minSaleOption ? `${minSaleOption}` : 'Não especificado'; // MinSale Verify

        if (value <= 0) {
            return interaction.reply({ content: '❌ Erro! O valor/preço deve ser maior que 0.\n Refaça seu anuncio preenchendo corretamente as opções sempre com o valor minimo maior que 0.', ephemeral: true });
        }

        if (stock <= 0) {
            return interaction.reply({ content: '❌ Erro! A quantidade de estoque deve ser maior que 0, mesmo sendo um serviço.\n Refaça seu anuncio preenchendo corretamente as opções sempre com o valor minimo maior que 0.', ephemeral: true });
        }

        if (minSale && minSale <= 0) { // Só verifica se vendaMinima for fornecida
            return interaction.reply({ content: '❌ Erro! A venda mínima deve ser maior que 0, se especificada.\n Refaça seu anuncio preenchendo corretamente as opções sempre com o valor minimo maior que 0.', ephemeral: true });
        }

        const title = interaction.options.getString('titulo');
        const type = interaction.options.getString('tipo');
        const imageUrl = interaction.options.getString('imagem', false);

        // ${vipStatus ? `💎 › **VIP Nível:** ${vipStatus.vip_level}` : '🔻 Não possui VIP'}

        try {
            await db.run(
                `INSERT INTO anuncios (user_id, titulo, valor, estoque, tipo, venda_minima, imagem_url) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [interaction.user.id, title, value, stock, type, minSaleOption || null, imageUrl || null]
            );

            // Construa a resposta após a inserção bem-sucedida aqui
            const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle(title)
            .setDescription(`Para obter mais detalhes sobre o usuário, use /perfil ${interaction.user.username}\nou use /sellerview ${interaction.user.username} para visualizar todos os anuncios ativos do usuário.`)
            .addFields(
                { name: '🧙‍♂️ Vendedor:', value: `${interaction.user.username}`, inline: true },
                { name: '🤝 Reputações:', value: `**Recebidas:** ${userReputation.reputation}\n**Enviadas:** ${totalGiven.reputations_given}`, inline: true },
                { name: '🏆 Rank:', value: `${userRank}`, inline: true },
                { name: '📌 Tipo:', value: type, inline: true },
                { name: '📦 Estoque:', value: stock, inline: true },
                { name: '💸 Valor:', value: `R$${value}`, inline: true },
                ...minSaleOption ? [{ name: '🛒 Venda Mínima', value: minSale, inline: false }] : [],
            )
            .setTimestamp()
            .setFooter({ text: `Compra bem-sucedida? Dê Reputação ao Vendedor usando /rep ${interaction.user.username}`, iconURL: userAvatarUrl});

            if (imageUrl) embed.setImage(imageUrl);

                        await interaction.reply({ embeds: [embed] });

                        // Opcional: Reações para feedback adicional (mantido conforme a estrutura original)
                        const message = await interaction.fetchReply();
                        await message.react('😄'); // Muito Bom
                        await message.react('🙂'); // Bom
                        await message.react('😐'); // Neutros
                        await message.react('😕'); // Ruim
                        await message.react('😟'); // Muito Ruim
                
                    } catch (error) {
                        console.error(`Erro ao inserir anúncio no banco de dados: ${error}`);
                        await interaction.reply({ content: '❌ Houve um erro ao tentar criar o seu anúncio. Por favor, tente novamente mais tarde.', ephemeral: true });
                    }
                },
            };                
