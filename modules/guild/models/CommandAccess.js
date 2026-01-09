export class CommandAccess {
    model = 'guild.command_access';
    
    this.moduleName = { type: "string", nullable: False };
    this.commandName = { type: "string" };
    this.minRoleId = { type: "string" };
    this.allowedRoleIds = { type: "string[]", default: [] };
}
