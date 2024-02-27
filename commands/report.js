const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const db = require('../database/database.js'); // Ajuste o caminho conforme necessário

// Configurações de limites e tempo de espera
const MAX_REPORTS_PER_PERIOD = 500; // Número máximo de reports permitidos por período
const WAIT_PERIOD_HOURS = 24; // Tempo de espera em horas para resetar o contador de reports

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('⛔ Reporta um usuário por comportamento inadequado.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('O usuário que você deseja reportar')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('O motivo do report')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('evidencia')
                .setDescription('Link para a evidência (foto ou vídeo)')
                .setRequired(false)),
    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('usuario');
            const reporterUser = interaction.user;

            // Impede que bots sejam reportados
            if (targetUser.bot) {
                return await interaction.reply({ content: '❌ Bots não podem ser reportados.', ephemeral: true });
            }

            if (targetUser.id === reporterUser.id) {
                return await interaction.reply({ content: '❌ Você não pode reportar a si mesmo.', ephemeral: true });
            }

            const reason = interaction.options.getString('motivo');
            const evidence = interaction.options.getString('evidencia') || 'Nenhuma evidência fornecida';

            // Consulta para contar a quantidade de reports do usuário reportado
            const previousReportsResult = await db.all('SELECT COUNT(*) AS count FROM user_reports WHERE reported_user_id = ?', [targetUser.id]);
            const totalReports = previousReportsResult[0].count; // Pegando o total de reports do resultado

            const reportChannelId = '1207494805500727356'; // Substitua pelo ID real do seu canal de reports
            const abuseChannelId = '1207775549821288598'; // Substitua pelo ID real do seu canal de abusos

            const reportChannel = await interaction.client.channels.fetch(reportChannelId);
            const abuseChannel = await interaction.client.channels.fetch(abuseChannelId);

            const reports = await db.all('SELECT * FROM user_reports WHERE reporter_user_id = ? AND report_time > datetime("now", "-24 hour")', [reporterUser.id]);
            if (reports.length >= MAX_REPORTS_PER_PERIOD) {
                await interaction.reply({ content: `❌ Você atingiu o limite máximo de ${MAX_REPORTS_PER_PERIOD} reports em ${WAIT_PERIOD_HOURS} horas. Por favor, aguarde antes de reportar novamente.`, ephemeral: true });

                const abuseEmbed = new EmbedBuilder()
                    .setTitle('⚠️ Aviso de Possível Abuso de Reports')
                    .setDescription(`O usuário **${reporterUser.tag} (${reporterUser.id})** atingiu o limite de reports permitidos e pode estar tentando abusar do sistema de reports.`)
                    .setColor('Yellow')
                    .addFields(
                        { name: '👤 Usuário:', value: `${reporterUser.tag} (${reporterUser.id})`, inline: true },
                        { name: '⚠️ Tentativas de Report:', value: `${reports.length} vezes em ${WAIT_PERIOD_HOURS} horas`, inline: true }
                    )
                    .setTimestamp();

                await abuseChannel.send({ embeds: [abuseEmbed] });
                return;
            }

            await db.run('INSERT INTO user_reports (reported_user_id, reporter_user_id, reason, report_time) VALUES (?, ?, ?, CURRENT_TIMESTAMP)', [targetUser.id, reporterUser.id, reason]);

            await interaction.reply({ content: '📝 Seu report foi recebido e será investigado pela nossa equipe. Agradecemos sua colaboração.', ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle('🚨 Report Recebido!')
                .setColor('Red')
                .addFields(
                    { name: '👤 Reportado:', value: `**${targetUser.tag}**\n*${targetUser.id}*`, inline: true },
                    { name: '🕵️‍♂️ Reportador:', value: `**${reporterUser.tag}**\n*${reporterUser.id}*`, inline: true },
                    { name: '📊 Reports Recebidos:', value: `**${totalReports}** report(s)`, inline: true},
                    { name: '📜 Motivo:', value: reason, inline: false },
                    { name: '🔗 Evidência:', value: evidence, inline: false }
                )
                .setTimestamp();

            await reportChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao executar o comando report:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❗ Houve um erro ao processar seu report. Tente novamente mais tarde.', ephemeral: true });
            }
        }
    },
};
