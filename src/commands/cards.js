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

    if (!game.started) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ The game didn't start yet. ❌" },
                    description: "Please wait until the game starts.",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    const player = game.players.find(p => p.user == interaction.user);

    if (!player) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ You can't play yet ❌" },
                    description: "The game started before you entered the game. Please wait until a new game starts.",
                    timestamp: Date.now()
                })

            ], ephemeral: true
        }).catch(err => { });
    }

    const cards = [];

    for (const card of player.cards) {
        if (game.playableCard(card)) cards.push(`**${card}**`);
        else cards.push(card);
    }

    interaction.reply({
        embeds: [
            new MessageEmbed({
                color: game.currentColor.toUpperCase(),
                author: { name: "🃏 These are your cards: 🃏" },
                description: `${cards.join(" | ")}.`,
                timestamp: Date.now()
            })
        ], ephemeral: true
    }).catch(err => { });
}