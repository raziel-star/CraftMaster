const { equipBestTool } = require('./utils');

async function collectResource(bot, mcData, blockName) {
  const blockType = mcData.blocksByName[blockName];
  if (!blockType) return bot.chat(`Block not found: ${blockName}`);

  const block = bot.findBlock({ matching: blockType.id, maxDistance: 64 });
  if (!block) return bot.chat(`No ${blockName} nearby`);

  const chest = bot.findBlock({
    matching: mcData.blocksByName.chest.id,
    maxDistance: 16
  });

  equipBestTool(bot, mcData, block);
  bot.chat(`Collecting ${blockName}`);

  bot.collectBlock.chestLocations = []; // Initialize chestLocations
  bot.collectBlock.itemFilter = () => true; // Initialize itemFilter to collect all items
  bot.collectBlock.options = {}; // Initialize options object

  if (chest) {
    bot.collectBlock.options.chest = chest;
  }

  bot.collectBlock.collect(block, (err) => {
    if (err) {
        bot.chat(`Failed to collect ${blockName}: ${err.message}`);
    } else {
        if (chest) {
            bot.chat(`${blockName} collected and stored in chest.`);
        } else {
            bot.chat(`${blockName} collected!`);
        }
    }
  });
}

module.exports = { collectResource };
