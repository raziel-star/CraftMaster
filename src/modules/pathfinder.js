const { goals } = require('mineflayer-pathfinder');

function followPlayer(bot, playerName) {
  if (!playerName) {
    bot.chat("You need to specify who to follow! Example: follow [username]");
    return;
  }

  // חיפוש השחקן בלי תלות באותיות קטנות/גדולות
  const targetName = Object.keys(bot.players).find(
    name => name.toLowerCase() === playerName.toLowerCase()
  );

  if (!targetName) {
    bot.chat(`I can't find any player named ${playerName}.`);
    return;
  }

  const target = bot.players[targetName]?.entity;

  if (!target) {
    bot.chat(`${targetName} is not visible right now.`);
    return;
  }

  // שימוש במטרה (goal) של pathfinder
  const goal = new goals.GoalFollow(target, 1.5); // עקוב ממרחק קטן
  bot.pathfinder.setGoal(goal, true);

  bot.chat(`Following ${targetName} 👣`);
}

module.exports = followPlayer;
