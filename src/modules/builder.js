const { Vec3 } = require('vec3');
const { goals: { GoalNear } } = require('mineflayer-pathfinder');

const penBlueprint = {
    name: 'pen',
    materials: { 'oak_fence': 12, 'oak_fence_gate': 1 },
    dimensions: { width: 5, depth: 5, height: 1 },
    shape: [
        { x: 0, y: 0, z: 0, name: 'oak_fence' },
        { x: 1, y: 0, z: 0, name: 'oak_fence' },
        { x: 2, y: 0, z: 0, name: 'oak_fence_gate' },
        { x: 3, y: 0, z: 0, name: 'oak_fence' },
        { x: 4, y: 0, z: 0, name: 'oak_fence' },

        { x: 0, y: 0, z: 1, name: 'oak_fence' },
        { x: 4, y: 0, z: 1, name: 'oak_fence' },

        { x: 0, y: 0, z: 2, name: 'oak_fence' },
        { x: 4, y: 0, z: 2, name: 'oak_fence' },

        { x: 0, y: 0, z: 3, name: 'oak_fence' },
        { x: 4, y: 0, z: 3, name: 'oak_fence' },

        { x: 0, y: 0, z: 4, name: 'oak_fence' },
        { x: 1, y: 0, z: 4, name: 'oak_fence' },
        { x: 2, y: 0, z: 4, name: 'oak_fence' },
        { x: 3, y: 0, z: 4, name: 'oak_fence' },
        { x: 4, y: 0, z: 4, name: 'oak_fence' },
    ]
};

async function build(bot, structureName, mcData) {
    if (structureName !== 'pen') {
        bot.chat(`I don't know how to build a ${structureName}.`);
        return;
    }

    const blueprint = penBlueprint;
    bot.chat(`Planning to build a ${blueprint.name}.`);

    // 1. Check for materials
    const missingMaterials = checkMaterials(bot, blueprint.materials, mcData);
    if (Object.keys(missingMaterials).length > 0) {
        bot.chat('I am missing materials for this build.');
        for (const material in missingMaterials) {
            bot.chat(`- ${missingMaterials[material]} ${material}`);
        }
        bot.chat('I need to gather materials first. This feature is not implemented yet.');
        return;
    }

    // 2. Find a suitable flat area
    const anchor = await findFlatArea(bot, blueprint.dimensions);
    if (!anchor) {
        bot.chat("I couldn't find a suitable flat area to build.");
        return;
    }

    bot.chat(`Found a suitable location at ${anchor}. Starting to build.`);
    await bot.waitForTicks(20); // Wait a second before starting

    // 3. Build the structure
    for (const block of blueprint.shape) {
        try {
            const item = mcData.itemsByName[block.name];
            if (!item) {
                bot.chat(`Unknown item: ${block.name}`);
                continue;
            }

            const targetPosition = anchor.offset(block.x, block.y, block.z);

            await bot.pathfinder.goto(new GoalNear(targetPosition.x, targetPosition.y, targetPosition.z, 3));

            const referenceBlock = bot.blockAt(targetPosition.offset(0, -1, 0));

            if (!referenceBlock) {
                bot.chat(`The ground beneath the build site is gone! Stopping.`);
                return;
            }

            // Equip the required item
            if (!bot.heldItem || bot.heldItem.type !== item.id) {
                const itemInInventory = bot.inventory.findInventoryItem(item.id, null);
                if (!itemInInventory) {
                    bot.chat(`I've run out of ${block.name}. Stopping build.`);
                    return;
                }
                await bot.equip(item.id, 'hand');
            }
            
            // Place the block
            await bot.placeBlock(referenceBlock, new Vec3(0, 1, 0));
            await bot.waitForTicks(10); // Wait a bit after placing a block
        } catch (err) {
            bot.chat(`An error occurred during building: ${err.message}. Stopping.`);
            console.log(err);
            return;
        }
    }

    bot.chat('Build complete!');
}

function checkMaterials(bot, materials, mcData) {
    const missing = {};
    for (const materialName in materials) {
        const requiredAmount = materials[materialName];
        const item = mcData.itemsByName[materialName];
        if (item) {
            const count = bot.inventory.count(item.id);
            if (count < requiredAmount) {
                missing[materialName] = requiredAmount - count;
            }
        } else {
            missing[materialName] = requiredAmount; // Unknown item
        }
    }
    return missing;
}

async function findFlatArea(bot, dimensions) {
    const botPosition = bot.entity.position.floored();
    for (let x = botPosition.x - 16; x < botPosition.x + 16; x++) {
        for (let z = botPosition.z - 16; z < botPosition.z + 16; z++) {
            // Check at the bot's feet level
            const anchor = new Vec3(x, botPosition.y, z);
            if (isAreaFlat(bot, anchor, dimensions)) {
                return anchor;
            }
        }
    }
    return null;
}

function isAreaFlat(bot, anchor, dimensions) {
    for (let x = 0; x < dimensions.width; x++) {
        for (let z = 0; z < dimensions.depth; z++) {
            const groundBlock = bot.blockAt(anchor.offset(x, -1, z));
            const spaceBlock = bot.blockAt(anchor.offset(x, 0, z));

            // Ground must be solid and not air
            if (!groundBlock || groundBlock.boundingBox === 'empty' || !groundBlock.solid) {
                return false;
            }

            // The space where we want to build must be empty (air)
            if (spaceBlock && spaceBlock.boundingBox !== 'empty') {
                return false;
            }
        }
    }
    return true;
}

module.exports = { build };