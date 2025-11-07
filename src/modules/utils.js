function equipBestTool(bot, mcData, block) {
    const items = bot.inventory.items();
    let bestTool = null;

    // Simple logic to find the best tool, can be improved
    const tool = bot.pathfinder.bestHarvestTool(block)
    if (tool) {
        bot.equip(tool, 'hand');
    }
}

module.exports = { equipBestTool };
