const { MessageEmbed, MessageActionRow } = require("discord.js");

module.exports = async (interaction, client) => {
    const button = interaction.component;

    const game = client.games.find(g => g.channel == interaction.channel);

    if (!game) {
        button.setDisabled(true);
        const row = new MessageActionRow({ components: [button] });

        interaction.message.edit({ components: [row] }).catch(err => { });

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
        button.setDisabled(true);
        const row = new MessageActionRow({ components: [button] });

        interaction.message.edit({ components: [row] }).catch(err => { });

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
                    color: this.currentColor.toUpperCase(),
                    author: { name: "❌ You can't play yet ❌" },
                    description: "The game started before you entered the game. Please wait until a new game starts.",
                    timestamp: Date.now()
                })

            ], ephemeral: true
        }).catch(err => { });
    }

    const unoPlayer = game.unoPlayer;

    if (!unoPlayer || unoPlayer == null || unoPlayer.user.id != button.customId.split("_")[1]) {
        button.setDisabled(true);
        const row = new MessageActionRow({ components: [button] });

        interaction.message.edit({ components: [row] }).catch(err => { });

        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: game.currentColor.toUpperCase(),
                    author: { name: "❌ You can no longer use this button. ❌" },
                    timestamp: Date.now()
                })
            ], ephemeral: true
        }).catch(err => { });
    }

    game.uno(interaction, client, button);
}