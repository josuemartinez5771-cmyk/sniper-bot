const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const { translate } = require('@vitalets/google-translate-api');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// Idiomas disponibles en el menú desplegable
const idiomas = [
    { name: 'Español (Spanish)', value: 'es' },
    { name: 'English (Inglés)', value: 'en' },
    { name: 'Русский (Ruso)', value: 'ru' },
    { name: '日本語 (Japonés)', value: 'ja' },
    { name: 'Deutsch (Alemán)', value: 'de' },
    { name: '中文 (Chino)', value: 'zh-CN' },
    { name: 'Português (Portugués)', value: 'pt' },
    { name: 'العربية (Árabe)', value: 'ar' }
];

// Creamos los dos comandos: /traducir y /translate
const commands = [
    new SlashCommandBuilder()
        .setName('traducir')
        .setDescription('Traduce un texto automáticamente al idioma que elijas')
        .addStringOption(option => option.setName('texto').setDescription('El texto que quieres traducir').setRequired(true))
        .addStringOption(option => option.setName('a').setDescription('Idioma al que quieres traducirlo').setRequired(true).addChoices(...idiomas)),

    new SlashCommandBuilder()
        .setName('translate')
        .setDescription('Translates text automatically into the language of your choice')
        .addStringOption(option => option.setName('text').setDescription('The text you want to translate').setRequired(true))
        .addStringOption(option => option.setName('to').setDescription('Language you want to translate to').setRequired(true).addChoices(...idiomas))
].map(command => command.toJSON());

// Función que registra los comandos en Discord al encender el bot
client.once('ready', async () => {
    console.log(`¡Listo! Conectado como: ${client.user.tag}`);
    
    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        console.log('Registrando comandos de barra (/) en Discord...');
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('¡Comandos registrados con éxito!');
    } catch (error) {
        console.error('Error registrando comandos:', error);
    }
});

// Escuchador de los comandos de barra diagonal (/)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, options, user } = interaction;

    if (commandName === 'traducir' || commandName === 'translate') {
        await interaction.deferReply(); // Le avisa a Discord que el bot está procesando la traducción

        // Obtenemos los datos dependiendo de si usaron la versión en español o inglés
        const textoOriginal = options.getString('texto') || options.getString('text');
        const idiomaDestino = options.getString('a') || options.getString('to');

        try {
            // La librería traduce automáticamente detectando el idioma original
            const res = await translate(textoOriginal, { to: idiomaDestino });

            // Buscamos el nombre del idioma de destino para mostrarlo bonito
            const nombreIdioma = idiomas.find(i => i.value === idiomaDestino)?.name || idiomaDestino;

            // Creamos un cuadro (Embed) muy elegante para la respuesta
            const embed = new EmbedBuilder()
                .setColor('#00ffaa')
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
                .addFields(
                    { name: '📝 Texto Original', value: textoOriginal },
                    { name: `🌍 Traducido a: ${nombreIdioma}`, value: res.text }
                )
                .setFooter({ text: 'SN1PER Traductores Asociados ✨' });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: commandName === 'traducir' ? '❌ Ocurrió un error al traducir.' : '❌ An error occurred during translation.' });
        }
    }
});

// Recuerda poner tu Token real aquí abajo
client.login(process.env.DISCORD_TOKEN);