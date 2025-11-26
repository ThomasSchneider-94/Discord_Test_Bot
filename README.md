# Modular Discord Bot

Modular Discord Bot is a Discord bot that provides multiple modules, each with its own functionality.

## Module List

- [Jukebox](./modules/jukebox/)
- [Reaction to Role](./modules/reaction_to_role/)
- [Roll Dice](./modules/roll_dice/)
- [Subscription Transfer](./modules/subscription_transfert/)

## Installation

### Install Node.js

You will need to install `Node Version Manager (NVM)`, a tool for managing multiple Node.js versions.

```bash
sudo apt install curl
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
```

Verify that nvm is correctly installed.

```bash
nvm list-remote
```

Install Node.js version `16.11.0` or above. You can list all available versions with: `nvm list-remote`

```bash
nvm install 24.11.1
nvm use 24.11.1       # Activate the version
nvm alias default 24.11.1  # Set it as the default version
```

### Install dependencies

**Clone the repository** and install dependencies:

```bash
npm install
```

### Token Configuration

In the [base module config](./modules/base/config/), create a `secretConfig.json` file with the following structure:

```json
{
    "token": "your-token",
    "webhookURL": "your-webhook",
    "clientId": "your-client-id"
}
```

You can find your token and client ID here: [Discord Developer Portal](https://discord.com/developers/applications/).

## How to use ?

If you want to use all modules :

```bash
node ./index.js
```

### Arguments

- `--help`, `-h`  
&nbsp;&nbsp;&nbsp;&nbsp;Display help information
- `--modules`, `-m` <module_name>  
&nbsp;&nbsp;&nbsp;&nbsp;Load specific modules, separated by `,` (e.g. `-m roll_dice,jukebox`). Default : all modules
- `-list-modules`, `-l`  
&nbsp;&nbsp;&nbsp;&nbsp;List all available modules

### Automatic execution using pm2

To keep the bot running after a reboot (e.g. on a VM), you can use the process manager pm2:

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
