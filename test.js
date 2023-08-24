const { reactionToRole } = require('./events/configReactionToRole.json');

for (message of reactionToRole) {
    console.log(message)
}