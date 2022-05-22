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

    if (game.creator != interaction.user.id) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ Only the creator of the game can start the game. ❌" },
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (game.started) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ You already started the game. ❌" },
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (game.users.length < 2) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ At least 2 players must be joined in order to play. ❌" },
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    game.startGame(interaction, client);
}