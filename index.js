const Discord = require('discord.js');
const bot = new Discord.Client();
const allChannels = ["status", "list", "request"];

function createChannels(channel = null) {
    let currentGuild = bot.guilds.first();

    if (channel == null)
        allChannels.forEach((channelName) => {
            currentGuild.createChannel(channelName, 'channel').then(() => {
                updateChannelParent(channelName);
            }).catch(console.error);
        });
    else
        currentGuild.createChannel(channel, 'channel').then(() => {
            updateChannelParent(channel);
        }).catch(console.error);
}

function updateChannelParent(channelName) {
    let channels = bot.guilds.first().channels;
    channels.find('name', channelName).setParent(channels.find('name', 'jobs'));
}

function createCategory() {
    let currentGuild = bot.guilds.first();
    currentGuild.createChannel('jobs', 'category').then(() => {
        checkChannels();
    }).catch(console.error);
}

function checkChannels() {

    let channels = bot.guilds.first().channels;

    if(channels.find('name', 'jobs')) {
        allChannels.forEach((channel) => {
            if (!channels.find('name', channel))
                createChannels(channel);
            else
                updateChannelParent(channel);
        });
    } else {
        createCategory();
    }

}

function removeCommandsMessages(channel) {
    channel.fetchMessages().then((messages) => {
        messages.forEach((message) => {
            if (message.content.substring(0, 4).includes('!job'))
                message.delete();
        })
    })
}

function messageAlreadyPosted(messageString, channel) {
    channel.fetchMessages().then((messages) => {
        messages.forEach((message) => {
            if (message.content === messageString)
                message.delete();
        });

        channel.send(messageString);
    }).catch(console.error);
}

function removeListJob(user, job) {
    let messages = bot.guilds.first().channels.find('name', 'list');
    messages.fetchMessages().then((messages) => {
        messages.forEach((message) => {
            if (message.content.indexOf(user) > -1 && message.content.indexOf(job) > -1)
                message.delete();
        })
    }).catch(console.error);
}

function removeStatus(user) {
    let messages = bot.guilds.first().channels.find('name', 'status');
    messages.fetchMessages().then((messages) => {
        messages.forEach((message) => {
            if (message.content.indexOf(user) > -1)
                message.delete();
        })
    }).catch(console.error);
}

bot.on('ready', () => {
    checkChannels();
});

bot.on('message', (msg) => {
    let channels = bot.guilds.first().channels;
    let cmd = msg.content.split(' ');
    if (cmd[0] === "!job")
    {
        if (cmd[1] === "ready") {
            messageAlreadyPosted(msg.author.toString() + ' ready to job !', channels.find('name', 'status'))
        } else if (cmd[1] === "stop") {
            removeStatus(msg.author.toString());
        } else if (cmd[1] === "add") {
            if (cmd.length === 5) {
                messageAlreadyPosted(cmd[2] + " exerce le métier de " + cmd[3] + " : niveau " + cmd[4], channels.find('name', 'list'));
            } else {
                msg.reply("Command error : pattern => !job add <<character_name>> <<job_name>> <<job_level>>").then((msg) => {
                    msg.delete(5000);
                });
            }
        } else if (cmd[1] === "remove") {
            if (cmd.length === 4) {
                removeListJob(cmd[2], cmd[3]);
                msg.reply("le métier " + cmd[3] + " de " + cmd[2] + " a été supprimé !").then((msg) => {
                    msg.delete(1000);
                });
            } else {
                msg.reply("Command error : pattern => !job remove <<character_name>> <<job_name>>").then((msg) => {
                    msg.delete(5000);
                });
            }
        } else if (cmd[1] === "help") {
            msg.reply("Command not found.\n" +
                "-- DOFUS JOBS COMMANDS HELPER --\n" +
                "!job ready #You're ready to farm\n" +
                "!job add <<character_name>> <<job_name>> <<job_level>> #Add a job for a player\n" +
                "!job remove <<character_name>> <<job_name>> #Remove a job for a player").then((msg) => {
                msg.delete(10000);
            });
        }
    }

    removeCommandsMessages(msg.channel);
});

bot.on('guildMemberRemove', (member) => {
    removeStatus(member.toString());
});

bot.login('NDY0MDg2MDkxMDYyODM3Mjc5.Dh54SA.S4o0f1mEBVZ_hoqUx3T1pWtXacM');