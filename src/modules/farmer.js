const { GoalNear } = require('mineflayer-pathfinder').goals;
const Vec3 = require('vec3');

async function farmAll(bot, mcData) {
    bot.chat('Starting full farm routine...');

    // חיפוש כל החיטה הבשלה בסביבה
    const wheatBlocks = bot.findBlocks({
        matching: mcData.blocksByName.wheat.id,
        maxDistance: 64,
        useExtraInfo: b => b.metadata === 7 // Fully grown
    });

    if (wheatBlocks.length === 0) {
        bot.chat('No fully grown wheat nearby. Farm complete.');
        return;
    }

    for (const pos of wheatBlocks) {
        const wheatBlock = bot.blockAt(pos);
        if (!wheatBlock) continue;

        // לגשת לחיטה
        const wheatGoal = new GoalNear(pos.x, pos.y, pos.z, 1.5);
        try {
            await bot.pathfinder.goto(wheatGoal);
            await bot.dig(wheatBlock);
            await bot.waitForTicks(20); // Add a delay to allow items to be collected
        } catch (err) {
            bot.chat('Failed to reach or dig wheat.');
            continue;
        }
    }

    // למצוא תיבה קרובה
    const chestBlock = bot.findBlock({
        matching: mcData.blocksByName.chest.id,
        maxDistance: 100
    });

    if (!chestBlock) {
        bot.chat('No chest nearby to store items. Replanting seeds anyway.');
        // שתילה מחדש של כל החיטה שנקטפה
        for (const pos of wheatBlocks) {
            await replant(bot, mcData, pos);
        }
        return;
    }

    // לגשת לתיבה
    const chestGoal = new GoalNear(chestBlock.position.x, chestBlock.position.y, chestBlock.position.z, 1.5);
    await bot.pathfinder.goto(chestGoal);

    const chest = await bot.openChest(chestBlock);

    // להכניס כל החיטה והזרעים לתיבה
    const itemsToDeposit = bot.inventory.items().filter(i => i.name === 'wheat' || i.name === 'wheat_seeds');
    for (const item of itemsToDeposit) {
        await chest.deposit(item.type, null, item.count);
    }

    await chest.close();
    bot.chat('All items stored in chest.');

    // שתילה מחדש של כל החיטה שנקטפה
    for (const pos of wheatBlocks) {
        await replant(bot, mcData, pos);
    }

    bot.chat('Farm routine finished!');
}

async function replant(bot, mcData, position) {
    const seeds = bot.inventory.findInventoryItem(mcData.itemsByName.wheat_seeds.id);
    if (!seeds) return;

    const farmland = bot.blockAt(position.offset(0, -1, 0));
    if (farmland && farmland.name === 'farmland') {
        await bot.equip(seeds, 'hand');
        await bot.placeBlock(farmland, new Vec3(0, 1, 0));
    }
}

module.exports = { farmAll };
