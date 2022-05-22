const { MessageEmbed } = require("discord.js");

module.exports = (interaction, client) => {
    const game = client.games.find(g => g.channel == interaction.channel);

    if (!game) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ There is no game created on this channel. ❌" },
                    description: "Use the command `/create` to create one!",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (!game.users.includes(interaction.user)) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ You did not enter this game. ❌" },
                    description: "Use the command `/join` if you want to join!",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    game.userLeave(interaction);
}