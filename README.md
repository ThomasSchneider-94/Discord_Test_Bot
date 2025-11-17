# Modular Discord Bot

Modular Discord Bot is a Discord bot that provides multiple modules, each with its own functionality.

## Module List

- [Jukebox](./modules/jukebox/README.md)
- [Reaction to Role](./modules/reaction_to_role/README.md)
- [Roll Dice](./modules/roll_dice/README.md)
- [Subscription Transfer](./modules/subscription_transfert/README.md)

## Installation

### Install Node.js

You will need to install Node Version Manager (NVM), a tool for managing multiple Node.js versions.

```bash
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

Then, install a Node.js version. You can list all available versions with:

```bash
nvm list-remote
```

Install version 16.11.0

```bash
nvm install 16.11.0
nvm use 16.11.0       # Activate this version
nvm alias default 16.11.0  # Set it as the default version
```

### Install Dependencies

Clone the repository and install dependencies:

```bash
npm install
```

### Automatic Execution

To keep the bot running after a reboot (e.g., on a VM), you can use the process manager pm2:

```bash
npm install pm2@latest -g
```

Start the bot:

```bash
pm2 start ./Discord_Modular_Bot/index.js --name "Discord Modular Bot" # --name is optional but helps track the process
```

Enable automatic restart on system boot:

```bash
pm2 startup
# You will be asked to execute a command, then:
pm2 save
```

## Token Configuration

In the base module
, create a config.json file in the project root with the following structure:

```json
{
    "token": "your-token",
    "webhookURL": "your-webhook",
    "clientId": "your-client-id"
}
```

You can find your token and client ID here: [Discord Developer Portal](https://discord.com/developers/applications/).
