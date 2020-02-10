const { RichEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { promptMessage } = require("../../functions.js");

module.exports = {
    name: "kick",
    category: "moderation",
    description: "Kicks the member",
    usage: "<id | mention>",
    run: async (client, message, args) => {
        const logChannel = message.guild.channels.find(c => c.name === "logs") || message.channel;
        
        if (message.deletable) message.delete();

        // No mention
        if (!args[0]) {
            return message.reply("Please provide a person to kick")
            .then(m => m.delete(5000));
        }

        // No reason
        if (!args[1]) {
            return message.reply("Please provide a reason to kick")
            .then(m => m.delete(5000));
        }

        // No author permissions
        if (!message.member.hasPermision("KICK_MEMBERS")) {
            return message.reply(" :regional_indicator_x: You don't have permission to kick members. Please contact a staff member")
                .then(m => m.delete(5000));
        }

        // No bot permissions
        if (!message.guild.me.hasPermision("KICK_MEMBERS")) {
            return message.reply("I do not have permission to kick members. Please contact a staff member")
                .then(m => m.delete(5000));
        }

        const toKick = message.mentions.members.first() || message.guild.members.get(args[0]);

        //No member found
        if (!toKick) {
            return message.reply("Could not find that member, try again!")
            .then(m => m.delete(5000));
        }

        // Can't kick yourself
        if (message.author.id === toKick.id) {
            return message.reply("Can't kick yourself, smartboii")
            .then(m => m.delete(5000));
        }

        // Kickable
        if (!toKick.kickable) {
            return message.reply("I can not kick that person due to role hierarchy, I suppose.")
            .then(m => m.delete(5000));
        }

        const embed = new RichEmbed()
            .setColor("#ff0000")
            .setThumbnail(toKick.user.displayAvatarURL)
            .setFooter(message.member.displayName, message.author.displayAvatarURL)
            .setTimestamp()
            .setDescription(stripIndents`**> Kicked member:** ${toKick} (${toKick.id})
            **> Kicked by:** ${message.author} (${message.author.id})
            **> Reason:** ${args.slice(1).join(" ")}`);

        const promptEmbed = new RichEmbed()
            .setColor("GREEN")
            .setAuthor("This verification becomes invaild after 30s")
            .setDescription(`Do you want to kick ${toKick}?`);
        
        await message.channel.send(promptEmbed).then(async msg => {
            const emoji = await promptMessage(msg, message.author, 30, ["✔️", "❌"]);

            if (emoji ==="✔️") {
                msg.delete();

                toKick.kick(args.slice(1).join(" "))
                    .catch(err => {
                        if (err) return message.channel.send(`Well.. Something went wrong?`);
                    });

                logChannel.send(embed);
            } else if (emoji === "❌") {
                msg.delete();

                message.reply("Kick cancelled...")
                    .then(m => m.delete(5000));
            }
        });
    }
}
