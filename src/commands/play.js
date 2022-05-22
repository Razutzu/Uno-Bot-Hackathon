const { MessageEmbed } = require("discord.js");

module.exports = (interaction, client) => {
    const game = client.games.find(g => g.channel = interaction.channel);

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

    if (game.currentTurn != game.players.indexOf(player)) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: game.currentColor.toUpperCase(),
                    author: { name: "❌ It is not your turn. ❌" },
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (player.drawing !== null) {
        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: game.currentColor.toUpperCase(),
                    author: { name: "❌ You already drew a card. ❌" },
                    description: "Please press the **Play!** button or the **Keep!** button in the embed above.",
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    const color = interaction.options.getString("color");
    const value = interaction.options.getString("value");

    const card = `${color} ${value}`

    if (!player.cards.includes(card) && !player.cards.includes(value)) {
        const cards = [];

        for (const card of player.cards) {
            if (game.playableCard(card)) cards.push(`**${card}**`);
            else cards.push(card);
        }

        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: game.currentColor.toUpperCase(),
                    author: { name: "❌ You do not have this card. ❌" },
                    description: `These are your cards: ${cards.join(" | ")}.`,
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    // Verifying colors, numbers, all this stuff (kinda confusing (for me) but it works :))
    if (!game.playableCard(card) && !game.playableCard(value)) {
        const cards = [];

        for (const card of player.cards) {
            if (game.playableCard(card)) cards.push(`**${card}**`);
        }

        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "❌ You cannot play this card. ❌" },
                    description: `These are the cards you can play: ${cards.join(" | ")}.`,
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    if (value == "Wild Draw Four") {
        game.wildDrawFourCard(interaction, player, color);
    } else if (value == "Wild") {
        game.wildCard(interaction, player, color);
    } else if (value == "Draw Two") {
        game.drawTwoCard(interaction, player, card)
    } else if (value == "Reverse") {
        game.reverseCard(interaction, player, card);
    } else if (value == "Skip") {
        game.skipCard(interaction, player, card);
    } else {
        game.normalCard(interaction, player, card);
    }
}