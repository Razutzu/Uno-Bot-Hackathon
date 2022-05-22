const { MessageEmbed } = require("discord.js");
const Game = require("../game");

module.exports = (interaction, client) => {
    if (client.games.find(g => g.channel == interaction.channel)) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ A game is already created on this channel. ❌" },
                    description: "Use the command `/join` to play if you haven't already done so!",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    const game = new Game(interaction, client);

    client.games.push(game);
}