const { GoalFollow } = require('mineflayer-pathfinder').goals;

async function bringItem(bot, username, itemName, amount, mcData) {
    const normalizedItemName = itemName.replace(/ /g, '_');
    const item = mcData.itemsByName[normalizedItemName];
    if (!item) {
        bot.chat(`I don't know what ${itemName} is.`);
        return;
    }

    const itemsInInventory = bot.inventory.findInventoryItem(item.id, null, false);

    if (!itemsInInventory || itemsInInventory.count < amount) {
        bot.chat(`I don't have ${amount} ${itemName}.`);
        return;
    }

    const player = bot.players[username.toLowerCase()];
    if (!player || !player.entity) {
        bot.chat(`I can't find you, ${username}.`);
        return;
    }

    await bot.pathfinder.goto(new GoalFollow(player.entity, 2));

    await bot.equip(itemsInInventory, 'hand');
    await bot.toss(item.id, null, amount);

    bot.chat(`Here is your ${itemName}, ${username}.`);
}

module.exports = { bringItem };
