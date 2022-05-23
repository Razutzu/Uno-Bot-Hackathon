const { MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

class Game {
    constructor(interaction, client) {
        this.channel = interaction.channel; // The channel of the game
        this.creator = interaction.user.id; // The creator of the game

        this.client = client;

        this.started = false; // Variabile which will help me find out if the game already started

        this.cards = this.refillDeck();
        this.normalCards = this.cards.filter(c => !isNaN(c[c.length - 1])); // Normal cards

        this.decks = 0;

        this.users = [interaction.user] // All users JOINED
        this.players = []; // All users IN GAME
        this.currentTurn = 0; // The variabile which will help me find a player based on the turn.

        this.currentCard = this.normalCards[Math.floor(Math.random() * this.normalCards.length)];
        this.currentCardImage = this.cardImage(this.currentCard);

        this.currentColor = this.currentCard.split(" ")[0];
        this.cards.splice(this.cards.indexOf(this.currentCard), 1);

        this.drawingMessages = ["happily drew", "sadly drew"];

        this.lastDescription = "";

        this.unoPlayer = null;

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "🎮 Hi, let's play Uno! 🎮" },
                    description: "First of all, you need some players. Invite your friends and tell them to use the command `/join`.\n\nBefore playing, it is necessary to read the information in the `/info` command, which explains how to play.\n\nWhen you are ready, use the command `/start` to start the game.",
                    footer: { text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) },
                    thumbnail: { url: client.user.avatarURL() },
                    timestamp: Date.now()
                })
            ]
        }).catch(err => { });
    }
    startGame(interaction, client) {
        this.started = true;

        for (const user of this.users) {
            const cards = []; // Player's cards
            for (let i = 0; i < 7; i++) {
                const card = this.cards[Math.floor(Math.random() * this.cards.length)]
                cards.push(card);
                this.cards.splice(this.cards.indexOf(card), 1);
            }

            this.players.push({
                user: user,
                cards: cards,
                drawing: null,
            })
        }

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: this.currentColor.toUpperCase(),
                    author: { name: "🎮 Uno Game 🎮" },
                    description: `Everyone received their cards. The top card of the deck was flipped over: **${this.currentCard}**.\n\nIt is ${this.players[this.currentTurn].user.toString()}'s turn.`,
                    footer: { text: `${this.cards.length} cards left | ${this.decks} deck(s) used`, iconURL: this.players[this.currentTurn].user.avatarURL({ dynamic: true }) },
                    thumbnail: { url: `attachment://${this.currentCardImage}` },
                    timestamp: Date.now()
                })
            ], files: [{ attachment: `cards/${this.currentCardImage}`, name: `${this.currentCardImage}` }]
        }).catch(err => { });
    }
    endMatch(interaction, player) {
        this.started = false;

        this.cards = this.refillDeck();
        this.normalCards = this.cards.filter(c => !isNaN(c[c.length - 1]));

        this.decks = 1;

        this.players = [];
        this.currentTurn = 0;

        this.currentColor = this.currentCard.split(" ")[0];
        this.cards.splice(this.cards.indexOf(this.currentCard), 1);

        this.lastDescription = "";

        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: this.currentColor.toUpperCase(),
                    author: { name: "🎉 Congratulations! 🎉" },
                    description: `The winner of the game is ${player.user.toString()}!\n\nThe game has ended. Use the command \`/start\` to play again!`,
                    footer: { text: player.user.tag, iconURL: player.user.avatarURL({ dynamic: true }) },
                    timestamp: Date.now()
                })
            ]
        }).catch(err => { });
    }
    endGame(interaction) {
        this.client.games.splice(this.client.games.indexOf(this), 1);

        return interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "🎮 The game has no more players. 🎮" },
                    description: "Use the command \`/create\` if you want to create a game.",
                    footer: { text: interaction.user.tag, iconURL: interaction.user.avatarURL({ dynamic: true }) },
                    timestamp: Date.now()
                })
            ]
        }).catch(err => { });
    }
    userJoin(interaction) {
        this.users.push(interaction.user);

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: "RED",
                    author: { name: "🎮 Uno Game 🎮" },
                    description: `${interaction.user.toString()} joined the game!`,
                    timestamp: Date.now()
                })
            ]
        }).catch(err => { });
    }
    userLeave(interaction) {
        this.users.splice(this.users.indexOf(interaction.user), 1);

        if (this.users.length == 0) return this.endGame(interaction);

        if (this.creator == interaction.user.id) this.creator = this.users[0].id;

        const player = this.players.find(p => p.user == interaction.user);

        const embed = new MessageEmbed({
            color: "RED",
            author: { name: "🎮 Uno Game 🎮" },
            description: `${interaction.user.toString()} left the game!`,
            timestamp: Date.now()
        })

        if (player) {
            if (this.players.length == 2) {
                this.players.splice(this.players.indexOf(player), 1);

                const winner = this.players[0];

                return this.endMatch(interaction, winner);
            }

            embed.setColor(this.currentColor.toUpperCase());

            if (this.currentTurn == this.players.indexOf(player)) this.changeTurn(interaction, `${interaction.user.toString()} left the game!`, 0);
            else interaction.reply({ embeds: [embed] }).catch(err => { });

            this.currentTurn--;

            this.players.splice(this.players.indexOf(player), 1);
        } else {
            interaction.reply({ embeds: [embed] }).catch(err => { });
        }
    }
    changeTurn(interaction, msg, skip) {
        if (this.cards.length <= 0) {
            this.cards = this.refillDeck();
        }

        if (this.players[this.currentTurn].drawing !== null) this.players[this.currentTurn].drawing = null;

        if (this.players[this.currentTurn].cards.length == 0) return this.endMatch(interaction, this.players[this.currentTurn])

        let components = this.displayUnoButton(interaction)

        this.currentCardImage = this.cardImage(this.currentCard);

        if (this.players.length > 2 || (this.players.length == 2 && skip == 0)) {
            if ((this.currentTurn + 1 + skip) >= this.players.length) this.currentTurn = 0 + skip;
            else this.currentTurn += 1 + skip;
        }

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: this.currentColor.toUpperCase(),
                    author: { name: "🎮 Uno Game 🎮" },
                    description: `${msg}\n\nIt is ${this.players[this.currentTurn].user.toString()}'s turn.`,
                    footer: { text: `${this.cards.length} cards left | ${this.decks} deck(s) used`, iconURL: this.players[this.currentTurn].user.avatarURL({ dynamic: true }) },
                    thumbnail: { url: `attachment://${this.currentCardImage}` },
                    timestamp: Date.now()
                })
            ], components: components, files: [{ attachment: `cards/${this.currentCardImage}`, name: this.currentCardImage }]
        }).catch(err => { console.log(err) });

        this.lastDescription = msg;
    }
    drawCard(interaction, player) {
        let card = this.cards[Math.floor(Math.random() * this.cards.length)];

        this.cards.splice(this.cards.indexOf(card), 1);
        player.cards.push(card);

        if (!this.playableCard(card)) return this.changeTurn(interaction, `${player.user.toString()} drew a card.\n\nThe last card played was a **${this.currentCard}** card.`, 0);

        let color;
        let colors = ["Red", "Yellow", "Blue", "Green"];

        if (card.includes("Wild")) {
            color = colors[Math.floor(Math.random() * colors.length)];
            card = `${color} ${card}`;
        }
        else color = color = card.split(" ")[0];

        let cardImg = this.cardImage(card);

        player.drawing = card;

        interaction.reply({
            embeds: [
                new MessageEmbed({
                    color: color.toUpperCase(),
                    author: { name: "🎮 Uno Game 🎮" },
                    description: `You drew a **${card}** card.`,
                    image: { url: `attachment://${cardImg}` },
                    timestamp: Date.now()
                })
            ], components: [
                new MessageActionRow({
                    components: [
                        new MessageButton({
                            customId: `play_${interaction.user.id}_${card}_${color}`,
                            style: "SUCCESS",
                            emoji: "✅",
                            label: "Play!",
                        }),
                        new MessageButton({
                            customId: `keep_${interaction.user.id}_${card}_${color}`,
                            style: "DANGER",
                            emoji: "❌",
                            label: "Keep!",
                        })
                    ]
                })
            ], ephemeral: true, files: [{ attachment: `cards/${cardImg}`, name: cardImg }]
        }).catch(err => { });
    }
    normalCard(interaction, player, card) {
        player.cards.splice(player.cards.indexOf(card), 1);

        this.currentCard = card;
        this.currentColor = card.split(" ")[0];

        this.changeTurn(interaction, `${player.user.toString()} played a **${card}** card.`, 0);
    }
    skipCard(interaction, player, card) {
        player.cards.splice(player.cards.indexOf(card), 1);

        this.currentCard = card;
        this.currentColor = card.split(" ")[0];

        let skippedPlayer; // the player who's skipped

        if ((this.currentTurn + 1) == this.players.length) skippedPlayer = this.players[0];
        else skippedPlayer = this.players[this.currentTurn + 1];

        this.changeTurn(interaction, `${player.user.toString()} played a **${card}** card.\n\n${skippedPlayer.user.toString()} has been skipped.`, 1);
    }
    reverseCard(interaction, player, card) {
        player.cards.splice(player.cards.indexOf(card), 1);

        this.currentCard = card;
        this.currentColor = card.split(" ")[0];

        if (this.players.length > 2) {
            this.players.reverse();

            this.currentTurn = this.players.indexOf(player);

            this.changeTurn(interaction, `${player.user.toString()} played a **${card}** card.`, 0);
        } else {
            this.changeTurn(interaction, `${player.user.toString()} played a **${card}** card.`, 0);
        }
    }
    drawTwoCard(interaction, player, card) {
        player.cards.splice(player.cards.indexOf(card), 1);

        this.currentCard = card;
        this.currentColor = card.split(" ")[0];

        let playerToGive; // the player who must receive the cards.

        if ((this.currentTurn + 1) == this.players.length) playerToGive = this.players[0];
        else playerToGive = this.players[this.currentTurn + 1];

        for (let i = 0; i < 2; i++) {
            const card = this.cards[Math.floor(Math.random() * this.cards.length)]
            playerToGive.cards.push(card);
            this.cards.splice(this.cards.indexOf(card), 1);
        }

        const drawingMessage = this.drawingMessages[Math.floor(Math.random() * this.drawingMessages.length)];

        this.changeTurn(interaction, `${player.user.toString()} played a **${card}** card.\n\n${playerToGive.user.toString()} ${drawingMessage} 2 cards.`, 1);
    }
    wildCard(interaction, player, color) {
        player.cards.splice(player.cards.indexOf("Wild"), 1);

        this.currentCard = "Wild";
        this.currentColor = color;

        this.changeTurn(interaction, `${player.user.toString()} played a **Wild** card and changed the color to **${color}**.`, 0);
    }
    wildDrawFourCard(interaction, player, color) {
        player.cards.splice(player.cards.indexOf("Wild Draw Four"), 1);

        this.currentCard = "Wild Draw Four";
        this.currentColor = color;

        let playerToGive; // the player who must receive the cards.

        if ((this.currentTurn + 1) == this.players.length) playerToGive = this.players[0];
        else playerToGive = this.players[this.currentTurn + 1];

        for (let i = 0; i < 4; i++) {
            const card = this.cards[Math.floor(Math.random() * this.cards.length)]
            playerToGive.cards.push(card);
            this.cards.splice(this.cards.indexOf(card), 1);
        }

        const drawingMessage = this.drawingMessages[Math.floor(Math.random() * this.drawingMessages.length)];

        this.changeTurn(interaction, `${player.user.toString()} played a **Wild Draw Four** card and changed the color to **${color}**.\n\n${playerToGive.user.toString()} ${drawingMessage} 4 cards.`, 1);
    }
    cardImage(card) {
        if (card == "Wild" || card == "Wild Draw Four") return `${this.currentColor}${card.split(" ").join("")}.png`;

        return `${card.split(" ").join("")}.png`
    }
    uno(interaction, client, button) {
        button.setDisabled(true);
        const embed = new MessageEmbed({
            color: this.currentColor.toUpperCase(),
            author: { name: "🎮 Uno Game 🎮" },
            footer: {},
            thumbnail: { url: `attachment://${this.currentCardImage}` },
            timestamp: Date.now()
        })

        if (interaction.user.id == button.customId.split("_")[1]) {
            embed.setDescription(`${this.lastDescription}\n\n${interaction.user.toString()} called "Uno!".\n\nIt is ${this.players[this.currentTurn].user.toString()}'s turn.`);
            embed.setFooter({ text: `${this.cards.length} cards left | ${this.decks} deck(s) used`, iconURL: this.players[this.currentTurn].user.avatarURL({ dynamic: true }) });
        } else {
            embed.setDescription(`${this.lastDescription}\n\n${interaction.user.toString()} called "Uno!" before ${this.unoPlayer.user.toString()}.\n\n${this.unoPlayer.user.toString()} drew 2 cards.\n\nIt is ${this.players[this.currentTurn].user.toString()} 's turn.`);
            embed.setFooter({ text: `${this.cards.length - 2} cards left | ${this.decks} deck(s) used`, iconURL: this.players[this.currentTurn].user.avatarURL({ dynamic: true }) })

            for (let i = 0; i < 2; i++) {
                const card = this.cards[Math.floor(Math.random() * this.cards.length)]
                this.unoPlayer.cards.push(card);
                this.cards.splice(this.cards.indexOf(card), 1);
            }
        }
        this.unoPlayer = null;

        interaction.message.edit({ embeds: [embed], components: [new MessageActionRow({ components: [button] })] }).catch(err => { });
        interaction.deferUpdate();
    }
    displayUnoButton(interaction) {
        if (this.players[this.currentTurn].cards.length == 1) {
            this.unoPlayer = this.players[this.currentTurn];

            const row = new MessageActionRow();

            const button = new MessageButton({
                customId: `uno_${interaction.user.id}`,
                style: "SECONDARY",
                emoji: "💥",
                label: "Uno!",
            })
            row.setComponents([button]);

            return [row];
        } else {
            this.unoPlayer = null;
        }

        return null;
    }
    playableCard(card) {
        if (card == "Wild" || card == "Wild Draw Four") return true;
        else if (card.split(" ")[0] == this.currentColor) return true;
        else if (card.split(" ").slice(1).join(" ") == this.currentCard.split(" ").slice(1).join(" ")) return true;

        return false;
    }
    refillDeck() {
        this.decks++;

        return [ // Pack of cards
            "Red 0",
            "Yellow 0",
            "Green 0",
            "Blue 0",
            "Red 1",
            "Yellow 1",
            "Green 1",
            "Blue 1",
            "Red 2",
            "Yellow 2",
            "Green 2",
            "Blue 2",
            "Red 3",
            "Yellow 3",
            "Green 3",
            "Blue 3",
            "Red 4",
            "Yellow 4",
            "Green 4",
            "Blue 4",
            "Red 5",
            "Yellow 5",
            "Green 5",
            "Blue 5",
            "Red 6",
            "Yellow 6",
            "Green 6",
            "Blue 6",
            "Red 7",
            "Yellow 7",
            "Green 7",
            "Blue 7",
            "Red 8",
            "Yellow 8",
            "Green 8",
            "Blue 8",
            "Red 9",
            "Yellow 9",
            "Green 9",
            "Blue 9",
            "Red Skip",
            "Yellow Skip",
            "Green Skip",
            "Blue Skip",
            "Red Reverse",
            "Yellow Reverse",
            "Green Reverse",
            "Blue Reverse",
            "Red Draw Two",
            "Yellow Draw Two",
            "Green Draw Two",
            "Blue Draw Two",
            "Wild",
            "Wild",
            "Wild",
            "Wild",
            "Red 1",
            "Yellow 1",
            "Green 1",
            "Blue 1",
            "Red 2",
            "Yellow 2",
            "Green 2",
            "Blue 2",
            "Red 3",
            "Yellow 3",
            "Green 3",
            "Blue 3",
            "Red 4",
            "Yellow 4",
            "Green 4",
            "Blue 4",
            "Red 5",
            "Yellow 5",
            "Green 5",
            "Blue 5",
            "Red 6",
            "Yellow 6",
            "Green 6",
            "Blue 6",
            "Red 7",
            "Yellow 7",
            "Green 7",
            "Blue 7",
            "Red 8",
            "Yellow 8",
            "Green 8",
            "Blue 8",
            "Red 9",
            "Yellow 9",
            "Green 9",
            "Blue 9",
            "Red Skip",
            "Yellow Skip",
            "Green Skip",
            "Blue Skip",
            "Red Reverse",
            "Yellow Reverse",
            "Green Reverse",
            "Blue Reverse",
            "Red Draw Two",
            "Yellow Draw Two",
            "Green Draw Two",
            "Blue Draw Two",
            "Wild Draw Four",
            "Wild Draw Four",
            "Wild Draw Four",
            "Wild Draw Four"
        ];
    }
}

module.exports = Game;