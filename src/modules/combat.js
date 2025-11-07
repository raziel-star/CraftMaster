function attackTarget(bot, targetName) {
  const lowerCaseTargetName = targetName.toLowerCase();
  let entity = null;

  // First, try to find the player in the bot.players list
  const player = bot.players[lowerCaseTargetName];
  if (player && player.entity) {
    entity = player.entity;
  } else {
    // If not found, try to find the nearest entity with a matching name
    entity = bot.nearestEntity(e => {
      if (e.username && e.username.toLowerCase() === lowerCaseTargetName) {
        return true;
      }
      if (e.name && e.name.toLowerCase() === lowerCaseTargetName) {
        return true;
      }
      return false;
    });
  }

  if (!entity) {
    bot.chat(`Target ${targetName} not found.`);
    return;
  }

  bot.pvp.attack(entity);
}

module.exports = { attackTarget };
