const { Client, Collection, Intents } = require("discord.js");

const { token } = require("../config.json");

const client = new Client({
    intents: new Intents(513)
})

client.games = [];
client.usedButtons = [];

const commands = ["cards", "create", "draw", "info", "join", "leave", "play", "start"];
const buttons = ["keep", "play", "uno"];

client.once("ready", () => {
    /*client.application.commands.set(
        [
            {
                type: "CHAT_INPUT",
                name: "cards",
                description: "Shows your cards in a game."
            }, {
                type: "CHAT_INPUT",
                name: "create",
                description: "Creates a game on the channel in which the command is used."
            },
            {
                type: "CHAT_INPUT",
                name: "draw",
                description: "Draw a card in a game."
            },
            {
                type: "CHAT_INPUT",
                name: "image",
                description: "Shows your cards."
            }, {

                type: "CHAT_INPUT",
                name: "info",
                description: "See everything you need to know about me."
            },
            {
                type: "CHAT_INPUT",
                name: "join",
                description: "Join the game on the channel in which the command is used."
            },
            {
                type: "CHAT_INPUT",
                name: "leave",
                description: "Leave the game on the channel in which to command is used."
            }, {
                type: "CHAT_INPUT",
                name: "start",
                description: "Starts a game on the channel in which the command is used.",
            }, {
                type: "CHAT_INPUT",
                name: "play",
                description: "Play a card in a game.",
                options: [
                    {
                        type: "STRING",
                        name: "color",
                        description: "The card color.",
                        required: true,
                        choices: [
                            {
                                name: "Red",
                                value: "Red",
                            }, {
                                name: "Yellow",
                                value: "Yellow"
                            }, {
                                name: "Green",
                                value: "Green"
                            }, {
                                name: "Blue",
                                value: "Blue"
                            },
                        ]
                    }, {
                        type: "STRING",
                        name: "value",
                        description: "The card you want to use.",
                        required: true,
                        choices: [
                            {
                                name: "1",
                                value: "1"
                            }, {
                                name: "2",
                                value: "2"
                            }, {
                                name: "3",
                                value: "3"
                            }, {
                                name: "4",
                                value: "4"
                            }, {
                                name: "5",
                                value: "5"
                            }, {
                                name: "6",
                                value: "6"
                            }, {
                                name: "7",
                                value: "7"
                            }, {
                                name: "8",
                                value: "8"
                            }, {
                                name: "9",
                                value: "9"
                            }, {
                                name: "0",
                                value: "0"
                            }, {
                                name: "Skip",
                                value: "Skip"
                            }, {
                                name: "Reverse",
                                value: "Reverse"
                            }, {
                                name: "Draw Two",
                                value: "Draw Two"
                            }, {
                                name: "Wild",
                                value: "Wild"
                            }, {
                                name: "Wild Draw Four",
                                value: "Wild Draw Four"
                            },
                        ]
                    }
                ]
            }
        ]
    )*/
    console.log(`${client.user.tag} is ready to play UNO!`);
})

client.on("interactionCreate", (interaction) => {
    let path

    if (interaction.isButton() && buttons.includes(interaction.component.customId.split("_")[0])) path = `./buttons/${interaction.component.customId.split("_")[0]}`
    else if (interaction.isCommand() && commands.includes(interaction.commandName)) path = `./commands/${interaction.commandName}`;
    else return interaction.deferUpdate();

    require(path)(interaction, client);
})

client.login(token);