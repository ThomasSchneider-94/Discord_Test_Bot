# Guild

Base module of each server providing essential commands and configurations. Not installable or uninstallable

## Commands

- **/help**
  Display information about a command, module or general information about the bot if no argument is provided.
  - `module`: Name of the module you want info on. Can also be used to filter the commands autocomplete.
  - `command`: Name of the command you want info on. If multiple modules provide the command, use the format `command (module)`.

- **/module**
  Install or remove modules on the server.
  - `action`: Either 'Add' or 'Remove', the action you want to perform.
  - `module`: Name of the module you want to install or remove.

- **/permissions**
  Manage or review the modules and command permissions. If command and module are specified, only the command argument is considered.
  - `action`: Either 'Add', 'Remove' or 'View', the action you want to perform.
  - `module`: Name of the module of which the permissions needs to be managed or reviewed. Can also be used to filter the commands autocomplete.
  - `command`: Name of the command of which the permissions needs to be managed or reviewed.
  - `role`: The role which need to be added or removed. If 'Remove' is selected and role is not specified, remove all restriction from the module or command. If 'View' action is selected, display all commands usable by the role.
  - `include-higher-roles`: When adding permissions, does the permission extend to all roles above? When removing permission, specifically remove the minimal required role.
