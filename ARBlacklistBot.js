const token = "OTYzNzkyMDI3NTU5MDE0NDIw.YlbPRQ.HpBf8mVHl80N-JHE4bTwfJlWp70"//token of the discord bot
const listid = ""//listid of trello
const apikey = ""//api key of trello
const apitoken = ""//api token of trello
const channelid = "956658566880702505"//channel id for blacklist log
const whitelist = ["921565996786020422", "921565996039417856", "923371899197751336", "954167012668629022", "925171667691528224"]
///////////////////////////////////////////////////DONT CHANGE ANYTHING BELOW THIS///////////////////////////////////////////////////////////
var Trello = require("trello");
var trello = new Trello(apikey, apitoken);
const Discord = require("discord.js")
const noblox = require("noblox.js")
const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_MEMBERS] });
client.on("ready", () => {
    console.log(`Bot has started. Scripted by zapz#5077`);
    await client.api.applications(client.user.id).commands.post({
        data: {
            name: "blacklist",
            description: "Used to blacklist people.",
            options: [
                {
                    type: 3,
                    name: 'user',
                    description: "Username of the people you want to blacklist",
                    required: true
                }, {
                    type: 3,
                    name: 'reason',
                    description: "Why?",
                    required: true
                },
            ]
        }
    })
    await client.api.applications(client.user.id).guilds('931273250502242385').commands.post({
        data: {
            name: "unblacklist",
            description: "Used to blacklist people.",
            options: [
                {
                    type: 3,
                    name: 'user',
                    description: "Who do you want to unblacklist?",
                    required: true,
                    autocomplete: true
                }
            ]
        }
    })
});
client.on('interactionCreate', interaction => {
    if (!interaction.isCommand()) return;
    const memberHasRole = whitelist.some(role => {
        interaction.member?.roles.cache.has(role);
    });
    if (!memberHasRole) return interaction.reply({
        embeds: [{
            description: "❌** You can't use this command.**",
            color: "RED",
            footer: {
                text: "Bot by zapz#5077"
            }
        }]
    })
    if (interaction.isAutocomplete() && interaction.commandName === 'unblacklist') {
        var cardsPromise = trello.getCardsOnList(listid);
        var users = []

        cardsPromise.then(async (cards) => {
            var bar = new Promise((resolve, reject) => {
                cards.forEach((card, index, array) => {
                    let one = card.name.split(":")
                    users.push({
                        name: one[0],
                        value: card.id
                    })
                    users.push({
                        name: one[1],
                        value: card.id
                    })
                    if (index === array.length - 1) resolve();
                })
                bar.then(() => {
                    interaction.respond(users)
                });
            })
        })

    }
    if (interaction.commandName === "blacklist") {
        const name = interaction.options.getString('user');
        const reason = interaction.options.getString('reason');
        noblox.getIdFromUsername(name).then(id => {
            if (id) {
                var cardsPromise = trello.getCardsOnList(listid);
                cardsPromise.then(async (cards) => {
                    let filt = `${name}:${id}`
                    let isalr = await cards.filter(ok => ok.name.toLowerCase() == filt.toLowerCase())
                    if (isalr > 0) return interaction.reply("**:x: This user is already blacklisted.**")
                    var dateObj = new Date();
                    var month = dateObj.getUTCMonth() + 1; //months from 1-12
                    var day = dateObj.getUTCDate();
                    var year = dateObj.getUTCFullYear();

                    let dat = year + "/" + month + "/" + day;
                    let parm21 = {
                        idLabels: labels,
                        desc: `**User Blacklisted:** ${name} - ${id}
                        **ROBLOX Profile:** https://www.roblox.com/users/${id}/profile**
                        **Blacklisted By:** ${interaction.author.id}
                        **Reason:** ${reason}
                        **Date:** ${dat}`
                    }
                    trello.addCardWithExtraParams(filt, parm21, listid,
                        function (error, trelloCard) {
                            if (error) {
                                console.log('Could not add card:', error);
                                return interaction.reply("**:x: I had an error, please check console for more details.**")
                            }
                            else {
                                client.channels.cache.get(channelid)?.send("**https://www.roblox.com/users/" + id + "/profile** has been blacklisted.")
                                interaction.reply({
                                    embeds: [{
                                        description: "✅ Succesfully blacklisted **" + name + "**.",
                                        color: "GREEN",
                                        footer: {
                                            text: "Bot by zapz#5077"
                                        }
                                    }]
                                })
                            }
                        });
                })
            } else {
                return interaction.reply("**:x: Please provide a valid username.**")
            }
        }).catch(function (err) {
            return interaction.reply("**:x: Please provide a valid username.**")
        })
    }
    if (interaction.commandName === "unblacklist") {
        const user = interaction.options.getString('user');
        trello.updateCard(id, "closed", true,
            function (error, trelloCard) {
                if (error) {
                    interaction.reply("Had an error, check console.\n\nDid you provide a valid card?")
                    console.log(error)
                } else {
                    let nameis = trelloCard.name
                    trello.addCommentToCard(user, "Unblacklisted by " + interaction.user.id)
                    client.channels.cache.get(channelid)?.send("**https://www.roblox.com/users/" + nameis[2] + "/profile** has been un-blacklisted.")
                    interaction.reply({
                        embeds: [{
                            title: "✅Done",
                            description: "I've succesfully removed the blacklist for this user!",
                            color: "BLUE",
                            footer: {
                                text: "Bot by zapz#5077"
                            }

                        }]
                    })
                }
            })
    }
})
client.login(token)