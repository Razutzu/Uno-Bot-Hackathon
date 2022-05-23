const { MessageEmbed } = require("discord.js");

module.exports = (interaction, client) => {
    interaction.reply({
        embeds: [
            new MessageEmbed({
                color: "RED",
                description: "I thought that if I write the information here, it will be much harder to read, so I wrote everything you need to know on the [bot's repository](https://github.com/Razutzu/Uno-Bot-Hackathon).",
                footer: { text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) },
                timestamp: Date.now(),
            }),
        ], ephemeral: true
    }).catch(err => { })
}