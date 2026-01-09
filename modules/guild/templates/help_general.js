export const template = {
    title: "Moddy",
    url: "https://github.com/ThomasSchneider-94/Discord_Test_Bot/tree/master",
    color: 0x0099ff,
    description: "Moddy is a discord bot built around different modules, each providing new features to yout server. You can manage each module and command permission individually to correspond to your needs. For more information about a specific module or command, use `/help <module/command name>`.",
    fields: (context) => {
        const fields = [];
        fields.push(
            {
                name: "📚 Granting permissions",
                value: `To ensure Moddy can function properly, it requires certain permissions. You can grant these permissions with this [link](https://discord.com/oauth2/authorize?client_id=${context.clientId}&scope=bot&permissions=${context.permBitField})`
            }
        );
        fields.push(
            {
                name: "🛠️ Participate in development",
                value: "If you want to help improve the bot, check out the [GitHub repository](https://github.com/ThomasSchneider-94/Discord_Test_Bot). Your contributions are welcome, whether it's fixing bugs, adding new features, or improving documentation."
            }
        );
        fields.push(
            {
                name: "🐛 Report a bug",
                value: "Open an issue on [GitHub](https://github.com/ThomasSchneider-94/Discord_Test_Bot/issues)"
            }
        );
        return fields;
    },
};
