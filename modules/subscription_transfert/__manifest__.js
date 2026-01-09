import { PermissionFlagsBits } from "discord.js";

export const manifest = {
    name: 'subscription_transfert',
    displayName: 'Subscription Transfert',
    description: 'Transfert messages received via announcement channel subscription with added roles, ',
    author: 'Thomas Schneider',
    class: 'SubscriptionTransfert',
    events: [
        'transfert_subscription_message.js',
        'update_subscription_message.js'
    ],
    configs: [
        'suscribed_servers.json',
    ]
};
