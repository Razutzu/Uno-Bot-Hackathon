const { MessageEmbed } = require("discord.js");

module.exports = (interaction, client) => {
    interaction.reply({
        embeds: [
            new MessageEmbed({
                color: "RED",
                author: { name: "ℹ Here's everything you need to know about me. ℹ" },
                fields: [
                    {
                        name: "Rules", value: `The rules are like the original game, just with a few changes:
1. When you draw a Wild card or a Wild Draw Four card, the game will choose a color for you if you want to use it, and if you want to keep it, you will receive the card and you will lose your turn.
2. When a Wild Draw Four card is used against you, you cannot challange the player who used the card.
3. A player doesn't win if he has 500 points, but he wins if he run out of cards, because no one is playing Uno 30+ minutes on Discord.` },
                    {
                        name: "Playing", value: `To start playing, you must use the command \`/create\` to create a game, or use the command \`/join\` to join an existing game. Only one game can be created on a channel.
Then, there are more than 2 players on a game, you can use the command \`/start\` to start the game.

When it's your turn, you have 2 choices:
1. Play a card (use the command \`/play\`).
2. Draw a card (use the command \`/draw\`).

If you draw a card and it is playable, you will be able to choose wheter to play it, or to keep it.
If you want want to leave a game, just use the command \`/leave\`. It doesn't matter if you are the creator of the game.` },
                    { name: "Other", value: "You can find out more about Uno and its rules [here](https://en.wikipedia.org/wiki/Uno_(card_game))" }
                ],
                footer: { text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) },
                timestamp: Date.now(),
            }),
        ]
    }).catch(err => { })
}