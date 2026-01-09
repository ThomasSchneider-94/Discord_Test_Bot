# Reaction to Role

Module to assign roles to users based on their reactions. Add or remove roles from users based on their reactions to specific messages.

## Commands

- **/rtr-setup**
  Manage a message for reaction-based role assignment.
  - `action`: Either 'Add', 'Remove' or 'View', the action you want to perform. If 'Remove' is selected and no other arguments are filled, remove all configuration from the message.
  - `messsage-link`: Link of the message to manage.
  - `role`: The role to assign when the reaction is added. If 'Remove' is selected, all occurence or the role are removed from the message.
  - `emoji`: Specific emoji to target. Do not use at the same time as 'any-reaction'.
  - `any-reaction`: When adding a role, do you want the role to be added on any emoji? When removing permission, specifically remove the role added with any emoji.
