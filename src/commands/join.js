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

    if (game.users.includes(interaction.user)) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ You have already joined the game on this channel. ❌" },
                    description: "Use the command `/leave` if you want to leave.",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (game.users.length == 10) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ Unfortunately, this game is full. ❌" },
                    description: "Please wait until someone leaves the game.",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    game.userJoin(interaction);
}