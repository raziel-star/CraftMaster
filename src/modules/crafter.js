async function craftItem(bot, itemName, amount, mcData) {
    const normalizedItemName = itemName.replace(/ /g, '_');
    const item = mcData.itemsByName[normalizedItemName];
    if (!item) {
        bot.chat(`I don't know what ${itemName} is.`);
        return;
    }

    const recipes = bot.recipesFor(item.id, null, 1, null);
    if (recipes.length === 0) {
        bot.chat(`I don't know how to craft ${itemName}.`);
        return;
    }

    const recipe = recipes[0]; // Choose the first recipe

    try {
        await bot.craft(recipe, amount, null);
        bot.chat(`Crafted ${amount} ${itemName}.`);
    } catch (err) {
        bot.chat(`Failed to craft ${itemName}: ${err.message}`);
    }
}

module.exports = { craftItem };
