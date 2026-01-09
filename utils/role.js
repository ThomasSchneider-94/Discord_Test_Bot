export function getRoleName(guild, roleId) {
    if (!guild || !roleId) { return undefined; } 
    const role = guild.roles.cache.get(roleId);
    return role ? `${role.toString()}` : `unknown role (ID ${roleId})`;
}

export function formatRoleList(guild, roleIds) {
    if (!guild || !roleIds.length) { return undefined; }
    return roleIds.map(id => getRoleName(guild, id)).join(', ');
}
