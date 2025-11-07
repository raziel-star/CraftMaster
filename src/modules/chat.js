const followPlayer = require('./pathfinder');
const { collectResource } = require('./collector');
const { attackTarget } = require('./combat');
const { farmAll } = require('./farmer');
const { bringItem } = require('./bring');
const { craftItem } = require('./crafter');
const { build } = require('./builder');

module.exports = async function chatHandler(bot, username, message, mcData) {
    const command = message.toLowerCase();

    if (command.startsWith('follow ')) {
        const playerName = command.split(' ')[1];
        followPlayer(bot, playerName);
    } else if (command.startsWith('collect ')) {
        const blockName = command.split(' ')[1];
        collectResource(bot, mcData, blockName);
    } else if (command.startsWith('attack ')) {
        const targetName = command.split(' ')[1];
        attackTarget(bot, targetName);
    } else if (command.startsWith('bring ')) {
        const args = message.split(' ');
        const itemName = args[1];
        const amount = args[2] ? parseInt(args[2], 10) : 1;
        bringItem(bot, username, itemName, amount, mcData);
    } else if (command.startsWith('craft ')) {
        const args = message.split(' ');
        const itemName = args[1];
        const amount = args[2] ? parseInt(args[2], 10) : 1;
        craftItem(bot, itemName, amount, mcData);
    } else if (command.startsWith('build ')) {
        const structure = command.split(' ')[1];
        build(bot, structure, mcData);
    } else if (command === 'eat') {
        bot.autoEat.enable();
    } else if (command === 'status') {
        bot.chat(`Health: ${bot.health}, Food: ${bot.food}`);
    } else if (command === 'stop') {
        bot.pathfinder.stop();
        bot.collectBlock.stop();
        bot.pvp.stop();
        bot.chat('All activities stopped.');
    } else if (command === 'sleep') {
        const bed = bot.findBlock({
            matching: mcData.beds,
            maxDistance: 16
        });
        if (bed) {
            bot.sleep(bed, (err) => {
                if (err) {
                    bot.chat(`I can't sleep: ${err.message}`);
                } else {
                    bot.chat('Sleeping...');
                }
            });
        } else {
            bot.chat('No bed nearby.');
        }
    } else if (command === 'farm') {
        farmAll(bot, mcData);
    }
}
