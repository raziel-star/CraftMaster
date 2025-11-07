const mineflayer = require('mineflayer');
const { pathfinder, Movements } = require('mineflayer-pathfinder');
const autoEat = require('mineflayer-auto-eat').plugin;
const collectBlock = require('mineflayer-collectblock').plugin;
const pvp = require('mineflayer-pvp').plugin;
const mcData = require('minecraft-data')('1.20.1'); // put your minecraft version here

const chatHandler = require('./modules/chat');

const bot = mineflayer.createBot({
  host: 'localhost',
  port: 1234,
  username: 'Blocky123'
});

// טעינת הפלאגינים בצורה נכונה
bot.loadPlugin(pathfinder);
bot.loadPlugin(autoEat);
bot.loadPlugin(collectBlock);
bot.loadPlugin(pvp);

bot.once('spawn', () => {
  console.log(`✅ Bot connected as: ${bot.username}`);

  // הגדרות AutoEat
  bot.autoEat.options = {
    priority: 'foodPoints',
    startAt: 14,
    bannedFood: []
  };
  
  // pathfinding settings
  const defaultMove = new Movements(bot, mcData);
  defaultMove.allow1by1tall = true;
  defaultMove.allowSprinting = true;
  defaultMove.allowDig = true;

  // collector settings
  bot.collectBlock.chestLocations = []; // Initialize chestLocations
  bot.collectBlock.itemFilter = () => true; // Initialize itemFilter to collect all items
});

// chat listening
bot.on('chat', (username, message) => {
  if (username === bot.username) return;
  chatHandler(bot, username, message, mcData);
});

bot.on('error', err => console.error('Error:', err));
bot.on('end', () => console.log('Bot disconnected'));


