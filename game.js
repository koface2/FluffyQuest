const GRID_WIDTH = 7;
const GRID_HEIGHT = 7;
const TILE_SIZE = 50;
const GRID_OFFSET_X = 20;
const GRID_OFFSET_Y = 30;
const FIGHT_PANEL_Y = 395;

const TILE_TYPES = [
    { name: 'health',   color: 0xff1493, icon: '♥',  effect: 'health'   },
    { name: 'magic',    color: 0x0000ff, icon: '📖', effect: 'magic'    },
    { name: 'ranged',   color: 0x00ff00, icon: '🏹', effect: 'ranged'   },
    { name: 'physical', color: 0xff0000, icon: '⚔️', effect: 'physical' },
    { name: 'gold',     color: 0xffff00, icon: '🪙', effect: 'gold'     },
    // Special tile types — placed by skills, not generated randomly
    { name: 'frost', color: 0x88ddff, icon: '❄️', effect: 'frost', special: true, textureKey: 'special_frost' },
    { name: 'zap',   color: 0xffee44, icon: '⚡', effect: 'zap',   special: true, textureKey: 'special_zap'   },
    { name: 'flame', color: 0xff6600, icon: '🔥', effect: 'flame', special: true, textureKey: 'special_flame' },
];

const MONSTER_NAMES = ['Kobold', 'Goblin', 'Orc', 'Troll', 'Warlock', 'Skeleton', 'Lich', 'Bandit'];

const MONSTER_BODIES = [
    // Red Squirrel (index 0)
    { spriteKey: 'redsquirrel',
      innate: [{ icon: '💨', name: 'Nimble', desc: '10% chance to evade attacks.' }] },
    // Pig Goblin (index 1)
    { spriteKey: 'skinnypiggoblin',
      innate: [{ id: 'doubleAttack', icon: '⚔️', name: 'Feral', desc: 'Attacks twice per turn.' }] },
    // Orc Pig (index 2)
    { spriteKey: 'orcpig',
      innate: [{ id: 'toughHide', icon: '🐗', name: 'Tough Hide', desc: 'Takes reduced damage from all sources.' }] },
    // Sloth Troll (index 3)
    { spriteKey: 'slothtroll',
      innate: [{ id: 'trollRegen', icon: '💪', name: 'Regeneration', desc: 'Heals 10% of its max health at the start of each turn.' }] },
    // Bunny Warlock (index 4)
    { spriteKey: 'bunnywarlock',
      innate: [{ id: 'elementalChaos', icon: '🔮', name: 'Elemental Chaos', desc: 'Deals a random type of elemental damage instead of regular damage.' }] },
    // Hamster Skeleton (index 5)
    { spriteKey: 'hamsterskeleton',
      innate: [{ id: 'undead', icon: '💀', name: 'Undead', desc: '33% chance to resurrect at 50% health upon death.' }] },
    // Guinea Pig Lich — boss (index 6)
    { spriteKey: 'guineapiglich', isBoss: true,
      spriteOriginY: 1, spritePosYOffset: 84, spriteDisplayW: 182, spriteDisplayH: 149,
      innate: [{ id: 'cursedAura', icon: '☠️', name: 'Cursed Aura', desc: 'Radiates dark energy that saps the hero\'s life force each turn.' }] },
    // Raccoon Bandit (index 7)
    { spriteKey: 'raccoonbandit', spriteDisplayW: 155, spriteDisplayH: 130, spriteOriginX: 0.62,
      innate: [{ id: 'goldTheft', icon: '🪙', name: 'Pickpocket', desc: 'Steals 5% of the hero\'s gold each time it attacks.' }] }
];

const ITEM_RARITIES = [
    { name: 'Normal', weight: 90, affixes: 0, statMultiplier: 1.0, frameColor: 0xa3a3a3, textColor: '#d0d0d0' },
    { name: 'Magic', weight: 8, affixes: 2, statMultiplier: 1.1, frameColor: 0x5aa9ff, textColor: '#8ec5ff' },
    { name: 'Rare', weight: 2, affixes: 4, statMultiplier: 1.25, frameColor: 0xffd166, textColor: '#ffe08f' },
    { name: 'Legendary', weight: 0, affixes: 6, statMultiplier: 1.5, frameColor: 0xff7f11, textColor: '#ffb35c' }
];

// ---------------------------------------------------------------------------
// Enemy rarity system — mirrors item rarities in colour language.
// Magic=1 affix, Rare=2, Legendary=3.
// ---------------------------------------------------------------------------
const ENEMY_RARITIES = [
    { name: 'Normal',    weight: 55, affixes: 0, hpMult: 1.00, atkMult: 1.00, textColor: '#d0d0d0' },
    { name: 'Magic',     weight: 28, affixes: 1, hpMult: 1.35, atkMult: 1.25, textColor: '#8ec5ff' },
    { name: 'Rare',      weight: 13, affixes: 2, hpMult: 1.80, atkMult: 1.60, textColor: '#ffe08f' },
    { name: 'Legendary', weight: 4,  affixes: 3, hpMult: 2.60, atkMult: 2.10, textColor: '#ffb35c' }
];

const ENEMY_AFFIXES = [
    { id: 'enraged',      name: 'Enraged',      icon: '🔥', atkMult: 0.5,  hpMult: 0,    desc: '+50% attack damage. This foe strikes with burning fury.' },
    { id: 'fortified',    name: 'Fortified',    icon: '🛡️', atkMult: 0,    hpMult: 0.6,  desc: '+60% max health. This foe is encased in thick armour.' },
    { id: 'regenerating', name: 'Regenerating', icon: '💚', atkMult: 0,    hpMult: 0.3,  desc: 'Heals 8% max HP each time it attacks.' },
    { id: 'thorns',       name: 'Thorns',       icon: '🌵', atkMult: 0,    hpMult: 0,    desc: 'Reflects 15% of damage received back to the attacker.' },
    { id: 'berserking',   name: 'Berserking',   icon: '💢', atkMult: 0.3,  hpMult: -0.1, desc: '+30% attack, -10% HP. Frenzied and hard to slow.' },
    { id: 'swift',        name: 'Swift',        icon: '💨', atkMult: 0.2,  hpMult: 0,    desc: '+20% attack. Attacks with blinding speed.' },
    { id: 'armored',      name: 'Armoured',     icon: '⚙️', atkMult: 0,    hpMult: 0.4,  desc: '+40% HP. Heavy plate reduces incoming blows.' },
    { id: 'warding',      name: 'Warding',      icon: '✨', atkMult: 0,    hpMult: 0.2,  desc: '+20% HP. Arcane wards deflect elemental damage.' },
    { id: 'vampiric',     name: 'Vampiric',     icon: '🩸', atkMult: 0.25, hpMult: 0,    desc: '+25% attack. Leeches life every time it hits.' },
    { id: 'plagued',      name: 'Plagued',      icon: '☠️', atkMult: 0.1,  hpMult: 0.2,  desc: '+10% ATK, +20% HP. Oozes corruption.' }
];

const ITEM_BASES = [
    // --- Helmets ---
    { slotGroup: 'helmet', type: 'Helmet', baseName: 'Helm', icon: '🪖', description: 'A sturdy iron helm.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 4 } },
    { slotGroup: 'helmet', type: 'Helmet', baseName: 'Circlet', icon: '🪖', description: 'A circlet humming with arcane energy.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 4 } },
    { slotGroup: 'helmet', type: 'Helmet', baseName: 'Hood', icon: '🪖', description: 'A lightweight hood favoring agility.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 4 } },
    // --- Chests ---
    { slotGroup: 'chest', type: 'Chest', baseName: 'Cuirass', icon: '🦺', description: 'Heavy plate that absorbs strikes.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 6, health: 4 } },
    { slotGroup: 'chest', type: 'Chest', baseName: 'Robe', icon: '🦺', description: 'A flowing robe threaded with mana.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 6, health: 4 } },
    { slotGroup: 'chest', type: 'Chest', baseName: 'Vest', icon: '🦺', description: 'Supple leather for nimble fighters.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 6, health: 4 } },
    // --- Gloves ---
    { slotGroup: 'gloves', type: 'Gloves', baseName: 'Gauntlets', icon: '🧤', description: 'Iron gauntlets for crushing grip.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 3, physical: 1 } },
    { slotGroup: 'gloves', type: 'Gloves', baseName: 'Silk Wraps', icon: '🧤', description: 'Enchanted silk that channels spells.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 3, magic: 1 } },
    { slotGroup: 'gloves', type: 'Gloves', baseName: 'Bracers', icon: '🧤', description: 'Light bracers for precise strikes.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 3, ranged: 1 } },
    // --- Boots ---
    { slotGroup: 'boots', type: 'Boots', baseName: 'Greaves', icon: '🥾', description: 'Plated boots for the front line.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 3 } },
    { slotGroup: 'boots', type: 'Boots', baseName: 'Slippers', icon: '🥾', description: 'Enchanted slippers of the magi.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 3 } },
    { slotGroup: 'boots', type: 'Boots', baseName: 'Striders', icon: '🥾', description: 'Nimble footwear for quick movement.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 3 } },
    // --- Belts ---
    { slotGroup: 'belt', type: 'Belt', baseName: 'Warbelt', icon: '�', description: 'A heavy belt reinforcing stance.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 2, health: 6 } },
    { slotGroup: 'belt', type: 'Belt', baseName: 'Sash', icon: '🥋', description: 'A woven sash pulsing with mana.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 2, health: 6 } },
    { slotGroup: 'belt', type: 'Belt', baseName: 'Cord', icon: '🥋', description: 'A flexible cord for the agile.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 2, health: 6 } },
    // --- Weapons (no base type) ---
    { slotGroup: 'mainhand', type: 'Sword', baseName: 'Longsword', icon: '⚔️', description: 'A balanced blade that excels at physical damage.', implicitStat: 'physical', baseStats: { physical: 5 }, weaponClass: 'sword' },
    { slotGroup: 'mainhand', type: 'Wand', baseName: 'Wand', icon: '🪄', description: 'A conduit for arcane force and focused spellcraft.', implicitStat: 'magic', baseStats: { magic: 5 }, weaponClass: 'wand' },
    { slotGroup: 'mainhand', type: 'Bow', baseName: 'Longbow', icon: '🏹', description: 'A two-handed bow tuned for ranged damage.', implicitStat: 'ranged', baseStats: { ranged: 6 }, weaponClass: 'bow', twoHanded: true },
    // --- Offhand ---
    { slotGroup: 'offhand', type: 'Shield', baseName: 'Buckler', icon: '🛡️', description: 'A sturdy iron shield.', baseType: 'strength', implicitStat: 'armor', baseStats: { armor: 5 } },
    { slotGroup: 'offhand', type: 'Shield', baseName: 'Spirit Shield', icon: '🛡️', description: 'A shield woven from pure energy.', baseType: 'intelligence', implicitStat: 'energyShield', baseStats: { energyShield: 5 } },
    { slotGroup: 'offhand', type: 'Shield', baseName: 'Deflector', icon: '🛡️', description: 'A light parrying shield.', baseType: 'dexterity', implicitStat: 'evasion', baseStats: { evasion: 5 } },
    // --- Rings ---
    { slotGroup: 'ring', type: 'Ring', baseName: 'Iron Ring', icon: '💍', description: 'A heavy iron band.', baseType: 'strength', implicitStat: 'strength', baseStats: { strength: 3 } },
    { slotGroup: 'ring', type: 'Ring', baseName: 'Sapphire Ring', icon: '💍', description: 'A ring set with a glowing sapphire.', baseType: 'intelligence', implicitStat: 'intelligence', baseStats: { intelligence: 3 } },
    { slotGroup: 'ring', type: 'Ring', baseName: 'Jade Ring', icon: '💍', description: 'A ring carved from jade.', baseType: 'dexterity', implicitStat: 'dexterity', baseStats: { dexterity: 3 } },
    // --- Necklaces ---
    { slotGroup: 'necklace', type: 'Necklace', baseName: 'Gorget', icon: '📿', description: 'A heavy neck guard.', baseType: 'strength', implicitStat: 'strength', baseStats: { strength: 4 } },
    { slotGroup: 'necklace', type: 'Necklace', baseName: 'Pendant', icon: '📿', description: 'A pendant pulsing with arcane light.', baseType: 'intelligence', implicitStat: 'intelligence', baseStats: { intelligence: 4 } },
    { slotGroup: 'necklace', type: 'Necklace', baseName: 'Talisman', icon: '📿', description: 'A talisman of keen reflexes.', baseType: 'dexterity', implicitStat: 'dexterity', baseStats: { dexterity: 4 } }
];

const ITEM_PREFIXES = [
    { name: 'Brutal', stats: { physical: [1, 3] }, tags: ['strength'] },
    // Attribute Prefixes
    { name: 'Mighty', stats: { strength: [1, 3] }, tags: ['strength'] },
    { name: 'Sage', stats: { intelligence: [1, 3] }, tags: ['intelligence'] },
    { name: 'Agile', stats: { dexterity: [1, 3] }, tags: ['dexterity'] },
    { name: 'Arcane', stats: { magic: [1, 3] }, tags: ['intelligence'] },
    { name: 'Deadeye', stats: { ranged: [1, 3] }, tags: ['dexterity'] },
    { name: 'Stalwart', stats: { armor: [2, 5] }, tags: ['strength'], noWeapon: true },
    { name: 'Vital', stats: { health: [5, 14] }, tags: [], weight: 3 },
    { name: 'Prosperous', stats: { magicFind: [3, 10] }, tags: [] },
    { name: 'Cruel', stats: { physical: [2, 6] }, tags: ['strength'] },
    { name: 'Runic', stats: { magic: [2, 6] }, tags: ['intelligence'] },
    { name: 'Sharpened', stats: { ranged: [1, 4], physical: [1, 2] }, tags: ['dexterity', 'strength'] },
    { name: 'Fortified', stats: { armor: [3, 8], health: [3, 7] }, tags: ['strength'], noWeapon: true },
    { name: 'Vampiric', stats: { health: [4, 10], physical: [1, 2] }, tags: ['strength'] },
    { name: 'Gilded', stats: { magicFind: [4, 14] }, tags: [] },
    { name: 'Nimble', stats: { ranged: [1, 3], evasion: [1, 2] }, tags: ['dexterity'], noWeapon: true },
    { name: 'Sorcerous', stats: { magic: [2, 5], energyShield: [1, 4] }, tags: ['intelligence'], noWeapon: true },
    { name: 'Warding', stats: { energyShield: [2, 5] }, tags: ['intelligence'], noWeapon: true },
    { name: 'Evasive',    stats: { evasion: [2, 5] },           tags: ['dexterity'], noWeapon: true },
    { name: 'Blazing',    stats: { fireDamage: [2, 6] },         tags: ['intelligence'] },
    { name: 'Shocking',   stats: { lightningDamage: [2, 6] },    tags: ['intelligence'] },
    { name: 'Glacial',    stats: { coldDamage: [2, 6] },         tags: ['intelligence'] },
    { name: 'Fireproof',  stats: { fireResistance: [3, 8] },     tags: [] },
    { name: 'Grounded',   stats: { lightningResistance: [3, 8] }, tags: [] },
    { name: 'Insulated',  stats: { coldResistance: [3, 8] },     tags: [] },
    { name: 'Mending',    stats: { lifeRegen: [1, 3] },           tags: [] }
];

const ITEM_SUFFIXES = [
    { name: 'of Slaying', stats: { physical: [1, 3], magic: [1, 2] }, tags: ['strength', 'intelligence'] },
    // Attribute Suffixes
    { name: 'of Power', stats: { strength: [1, 3] }, tags: ['strength'] },
    { name: 'of Wisdom', stats: { intelligence: [1, 3] }, tags: ['intelligence'] },
    { name: 'of Finesse', stats: { dexterity: [1, 3] }, tags: ['dexterity'] },
    { name: 'of Focus', stats: { magic: [1, 4] }, tags: ['intelligence'] },
    { name: 'of Precision', stats: { ranged: [1, 4] }, tags: ['dexterity'] },
    { name: 'of Guarding', stats: { armor: [2, 5] }, tags: ['strength'], noWeapon: true },
    { name: 'of Vitality', stats: { health: [6, 16] }, tags: [], weight: 3 },
    { name: 'of Fortune', stats: { magicFind: [4, 12] }, tags: [] },
    { name: 'of Carnage', stats: { physical: [2, 7] }, tags: ['strength'] },
    { name: 'of the Magi', stats: { magic: [2, 7] }, tags: ['intelligence'] },
    { name: 'of the Hawk', stats: { ranged: [2, 6] }, tags: ['dexterity'] },
    { name: 'of the Fortress', stats: { armor: [3, 9], health: [3, 7] }, tags: ['strength'], noWeapon: true },
    { name: 'of Regeneration', stats: { health: [8, 20] }, tags: [], weight: 3 },
    { name: 'of Plunder', stats: { magicFind: [6, 16] }, tags: [] },
    { name: 'of Devastation', stats: { physical: [2, 5], ranged: [1, 3] }, tags: ['strength', 'dexterity'] },
    { name: 'of the Archmage', stats: { magic: [2, 5], energyShield: [2, 5] }, tags: ['intelligence'], noWeapon: true },
    { name: 'of Reflexes', stats: { evasion: [2, 6] }, tags: ['dexterity'], noWeapon: true },
    { name: 'of Shielding',     stats: { energyShield: [2, 6] },        tags: ['intelligence'], noWeapon: true },
    { name: 'of Embers',         stats: { fireDamage: [2, 7] },           tags: ['intelligence'] },
    { name: 'of the Storm',      stats: { lightningDamage: [2, 7] },      tags: ['intelligence'] },
    { name: 'of Frost',          stats: { coldDamage: [2, 7] },           tags: ['intelligence'] },
    { name: 'of the Flame Ward', stats: { fireResistance: [4, 10] },      tags: [] },
    { name: 'of the Lightning Ward', stats: { lightningResistance: [4, 10] }, tags: [] },
    { name: 'of the Frost Ward', stats: { coldResistance: [4, 10] },      tags: [] },
    { name: 'of Recovery',       stats: { lifeRegen: [2, 4] },            tags: [] },
    { name: 'of Leech',          stats: { leech: [5, 12] },               tags: [], allowedSlots: ['mainhand', 'ring', 'necklace'] },
    { name: 'of Scorching',      stats: { fireDamage: [2, 7] },            tags: [], allowedSlots: ['mainhand', 'ring', 'necklace'] },
    { name: 'of the Tempest',    stats: { lightningDamage: [2, 7] },       tags: [], allowedSlots: ['mainhand', 'ring', 'necklace'] },
    { name: 'of Permafrost',     stats: { coldDamage: [2, 7] },            tags: [], allowedSlots: ['mainhand', 'ring', 'necklace'] }
];

// ---------------------------------------------------------------------------
// Legendary-exclusive affixes — only roll on Legendary rarity items.
// Stats with [1,1] range act as boolean flags (checked via >= 1).
// ---------------------------------------------------------------------------
const LEGENDARY_ITEM_AFFIXES = [
    // --- Damage Conversions (100%) ---
    { name: 'Infernal',       desc: '100% of physical damage converts to fire damage.',        stats: { physToFire:         [1, 1] }, tags: ['strength'] },
    { name: 'Tempest',        desc: '100% of ranged damage converts to lightning damage.',      stats: { rangedToLightning:  [1, 1] }, tags: ['dexterity'] },
    { name: 'Glacial Mind',   desc: '100% of magic damage converts to cold damage.',            stats: { magicToCold:        [1, 1] }, tags: ['intelligence'] },
    { name: 'Thunderfist',    desc: '100% of physical damage converts to lightning damage.',    stats: { physToLightning:    [1, 1] }, tags: ['strength'] },
    { name: 'Flame Caller',   desc: '100% of ranged damage converts to fire damage.',           stats: { rangedToFire:       [1, 1] }, tags: ['dexterity'] },
    { name: "Winter's Touch", desc: '100% of physical damage converts to cold damage.',         stats: { physToCold:         [1, 1] }, tags: ['strength'] },
    // --- Tile Spawn Chance (+25%) ---
    { name: 'Crimson',        desc: '25% chance for a red (physical) tile to appear.',          stats: { redTileChance:      [25, 25] }, tags: [] },
    { name: 'Verdant',        desc: '25% chance for a green (ranged) tile to appear.',          stats: { greenTileChance:    [25, 25] }, tags: [] },
    { name: 'Azure',          desc: '25% chance for a blue (magic) tile to appear.',            stats: { blueTileChance:     [25, 25] }, tags: [] },
    { name: 'Auric',          desc: '25% chance for a gold tile to appear.',                    stats: { goldTileChance:     [25, 25] }, tags: [] },
    { name: 'Rosy',           desc: '25% chance for a health tile to appear.',                  stats: { pinkTileChance:     [25, 25] }, tags: [] },
    // --- Extra Turn ---
    { name: 'of Haste',       desc: '10% chance to take another turn after making a match.',   stats: { extraTurnChance:    [10, 10] }, tags: [] },
    // --- PoE-Inspired Unique Effects ---
    { name: 'of Soul Steal', desc: 'On kill: gain +15% all damage for the rest of the battle (stacks).', stats: { headhunter: [1, 1] }, tags: [] },
    { name: "of the Kaom",    desc: 'All energy shield is converted into maximum health instead.',          stats: { kaomHeart:  [1, 1] }, tags: ['strength'] },
    { name: 'of Iron Will',   desc: '50% of your Strength stat bonus also applies to magic damage.',        stats: { ironWill:   [1, 1] }, tags: ['strength', 'intelligence'] },
    { name: 'of the Aegis',   desc: 'Gain +25% block chance. On block, heal 2 HP.',                        stats: { aegisAurora: [1, 1] }, tags: ['intelligence'] },
    { name: 'of Rupture',     desc: 'Critical hits deal an additional +50% damage on top of the normal crit bonus.', stats: { rupture: [1, 1] }, tags: [] },
    { name: 'of the Voidheart', desc: 'Your gold tile matches also deal magic damage equal to the gold gained.', stats: { voidheart: [1, 1] }, tags: [] },
];

const EQUIPMENT_SLOT_GROUP_BY_KEY = {
    helmet: 'helmet',
    chest: 'chest',
    gloves: 'gloves',
    boots: 'boots',
    belt: 'belt',
    mainhand: 'mainhand',
    offhand: 'offhand',
    ring1: 'ring',
    necklace: 'necklace'
};

const ACTIVE_SKILL_GEMS = [
    {
        id: 'cleave',
        name: 'Cleave',
        tileEffect: 'physical',
        baseThreshold: 4,
        mode: 'damage-all',
        basePower: 10,
        scalingStat: 'physical',
        tags: ['physical', 'melee', 'damage-all']
    },
    {
        id: 'minute-missles',
        name: 'Minute Missles',
        tileEffect: 'magic',
        baseThreshold: 4,
        mode: 'damage-random-4',
        basePower: 26,
        scalingStat: 'magic',
        tags: ['magic', 'projectile', 'random']
    },
    {
        id: 'multishot',
        name: 'Multishot',
        tileEffect: 'ranged',
        baseThreshold: 4,
        mode: 'damage-repeat-target',
        basePower: 22,
        scalingStat: 'ranged',
        tags: ['ranged', 'projectile', 'multi-hit']
    },
    {
        id: 'duck-and-roll',
        name: 'Duck and Roll',
        tileEffect: 'ranged',
        baseThreshold: 4,
        mode: 'damage',
        basePower: 20,
        scalingStat: 'ranged',
        tags: ['ranged', 'projectile']
    },
    {
        id: 'energy-beam',
        name: 'Energy Beam',
        tileEffect: 'magic',
        baseThreshold: 4,
        mode: 'damage',
        basePower: 28,
        scalingStat: 'magic',
        tags: ['magic', 'projectile']
    },
    {
        id: 'reckless-attack',
        name: 'Reckless Attack',
        tileEffect: 'physical',
        baseThreshold: 5,
        mode: 'damage',
        basePower: 30,
        scalingStat: 'physical',
        tags: ['physical', 'melee']
    },
    {
        id: 'cloak-of-flames',
        name: 'Cloak of Flames',
        tileEffect: 'physical',
        baseThreshold: 4,
        mode: 'cloak-aura',
        basePower: 20,
        scalingStat: 'physical',
        tags: ['physical', 'fire', 'aura']
    },
    {
        id: 'shock-and-awe',
        name: 'Shock and Awe',
        tileEffect: 'ranged',
        baseThreshold: 4,
        mode: 'damage-random-2-4',
        basePower: 27,
        scalingStat: 'ranged',
        tags: ['ranged', 'lightning', 'random']
    },
    {
        id: 'blizzard',
        name: 'Blizzard',
        tileEffect: 'magic',
        baseThreshold: 5,
        mode: 'damage-all-chill',
        basePower: 22,
        scalingStat: 'magic',
        tags: ['magic', 'cold', 'damage-all', 'chill']
    },
    {
        id: 'charge',
        name: 'Charge',
        tileEffect: 'ranged',
        baseThreshold: 5,
        mode: 'damage',
        basePower: 35,
        scalingStat: 'physical',
        tags: ['physical', 'damage']
    },
    {
        id: 'frostbite',
        name: 'Frostbite',
        tileEffect: 'magic',
        baseThreshold: 4,
        mode: 'transform-frost-tiles',
        basePower: 5,
        scalingStat: 'magic',
        tags: ['magic', 'cold', 'utility', 'board']
    },
    {
        id: 'burst-lightning',
        name: 'Burst Lightning',
        tileEffect: 'ranged',
        baseThreshold: 4,
        mode: 'transform-zap-tiles',
        basePower: 20,
        scalingStat: 'ranged',
        tags: ['ranged', 'lightning', 'utility', 'board']
    },
    {
        id: 'kindling',
        name: 'Kindling',
        tileEffect: 'physical',
        baseThreshold: 4,
        mode: 'transform-flame-tiles',
        basePower: 15,
        scalingStat: 'physical',
        tags: ['physical', 'fire', 'utility', 'board']
    }
];

const SUPPORT_SKILL_GEMS = [
    {
        id: 'focus',
        name: 'Focus',
        short: 'Fcs',
        thresholdDelta: -1,
        powerMultiplier: 0.14,
        scalingStatFilter: 'magic',
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0,
        imageKey: 'support_focus',
        tags: ['magic']
    },
    {
        id: 'brutality',
        name: 'Brutality',
        short: 'Brt',
        thresholdDelta: 1,
        powerMultiplier: 0.46,
        scalingStatFilter: 'physical',
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0,
        imageKey: 'support_brutality',
        tags: ['physical', 'melee']
    },
    {
        id: 'echo',
        name: 'Echo',
        short: 'Ech',
        thresholdDelta: 0,
        powerMultiplier: 0.08,
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0.25,
        imageKey: 'support_echo',
        tags: ['generic']
    },
    {
        id: 'vitality',
        name: 'Vitality',
        short: 'Vit',
        thresholdDelta: 0,
        powerMultiplier: 0.08,
        lootFlat: 0,
        healFlat: 8,
        extraHitChance: 0,
        tags: ['generic', 'heal']
    },
    {
        id: 'prosperity',
        name: 'Prosperity',
        short: 'Prs',
        thresholdDelta: 0,
        powerMultiplier: 0,
        goldFlat: 12,
        healFlat: 0,
        extraHitChance: 0,
        tags: ['generic', 'gold']
    },
    {
        id: 'added-lightning-damage',
        name: 'Added Lightning Damage',
        short: 'Ltn',
        thresholdDelta: 0,
        powerMultiplier: 0,
        flatDamage: 10,
        element: 'lightning',
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0,
        imageKey: 'support_addedlightning',
        tags: ['lightning', 'elemental']
    },
    {
        id: 'added-cold-damage',
        name: 'Added Cold Damage',
        short: 'Cld',
        thresholdDelta: 0,
        powerMultiplier: 0,
        flatDamage: 10,
        element: 'cold',
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0,
        imageKey: 'support_addedcold',
        tags: ['cold', 'elemental']
    },
    {
        id: 'added-fire-damage',
        name: 'Added Fire Damage',
        short: 'Fre',
        thresholdDelta: 0,
        powerMultiplier: 0,
        flatDamage: 10,
        element: 'fire',
        lootFlat: 0,
        healFlat: 0,
        extraHitChance: 0,
        imageKey: 'support_addedfire',
        tags: ['fire', 'elemental']
    }
];

const SKILL_ICON_MAP = {
    'cleave': 'skill_cleave',
    'minute-missles': 'skill_minutemissles',
    'multishot': 'skill_multishot',
    'duck-and-roll': 'skill_duckandroll',
    'energy-beam': 'skill_energybeam',
    'reckless-attack': 'skill_recklessattack',
    'cloak-of-flames': 'skill_cloakofflames',
    'shock-and-awe': 'skill_shockandawe',
    'blizzard': 'skill_blizzard',
    'charge': 'skill_heartofgold',
    'frostbite': 'skill_frostbite',
    'burst-lightning': 'skill_burstlightning',
    'kindling': 'skill_kindling'
};

// ---------------------------------------------------------------------------
// Talent Tree — PoE-style. Three large starting nodes (STR / DEX / INT) sit
// near the centre. Players pick exactly ONE to begin, then spend talent points
// travelling outward along connected paths.  prereqs lists the IDs that must
// already be allocated before a node can be chosen.  isStart marks the three
// class-origin nodes; isKeystone marks powerful end-of-path nodes.
// Node layout and connections match talent-tree-config.json exactly.
// ---------------------------------------------------------------------------
const TALENT_TREE_NODES = [
    { id:   1, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 STR"                              ,
      desc: "Starting node. Begin your journey along the Strength path."                    ,
      x:   190, y:   254, color: 0xFF4747, prereqs: [], isStart: true },
    { id:   2, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 DEX"                              ,
      desc: "Starting node. Begin your journey along the Dexterity path."                   ,
      x:   229, y:   293, color: 0x0FB836, prereqs: [], isStart: true },
    { id:  11, name: "Physical Damage"     , icon: "\ud83d\udca5", stat: "physicalDamage"      , value:   4, shortDesc: "+4% Physical Damage"                 ,
      desc: "+4% Physical Damage."                                                          ,
      x:   258, y:   186, color: 0xFF4747, prereqs: [13] },
    { id:  13, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   219, y:   225, color: 0xFF4747, prereqs: [1] },
    { id:  14, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:   151, y:   342, color: 0x1131D1, prereqs: [104] },
    { id:  15, name: "Magic Damage"        , icon: "\u2728", stat: "magicDamage"         , value:   4, shortDesc: "+4% Magic Damage"                    ,
      desc: "+4% Magic Damage."                                                             ,
      x:   112, y:   381, color: 0x1131D1, prereqs: [14] },
    { id:  18, name: "Ranged Damage"       , icon: "\ud83c\udfaf", stat: "rangedDamage"        , value:   4, shortDesc: "+4% Ranged Damage"                   ,
      desc: "+4% Ranged Damage."                                                            ,
      x:   336, y:   371, color: 0x0FB836, prereqs: [19] },
    { id:  19, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   297, y:   332, color: 0x0FB836, prereqs: [2] },
    { id:  26, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   219, y:   147, color: 0xFF4747, prereqs: [11] },
    { id:  27, name: "Armour"              , icon: "\ud83d\udee1\ufe0f", stat: "armor"               , value:   4, shortDesc: "+4% Armour"                          ,
      desc: "+4% Armour."                                                                   ,
      x:   219, y:    69, color: 0xFF4747, prereqs: [26] },
    { id:  31, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   180, y:    98, color: 0xFF4747, prereqs: [27] },
    { id:  32, name: "Physical Damage"     , icon: "\ud83d\udca5", stat: "physicalDamage"      , value:   4, shortDesc: "+4% Physical Damage"                 ,
      desc: "+4% Physical Damage."                                                          ,
      x:   141, y:   108, color: 0xFF4747, prereqs: [31] },
    { id:  33, name: "Red Tile Chance"     , icon: "\ud83d\udd34", stat: "redTileChance"       , value:   1, shortDesc: "+1% Red Tile Chance"                 ,
      desc: "+1% Red Tile Chance."                                                          ,
      x:   102, y:   108, color: 0xFF4747, prereqs: [32] },
    { id:  34, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   258, y:    98, color: 0xFF4747, prereqs: [27] },
    { id:  35, name: "Armour"              , icon: "\ud83d\udee1\ufe0f", stat: "armor"               , value:   4, shortDesc: "+4% Armour"                          ,
      desc: "+4% Armour."                                                                   ,
      x:   297, y:    98, color: 0xFF4747, prereqs: [34] },
    { id:  36, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   336, y:    98, color: 0xFF4747, prereqs: [35] },
    { id:  38, name: "Block Chance"        , icon: "\ud83d\udd30", stat: "blockChance"         , value:   2, shortDesc: "+2% Block Chance"                    ,
      desc: "+2% Block Chance."                                                             ,
      x:   375, y:    98, color: 0xFF4747, prereqs: [36] },
    { id:  39, name: "Health Regen"         , icon: "\ud83d\udc9a", stat: "healthRegen"         , value:   1, shortDesc: "+1 Health Regen"                    ,
      desc: "+1 HP regenerated at the end of each turn."                                    ,
      x:   414, y:    98, color: 0xFF4747, prereqs: [38] },
    { id:  40, name: "Block Chance"        , icon: "\ud83d\udd30", stat: "blockChance"         , value:   2, shortDesc: "+2% Block Chance"                    ,
      desc: "+2% Block Chance."                                                             ,
      x:   453, y:    98, color: 0xFF4747, prereqs: [39] },
    { id:  42, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   336, y:   137, color: 0xFF4747, prereqs: [36] },
    { id:  43, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   336, y:   215, color: 0xFF4747, prereqs: [44, 70] },
    { id:  44, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   336, y:   176, color: 0xFF4747, prereqs: [42] },
    { id:  46, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   394, y:   186, color: 0xFF4747, prereqs: [47] },
    { id:  47, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   355, y:   186, color: 0xFF4747, prereqs: [43] },
    { id:  50, name: "Red Tile Chance"     , icon: "\ud83d\udd34", stat: "redTileChance"       , value:   1, shortDesc: "+1% Red Tile Chance"                 ,
      desc: "+1% Red Tile Chance."                                                          ,
      x:   258, y:    59, color: 0xFF4747, prereqs: [27] },
    { id:  54, name: "Juggernaut"          , icon: "\ud83c\udfcb\ufe0f", stat: "juggernaut"          , value:   1, shortDesc: "Keystone: Juggernaut"                ,
      desc: "Gear HP bonuses doubled."                                                      ,
      x:   424, y:   215, color: 0xFF4747, prereqs: [46], isKeystone: true },
    { id:  57, name: "Red Tile Chance copy", icon: "\ud83d\udd34", stat: "redTileChance"       , value:   1, shortDesc: "+1% Red Tile Chance"                 ,
      desc: "+1% Red Tile Chance."                                                          ,
      x:   297, y:    20, color: 0xFF4747, prereqs: [50] },
    { id:  58, name: "Red Tile Chance copy", icon: "\ud83d\udd34", stat: "redTileChance"       , value:   1, shortDesc: "+1% Red Tile Chance"                 ,
      desc: "+1% Red Tile Chance."                                                          ,
      x:   336, y:   -19, color: 0xFF4747, prereqs: [57] },
    { id:  59, name: "See Red"             , icon: "\ud83d\udc41\ufe0f", stat: "seeRed"              , value:   1, shortDesc: "Keystone: See Red"                   ,
      desc: "2\u00d7 Red tile damage."                                                      ,
      x:   385, y:    20, color: 0xFF4747, prereqs: [58], isKeystone: true },
    { id:  60, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:    73, y:   420, color: 0x1131D1, prereqs: [15] },
    { id:  61, name: "Energy Shield"       , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:    34, y:   459, color: 0x1131D1, prereqs: [60] },
    { id:  62, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   375, y:   420, color: 0x0FB836, prereqs: [18] },
    { id:  64, name: "Evasion"             , icon: "\ud83d\udca8", stat: "evasion"             , value:   4, shortDesc: "+4% Evasion"                         ,
      desc: "+4% Evasion."                                                                  ,
      x:   394, y:   459, color: 0x0FB836, prereqs: [62] },
    { id:  66, name: "Evasion"             , icon: "\ud83d\udca8", stat: "evasion"             , value:   4, shortDesc: "+4% Evasion"                         ,
      desc: "+4% Evasion."                                                                  ,
      x:   433, y:   381, color: 0x0FB836, prereqs: [68] },
    { id:  67, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   414, y:   332, color: 0x0FB836, prereqs: [66] },
    { id:  68, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   414, y:   410, color: 0xFF4747, prereqs: [64] },
    { id:  69, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   433, y:   303, color: 0xFF4747, prereqs: [67] },
    { id:  70, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   394, y:   264, color: 0x0FB836, prereqs: [69] },
    { id:  74, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   394, y:   498, color: 0x0FB836, prereqs: [64] },
    { id:  77, name: "Ranged Damage"       , icon: "\ud83c\udfaf", stat: "rangedDamage"        , value:   4, shortDesc: "+4% Ranged Damage"                   ,
      desc: "+4% Ranged Damage."                                                            ,
      x:   394, y:   537, color: 0x0FB836, prereqs: [74] },
    { id:  78, name: "Green Tile Chance"   , icon: "\ud83d\udfe2", stat: "greenTileChance"     , value:   1, shortDesc: "+1% Green Tile Chance"               ,
      desc: "+1% Green Tile Chance."                                                        ,
      x:   394, y:   576, color: 0x0FB836, prereqs: [77] },
    { id:  85, name: "Green Tile Chance"   , icon: "\ud83d\udfe2", stat: "greenTileChance"     , value:   1, shortDesc: "+1% Green Tile Chance"               ,
      desc: "+1% Green Tile Chance."                                                        ,
      x:   511, y:   459, color: 0x0FB836, prereqs: [86] },
    { id:  86, name: "Green Tile Chance"   , icon: "\ud83d\udfe2", stat: "greenTileChance"     , value:   1, shortDesc: "+1% Green Tile Chance"               ,
      desc: "+1% Green Tile Chance."                                                        ,
      x:   472, y:   459, color: 0x0FB836, prereqs: [87] },
    { id:  87, name: "Green Tile Chance"   , icon: "\ud83d\udfe2", stat: "greenTileChance"     , value:   1, shortDesc: "+1% Green Tile Chance"               ,
      desc: "+1% Green Tile Chance."                                                        ,
      x:   433, y:   459, color: 0x0FB836, prereqs: [64] },
    { id:  89, name: "Turning Green"       , icon: "\ud83c\udf40", stat: "turningGreen"        , value:   1, shortDesc: "Keystone: Turning Green"             ,
      desc: "2\u00d7 Green tile damage."                                                    ,
      x:   560, y:   449, color: 0x0FB836, prereqs: [85], isKeystone: true },
    { id:  91, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:    82, y:   498, color: 0xFF4747, prereqs: [61] },
    { id:  92, name: "Energy Shield"       , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   121, y:   537, color: 0x1131D1, prereqs: [91] },
    { id:  94, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:   160, y:   576, color: 0x1131D1, prereqs: [92] },
    { id:  96, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:     4, y:   498, color: 0x1131D1, prereqs: [61] },
    { id:  97, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:   -74, y:   576, color: 0x1131D1, prereqs: [98] },
    { id:  98, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:   -35, y:   537, color: 0x1131D1, prereqs: [96] },
    { id: 100, name: "Feeling Blue"        , icon: "\ud83d\udca7", stat: "feelingBlue"         , value:   1, shortDesc: "Keystone: Feeling Blue"              ,
      desc: "2\u00d7 Blue tile damage."                                                     ,
      x:   -44, y:   605, color: 0x1131D1, prereqs: [97], isKeystone: true },
    { id: 101, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:   -74, y:   342, color: 0x1131D1, prereqs: [103] },
    { id: 102, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:     4, y:   420, color: 0x1131D1, prereqs: [61] },
    { id: 103, name: "Magic Damage"        , icon: "\u2728", stat: "magicDamage"         , value:   4, shortDesc: "+4% Magic Damage"                    ,
      desc: "+4% Magic Damage."                                                             ,
      x:   -35, y:   381, color: 0x1131D1, prereqs: [102] },
    { id: 104, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 INT"                              ,
      desc: "Starting node. Begin your journey along the Intelligence path."                ,
      x:   170, y:   293, color: 0x1131D1, prereqs: [], isStart: true },
    { id: 106, name: "Evasion"             , icon: "\ud83d\udca8", stat: "evasion"             , value:   4, shortDesc: "+4% Evasion"                         ,
      desc: "+4% Evasion."                                                                  ,
      x:   472, y:   303, color: 0x0FB836, prereqs: [69] },
    { id: 108, name: "Evasion"             , icon: "\ud83d\udca8", stat: "evasion"             , value:   4, shortDesc: "+4% Evasion"                         ,
      desc: "+4% Evasion."                                                                  ,
      x:   511, y:   342, color: 0x0FB836, prereqs: [106] },
    { id: 110, name: "Parry"               , icon: "\u26a1", stat: "parry"               , value:   1, shortDesc: "Keystone: Parry"                     ,
      desc: "Deal ranged damage when evading."                                              ,
      x:   472, y:   371, color: 0x0FB836, prereqs: [108], isKeystone: true },
    { id: 112, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   121, y:   615, color: 0xFF4747, prereqs: [94] },
    { id: 113, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Health"                          ,
      desc: "+2% Health."                                                                   ,
      x:   121, y:   654, color: 0xFF4747, prereqs: [112] },
    { id: 115, name: "Energy Form"         , icon: "\u2b50", stat: "energyForm"          , value:   1, shortDesc: "Health changes -> Energy Shield"       ,
      desc: "Heart heals restore Energy Shield instead of Health. Damage still depletes shield first, then health."                                   ,
      x:   160, y:   683, color: 0x1131D1, prereqs: [113], isKeystone: true },
    { id: 116, name: "Energy Shield "      , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   287, y:   693, color: 0x1131D1, prereqs: [117] },
    { id: 117, name: "Energy Shield "      , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   248, y:   654, color: 0x1131D1, prereqs: [119] },
    { id: 119, name: "Intelligence "       , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:   209, y:   615, color: 0x1131D1, prereqs: [94] },
    { id: 120, name: "Ranged Damage "      , icon: "\ud83c\udfaf", stat: "rangedDamage"        , value:   4, shortDesc: "+4% Ranged Damage"                   ,
      desc: "+4% Ranged Damage."                                                            ,
      x:   336, y:   615, color: 0x0FB836, prereqs: [78] },
    { id: 121, name: "Dexterity"           , icon: "\ud83c\udff9", stat: "dexterity"           , value:   5, shortDesc: "+5 Dexterity"                        ,
      desc: "+5 Dexterity."                                                                 ,
      x:   375, y:   693, color: 0x0FB836, prereqs: [120, 116] },
    { id: 122, name: "Intelligence"        , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:  -103, y:   303, color: 0x1131D1, prereqs: [101, 152] },
    { id: 123, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:    63, y:   108, color: 0xFF4747, prereqs: [33] },
    { id: 125, name: "Energy Shield"       , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   -64, y:   264, color: 0x1131D1, prereqs: [122] },
    { id: 126, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:   5, shortDesc: "+5 Strength"                         ,
      desc: "+5 Strength."                                                                  ,
      x:   -15, y:   108, color: 0xFF4747, prereqs: [123] },
    { id: 128, name: "Damage"              , icon: "\u2694\ufe0f", stat: "allDamage"           , value:   2, shortDesc: "+2% All Damage"                      ,
      desc: "+2% All Damage."                                                               ,
      x:   -25, y:   225, color: 0xFF4747, prereqs: [126, 125] },
    { id: 129, name: "Damage"              , icon: "\u2694\ufe0f", stat: "allDamage"           , value:   2, shortDesc: "+2% All Damage"                      ,
      desc: "+2% All Damage."                                                               ,
      x:   -93, y:   225, color: 0xFF4747, prereqs: [128] },
    { id: 130, name: "Damage"              , icon: "\u2694\ufe0f", stat: "allDamage"           , value:   2, shortDesc: "+2% All Damage"                      ,
      desc: "+2% All Damage."                                                               ,
      x:  -171, y:   225, color: 0xFF4747, prereqs: [129] },
    { id: 134, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:   102, y:    30, color: 0xFF4747, prereqs: [123] },
    { id: 136, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:   141, y:    -9, color: 0xFF4747, prereqs: [134] },
    { id: 137, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:   141, y:   -87, color: 0xFF4747, prereqs: [136] },
    { id: 138, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:   297, y:   771, color: 0x1131D1, prereqs: [116] },
    { id: 139, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:   375, y:   810, color: 0x1131D1, prereqs: [140] },
    { id: 140, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:   297, y:   849, color: 0x1131D1, prereqs: [138] },
    { id: 142, name: "Lightning Damage"    , icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   492, y:   264, color: 0x0FB836, prereqs: [70] },
    { id: 143, name: "Lightning Damage copy", icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   570, y:   106, color: 0x0FB836, prereqs: [144] },
    { id: 144, name: "Lightning Damage"    , icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   531, y:   225, color: 0x0FB836, prereqs: [142] },
    { id: 145, name: "Intelligence "       , icon: "\ud83d\udcd6", stat: "intelligence"        , value:   5, shortDesc: "+5 Intelligence"                     ,
      desc: "+5 Intelligence."                                                              ,
      x:   258, y:   732, color: 0x1131D1, prereqs: [116] },
    { id: 146, name: "Energy Shield"       , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   219, y:   771, color: 0x1131D1, prereqs: [145] },
    { id: 147, name: "Energy Shield"       , icon: "\ud83d\udca0", stat: "energyShield"        , value:   4, shortDesc: "+4% Energy Shield"                   ,
      desc: "+4% Energy Shield."                                                            ,
      x:   180, y:   810, color: 0x1131D1, prereqs: [146] },
    { id: 148, name: "Blue Blooded"        , icon: "\ud83d\udca0", stat: "blueBlooded"         , value:   1, shortDesc: "Keystone: Blue Blooded"              ,
      desc: "Energy Shield restored per heart consumed."                                    ,
      x:    92, y:   800, color: 0x1131D1, prereqs: [147], isKeystone: true },
    { id: 149, name: "Polar Vortex"        , icon: "\u2b50", stat: "polarVortex"         , value:   1, shortDesc: "+12% Cold Damage"                    ,
      desc: "+12% Cold Damage."                                                               ,
      x:   443, y:   800, color: 0x1131D1, prereqs: [139], isKeystone: true },
    { id: 150, name: "Heatwave"            , icon: "\u2b50", stat: "heatwave"            , value:   1, shortDesc: "+12% Fire Damage"                    ,
      desc: "+12% Fire Damage."                                                               ,
      x:    53, y:   -97, color: 0xFF4747, prereqs: [137], isKeystone: true },
    { id: 151, name: "Stormy Night"        , icon: "\u2b50", stat: "stormyNight"         , value:   1, shortDesc: "+12% Lightning Damage"               ,
      desc: "+12% Lightning Damage."                                                          ,
      x:   638, y:    96, color: 0x0FB836, prereqs: [143], isKeystone: true },
    { id: 152, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:  -171, y:   303, color: 0x1131D1, prereqs: [] },
    { id: 153, name: "Blue Tile Chance"    , icon: "\ud83d\udd35", stat: "blueTileChance"      , value:   1, shortDesc: "+1% Blue Tile Chance"                ,
      desc: "+1% Blue Tile Chance."                                                         ,
      x:  -249, y:   303, color: 0x1131D1, prereqs: [152] },
    { id: 154, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:  -249, y:   381, color: 0x1131D1, prereqs: [153] },
    { id: 157, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:  -249, y:   459, color: 0x1131D1, prereqs: [154] },
    { id: 159, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"          , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:  -171, y:   498, color: 0x1131D1, prereqs: [157] },
    { id: 160, name: "Frost Mage"          , icon: "\u2b50", stat: "frostMage"           , value:   1, shortDesc: "50% magic dmg -> cold"                ,
      desc: "50% of Magic damage converts to Cold, gaining +Cold Damage bonuses."             ,
      x:  -142, y:   410, color: 0x1131D1, prereqs: [159], isKeystone: true },
    { id: 161, name: "Physical Damage"     , icon: "\ud83d\udca5", stat: "physicalDamage"      , value:   4, shortDesc: "+4% Physical Damage"                 ,
      desc: "+4% Physical Damage."                                                          ,
      x:   -93, y:   108, color: 0xFF4747, prereqs: [126] },
    { id: 162, name: "Red Tile Chance"     , icon: "\ud83d\udd34", stat: "redTileChance"       , value:   1, shortDesc: "+1% Red Tile Chance"                 ,
      desc: "+1% Red Tile Chance."                                                          ,
      x:  -171, y:   108, color: 0xFF4747, prereqs: [161] },
    { id: 163, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:  -171, y:    30, color: 0xFF4747, prereqs: [162] },
    { id: 164, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:  -171, y:   -48, color: 0xFF4747, prereqs: [163] },
    { id: 165, name: "Fire Damage"         , icon: "\ud83d\udd25", stat: "fireDamage"          , value:   4, shortDesc: "+4% Fire Damage"                     ,
      desc: "+4% Fire Damage."                                                              ,
      x:  -132, y:   -87, color: 0xFF4747, prereqs: [164] },
    { id: 166, name: "Burning Man"         , icon: "\u2b50", stat: "burningMan"          , value:   1, shortDesc: "50% phys dmg -> fire"                 ,
      desc: "50% of Physical damage converts to Fire, gaining +Fire Damage bonuses."          ,
      x:   -64, y:   -19, color: 0xFF4747, prereqs: [165], isKeystone: true },
    { id: 167, name: "Green Tile Chance"   , icon: "\ud83d\udfe2", stat: "greenTileChance"     , value:   1, shortDesc: "+1% Green Tile Chance"               ,
      desc: "+1% Green Tile Chance."                                                        ,
      x:   453, y:   693, color: 0x0FB836, prereqs: [121] },
    { id: 168, name: "Crit Chance"         , icon: "\ud83c\udfb2", stat: "critChance"          , value:   1, shortDesc: "+1% Crit Chance"                     ,
      desc: "+1% Crit Chance."                                                              ,
      x:   531, y:   693, color: 0x0FB836, prereqs: [167] },
    { id: 170, name: "Lightning Damage"    , icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   531, y:   615, color: 0x0FB836, prereqs: [168] },
    { id: 171, name: "Lightning Damage"    , icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   648, y:   537, color: 0x0FB836, prereqs: [173] },
    { id: 173, name: "Lightning Damage"    , icon: "\u26a1", stat: "lightningDamage"     , value:   4, shortDesc: "+4% Lightning Damage"                ,
      desc: "+4% Lightning Damage."                                                         ,
      x:   570, y:   576, color: 0x0FB836, prereqs: [170] },
    { id: 174, name: "Conduit"             , icon: "\u2b50", stat: "conduit"             , value:   1, shortDesc: "50% ranged dmg -> lightning"          ,
      desc: "50% of Ranged damage converts to Lightning, gaining +Lightning Damage bonuses."  ,
      x:   638, y:   605, color: 0x0FB836, prereqs: [171], isKeystone: true },

    // --- New nodes from config update ---
    { id: 156, name: "Cold Damage"         , icon: "\u2744\ufe0f", stat: "coldDamage"           , value:   4, shortDesc: "+4% Cold Damage"                     ,
      desc: "+4% Cold Damage."                                                              ,
      x:   336, y:   809, color: 0x1131D1, prereqs: [140] },
    { id: 175, name: "Health Regen"        , icon: "\ud83d\udc9a", stat: "healthRegen"          , value:   1, shortDesc: "+1 Health Regen"                     ,
      desc: "+1 HP regenerated at the end of each turn."                                   ,
      x:   501, y:   109, color: 0xFF4747, prereqs: [40] },
    { id: 176, name: "Strength"            , icon: "\u2694\ufe0f", stat: "strength"            , value:  10, shortDesc: "+10 Strength"                        ,
      desc: "+10 Strength."                                                                 ,
      x:   501, y:   148, color: 0xFF4747, prereqs: [175] },
    { id: 177, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Max Health"                      ,
      desc: "+2% Max Health."                                                               ,
      x:   501, y:   187, color: 0xFF4747, prereqs: [176] },
    { id: 178, name: "Health Regen"        , icon: "\ud83d\udc9a", stat: "healthRegen"          , value:   1, shortDesc: "+1 Health Regen"                     ,
      desc: "+1 HP regenerated at the end of each turn."                                   ,
      x:   540, y:   187, color: 0xFF4747, prereqs: [177] },
    { id: 179, name: "Health"              , icon: "\u2764\ufe0f", stat: "health"              , value:   2, shortDesc: "+2% Max Health"                      ,
      desc: "+2% Max Health."                                                               ,
      x:   579, y:   187, color: 0xFF4747, prereqs: [178] },
    { id: 180, name: "Mortal Constitution" , icon: "\ud83d\udcaa", stat: "mortalConstitution"   , value:   1, shortDesc: "Restore 20% HP after battle"          ,
      desc: "Restore 20% of max HP after each battle. Cannot use Energy Shield."           ,
      x:   647, y:   177, color: 0xFF4747, prereqs: [179], isKeystone: true },
    { id: 181, name: "Block Chance"        , icon: "\ud83d\udd30", stat: "blockChance"         , value:   2, shortDesc: "+2% Block Chance"                    ,
      desc: "+2% Block Chance."                                                             ,
      x:   501, y:    70, color: 0xFF4747, prereqs: [175] },
    { id: 183, name: "Shield Damage"       , icon: "\ud83d\udee1\ufe0f", stat: "shieldDamage"  , value:   4, shortDesc: "+4% Damage (shield equipped)"         ,
      desc: "+4% damage to all attacks while a Shield is equipped in your offhand."        ,
      x:   501, y:    31, color: 0xFF4747, prereqs: [181] },
    { id: 184, name: "Block Chance"        , icon: "\ud83d\udd30", stat: "blockChance"         , value:   2, shortDesc: "+2% Block Chance"                    ,
      desc: "+2% Block Chance."                                                             ,
      x:   540, y:    31, color: 0xFF4747, prereqs: [183] },
    { id: 185, name: "Shield Damage"       , icon: "\ud83d\udee1\ufe0f", stat: "shieldDamage"  , value:   4, shortDesc: "+4% Damage (shield equipped)"         ,
      desc: "+4% damage to all attacks while a Shield is equipped in your offhand."        ,
      x:   579, y:    31, color: 0xFF4747, prereqs: [184] },
    { id: 186, name: "Lord of Thorns"      , icon: "\ud83c\udf35", stat: "lordOfThorns"        , value:   1, shortDesc: "Deal physical dmg on block"           ,
      desc: "When you Block an attack, deal physical damage equal to the enemy's attack back to them."  ,
      x:   647, y:    21, color: 0xFF4747, prereqs: [185], isKeystone: true },
];

const TALENT_TREE_CONNECTIONS = [
    { from:   1, to:  13 },
    { from:  13, to:  11 },
    { from:  14, to:  15 },
    { from:   2, to:  19 },
    { from:  19, to:  18 },
    { from:  26, to:  27 },
    { from:  27, to:  31 },
    { from:  31, to:  32 },
    { from:  32, to:  33 },
    { from:  36, to:  42 },
    { from:  42, to:  44 },
    { from:  44, to:  43 },
    { from:  43, to:  47 },
    { from:  47, to:  46 },
    { from:  27, to:  34 },
    { from:  34, to:  35 },
    { from:  35, to:  36 },
    { from:  36, to:  38 },
    { from:  38, to:  39 },
    { from:  39, to:  40 },
    { from:  46, to:  54 },
    { from:  27, to:  50 },
    { from:  50, to:  57 },
    { from:  57, to:  58 },
    { from:  58, to:  59 },
    { from:  15, to:  60 },
    { from:  60, to:  61 },
    { from:  18, to:  62 },
    { from:  62, to:  64 },
    { from:  64, to:  68 },
    { from:  68, to:  66 },
    { from:  66, to:  67 },
    { from:  67, to:  69 },
    { from:  69, to:  70 },
    { from:  70, to:  43 },
    { from:  64, to:  87 },
    { from:  87, to:  86 },
    { from:  86, to:  85 },
    { from:  85, to:  89 },
    { from:  64, to:  74 },
    { from:  74, to:  77 },
    { from:  77, to:  78 },
    { from:  61, to:  91 },
    { from:  91, to:  92 },
    { from:  92, to:  94 },
    { from:  61, to:  96 },
    { from:  96, to:  98 },
    { from:  98, to:  97 },
    { from:  97, to: 100 },
    { from:  61, to: 102 },
    { from: 102, to: 103 },
    { from: 103, to: 101 },
    { from: 104, to:  14 },
    { from:  69, to: 106 },
    { from: 106, to: 108 },
    { from: 108, to: 110 },
    { from:  94, to: 112 },
    { from: 112, to: 113 },
    { from: 113, to: 115 },
    { from:  94, to: 119 },
    { from: 119, to: 117 },
    { from: 117, to: 116 },
    { from:  78, to: 120 },
    { from: 120, to: 121 },
    { from: 116, to: 121 },
    { from: 123, to: 126 },
    { from: 126, to: 128 },
    { from: 128, to: 129 },
    { from: 129, to: 130 },
    { from: 101, to: 122 },
    { from: 122, to: 125 },
    { from: 125, to: 128 },
    { from:  33, to: 123 },
    { from: 123, to: 134 },
    { from: 134, to: 136 },
    { from: 136, to: 137 },
    { from: 116, to: 138 },
    { from: 138, to: 140 },
    { from: 140, to: 139 },
    { from:  11, to:  26 },
    { from:  70, to: 142 },
    { from: 142, to: 144 },
    { from: 144, to: 143 },
    { from: 116, to: 145 },
    { from: 145, to: 146 },
    { from: 146, to: 147 },
    { from: 147, to: 148 },
    { from: 139, to: 149 },
    { from: 137, to: 150 },
    { from: 143, to: 151 },
    { from: 152, to: 122 },
    { from: 152, to: 153 },
    { from: 153, to: 154 },
    { from: 154, to: 157 },
    { from: 157, to: 159 },
    { from: 159, to: 160 },
    { from: 126, to: 161 },
    { from: 161, to: 162 },
    { from: 162, to: 163 },
    { from: 163, to: 164 },
    { from: 164, to: 165 },
    { from: 165, to: 166 },
    { from: 167, to: 168 },
    { from: 121, to: 167 },
    { from: 168, to: 170 },
    { from: 170, to: 173 },
    { from: 173, to: 171 },
    { from: 171, to: 174 },
    // --- New connections from config update ---
    { from:  40, to: 175 },
    { from: 175, to: 176 },
    { from: 176, to: 177 },
    { from: 177, to: 178 },
    { from: 178, to: 179 },
    { from: 179, to: 180 },
    { from: 175, to: 181 },
    { from: 181, to: 183 },
    { from: 183, to: 184 },
    { from: 184, to: 185 },
    { from: 185, to: 186 },
    { from: 140, to: 156 },
    { from: 156, to: 149 },
];

// Build a fast lookup map for talent nodes by ID
const TALENT_NODE_MAP = new Map();
TALENT_TREE_NODES.forEach(n => TALENT_NODE_MAP.set(n.id, n));

class Match3Scene extends Phaser.Scene {
    // Track when the store was last refreshed
    // (initialize in constructor)
    constructor() {
        super('Match3Scene');
        this.grid = [];
        this.tileSprites = [];
        this.dragStart = null;
        this.isSwapping = false;
        this.score = 0;
        this.lastStoreRefreshBattle = 1;
        this.player = {
            health: 20,
            currentShield: 0,
            physical: 0,
            magic: 0,
            ranged: 0,
            gold: 0,
            strength: 10,
            intelligence: 10,
            dexterity: 10,
            equipment: {
                helmet: 'None',
                chest: 'None',
                gloves: 'None',
                boots: 'None',
                belt: 'None',
                mainhand: 'None',
                offhand: 'None',
                ring1: 'None',
                necklace: 'None'
            },
            level: 1,
            talentPoints: 0
        };
        this.enemies = [];
        this.targetEnemyIndex = 0;
        this.encounterSize = 1;
        this.playerStatsText = null;
        this.playerShieldBarBg = null;
        this.playerShieldBar = null;
        this.playerShieldLabel = null;
        this.playerShieldText = null;
        this.playerHealthBarBg = null;
        this.playerHealthBar = null;
        this.enemyEncounterLabel = null;
        this.combatLog = [];

        this.boardContainer = null;
        this.hudContainer = null;
        this.equipmentScreenGroup = null;
        this.talentScreenGroup = null;
        this.storeScreenGroup = null;
        this.storeItems = [];
        this.storeItemCards = [];
        this.storeGoldLabel = null;
        this.talentNodeUI = {};
        this.talentPointsLabel = null;
        this.talentConnectionGraphics = null;
        this.talentNodePopup = null;
        this._talentGlowTweens = [];
        this._talentButtonGlowTween = null;
        this.currentScreen = 'game';

        this.maxInventorySlots = 12;
        this.itemIdCounter = 0;
        this.inventory = this.generateStarterInventory();
        this.equippedItems = {};
        this.allocatedTalents = new Set();
        this.inventoryTiles = [];
        this.selectedInventoryItem = null;
        this.selectedItemSource = null;
        this.selectedEquippedSlot = null;
        this.inventoryModal = null;
        this.inventoryModalIcon = null;
        this.inventoryModalName = null;
        this.inventoryModalType = null;
        this.inventoryModalDesc = null;
        this.inventoryModalStats = null;
        this.inventoryModalEquipBtn = null;
        this.inventoryModalRemoveBtn = null;
        this.inventoryModalSellBtn = null;
        this.rewardScreenGroup = null;
        this.rewardLootInfoText = null;
        this.rewardCards = [];
        this.rewardChoices = [];
        this.awaitingRewardChoice = false;
        this.battleNumber = 1;

        this.skillBarContainer = null;
        this.skillSlotUI = [];
        this.skillInfoPopup = null;
        this.skillLongPressTimer = null;
        this.playerSkills = this.createInitialSkillLoadout();
        this.skillCharge = this.createInitialSkillCharge();
        this.cloakOfFlamesActive = false;
        this.cloakOfFlamesDamage = 0;
        this.headhunterKills = 0;
        this.stolenEnemyAffixes = [];

        this.goldDisplayText = null;
        this.goldDisplayIcon = null;

        // Ensure the store is fully stocked at game start
        this.generateStoreInventory();

        this.skillsScreenGroup = null;
        this.skillsActiveSlotUI = [];
        this.skillsInventoryGems = this.createSkillGemInventoryPool();
        this.skillsInventoryTiles = [];
        this.selectedSkillGem = null;
        this.selectedGemInventoryIndex = -1;
        this.skillsGemModal = null;
        this.skillsGemModalTitle = null;
        this.skillsGemModalIcon = null;
        this.skillsGemModalIconImage = null;
        this.skillsGemModalName = null;
        this.skillsGemModalType = null;
        this.skillsGemModalDesc = null;
        this.skillsGemModalEquipBtn = null;
        this.skillsGemModalDiscardBtn = null;
        this.draggingSkillGemTile = null;
        this.skillGemWasDragged = false;
        this.armedEquipGem = null;
        this.justDroppedSkillGem = false;

        // Enemy info popup (long-press on enemy)
        this.enemyInfoPopup = null;
        this.enemyInfoPopupSpriteRef = null;
    }

    // -------------------------------------------------------------------------
    // Reset all gameplay state — called by Phaser on scene.restart()
    // -------------------------------------------------------------------------
    init() {
        this.score = 0;
        this.lastStoreRefreshBattle = 1;
        this.player = {
            health: 20,
            currentShield: 0,
            physical: 0,
            magic: 0,
            ranged: 0,
            gold: 0,
            strength: 10,
            intelligence: 10,
            dexterity: 10,
            equipment: {
                helmet: 'None',
                chest: 'None',
                gloves: 'None',
                boots: 'None',
                belt: 'None',
                mainhand: 'None',
                offhand: 'None',
                ring1: 'None',
                necklace: 'None'
            },
            level: 1,
            talentPoints: 0
        };
        this.enemies = [];
        this.targetEnemyIndex = 0;
        this.encounterSize = 1;
        this.combatLog = [];
        this.battleNumber = 1;
        this.itemIdCounter = 0;
        this.inventory = this.generateStarterInventory();
        this.equippedItems = {};
        this.allocatedTalents = new Set();
        this.playerSkills = this.createInitialSkillLoadout();
        this.skillCharge = this.createInitialSkillCharge();
        this.cloakOfFlamesActive = false;
        this.cloakOfFlamesDamage = 0;
        this.skillsInventoryGems = this.createSkillGemInventoryPool();
        this.generateStoreInventory();
        // Reset state flags that persist across scene.restart()
        this.isSwapping = false;
        this.dragStart = null;
        this.awaitingRewardChoice = false;
    }

    // -------------------------------------------------------------------------
    // Enemy rarity helpers
    // -------------------------------------------------------------------------

    rollEnemyRarity(battleNumber) {
        // Tier-gated rarity based on boss progression.
        // Bosses: 7, 14, 21, 28 … (battleNumber % 7 === 0)
        // Tier 1 (before/at first boss, battles 1-7): Normal only
        if (battleNumber <= 7) return ENEMY_RARITIES[0];

        // Tier 2 (after first boss, before second, battles 8-13): Normal or Magic
        if (battleNumber < 14) {
            return Math.random() < 0.65 ? ENEMY_RARITIES[0] : ENEMY_RARITIES[1];
        }

        // Tier 3 (after second boss, before third, battles 15-20): up to Rare
        if (battleNumber < 21) {
            const ramp = Math.min(battleNumber - 14, 6) / 6;
            const wN = Math.max(25, 55 - ramp * 25);
            const wM = 30;
            const wR = ramp * 45;
            const total = wN + wM + wR;
            let r = Math.random() * total;
            r -= wN; if (r <= 0) return ENEMY_RARITIES[0];
            r -= wM; if (r <= 0) return ENEMY_RARITIES[1];
            return ENEMY_RARITIES[2];
        }

        // Tier 4 (after third boss, battles 22+): any rarity with ramp
        const ramp = Math.min(battleNumber - 21, 10) / 10;
        const w = [
            Math.max(20, 55 - ramp * 30),   // Normal
            28 + ramp * 10,                  // Magic
            13 + ramp * 14,                  // Rare
            4  + ramp * 6                    // Legendary
        ];
        const total = w.reduce((s, v) => s + v, 0);
        let r = Math.random() * total;
        for (let i = 0; i < ENEMY_RARITIES.length; i++) {
            r -= w[i];
            if (r <= 0) return ENEMY_RARITIES[i];
        }
        return ENEMY_RARITIES[0];
    }

    rollEnemyAffixes(rarity) {
        if (rarity.affixes === 0) return [];
        const pool = [...ENEMY_AFFIXES];
        const result = [];
        for (let i = 0; i < rarity.affixes && pool.length > 0; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            result.push(pool.splice(idx, 1)[0]);
        }
        return result;
    }

    applyEnemyAffixStats(hp, atk, affixes) {
        for (const af of affixes) {
            hp  = Math.round(hp  * (1 + af.hpMult));
            atk = Math.round(atk * (1 + af.atkMult));
        }
        return { hp: Math.max(1, hp), atk: Math.max(1, atk) };
    }

    buildRarityEnemyName(baseName, rarity, affixes) {
        if (rarity.name === 'Normal') return baseName;
        const prefix = affixes[0] ? affixes[0].name : '';
        const suffix = affixes[1] ? `of ${affixes[1].name}` : '';
        return `${prefix} ${baseName} ${suffix}`.trim().replace(/\s+/g, ' ');
    }

    // Damage an enemy and apply thorns reflection  
    damageEnemy(enemy, amount) {
        if (!enemy || !enemy.alive) return 0;
        // Tough Hide innate: Orc Pig takes 25% reduced damage
        const toughHideCfg = MONSTER_BODIES[enemy.bodyIndex];
        const hasToughHide = toughHideCfg && toughHideCfg.innate &&
            toughHideCfg.innate.some(t => t.id === 'toughHide');
        const reducedAmount = hasToughHide ? Math.ceil(amount * 0.75) : amount;
        const actual = Math.max(0, reducedAmount);
        enemy.health = Math.max(0, enemy.health - actual);
        // Leech: heal player for a percentage of damage dealt
        if (actual > 0) {
            const gear = this.getEquippedStatTotals();
            if (gear.leech > 0) {
                const leechHeal = Math.max(1, Math.round(actual * gear.leech / 100));
                this.player.health = Math.min(this.getMaxHealth(), this.player.health + leechHeal);
                const px = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
                this.showCombatMessage(`🩸+${leechHeal}`, '#ff88cc', px, FIGHT_PANEL_Y + 30);
            }
        }
        if (actual > 0 && enemy.affixes && enemy.affixes.some(a => a.id === 'thorns')) {
            const reflected = Math.max(1, Math.round(actual * 0.08));
            this.player.health = Math.max(0, this.player.health - reflected);
            const px = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
            this.showCombatMessage(`-${reflected}`, '#ff4444', px, FIGHT_PANEL_Y + 30);
            this.addCombatLog(`🌵 Thorns: ${reflected} damage reflected to you`, '#ff6666');
            this.updatePlayerUI();
            // Check for death caused by thorns reflection
            if (this.player.health <= 0) {
                if (this.playerSprite) this.playerSprite.play('warrior_death');
                this.isSwapping = true;
                this.time.delayedCall(900, () => this.showDeathScreen(enemy.name + ' (Thorns)'));
            }
        }
        return actual;
    }

    // --- Multi-enemy encounter helpers ---

    getEncounterSize(battleNumber) {
        if (battleNumber <= 2) return 1;
        if (battleNumber <= 4) return Phaser.Math.Between(1, 2);
        if (battleNumber <= 7) return Phaser.Math.Between(1, 3);
        return Phaser.Math.Between(2, 4);
    }

    getEnemyGroupStats(battleNumber, enemyCount) {
        let baseHP, baseAtk;
        if (battleNumber <= 8) {
            baseHP = 22 + (battleNumber - 1) * 10;
            baseAtk = 3 + Math.floor((battleNumber - 1) * 1.2);
        } else {
            // After level 8, scale up more aggressively
            baseHP = 22 + 7 * 10 + (battleNumber - 8) * 22;
            baseAtk = 1 + Math.floor(7 * 0.8) + Math.floor((battleNumber - 8) * 2.2);
        }
        if (enemyCount === 1) return { hp: baseHP, atk: baseAtk };
        const hpPerEnemy = Math.floor(baseHP * 0.85 / enemyCount);
        const atkPerEnemy = Math.max(1, Math.floor(baseAtk * 0.9 / enemyCount));
        return { hp: hpPerEnemy, atk: atkPerEnemy };
    }

    getEnemyPositions(count) {
        const rightCX = 293;
        const FP = FIGHT_PANEL_Y;
        if (count === 1) return [{ x: rightCX, y: FP + 55, scale: 1.10, barW: 166, barY: FP + 148 }];
        if (count === 2) return [
            { x: rightCX - 34, y: FP + 45, scale: 0.90, barW: 82, barY: FP + 130 },
            { x: rightCX + 34, y: FP + 45, scale: 0.90, barW: 82, barY: FP + 143 }
        ];
        if (count === 3) return [
            { x: rightCX - 38, y: FP + 38, scale: 0.80, barW: 72, barY: FP + 110 },
            { x: rightCX + 38, y: FP + 38, scale: 0.80, barW: 72, barY: FP + 122 },
            { x: rightCX,      y: FP + 98, scale: 0.80, barW: 72, barY: FP + 162 }
        ];
        return [
            { x: rightCX - 36, y: FP + 35, scale: 0.72, barW: 66, barY: FP + 96 },
            { x: rightCX + 36, y: FP + 35, scale: 0.72, barW: 66, barY: FP + 108 },
            { x: rightCX - 36, y: FP + 100, scale: 0.72, barW: 66, barY: FP + 158 },
            { x: rightCX + 36, y: FP + 100, scale: 0.72, barW: 66, barY: FP + 170 }
        ];
    }

    getAliveEnemies() {
        return this.enemies.filter(e => e.alive);
    }

    getTargetEnemy() {
        // Return the player-selected target if alive, otherwise fall back to first alive
        if (this.targetEnemyIndex >= 0 && this.targetEnemyIndex < this.enemies.length
            && this.enemies[this.targetEnemyIndex].alive) {
            return this.enemies[this.targetEnemyIndex];
        }
        const fallback = this.enemies.find(e => e.alive);
        if (fallback) this.targetEnemyIndex = this.enemies.indexOf(fallback);
        return fallback || null;
    }

    allEnemiesDead() {
        return this.enemies.length > 0 && this.enemies.every(e => !e.alive);
    }

    stopAllParticleEffects() {
        if (this.skillChargeFxContainer) {
            // Kill tweens only for particle children, not all scene tweens
            this.skillChargeFxContainer.each(child => {
                this.tweens.killTweensOf(child);
                child.destroy();
            });
            this.skillChargeFxContainer.removeAll();
        }
    }

    destroyAllEnemyUI() {
        if (this.enemyInfoPopup) this.enemyInfoPopup.setVisible(false);
        if (this.enemyInfoPopupSpriteRef) { this.enemyInfoPopupSpriteRef.destroy(); this.enemyInfoPopupSpriteRef = null; }
        this.enemies.forEach(enemy => {
            if (enemy.enemySprite) enemy.enemySprite.destroy();
            if (enemy.healthBar) enemy.healthBar.destroy();
            if (enemy.healthBarBg) enemy.healthBarBg.destroy();
            if (enemy.healthText) enemy.healthText.destroy();
            if (enemy.nameText) enemy.nameText.destroy();
            if (enemy.targetMarker) enemy.targetMarker.destroy();
        });
        this.enemies = [];
    }

    buildEnemyGroup(battleNumber, hudContainer) {
        this.destroyAllEnemyUI();
        this.targetEnemyIndex = 0;

        // Boss encounters (battle 7, then every 7th battle) are always solo
        const isBossBattle = (battleNumber === 7) || (battleNumber > 7 && battleNumber % 7 === 0);
        const count = isBossBattle ? 1 : this.encounterSize;

        const stats = this.getEnemyGroupStats(battleNumber, count);
        const positions = this.getEnemyPositions(count);

        // Encounter label kept empty — names appear on individual enemy name labels
        if (this.enemyEncounterLabel) this.enemyEncounterLabel.setText('');

        for (let i = 0; i < count; i++) {
            let monsterIndex;
            if (battleNumber === 1 && i === 0)      monsterIndex = 0;
            else if (battleNumber === 2 && i === 0) monsterIndex = 1;
            else if (battleNumber === 3 && i === 0) monsterIndex = 2;
            else if (battleNumber === 4 && i === 0) monsterIndex = 3;
            else if (battleNumber === 5 && i === 0) monsterIndex = 4;
            else if (battleNumber === 6 && i === 0) monsterIndex = 5;
            else if (isBossBattle && i === 0)       monsterIndex = 6;
            else {
                // Pick from non-boss pool: all indices except 6 (Guinea Pig Lich)
                // Roll 0..(length-2), then skip over index 6 by shifting up
                let roll = Phaser.Math.Between(0, MONSTER_BODIES.length - 2);
                if (roll >= 6) roll++;
                monsterIndex = roll;
            }

            const pos = positions[i];
            const baseName = MONSTER_NAMES[monsterIndex];
            const bodyCfg = MONSTER_BODIES[monsterIndex];

            // Roll rarity — first boss encounter (battle 7) is Normal; subsequent Lich appearances escalate through Magic/Rare/Legendary; battle 1 always Normal for tutorial
            const rarity = bodyCfg.isBoss
                ? (battleNumber === 7  ? ENEMY_RARITIES[0]
                :  battleNumber === 14 ? ENEMY_RARITIES[1]
                :  battleNumber === 21 ? ENEMY_RARITIES[2]
                :                        ENEMY_RARITIES[3])
                : (battleNumber === 1) ? ENEMY_RARITIES[0] : this.rollEnemyRarity(battleNumber);
            const affixes = this.rollEnemyAffixes(rarity);

            // Apply rarity multiplier then per-affix modifiers
            let rawHp  = Math.round(stats.hp  * rarity.hpMult);
            let rawAtk = Math.round(stats.atk * rarity.atkMult);
            const finalStats = this.applyEnemyAffixStats(rawHp, rawAtk, affixes);

            const displayName = this.buildRarityEnemyName(baseName, rarity, affixes);

            let enemySprite = null;

            if (bodyCfg.spriteKey) {
                // Support per-sprite origin and offsets for animation stabilisation
                const originX = bodyCfg.spriteOriginX !== undefined ? bodyCfg.spriteOriginX : 0.5;
                const originY = bodyCfg.spriteOriginY !== undefined ? bodyCfg.spriteOriginY : 0.5;
                const effectiveX = pos.x + (bodyCfg.spritePosXOffset || 0);
                const effectiveY = pos.y + (bodyCfg.spritePosYOffset || 0);
                enemySprite = this.add.sprite(effectiveX, effectiveY, bodyCfg.spriteKey).setOrigin(originX, originY);
                if (bodyCfg.spriteDisplayW) {
                    // Fixed display size locks the sprite at a stable size regardless of frame content
                    enemySprite.setDisplaySize(
                        bodyCfg.spriteDisplayW * pos.scale,
                        bodyCfg.spriteDisplayH * pos.scale
                    );
                } else {
                    enemySprite.setScale(pos.scale * 0.95);
                }
                enemySprite.play(bodyCfg.spriteKey + '_idle');
                // Persistent fallback: any non-looping animation always returns to idle
                const _sk = bodyCfg.spriteKey;
                enemySprite.on('animationcomplete', (anim) => {
                    if (!anim.key.endsWith('_idle') && !anim.key.endsWith('_death') && enemySprite.active) {
                        enemySprite.play(_sk + '_idle');
                    }
                });
                hudContainer.add(enemySprite);
            }

            const barY = pos.barY;
            const barH = count === 1 ? 12 : 8;
            const hpBg  = this.add.rectangle(pos.x, barY, pos.barW, barH, 0x444444).setOrigin(0.5, 0.5);
            hudContainer.add(hpBg);
            const hpBar = this.add.rectangle(pos.x, barY, pos.barW, barH, 0xff0000).setOrigin(0.5, 0.5);
            hudContainer.add(hpBar);
            const hpText = this.add.text(pos.x, barY, `${finalStats.hp} / ${finalStats.hp}`, {
                fontSize: count === 1 ? '9px' : '7px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);
            hudContainer.add(hpText);

            // Name label — anchored just above the HP bar to avoid overlapping sprites or elements below
            const nameFontSize = count === 1 ? '13px' : (count <= 2 ? '11px' : '9px');
            const nameLabel = this.add.text(pos.x, barY - barH / 2 - 2, displayName, {
                fontSize: nameFontSize,
                color: rarity.textColor,
                fontStyle: rarity.name !== 'Normal' ? 'bold' : 'normal',
                stroke: '#000000', strokeThickness: 2,
                wordWrap: { width: pos.barW + 4 }
            }).setOrigin(0.5, 1);
            hudContainer.add(nameLabel);

            const markerY = pos.y - 60 * pos.scale;
            const marker = this.add.triangle(pos.x, markerY, 0, 8, 4, 0, 8, 8, 0xff4444, 0.9).setOrigin(0.5);
            marker.setVisible(false);
            hudContainer.add(marker);

            // Short tap = change target; long press (500 ms) = show info popup
            if (enemySprite) {
                enemySprite.setInteractive({ useHandCursor: true });
                const enemyIndex = i;
                let lpTimer = null;
                let lpFired = false;

                enemySprite.on('pointerdown', () => {
                    lpFired = false;
                    lpTimer = this.time.delayedCall(500, () => {
                        lpFired = true;
                        this.showEnemyInfoPopup(enemyIndex);
                    });
                });
                enemySprite.on('pointerup', () => {
                    if (lpTimer) { lpTimer.remove(false); lpTimer = null; }
                    if (!lpFired && this.enemies[enemyIndex] && this.enemies[enemyIndex].alive) {
                        this.targetEnemyIndex = enemyIndex;
                        this.updateEnemyTargetMarkers();
                    }
                });
                enemySprite.on('pointerout', () => {
                    if (lpTimer) { lpTimer.remove(false); lpTimer = null; }
                });
            }

            this.enemies.push({
                health: finalStats.hp,
                maxHealth: finalStats.hp,
                attack: finalStats.atk,
                chilledTurns: 0,
                chilledDamageMultiplier: 1,
                name: displayName,
                baseName: baseName,
                bodyIndex: monsterIndex,
                rarity: rarity,
                affixes: affixes,
                enemySprite: enemySprite,
                healthBar: hpBar,
                healthBarBg: hpBg,
                healthText: hpText,
                nameText: nameLabel,
                targetMarker: marker,
                alive: true,
                pos: pos
            });
        }

        this.updateEnemyTargetMarkers();
    }

    // -------------------------------------------------------------------------
    // Enemy info popup (long-press)
    // -------------------------------------------------------------------------

    createEnemyInfoPopup() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        const PW = 330, PH = 340;

        this.enemyInfoPopup = this.add.container(W / 2, H / 2).setVisible(false).setDepth(3000);

        const overlay = this.add.rectangle(0, 0, W * 2, H * 2, 0x000000, 0.70)
            .setInteractive()
            .on('pointerup', () => this.hideEnemyInfoPopup());

        const bg = this.add.rectangle(0, 0, PW, PH, 0x0f1020, 1)
            .setOrigin(0.5)
            .setStrokeStyle(2, 0x4455aa);

        // Sprite preview zone (left column)
        const spriteZoneX = -PW / 2 + 68;
        this.enemyInfoPopupSpriteZone = this.add.rectangle(spriteZoneX, -70, 136, 130, 0x1a1a2e)
            .setStrokeStyle(1, 0x333366);

        // Name & rarity (right of sprite)
        const textX = spriteZoneX + 80;
        this.enemyInfoPopupName = this.add.text(textX, -128, '', {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
            wordWrap: { width: 150 }, stroke: '#000', strokeThickness: 2
        }).setOrigin(0, 0.5);

        this.enemyInfoPopupRarity = this.add.text(textX, -109, '', {
            fontSize: '14px', color: '#aaaaaa', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.enemyInfoPopupStats = this.add.text(textX, -90, '', {
            fontSize: '14px', color: '#cccccc'
        }).setOrigin(0, 0.5);

        // Innate traits (hardcoded per monster type)
        this.enemyInfoPopupInnate = this.add.text(textX, -74, '', {
            fontSize: '14px', color: '#88ddaa',
            wordWrap: { width: 158 }
        }).setOrigin(0, 0);

        // Divider
        const divider = this.add.rectangle(0, -30, PW - 20, 1, 0x333366);

        // Affix section
        this.enemyInfoPopupAffixHeader = this.add.text(-PW / 2 + 12, -18, 'Affixes', {
            fontSize: '14px', color: '#8888cc', fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        this.enemyInfoPopupAffixLines = [];
        for (let a = 0; a < 3; a++) {
            const t = this.add.text(-PW / 2 + 12, 2 + a * 52, '', {
                fontSize: '14px', color: '#ffeecc',
                wordWrap: { width: PW - 26 }, lineSpacing: 4
            }).setOrigin(0, 0);
            this.enemyInfoPopupAffixLines.push(t);
        }

        this.enemyInfoPopupNormalMsg = this.add.text(0, 20, 'Normal enemy — no special modifiers.', {
            fontSize: '14px', color: '#777777', align: 'center', wordWrap: { width: PW - 24 }
        }).setOrigin(0.5, 0);

        const closeBtn = this.add.text(0, PH / 2 - 20, '[ Close ]', {
            fontSize: '14px', color: '#ffaaaa', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.hideEnemyInfoPopup());

        this.enemyInfoPopup.add([
            overlay, bg, this.enemyInfoPopupSpriteZone,
            this.enemyInfoPopupName, this.enemyInfoPopupRarity, this.enemyInfoPopupStats,
            this.enemyInfoPopupInnate,
            divider, this.enemyInfoPopupAffixHeader,
            ...this.enemyInfoPopupAffixLines,
            this.enemyInfoPopupNormalMsg, closeBtn
        ]);
        this.enemyInfoPopupSpriteRef = null;
    }

    showEnemyInfoPopup(enemyIndex) {
        const enemy = this.enemies[enemyIndex];
        if (!enemy) return;

        // Destroy old preview sprite if present
        if (this.enemyInfoPopupSpriteRef) {
            this.enemyInfoPopupSpriteRef.destroy();
            this.enemyInfoPopupSpriteRef = null;
        }

        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        const PW = 330;
        const spriteZoneX = -PW / 2 + 68;
        const spriteZoneY = -70;

        const bodyCfg = MONSTER_BODIES[enemy.bodyIndex];
        if (bodyCfg && bodyCfg.spriteKey) {
            const sp = this.add.sprite(W / 2 + spriteZoneX, H / 2 + spriteZoneY, bodyCfg.spriteKey)
                .setOrigin(0.5, 0.5)
                .setDepth(3001);
            // Match display size to ~132×110 px regardless of source frame size
            const displayW = bodyCfg.spriteDisplayW ? Math.round(bodyCfg.spriteDisplayW * 0.72) : 132;
            const displayH = bodyCfg.spriteDisplayH ? Math.round(bodyCfg.spriteDisplayH * 0.72) : 110;
            sp.setDisplaySize(displayW, displayH);
            sp.play(bodyCfg.spriteKey + '_idle');
            this.enemyInfoPopupSpriteRef = sp;
        }

        const rarity  = enemy.rarity  || ENEMY_RARITIES[0];
        const affixes = enemy.affixes || [];

        this.enemyInfoPopupName.setText(enemy.displayName || enemy.name);
        this.enemyInfoPopupName.setColor(rarity.textColor);

        const affixCount = affixes.length;
        this.enemyInfoPopupRarity.setText(
            rarity.name + (affixCount > 0 ? ` (${affixCount} ${affixCount === 1 ? 'affix' : 'affixes'})` : '')
        );
        this.enemyInfoPopupRarity.setColor(rarity.textColor);

        this.enemyInfoPopupStats.setText(`HP: ${enemy.maxHealth}   ATK: ${enemy.attack}`);

        // Innate traits
        const bodyInnate = (MONSTER_BODIES[enemy.bodyIndex] && MONSTER_BODIES[enemy.bodyIndex].innate) || [];
        if (this.enemyInfoPopupInnate) {
            if (bodyInnate.length > 0) {
                this.enemyInfoPopupInnate.setText(bodyInnate.map(t => `${t.icon} ${t.name}: ${t.desc}`).join('\n'));
                this.enemyInfoPopupInnate.setVisible(true);
            } else {
                this.enemyInfoPopupInnate.setVisible(false);
            }
        }

        const hasAffixes = affixes.length > 0;
        this.enemyInfoPopupAffixHeader.setVisible(hasAffixes);
        this.enemyInfoPopupNormalMsg.setVisible(!hasAffixes);

        this.enemyInfoPopupAffixLines.forEach((line, idx) => {
            if (idx < affixes.length) {
                line.setText(`${affixes[idx].icon}  ${affixes[idx].name}\n    ${affixes[idx].desc}`);
                line.setVisible(true);
            } else {
                line.setVisible(false);
            }
        });

        this.enemyInfoPopup.setVisible(true);
    }

    hideEnemyInfoPopup() {
        if (this.enemyInfoPopupSpriteRef) {
            this.enemyInfoPopupSpriteRef.destroy();
            this.enemyInfoPopupSpriteRef = null;
        }
        if (this.enemyInfoPopup) this.enemyInfoPopup.setVisible(false);
    }

    showTileInfoPopup(x, y) {
        this.hideTileInfoPopup();
        if (!this.grid[y]) return;
        const tileType = this.grid[y][x];
        if (tileType < 0 || !TILE_TYPES[tileType]) return;
        const info = TILE_TYPES[tileType];

        let title, desc;
        if (info.effect === 'frost') {
            title = '❄️ Frost Tile';
            desc = 'Boosts cold damage by 4% while on the board. Deals cold damage when matched.';
        } else if (info.effect === 'zap') {
            title = '⚡ Zap Tile';
            desc = 'Tap to explode — deals lightning damage and destroys 4 adjacent tiles. Also deals lightning damage when matched.';
        } else if (info.effect === 'flame') {
            title = '🔥 Flame Tile';
            desc = '50% chance each turn to spread fire to an adjacent tile. Deals heavy fire damage when matched.';
        } else {
            const effectDesc = {
                health:   'Restores player health when matched.',
                magic:    'Deals magic damage when matched.',
                ranged:   'Deals ranged damage when matched.',
                physical: 'Deals physical damage when matched.',
                gold:     'Grants gold when matched.'
            };
            title = `${info.icon} ${info.name[0].toUpperCase()}${info.name.slice(1)}`;
            desc = effectDesc[info.effect] || 'Matched for its effect.';
        }

        const W = 210, H = 86;
        const cx = this.scale.width / 2;
        const cy = GRID_OFFSET_Y + H / 2 + 8;

        const container = this.add.container(0, 0).setDepth(200);
        const bg = this.add.rectangle(cx, cy, W, H, 0x111118, 0.9)
            .setStrokeStyle(2, 0xaaaacc, 0.9);
        const titleTxt = this.add.text(cx, cy - H / 2 + 12, title, {
            fontSize: '14px', color: '#ffffff', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5, 0);
        const descTxt = this.add.text(cx, cy - H / 2 + 32, desc, {
            fontSize: '11px', color: '#cccccc', align: 'center',
            wordWrap: { width: W - 18 }, maxLines: 3
        }).setOrigin(0.5, 0);
        container.add([bg, titleTxt, descTxt]);
        this._tileInfoPopup = container;
    }

    hideTileInfoPopup() {
        if (this._tileInfoPopup) {
            this._tileInfoPopup.destroy(true);
            this._tileInfoPopup = null;
        }
        if (this._tileHoldTimer) {
            this._tileHoldTimer.remove(false);
            this._tileHoldTimer = null;
        }
    }

    updateEnemyTargetMarkers() {
        const target = this.getTargetEnemy();
        this.enemies.forEach(e => {
            if (e.targetMarker) {
                e.targetMarker.setVisible(e === target && e.alive);
            }
        });
    }

    preload() {
        // All assets already loaded by LoadScreen — nothing to do here
    }

    create() {
        // Inject a default black stroke on every text object for readability.
        // Individual calls that already set their own stroke/strokeThickness keep their values.
        const _origAddText = this.add.text.bind(this.add);
        this.add.text = (x, y, content, style) => {
            const s = style ? Object.assign({}, style) : {};
            if (!s.stroke) s.stroke = '#000000';
            if (s.strokeThickness === undefined) s.strokeThickness = 2;
            return _origAddText(x, y, content, s);
        };

        // --- Warrior sprite animations (row 0=idle, 1=attack, 2=hit, 3=death) ---
        this.anims.create({ key: 'warrior_idle', frames: this.anims.generateFrameNumbers('warrior', { start: 0, end: 5 }), frameRate: 5, repeat: -1 });
        this.anims.create({ key: 'warrior_attack', frames: this.anims.generateFrameNumbers('warrior', { start: 6, end: 11 }), frameRate: 14, repeat: 0 });
        this.anims.create({ key: 'warrior_hit', frames: this.anims.generateFrameNumbers('warrior', { start: 12, end: 17 }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: 'warrior_death', frames: this.anims.generateFrameNumbers('warrior', { start: 18, end: 23 }), frameRate: 8, repeat: 0 });

        // --- Red Squirrel sprite animations (row 0=idle, 1=attack, 2=hit, 3=death) ---
        this.anims.create({ key: 'redsquirrel_idle', frames: this.anims.generateFrameNumbers('redsquirrel', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'redsquirrel_attack', frames: this.anims.generateFrameNumbers('redsquirrel', { start: 6, end: 11 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'redsquirrel_hit', frames: this.anims.generateFrameNumbers('redsquirrel', { start: 12, end: 17 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'redsquirrel_death', frames: this.anims.generateFrameNumbers('redsquirrel', { start: 18, end: 23 }), frameRate: 5, repeat: 0 });

        // --- Skinny Pig Goblin sprite animations (row 0=idle, 1=attack, 2=hit, 3=death) ---
        this.anims.create({ key: 'skinnypiggoblin_idle', frames: this.anims.generateFrameNumbers('skinnypiggoblin', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'skinnypiggoblin_attack', frames: this.anims.generateFrameNumbers('skinnypiggoblin', { start: 6, end: 11 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'skinnypiggoblin_hit', frames: this.anims.generateFrameNumbers('skinnypiggoblin', { start: 12, end: 17 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'skinnypiggoblin_death', frames: this.anims.generateFrameNumbers('skinnypiggoblin', { start: 18, end: 23 }), frameRate: 5, repeat: 0 });

        // --- Orc Pig sprite animations (row 0=idle, 1=attack, 2=hit, 3=death) --- (flipped: animate backwards)
        this.anims.create({ key: 'orcpig_idle', frames: this.anims.generateFrameNumbers('orcpig', { start: 5, end: 0 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'orcpig_attack', frames: this.anims.generateFrameNumbers('orcpig', { start: 11, end: 6 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'orcpig_hit', frames: this.anims.generateFrameNumbers('orcpig', { start: 17, end: 12 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'orcpig_death', frames: this.anims.generateFrameNumbers('orcpig', { start: 23, end: 18 }), frameRate: 5, repeat: 0 });

        // Sloth Troll animations
        // Use only the most stable frames for subtle idle motion
        this.anims.create({ key: 'slothtroll_idle', frames: this.anims.generateFrameNumbers('slothtroll', { start: 0, end: 3 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'slothtroll_attack', frames: this.anims.generateFrameNumbers('slothtroll', { start: 6, end: 11 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'slothtroll_hit', frames: this.anims.generateFrameNumbers('slothtroll', { start: 12, end: 17 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'slothtroll_death', frames: this.anims.generateFrameNumbers('slothtroll', { start: 18, end: 23 }), frameRate: 5, repeat: 0 });

        // Bunny Warlock animations
        this.anims.create({ key: 'bunnywarlock_idle', frames: this.anims.generateFrameNumbers('bunnywarlock', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'bunnywarlock_attack', frames: this.anims.generateFrameNumbers('bunnywarlock', { start: 6, end: 11 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'bunnywarlock_hit', frames: this.anims.generateFrameNumbers('bunnywarlock', { start: 12, end: 17 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'bunnywarlock_death', frames: this.anims.generateFrameNumbers('bunnywarlock', { start: 18, end: 23 }), frameRate: 5, repeat: 0 });

        // Hamster Skeleton animations (flipped: animate backwards)
        this.anims.create({ key: 'hamsterskeleton_idle', frames: this.anims.generateFrameNumbers('hamsterskeleton', { start: 5, end: 0 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'hamsterskeleton_attack', frames: this.anims.generateFrameNumbers('hamsterskeleton', { start: 11, end: 6 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'hamsterskeleton_hit', frames: this.anims.generateFrameNumbers('hamsterskeleton', { start: 17, end: 12 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'hamsterskeleton_death', frames: this.anims.generateFrameNumbers('hamsterskeleton', { start: 23, end: 18 }), frameRate: 5, repeat: 0 });

        // Guinea Pig Lich boss animations (reversed frame order on sheet)
        // Row 0=idle (frames 5→0), Row 1=attack (11→6), Row 2=hit (17→12), Row 3=death (23→18)
        this.anims.create({ key: 'guineapiglich_idle', frames: this.anims.generateFrameNumbers('guineapiglich', { start: 5, end: 0 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'guineapiglich_attack', frames: this.anims.generateFrameNumbers('guineapiglich', { start: 11, end: 6 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'guineapiglich_hit', frames: this.anims.generateFrameNumbers('guineapiglich', { start: 17, end: 12 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'guineapiglich_death', frames: this.anims.generateFrameNumbers('guineapiglich', { start: 23, end: 18 }), frameRate: 5, repeat: 0 });

        // Raccoon Bandit animations (forward frame order: row 0=idle, 1=attack, 2=hit, 3=death)
        this.anims.create({ key: 'raccoonbandit_idle', frames: this.anims.generateFrameNumbers('raccoonbandit', { start: 0, end: 5 }), frameRate: 3, repeat: -1 });
        this.anims.create({ key: 'raccoonbandit_attack', frames: this.anims.generateFrameNumbers('raccoonbandit', { start: 6, end: 11 }), frameRate: 7, repeat: 0 });
        this.anims.create({ key: 'raccoonbandit_hit', frames: this.anims.generateFrameNumbers('raccoonbandit', { start: 12, end: 17 }), frameRate: 6, repeat: 0 });
        this.anims.create({ key: 'raccoonbandit_death', frames: this.anims.generateFrameNumbers('raccoonbandit', { start: 18, end: 23 }), frameRate: 5, repeat: 0 });

        // Forest background
        const _forestBg = this.add.image(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'forest');
        _forestBg.setScale(Math.max(this.sys.game.config.width / _forestBg.width, this.sys.game.config.height / _forestBg.height));
        _forestBg.setDepth(-100);

        this.boardContainer = this.add.container(0, 0);
        this.hudContainer = this.add.container(0, 0);
        this.skillChargeFxContainer = this.add.container(0, 0);
        this.skillChargeFxContainer.setDepth(1100);

        this.createGrid();
        this.renderGrid();
        this.createPlayerUI();
        this.createEnemyInfoPopup();
        this.player.health = this.getMaxHealth();
        this.refillEnergyShield();
        this.createCombatLog();
        this.createRewardScreen();
        this.createDeathScreen();
        this.createSkillBar();

        this.showGameScreen();

        // Global pointer-up: always dismiss tile info popup when finger lifts anywhere
        this.input.on('pointerup', () => this.hideTileInfoPopup());
    }

    createInitialSkillLoadout() {
        return [
            { activeId: 'cleave', supportIds: [null, null, null] },
            { activeId: 'minute-missles', supportIds: [null, null, null] },
            { activeId: 'multishot', supportIds: [null, null, null] }
        ];
    }

    createInitialSkillCharge() {
        return {
            physical: 0,
            magic: 0,
            ranged: 0,
            health: 0,
            gold: 0
        };
    }

    createSkillGemInventoryPool() {
        const activeGems = ACTIVE_SKILL_GEMS.map(skill => ({
            type: 'active',
            id: skill.id
        }));

        // Ensure Blizzard is always present in the inventory
        if (!activeGems.find(gem => gem.id === 'blizzard')) {
            activeGems.push({ type: 'active', id: 'blizzard' });
        }

        const supportGems = SUPPORT_SKILL_GEMS.map(gem => ({
            type: 'support',
            id: gem.id
        }));

        return [...activeGems, ...supportGems];
    }

    getActiveSkillById(skillId) {
        return ACTIVE_SKILL_GEMS.find(skill => skill.id === skillId) || null;
    }

    getSupportGemById(gemId) {
        return SUPPORT_SKILL_GEMS.find(gem => gem.id === gemId) || null;
    }

    getTileDataForEffect(effect) {
        return TILE_TYPES.find(tile => tile.effect === effect) || null;
    }

    toHexColor(colorNumber) {
        return `#${colorNumber.toString(16).padStart(6, '0')}`;
    }

    activateSkillSlot(slotIndex) {
        if (!this.playerSkills[slotIndex]) return;
        const loadout = this.playerSkills[slotIndex];
        const activeSkill = this.getActiveSkillById(loadout.activeId);
        if (!activeSkill) return;

        const threshold = this.getSkillTriggerThreshold(loadout);
        const currentCharge = this.skillCharge[activeSkill.tileEffect] || 0;
        if (currentCharge < threshold) {
            this.addCombatLog(`${activeSkill.name} not ready (${currentCharge}/${threshold})`, '#9b9b9b');
            return;
        }

        const gear = this.getEquippedStatTotals();
        const castResult = this.resolveSkillCastEffect(activeSkill, loadout, currentCharge, threshold, gear);
        this.skillCharge[activeSkill.tileEffect] = Math.max(0, currentCharge - threshold);

        if (castResult.enemyDamage) {
            const dmg = castResult.enemyDamage;
            const skillCritChance = this.getCharacterStatBonuses().critChance;

            if (typeof dmg === 'object' && (dmg.randomHits || dmg.repeatTarget)) {
                // Minute Missiles (randomHits) / Shock and Awe (randomHits+lightning) / Multishot (repeatTarget)
                const aliveEnemies = this.getAliveEnemies();
                if (aliveEnemies.length > 0) {
                    if (this.playerSprite) this.playPlayerAttackAnim();
                    // Visual effects: missiles for non-lightning, multishot for repeatTarget
                    if (dmg.repeatTarget) {
                        const repeatTarget = this.getTargetEnemy();
                        if (repeatTarget) this.spawnMultishotEffect(repeatTarget, dmg.hitDamages.length);
                    } else if (!dmg.isLightning) {
                        // Minute Missiles — one orb per hit, toward random enemies
                        const missileTargets = dmg.hitDamages.map(() =>
                            aliveEnemies[Phaser.Math.Between(0, aliveEnemies.length - 1)]
                        );
                        this.spawnMissilesEffect(missileTargets);
                    }
                    dmg.hitDamages.forEach((hit, idx) => {
                        const enemyTarget = dmg.repeatTarget
                            ? this.getTargetEnemy()
                            : aliveEnemies[Phaser.Math.Between(0, aliveEnemies.length - 1)];
                        if (!enemyTarget) return;
                        this.time.delayedCall(idx * 160, () => {
                            if (!enemyTarget.alive) return;
                            let finalHit = hit;
                            let hitIsCrit = false;
                            if (Math.random() * 100 < skillCritChance) {
                                finalHit = Math.floor(hit * this.getCritMultiplier());
                                hitIsCrit = true;
                            }
                            this.damageEnemy(enemyTarget, finalHit);
                            if (hitIsCrit) {
                                this.showCombatMessage(
                                    `CRIT ${finalHit}`,
                                    '#ffff00',
                                    enemyTarget.pos.x,
                                    enemyTarget.pos.y - 40 - idx * 8
                                );
                            } else {
                                this.showCombatMessage(
                                    `-${finalHit}`,
                                    dmg.isLightning ? '#aaddff' : '#ff4444',
                                    enemyTarget.pos.x,
                                    enemyTarget.pos.y - 40 - idx * 8
                                );
                            }
                            if (dmg.isLightning) {
                                this.spawnLightningBolt(97, 90, enemyTarget.pos.x, enemyTarget.pos.y);
                            }
                            if (enemyTarget.health > 0) {
                                this.playEnemyHitAnim(enemyTarget);
                            } else {
                                this.handleEnemyDeath(enemyTarget);
                            }
                            // Check if the last enemy was just killed by this hit
                            if (this.allEnemiesDead() && !this.awaitingRewardChoice) {
                                this.awaitingRewardChoice = true;
                                this.time.delayedCall(1500, () => this.showRewardScreen());
                                this.isSwapping = true;
                            }
                            this.updateEnemyUI();
                        });
                    });
                }
            } else if (typeof dmg === 'object' && dmg.all) {
                // Cleave / Blizzard / Cloak of Flames (all enemies)
                const aliveEnemies = this.getAliveEnemies();
                const msgColor = dmg.chilledTurns ? '#aaddff' : (castResult.cloakAuraDamage ? '#ff6a00' : '#ff4444');
                aliveEnemies.forEach(enemy => {
                    let finalDmg = dmg.value;
                    let enemyHitIsCrit = false;
                    if (Math.random() * 100 < skillCritChance) {
                        finalDmg = Math.floor(dmg.value * this.getCritMultiplier());
                        enemyHitIsCrit = true;
                    }
                    this.damageEnemy(enemy, finalDmg);
                    if (enemyHitIsCrit) {
                        this.showCombatMessage(`CRIT ${finalDmg}`, '#ffff00', enemy.pos.x, enemy.pos.y - 40);
                    } else {
                        this.showCombatMessage(`-${finalDmg}`, msgColor, enemy.pos.x, enemy.pos.y - 40);
                    }
                    if (dmg.chilledTurns) {
                        enemy.chilledTurns = (enemy.chilledTurns || 0) + dmg.chilledTurns;
                        enemy.chilledDamageMultiplier = dmg.chilledDamageMultiplier || 0.65;
                    }
                    if (enemy.health > 0) {
                        this.time.delayedCall(100, () => this.playEnemyHitAnim(enemy));
                    } else {
                        this.handleEnemyDeath(enemy);
                    }
                });
                if (dmg.chilledTurns) {
                    this.spawnBlizzardEffect(aliveEnemies);
                } else if (!castResult.cloakAuraDamage) {
                    // Cleave slash effect
                    this.spawnCleaveEffect(aliveEnemies);
                }
                if (this.playerSprite) this.playPlayerAttackAnim();
            } else if (dmg > 0) {
                // Single-target damage (plain number)
                const target = this.getTargetEnemy();
                if (target) {
                    let finalDmg = dmg;
                    let singleIsCrit = false;
                    if (Math.random() * 100 < skillCritChance) {
                        finalDmg = Math.floor(dmg * this.getCritMultiplier());
                        singleIsCrit = true;
                    }
                    this.damageEnemy(target, finalDmg);
                    if (singleIsCrit) {
                        this.showCombatMessage(`CRIT ${finalDmg}`, '#ffff00', target.pos.x, target.pos.y - 40);
                    } else {
                        this.showCombatMessage(`-${finalDmg}`, '#ff4444', target.pos.x, target.pos.y - 40);
                    }
                    if (this.playerSprite) this.playPlayerAttackAnim();
                    switch (activeSkill.id) {
                        case 'duck-and-roll':    this.spawnDuckRollEffect(target);       break;
                        case 'energy-beam':      this.spawnEnergyBeamEffect(target);     break;
                        case 'reckless-attack':  this.spawnRecklessAttackEffect(target); break;
                    }
                    if (target.health > 0) {
                        this.time.delayedCall(100, () => this.playEnemyHitAnim(target));
                    } else {
                        this.handleEnemyDeath(target);
                    }
                }
            }
        }

        if (castResult.healAmount > 0) {
            this.player.health = Math.min(this.getMaxHealth(), this.player.health + castResult.healAmount);
            this.showCombatMessage(
                `+${castResult.healAmount}`,
                '#44ff88',
                GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25,
                FIGHT_PANEL_Y + 30
            );
        }

        if (castResult.lootAmount > 0) {
            this.player.gold += castResult.lootAmount;
            this.addCombatLog(`Skill Gold: +${castResult.lootAmount}`, '#ffee75');
        }

        if (castResult.cloakAuraDamage) {
            this.cloakOfFlamesActive = true;
            this.cloakOfFlamesDamage = castResult.cloakAuraDamage;
            this.addCombatLog('Cloak of Flames is now active!', '#ff6a00');
            this.spawnCloakCastEffect();
        }

        if (castResult.transformGoldToHealth) {
            this.transformGoldTilesToHealth();
        }

        if (castResult.transformSpecialTiles) {
            this.placeSpecialTiles(castResult.transformSpecialTiles.type, castResult.transformSpecialTiles.count);
        }

        // If any board transformation created matches, resolve them before proceeding.
        // Player keeps their turn after the cascade — enemy does NOT auto-attack afterward.
        if ((castResult.transformGoldToHealth || castResult.transformSpecialTiles) && !this.awaitingRewardChoice) {
            const matchData = this.findMatchData();
            if (matchData.matched.length > 0) {
                this.isSwapping = true;
                this._boardEffectGrantedTurn = true;   // tell applyGravity to skip enemy attack
                this.time.delayedCall(300, () => {
                    this.clearMatches(matchData.matched, matchData.runs, matchData.lShapes, matchData.tCrossShapes);
                    this.applyGravity();
                });
            }
        }

        if (this.allEnemiesDead()) {
            if (!this.awaitingRewardChoice) {
                this.awaitingRewardChoice = true;
                this.time.delayedCall(1500, () => this.showRewardScreen());
            }
            this.isSwapping = true;
        }

        this.updateSkillBarUI();
        this.updatePlayerUI();
        this.updateEnemyUI();
    }

    addSkillChargeFromMatches(matchCounts) {
        Object.entries(matchCounts).forEach(([effect, count]) => {
            if (!count || count <= 0) return;
            if (this.skillCharge[effect] === undefined) return;
            this.skillCharge[effect] += count;
        });
        this.updateSkillBarUI();
    }

    transformGoldTilesToHealth() {
        const goldType = TILE_TYPES.findIndex(t => t.effect === 'gold');
        const healthType = TILE_TYPES.findIndex(t => t.effect === 'health');
        if (goldType === -1 || healthType === -1) return;
        const healthInfo = TILE_TYPES[healthType];
        let count = 0;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y][x] !== goldType) continue;
                this.grid[y][x] = healthType;
                count++;
                const tile = this.tileSprites[y] && this.tileSprites[y][x];
                if (!tile || !tile.rect) continue;
                tile.type = healthType;
                tile.rect.setFillStyle(healthInfo.color);
                if (tile.icon) {
                    if (tile.icon.type === 'Image') {
                        tile.icon.setTexture('tile_' + healthInfo.name);
                    } else {
                        tile.icon.setText(healthInfo.icon);
                    }
                }
            }
        }
        if (count > 0) {
            this.addCombatLog(`Charge: ${count} gold tile${count !== 1 ? 's' : ''} → hearts`, '#ff69b4');
        }
    }

    /** Places `count` random tiles as special tiles of the given type. */
    placeSpecialTiles(type, count) {
        const typeIdx = { frost: 5, zap: 6, flame: 7 }[type];
        if (typeIdx === undefined) return;
        // Only replace normal (non-special) filled tiles
        const candidates = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y][x] >= 0 && this.grid[y][x] < 5) {
                    candidates.push({ x, y });
                }
            }
        }
        Phaser.Utils.Array.Shuffle(candidates);
        candidates.slice(0, count).forEach(({ x, y }) => {
            this.grid[y][x] = typeIdx;
        });
        this.renderGrid();
    }

    /** Returns the total cold damage % bonus from frost tiles on the board (4% each). */
    getFrostTileColdBonus() {
        let count = 0;
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y] && this.grid[y][x] === 5) count++;
            }
        }
        return count * 4; // percent
    }

    /** Explode a zap tile: deal lightning damage and destroy adjacent tiles. */
    handleZapTileClick(x, y) {
        if (!this.grid[y] || this.grid[y][x] !== 6) return;
        if (this.isSwapping) return;

        this.isSwapping = true;

        // Calculate lightning damage from basePower of burst-lightning skill + ranged scaling
        const gear = this.getEquippedStatTotals();
        const skill = this.getActiveSkillById('burst-lightning');
        const baseDmg = skill ? skill.basePower : 20;
        const zapDmg = Math.max(5, baseDmg + Math.floor(gear.ranged * 0.8));

        // Deal damage to target enemy
        const target = this.getTargetEnemy();
        if (target) {
            this.damageEnemy(target, zapDmg);
            const enemyCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
            this.showCombatMessage(`⚡-${zapDmg}`, '#ffe566', enemyCenterX, FIGHT_PANEL_Y + 30);
            if (target.health <= 0) this.handleEnemyDeath(target);
        }
        this.addCombatLog(`⚡ Zap tile exploded for ${zapDmg} lightning dmg!`, '#ffe566');

        // Explosion visual on the zap tile itself
        const zapWX = GRID_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2;
        const zapWY = GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
        this.spawnZapTileMatchEffect(zapWX, zapWY);

        // Destroy the zap tile itself and 4 adjacent tiles (no damage from adjacents)
        const toDestroy = [{ x, y }];
        const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        dirs.forEach(d => {
            const nx = x + d.dx, ny = y + d.dy;
            if (nx >= 0 && nx < GRID_WIDTH && ny >= 0 && ny < GRID_HEIGHT && this.grid[ny][nx] >= 0) {
                toDestroy.push({ x: nx, y: ny });
            }
        });
        toDestroy.forEach(({ x: tx, y: ty }) => {
            this.grid[ty][tx] = -1;
        });

        this.updateEnemyUI();
        this.renderGrid();

        if (this.allEnemiesDead()) {
            if (!this.awaitingRewardChoice) {
                this.awaitingRewardChoice = true;
                this.time.delayedCall(1500, () => this.showRewardScreen());
            }
            return;
        }

        // Trigger gravity to fill the holes
        this.time.delayedCall(200, () => {
            this.applyGravity();
        });
    }

    /** Each flame tile has a 50% chance to spread to a random adjacent normal tile. */
    processFlameTileSpread() {
        const flameTiles = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (this.grid[y] && this.grid[y][x] === 7) flameTiles.push({ x, y });
            }
        }
        if (flameTiles.length === 0) return;
        let spread = false;
        const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
        flameTiles.forEach(ft => {
            if (Math.random() < 0.5) {
                const candidates = dirs
                    .map(d => ({ x: ft.x + d.dx, y: ft.y + d.dy }))
                    .filter(p => p.x >= 0 && p.x < GRID_WIDTH && p.y >= 0 && p.y < GRID_HEIGHT
                        && this.grid[p.y][p.x] >= 0 && this.grid[p.y][p.x] < 5);
                if (candidates.length > 0) {
                    const target = candidates[Math.floor(Math.random() * candidates.length)];
                    this.grid[target.y][target.x] = 7;
                    spread = true;
                }
            }
        });
        if (spread) {
            this.addCombatLog('🔥 Flame tiles spread!', '#ff6a00');
            this.renderGrid();
        }
    }

    getSkillCardChargeTargets(effect) {
        if (!effect || !this.skillSlotUI || this.skillSlotUI.length === 0) {
            return [];
        }

        const targets = [];
        this.playerSkills.forEach((loadout, index) => {
            const activeSkill = this.getActiveSkillById(loadout.activeId);
            if (!activeSkill || activeSkill.tileEffect !== effect) return;

            const slotUI = this.skillSlotUI[index];
            if (!slotUI) return;

            targets.push({
                x: slotUI.centerX,
                y: slotUI.centerY,
                slotIndex: index
            });
        });

        return targets;
    }

    flashSkillCardCharge(slotIndex, color) {
        const slotUI = this.skillSlotUI[slotIndex];
        if (!slotUI) return;

        const flash = this.add.circle(slotUI.centerX, slotUI.centerY, slotUI.iconRadius + 4, color, 0.45)
            .setOrigin(0.5)
            .setDepth(1080);

        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add(flash);
        }

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.15,
            scaleY: 1.15,
            duration: 280,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });

        // Update glow immediately after charge particle hits
        this.updateSkillBarUI();
    }

    launchChargeParticle(startX, startY, targetX, targetY, color, delay, onHit, durationMin = 680, durationMax = 980) {
        const orb = this.add.circle(startX, startY, Phaser.Math.Between(2, 4), color, 0.95).setDepth(1095);
        const glow = this.add.circle(startX, startY, Phaser.Math.Between(6, 10), color, 0.28).setDepth(1094);

        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add([glow, orb]);
        }

        const midX = (startX + targetX) / 2 + Phaser.Math.Between(-20, 20);
        const midY = Math.min(startY, targetY) - Phaser.Math.Between(25, 80);

        this.tweens.addCounter({
            from: 0,
            to: 1,
            delay,
            duration: Phaser.Math.Between(durationMin, durationMax),
            ease: 'Cubic.easeInOut',
            onUpdate: tween => {
                const t = tween.getValue();
                const oneMinusT = 1 - t;
                const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * targetX;
                const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * targetY;

                orb.setPosition(x, y);
                glow.setPosition(x, y);
                orb.setScale(1 - (t * 0.25));
                glow.setScale(1.1 - (t * 0.5));
                glow.setAlpha(0.28 * (1 - t));
            },
            onComplete: () => {
                orb.destroy();
                glow.destroy();
                if (onHit) onHit();
            }
        });
    }

    spawnSkillChargeParticles(matchedTiles) {
        if (!matchedTiles || matchedTiles.length === 0) return;

        const flashedSlots = new Set();

        matchedTiles.forEach((tile, tileIndex) => {
            if (tile.effect === 'gold') {
                const target = this.getGoldDisplayParticleTarget();
                if (target) {
                    const particleCount = Phaser.Math.Between(2, 3);
                    for (let i = 0; i < particleCount; i++) {
                        const startX = tile.x + Phaser.Math.Between(-8, 8);
                        const startY = tile.y + Phaser.Math.Between(-8, 8);
                        const delay = tileIndex * 22 + i * 58;
                        this.launchChargeParticle(
                            startX,
                            startY,
                            target.x,
                            target.y,
                            tile.color,
                            delay,
                            () => this.flashGoldDisplay(tile.color)
                        );
                    }
                }
                return;
            }

            if (tile.effect === 'health') {
                const target = this.getHealthBarParticleTarget();
                if (target) {
                    const particleCount = Phaser.Math.Between(2, 3);
                    for (let i = 0; i < particleCount; i++) {
                        const startX = tile.x + Phaser.Math.Between(-8, 8);
                        const startY = tile.y + Phaser.Math.Between(-8, 8);
                        const delay = tileIndex * 22 + i * 65;
                        this.launchHeartParticle(
                            startX,
                            startY,
                            target.x,
                            target.y,
                            delay,
                            () => this.flashHealthBar()
                        );
                    }
                }
                return;
            }

            const targets = this.getSkillCardChargeTargets(tile.effect);
            if (targets.length === 0) return;

            targets.forEach((target, targetIndex) => {
                const particleCount = Phaser.Math.Between(1, 2);

                for (let i = 0; i < particleCount; i++) {
                    const startX = tile.x + Phaser.Math.Between(-8, 8);
                    const startY = tile.y + Phaser.Math.Between(-8, 8);
                    const delay = tileIndex * 18 + targetIndex * 42 + i * 55;

                    this.launchChargeParticle(
                        startX,
                        startY,
                        target.x,
                        target.y,
                        tile.color,
                        delay,
                        () => {
                            if (flashedSlots.has(target.slotIndex)) return;
                            flashedSlots.add(target.slotIndex);
                            this.flashSkillCardCharge(target.slotIndex, tile.color);
                        }
                    );
                }
            });
        });
    }

    getGoldDisplayParticleTarget() {
        if (!this.goldDisplayText) return null;
        const x = this.goldDisplayText.x;
        const y = this.goldDisplayText.y;
        return { x, y };
    }

    flashGoldDisplay(color) {
        if (!this.goldDisplayText) return;

        this.tweens.add({
            targets: this.goldDisplayText,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 120,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    getHealthBarParticleTarget() {
        if (!this.playerHealthBar) return null;
        const x = this.playerHealthBar.x + 83;
        const y = this.playerHealthBar.y;
        return { x, y };
    }

    launchHeartParticle(startX, startY, targetX, targetY, delay, onHit) {
        const heart = this.add.text(startX, startY, '♥', {
            fontSize: `${Phaser.Math.Between(10, 16)}px`,
            color: '#ff69b4'
        }).setOrigin(0.5).setDepth(1095).setAlpha(0.95);

        const glow = this.add.text(startX, startY, '♥', {
            fontSize: `${Phaser.Math.Between(18, 24)}px`,
            color: '#ff1493'
        }).setOrigin(0.5).setDepth(1094).setAlpha(0.25);

        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add([glow, heart]);
        }

        const midX = (startX + targetX) / 2 + Phaser.Math.Between(-25, 25);
        const midY = Math.min(startY, targetY) - Phaser.Math.Between(40, 100);

        this.tweens.addCounter({
            from: 0,
            to: 1,
            delay,
            duration: Phaser.Math.Between(750, 1050),
            ease: 'Cubic.easeInOut',
            onUpdate: tween => {
                const t = tween.getValue();
                const oneMinusT = 1 - t;
                const x = oneMinusT * oneMinusT * startX + 2 * oneMinusT * t * midX + t * t * targetX;
                const y = oneMinusT * oneMinusT * startY + 2 * oneMinusT * t * midY + t * t * targetY;

                heart.setPosition(x, y);
                glow.setPosition(x, y);
                heart.setScale(1 - (t * 0.3));
                glow.setScale(1.1 - (t * 0.5));
                glow.setAlpha(0.25 * (1 - t));
            },
            onComplete: () => {
                heart.destroy();
                glow.destroy();
                if (onHit) onHit();
            }
        });
    }

    flashHealthBar() {
        if (!this.playerHealthBar) return;

        const flash = this.add.rectangle(
            this.playerHealthBar.x + 83,
            this.playerHealthBar.y,
            this.playerHealthBar.width,
            this.playerHealthBar.height + 2,
            0xff69b4,
            0.55
        ).setOrigin(0.5).setDepth(1092);

        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add(flash);
        }

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleY: 1.5,
            duration: 280,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });
    }

    spawnComboTierEffect(centerX, centerY, color, rowLength, bonusUnits) {
        const ring = this.add.circle(centerX, centerY, 10, color, 0)
            .setStrokeStyle(3, color, 0.95)
            .setDepth(1096);
        const pulse = this.add.circle(centerX, centerY, 8, color, 0.4)
            .setDepth(1095);
        const text = this.add.text(centerX, centerY - 8, `${rowLength}x +${bonusUnits}`, {
            fontSize: rowLength >= 5 ? '20px' : '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: this.toHexColor(color),
            strokeThickness: rowLength >= 5 ? 8 : 6
        }).setOrigin(0.5).setDepth(1097);

        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add([ring, pulse, text]);
        }

        this.tweens.add({
            targets: ring,
            scaleX: rowLength >= 5 ? 3.3 : 2.5,
            scaleY: rowLength >= 5 ? 3.3 : 2.5,
            alpha: 0,
            duration: rowLength >= 5 ? 1650 : 1350,
            ease: 'Cubic.easeOut',
            onComplete: () => ring.destroy()
        });

        this.tweens.add({
            targets: pulse,
            scaleX: rowLength >= 5 ? 1.9 : 1.5,
            scaleY: rowLength >= 5 ? 1.9 : 1.5,
            alpha: 0,
            duration: rowLength >= 5 ? 1450 : 1180,
            ease: 'Quad.easeOut',
            onComplete: () => pulse.destroy()
        });

        this.tweens.add({
            targets: text,
            y: centerY - 42,
            alpha: 0,
            duration: rowLength >= 5 ? 1700 : 1500,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }

    spawnLShapeMatchEffect(shape, delay = 0) {
        if (!shape || !shape.tiles || shape.tiles.length < 5) return;

        const play = () => {
            const color = shape.color || 0xffffff;
            const cornerX = GRID_OFFSET_X + shape.corner.x * TILE_SIZE + TILE_SIZE / 2;
            const cornerY = GRID_OFFSET_Y + shape.corner.y * TILE_SIZE + TILE_SIZE / 2;

            const center = shape.tiles.reduce((acc, tile) => {
                acc.x += GRID_OFFSET_X + tile.x * TILE_SIZE + TILE_SIZE / 2;
                acc.y += GRID_OFFSET_Y + tile.y * TILE_SIZE + TILE_SIZE / 2;
                return acc;
            }, { x: 0, y: 0 });
            center.x /= shape.tiles.length;
            center.y /= shape.tiles.length;

            const cornerPulse = this.add.circle(cornerX, cornerY, 10, color, 0.35).setDepth(1098);
            const cornerRing = this.add.circle(cornerX, cornerY, 9, color, 0)
                .setStrokeStyle(3, color, 0.95)
                .setDepth(1099);
            const label = this.add.text(center.x, center.y - 10, 'L MATCH!', {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: this.toHexColor(color),
                strokeThickness: 6
            }).setOrigin(0.5).setDepth(1100);

            if (this.skillChargeFxContainer) {
                this.skillChargeFxContainer.add([cornerPulse, cornerRing, label]);
            }

            shape.tiles.forEach((tile, index) => {
                const tileX = GRID_OFFSET_X + tile.x * TILE_SIZE + TILE_SIZE / 2;
                const tileY = GRID_OFFSET_Y + tile.y * TILE_SIZE + TILE_SIZE / 2;
                const marker = this.add.rectangle(tileX, tileY, TILE_SIZE - 12, TILE_SIZE - 12, color, 0)
                    .setStrokeStyle(2, color, 0.95)
                    .setDepth(1097);

                if (this.skillChargeFxContainer) {
                    this.skillChargeFxContainer.add(marker);
                }

                this.tweens.add({
                    targets: marker,
                    scaleX: 1.22,
                    scaleY: 1.22,
                    alpha: 0,
                    duration: 520,
                    delay: index * 55,
                    ease: 'Quad.easeOut',
                    onComplete: () => marker.destroy()
                });
            });

            this.tweens.add({
                targets: cornerPulse,
                scaleX: 2.4,
                scaleY: 2.4,
                alpha: 0,
                duration: 980,
                ease: 'Cubic.easeOut',
                onComplete: () => cornerPulse.destroy()
            });

            this.tweens.add({
                targets: cornerRing,
                scaleX: 3.0,
                scaleY: 3.0,
                alpha: 0,
                duration: 1100,
                ease: 'Cubic.easeOut',
                onComplete: () => cornerRing.destroy()
            });

            this.tweens.add({
                targets: label,
                y: center.y - 56,
                alpha: 0,
                duration: 1250,
                ease: 'Quad.easeOut',
                onComplete: () => label.destroy()
            });
        };

        if (delay > 0) {
            this.time.delayedCall(delay, play);
        } else {
            play();
        }
    }

    spawnComboBonusChargeParticles(comboSources) {
        if (!comboSources || comboSources.length === 0) return;

        comboSources.forEach((source, sourceIndex) => {
            const targets = this.getSkillCardChargeTargets(source.effect);
            if (targets.length === 0) return;

            targets.forEach((target, targetIndex) => {
                const particleCount = Math.min(8, 2 + Math.ceil(source.bonusUnits / 2));

                for (let i = 0; i < particleCount; i++) {
                    const delay = sourceIndex * 80 + targetIndex * 95 + i * 68;
                    this.launchChargeParticle(
                        source.x + Phaser.Math.Between(-14, 14),
                        source.y + Phaser.Math.Between(-14, 14),
                        target.x,
                        target.y,
                        source.color,
                        delay,
                        null,
                        980,
                        1400
                    );
                }
            });
        });
    }

    /**
     * Shattering burst when a tile is cleared.
     * intensity 1 = 3-match (basic), 2 = 4-match (dramatic), 3 = 5/L/T (most dramatic).
     */
    spawnTileShatterEffect(worldX, worldY, color, intensity) {
        const shardCount  = intensity === 3 ? 18 : intensity === 2 ? 12 : 7;
        const spread      = intensity === 3 ? 100 : intensity === 2 ? 68 : 40;
        const duration    = intensity === 3 ? 980 : intensity === 2 ? 760 : 560;
        const shardBase   = intensity === 3 ? 13  : intensity === 2 ? 10 : 7;

        // White flash — all intensities now get one, bigger and brighter at higher tiers
        {
            const flashAlpha = intensity === 3 ? 1.0 : intensity === 2 ? 0.85 : 0.55;
            const flashScale = intensity === 3 ? 2.6 : intensity === 2 ? 1.9  : 1.45;
            const flashDur   = intensity === 3 ? 420 : intensity === 2 ? 320  : 240;
            const flash = this.add.rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, 0xffffff, flashAlpha)
                .setDepth(1202);
            this.tweens.add({
                targets: flash,
                alpha: 0,
                scaleX: flashScale,
                scaleY: flashScale,
                duration: flashDur,
                ease: 'Quad.easeOut',
                onComplete: () => flash.destroy()
            });
        }

        // Tile-colored inner glow pulse — all intensities
        {
            const glowAlpha = intensity === 3 ? 0.85 : intensity === 2 ? 0.65 : 0.45;
            const glowScale = intensity === 3 ? 2.0  : intensity === 2 ? 1.55 : 1.2;
            const glowDur   = intensity === 3 ? 360  : intensity === 2 ? 280  : 210;
            const glow = this.add.rectangle(worldX, worldY, TILE_SIZE - 4, TILE_SIZE - 4, color, glowAlpha)
                .setDepth(1201);
            this.tweens.add({
                targets: glow,
                alpha: 0,
                scaleX: glowScale,
                scaleY: glowScale,
                duration: glowDur,
                ease: 'Cubic.easeOut',
                onComplete: () => glow.destroy()
            });
        }

        // Expanding ring(s) — 4+ matches get at least one ring, 5/L/T get three
        const ringDefs = intensity === 3
            ? [
                { color: 0xffffff, stroke: 4, scaleTo: 5.5, alpha: 1.0,  dur: 820 },
                { color,           stroke: 3, scaleTo: 4.0, alpha: 0.9,  dur: 700 },
                { color: 0xffffff, stroke: 2, scaleTo: 2.8, alpha: 0.75, dur: 560 }
              ]
            : intensity === 2
            ? [
                { color: 0xffffff, stroke: 3, scaleTo: 4.0, alpha: 0.9, dur: 640 },
                { color,           stroke: 2, scaleTo: 2.8, alpha: 0.75, dur: 520 }
              ]
            : [
                { color,           stroke: 2, scaleTo: 2.4, alpha: 0.7, dur: 440 }
              ];

        ringDefs.forEach(rd => {
            const ring = this.add.circle(worldX, worldY, 10, rd.color, 0)
                .setStrokeStyle(rd.stroke, rd.color, rd.alpha)
                .setDepth(1200);
            this.tweens.add({
                targets: ring,
                scaleX: rd.scaleTo,
                scaleY: rd.scaleTo,
                alpha: 0,
                duration: rd.dur,
                ease: 'Cubic.easeOut',
                onComplete: () => ring.destroy()
            });
        });

        // Shards — mix of tile color and white for higher intensities
        for (let i = 0; i < shardCount; i++) {
            const baseAngle = (i / shardCount) * Math.PI * 2;
            const jitter    = Phaser.Math.Between(-25, 25) * (Math.PI / 180);
            const angle     = baseAngle + jitter;
            const dist      = spread * (0.5 + Math.random() * 0.9);

            const useWhite  = intensity >= 2 && Math.random() < 0.35;
            const shardColor = useWhite ? 0xffffff : color;
            const w = shardBase * (0.6 + Math.random() * 1.1);
            const h = shardBase * (0.3 + Math.random() * 0.8);
            const shard = this.add.rectangle(worldX, worldY, w, h, shardColor, 1.0)
                .setDepth(1198)
                .setRotation(Math.random() * Math.PI * 2);

            this.tweens.add({
                targets: shard,
                x: worldX + Math.cos(angle) * dist,
                y: worldY + Math.sin(angle) * dist,
                rotation: shard.rotation + Phaser.Math.Between(-4, 4) * Math.PI,
                scaleX: 0.05,
                scaleY: 0.05,
                alpha: 0,
                duration: duration * (0.6 + Math.random() * 0.6),
                ease: 'Quad.easeOut',
                onComplete: () => shard.destroy()
            });
        }

        // Central sparkle
        const sparkleScale = intensity === 3 ? 3.8 : intensity === 2 ? 2.6 : 1.8;
        const sparkleDur   = intensity === 3 ? 520 : intensity === 2 ? 400 : 300;
        const sparkle = this.add.circle(worldX, worldY, shardBase * 1.1, 0xffffff, 1.0)
            .setDepth(1203);
        this.tweens.add({
            targets: sparkle,
            scaleX: sparkleScale,
            scaleY: sparkleScale,
            alpha: 0,
            duration: sparkleDur,
            ease: 'Cubic.easeOut',
            onComplete: () => sparkle.destroy()
        });
    }

    /** Bursting ice-crystal effect for when a frost tile is matched. */
    spawnFrostTileMatchEffect(worldX, worldY) {
        const color = 0x88ddff;
        const white = 0xddf4ff;
        // Icy flash
        const flash = this.add.rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, white, 0.9).setDepth(1202);
        this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.2, scaleY: 2.2, duration: 320, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });

        // Expanding frost rings
        [{ stroke: 3, scale: 4.0, dur: 680, alpha: 0.95 }, { stroke: 2, scale: 2.6, dur: 520, alpha: 0.75 }].forEach(rd => {
            const ring = this.add.circle(worldX, worldY, 10, color, 0).setStrokeStyle(rd.stroke, color, rd.alpha).setDepth(1200);
            this.tweens.add({ targets: ring, scaleX: rd.scale, scaleY: rd.scale, alpha: 0, duration: rd.dur, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
        });

        // Snowflake-shaped spikes (8 directions)
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const dist  = 44 + Math.random() * 24;
            const shard = this.add.rectangle(worldX, worldY, 3, 14 + Math.random() * 8, i % 2 === 0 ? white : color, 1.0)
                .setDepth(1199).setRotation(angle);
            this.tweens.add({
                targets: shard,
                x: worldX + Math.cos(angle) * dist,
                y: worldY + Math.sin(angle) * dist,
                alpha: 0,
                scaleX: 0.2,
                scaleY: 0.2,
                duration: 480 + Math.random() * 200,
                ease: 'Quad.easeOut',
                onComplete: () => shard.destroy()
            });
        }

        // Floating snowflake emoji
        const flake = this.add.text(worldX, worldY - 4, '❄️', { fontSize: '22px' }).setOrigin(0.5).setDepth(1205);
        this.tweens.add({ targets: flake, y: worldY - 36, alpha: 0, duration: 700, ease: 'Quad.easeOut', onComplete: () => flake.destroy() });

        // Central sparkle
        const sparkle = this.add.circle(worldX, worldY, 8, 0xffffff, 1.0).setDepth(1203);
        this.tweens.add({ targets: sparkle, scaleX: 2.8, scaleY: 2.8, alpha: 0, duration: 380, ease: 'Cubic.easeOut', onComplete: () => sparkle.destroy() });
    }

    /** Crackling lightning burst for when a zap tile is matched or activated. */
    spawnZapTileMatchEffect(worldX, worldY) {
        const color = 0xffee44;
        // Bright white-yellow flash
        const flash = this.add.rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, 0xffffff, 1.0).setDepth(1202);
        this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.4, scaleY: 2.4, duration: 280, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });

        // Yellow expanding ring
        [{ stroke: 4, scale: 4.5, dur: 700, alpha: 1.0 }, { stroke: 2, scale: 3.0, dur: 540, alpha: 0.8 }].forEach(rd => {
            const ring = this.add.circle(worldX, worldY, 10, color, 0).setStrokeStyle(rd.stroke, color, rd.alpha).setDepth(1200);
            this.tweens.add({ targets: ring, scaleX: rd.scale, scaleY: rd.scale, alpha: 0, duration: rd.dur, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
        });

        // Jagged lightning spikes (6 directions)
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.3;
            const segments = 4;
            const gfx = this.add.graphics().setDepth(1199);
            gfx.lineStyle(2, i % 2 === 0 ? 0xffffff : color, 1);
            gfx.beginPath();
            gfx.moveTo(worldX, worldY);
            let cx = worldX, cy = worldY;
            for (let s = 0; s < segments; s++) {
                const t = (s + 1) / segments;
                const dist = 38 + Math.random() * 26;
                cx = worldX + Math.cos(angle) * dist * t + Phaser.Math.Between(-8, 8);
                cy = worldY + Math.sin(angle) * dist * t + Phaser.Math.Between(-8, 8);
                gfx.lineTo(cx, cy);
            }
            gfx.strokePath();
            this.tweens.add({ targets: gfx, alpha: 0, duration: 360 + Math.random() * 150, ease: 'Quad.easeOut', onComplete: () => gfx.destroy() });
        }

        // Lightning bolt emoji
        const bolt = this.add.text(worldX, worldY - 4, '⚡', { fontSize: '24px' }).setOrigin(0.5).setDepth(1205);
        this.tweens.add({ targets: bolt, y: worldY - 40, alpha: 0, duration: 650, ease: 'Quad.easeOut', onComplete: () => bolt.destroy() });

        // Central sparkle
        const sparkle = this.add.circle(worldX, worldY, 9, 0xffffff, 1.0).setDepth(1203);
        this.tweens.add({ targets: sparkle, scaleX: 3.0, scaleY: 3.0, alpha: 0, duration: 350, ease: 'Cubic.easeOut', onComplete: () => sparkle.destroy() });
    }

    /** Ember shower + fire burst for when a flame tile is matched. */
    spawnFlameTileMatchEffect(worldX, worldY) {
        const color  = 0xff6600;
        const orange = 0xff9900;
        const yellow = 0xffee00;
        // Hot white flash
        const flash = this.add.rectangle(worldX, worldY, TILE_SIZE - 2, TILE_SIZE - 2, 0xffffff, 1.0).setDepth(1202);
        this.tweens.add({ targets: flash, alpha: 0, scaleX: 2.6, scaleY: 2.6, duration: 340, ease: 'Quad.easeOut', onComplete: () => flash.destroy() });

        // Fire-colored rings
        [[0xffffff, 3, 4.5, 720], [orange, 3, 3.2, 580], [color, 2, 2.2, 460]].forEach(([c, stroke, scale, dur]) => {
            const ring = this.add.circle(worldX, worldY, 10, c, 0).setStrokeStyle(stroke, c, 0.95).setDepth(1200);
            this.tweens.add({ targets: ring, scaleX: scale, scaleY: scale, alpha: 0, duration: dur, ease: 'Cubic.easeOut', onComplete: () => ring.destroy() });
        });

        // Ember shards shooting upward with gravity
        const emberColors = [color, orange, yellow, 0xffffff];
        for (let i = 0; i < 12; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;  // mostly upward spread
            const dist  = 36 + Math.random() * 44;
            const c     = emberColors[Math.floor(Math.random() * emberColors.length)];
            const sz    = 4 + Math.random() * 7;
            const ember = this.add.rectangle(worldX, worldY, sz, sz * 0.6, c, 1.0).setDepth(1199).setRotation(Math.random() * Math.PI * 2);
            this.tweens.add({
                targets: ember,
                x: worldX + Math.cos(angle) * dist,
                y: worldY + Math.sin(angle) * dist + 18,  // slight fall arc
                alpha: 0,
                scaleX: 0.1,
                scaleY: 0.1,
                duration: 500 + Math.random() * 280,
                ease: 'Quad.easeOut',
                onComplete: () => ember.destroy()
            });
        }

        // Fire emoji
        const fire = this.add.text(worldX, worldY - 4, '🔥', { fontSize: '24px' }).setOrigin(0.5).setDepth(1205);
        this.tweens.add({ targets: fire, y: worldY - 42, alpha: 0, duration: 720, ease: 'Quad.easeOut', onComplete: () => fire.destroy() });

        // Central hot sparkle
        const sparkle = this.add.circle(worldX, worldY, 9, 0xffffff, 1.0).setDepth(1203);
        this.tweens.add({ targets: sparkle, scaleX: 3.2, scaleY: 3.2, alpha: 0, duration: 400, ease: 'Cubic.easeOut', onComplete: () => sparkle.destroy() });
    }

    /** Draws a jagged lightning bolt from (fromX,fromY) to (toX,toY) and fades it. */
    spawnLightningBolt(fromX, fromY, toX, toY) {
        const segments = 7;
        const gfx = this.add.graphics().setDepth(1096);
        gfx.lineStyle(2, 0x88ffff, 1);
        gfx.beginPath();
        gfx.moveTo(fromX, fromY);
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const mx = fromX + (toX - fromX) * t + Phaser.Math.Between(-14, 14);
            const my = fromY + (toY - fromY) * t + Phaser.Math.Between(-14, 14);
            gfx.lineTo(mx, my);
        }
        gfx.lineTo(toX, toY);
        gfx.strokePath();
        // Bright flash at impact point
        const flash = this.add.circle(toX, toY, 8, 0xeeffff, 0.85).setDepth(1097);
        if (this.skillChargeFxContainer) {
            this.skillChargeFxContainer.add([gfx, flash]);
        }
        this.tweens.add({
            targets: [gfx, flash],
            alpha: 0,
            duration: 220,
            ease: 'Quad.easeOut',
            onComplete: () => { gfx.destroy(); flash.destroy(); }
        });
    }

    /** Spawns falling snowflake particles over the enemy area for Blizzard. */
    spawnBlizzardEffect(enemies) {
        const flakeCount = 18 + (enemies ? enemies.length * 3 : 0);
        const minX = 230;
        const maxX = 360;
        for (let i = 0; i < flakeCount; i++) {
            const x = Phaser.Math.Between(minX, maxX);
            const flake = this.add.text(x, -10, '❄', {
                fontSize: `${Phaser.Math.Between(10, 20)}px`,
                color: Phaser.Math.RND.pick(['#aaddff', '#88bbff', '#ffffff'])
            }).setOrigin(0.5).setDepth(1095).setAlpha(0.92);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(flake);
            this.tweens.add({
                targets: flake,
                y: GRID_OFFSET_Y + GRID_HEIGHT * TILE_SIZE + 20,
                x: x + Phaser.Math.Between(-25, 25),
                alpha: 0,
                delay: i * 40,
                duration: Phaser.Math.Between(650, 1100),
                ease: 'Quad.easeIn',
                onComplete: () => flake.destroy()
            });
        }
    }

    /** Spawns a horizontal golden slash sweep across the enemy area for Cleave. */
    spawnCleaveEffect(enemies) {
        const x1 = GRID_OFFSET_X + GRID_WIDTH * TILE_SIZE * 0.38;
        const x2 = GRID_OFFSET_X + GRID_WIDTH * TILE_SIZE + 20;
        const y = enemies.length > 0
            ? enemies.reduce((s, e) => s + e.pos.y, 0) / enemies.length
            : FIGHT_PANEL_Y + 50;
        const gfx = this.add.graphics().setDepth(1096);
        gfx.lineStyle(5, 0xffdd44, 0.95);
        gfx.beginPath();
        gfx.moveTo(x1, y - 12);
        gfx.lineTo(x2, y + 8);
        gfx.strokePath();
        gfx.lineStyle(2, 0xffffff, 0.7);
        gfx.beginPath();
        gfx.moveTo(x1, y - 6);
        gfx.lineTo(x2, y + 14);
        gfx.strokePath();
        const flash = this.add.rectangle(
            (x1 + x2) / 2, y, x2 - x1 + 8, 28, 0xffee88, 0.22
        ).setOrigin(0.5).setDepth(1095);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add([gfx, flash]);
        this.tweens.add({
            targets: [gfx, flash],
            alpha: 0,
            duration: 280,
            ease: 'Quad.easeOut',
            onComplete: () => { gfx.destroy(); flash.destroy(); }
        });
    }

    /** Spawns small glowing projectiles flying from the player toward each enemy target. */
    spawnMissilesEffect(targets) {
        const fromX = 97;  // hero body center X
        const fromY = 90;  // hero body center Y (torso)
        targets.forEach((enemy, i) => {
            const delay = i * 160;
            const orb = this.add.circle(fromX, fromY, 5, 0xff88ff, 0.95).setDepth(1097);
            const trail = this.add.circle(fromX, fromY, 9, 0xcc44ff, 0.3).setDepth(1096);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add([trail, orb]);
            this.tweens.add({
                targets: [orb, trail],
                x: enemy.pos.x,
                y: enemy.pos.y - 20,
                delay,
                duration: 220,
                ease: 'Quad.easeIn',
                onComplete: () => {
                    const burst = this.add.circle(enemy.pos.x, enemy.pos.y - 20, 14, 0xff88ff, 0.7).setDepth(1097);
                    if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(burst);
                    this.tweens.add({
                        targets: burst, scaleX: 2.2, scaleY: 2.2, alpha: 0,
                        duration: 180, ease: 'Quad.easeOut',
                        onComplete: () => burst.destroy()
                    });
                    orb.destroy(); trail.destroy();
                }
            });
        });
    }

    /** Spawns arrow-line projectiles flying from the player to a single target. */
    spawnMultishotEffect(target, count) {
        const fromX = 97;  // hero body center X
        const fromY = 90;  // hero body center Y (torso)
        for (let i = 0; i < count; i++) {
            const delay = i * 80;
            const offsetY = (i - (count - 1) / 2) * 10;
            const gfx = this.add.graphics().setDepth(1096);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(gfx);
            let progress = 0;
            const toX = target.pos.x + Phaser.Math.Between(-10, 10);
            const toY = target.pos.y - 20 + offsetY;
            const tween = this.tweens.addCounter({
                from: 0, to: 1, delay, duration: 180, ease: 'Linear',
                onUpdate: (t) => {
                    progress = t.getValue();
                    const cx = fromX + (toX - fromX) * progress;
                    const cy = (fromY + offsetY) + (toY - fromY - offsetY) * progress;
                    const bx = fromX + (toX - fromX) * Math.max(0, progress - 0.25);
                    const by = (fromY + offsetY) + (toY - fromY - offsetY) * Math.max(0, progress - 0.25);
                    gfx.clear();
                    gfx.lineStyle(2, 0x88ff88, 0.9);
                    gfx.beginPath(); gfx.moveTo(bx, by); gfx.lineTo(cx, cy); gfx.strokePath();
                    gfx.fillStyle(0xffffff, 0.95);
                    gfx.fillCircle(cx, cy, 3);
                },
                onComplete: () => {
                    const burst = this.add.circle(toX, toY, 8, 0x44ff88, 0.75).setDepth(1097);
                    if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(burst);
                    this.tweens.add({
                        targets: burst, scaleX: 2, scaleY: 2, alpha: 0,
                        duration: 140, ease: 'Quad.easeOut',
                        onComplete: () => burst.destroy()
                    });
                    gfx.destroy();
                }
            });
        }
    }

    /** Duck and Roll: dash blur streaking toward the target then an impact flash. */
    spawnDuckRollEffect(target) {
        const fromX = 97;  // hero body center X
        const fromY = 90;  // hero body center Y (torso)
        for (let i = 0; i < 4; i++) {
            const blur = this.add.rectangle(fromX + i * 18, fromY, 30, 10, 0x88eeff, 0.55 - i * 0.1)
                .setOrigin(0.5).setDepth(1096);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(blur);
            this.tweens.add({
                targets: blur, x: target.pos.x - 18 + i * 10, alpha: 0,
                delay: i * 25, duration: 190 + i * 30, ease: 'Quad.easeIn',
                onComplete: () => blur.destroy()
            });
        }
        this.time.delayedCall(160, () => {
            const flash = this.add.circle(target.pos.x, target.pos.y - 10, 18, 0x88eeff, 0.75).setDepth(1097);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(flash);
            this.tweens.add({
                targets: flash, scaleX: 2.8, scaleY: 2.8, alpha: 0, duration: 200, ease: 'Quad.easeOut',
                onComplete: () => flash.destroy()
            });
        });
    }

    /** Energy Beam: sustained glowing beam from player to enemy with impact burst. */
    spawnEnergyBeamEffect(target) {
        const fromX = 97;  // hero body center X
        const fromY = 90;  // hero body center Y (torso)
        const toX = target.pos.x;
        const toY = target.pos.y - 10;
        const gfx = this.add.graphics().setDepth(1096);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(gfx);
        this.tweens.addCounter({
            from: 0, to: 1, duration: 380,
            onUpdate: (t) => {
                const p = t.getValue();
                const ex = fromX + (toX - fromX) * Math.min(1, p * 1.8);
                const ey = fromY + (toY - fromY) * Math.min(1, p * 1.8);
                gfx.clear();
                gfx.lineStyle(10, 0x0088ff, 0.22);
                gfx.beginPath(); gfx.moveTo(fromX, fromY); gfx.lineTo(ex, ey); gfx.strokePath();
                gfx.lineStyle(4, 0x44bbff, 0.9 - p * 0.3);
                gfx.beginPath(); gfx.moveTo(fromX, fromY); gfx.lineTo(ex, ey); gfx.strokePath();
            },
            onComplete: () => {
                this.tweens.add({ targets: gfx, alpha: 0, duration: 130, onComplete: () => gfx.destroy() });
                const burst = this.add.circle(toX, toY, 18, 0x44bbff, 0.8).setDepth(1097);
                if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(burst);
                this.tweens.add({
                    targets: burst, scaleX: 2.5, scaleY: 2.5, alpha: 0, duration: 220, ease: 'Quad.easeOut',
                    onComplete: () => burst.destroy()
                });
            }
        });
    }

    /** Guinea Pig Lich attack: dark-green evil energy bolt from enemy to hero. */
    spawnEvilEnergyEffect(enemy) {
        const fromX = enemy.pos.x;
        // Use actual sprite position if available (accounts for spritePosYOffset)
        const fromY = (enemy.enemySprite ? enemy.enemySprite.y : enemy.pos.y) - 20;
        const toX = 97;   // hero body center X
        const toY = 90;   // hero body center Y (torso)

        // Trailing dark-green orbs that streak toward the hero
        for (let k = 0; k < 10; k++) {
            this.time.delayedCall(k * 30, () => {
                const orb = this.add.circle(
                    fromX + Phaser.Math.Between(-12, 12),
                    fromY + Phaser.Math.Between(-12, 12),
                    Phaser.Math.Between(3, 8),
                    Phaser.Math.RND.pick([0x00ff44, 0x22cc33, 0x44ff88, 0x003311, 0x11aa22]),
                    0.88
                ).setDepth(1097);
                if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(orb);
                this.tweens.add({
                    targets: orb,
                    x: toX + Phaser.Math.Between(-18, 18),
                    y: toY + Phaser.Math.Between(-18, 18),
                    alpha: 0,
                    scaleX: 2.2,
                    scaleY: 2.2,
                    duration: 370,
                    ease: 'Quad.easeIn',
                    onComplete: () => orb.destroy()
                });
            });
        }

        // Main energy beam (dark green, wispy)
        const gfx = this.add.graphics().setDepth(1096);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(gfx);
        this.tweens.addCounter({
            from: 0, to: 1, duration: 420,
            onUpdate: (t) => {
                const p = t.getValue();
                const ex = fromX + (toX - fromX) * Math.min(1, p * 1.8);
                const ey = fromY + (toY - fromY) * Math.min(1, p * 1.8);
                gfx.clear();
                gfx.lineStyle(12, 0x003311, 0.28);
                gfx.beginPath(); gfx.moveTo(fromX, fromY); gfx.lineTo(ex, ey); gfx.strokePath();
                gfx.lineStyle(5, 0x22ff44, 0.85 - p * 0.3);
                gfx.beginPath(); gfx.moveTo(fromX, fromY); gfx.lineTo(ex, ey); gfx.strokePath();
                gfx.lineStyle(2, 0x88ffaa, 0.6 - p * 0.2);
                gfx.beginPath(); gfx.moveTo(fromX, fromY); gfx.lineTo(ex, ey); gfx.strokePath();
            },
            onComplete: () => {
                this.tweens.add({ targets: gfx, alpha: 0, duration: 140, onComplete: () => gfx.destroy() });
                const burst = this.add.circle(toX, toY, 22, 0x22ff44, 0.72).setDepth(1098);
                if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(burst);
                this.tweens.add({
                    targets: burst, scaleX: 3.0, scaleY: 3.0, alpha: 0, duration: 260,
                    ease: 'Quad.easeOut', onComplete: () => burst.destroy()
                });
            }
        });
    }

    /** Guinea Pig Lich cursed aura tick: wispy skulls drift from the Lich toward the hero. */
    spawnCursedAuraTick(enemy) {
        const icons = ['\u2620\ufe0f', '\ud83d\udc80', '\u2728'];
        // Use actual sprite Y so particles come from the correct position (accounts for spritePosYOffset)
        const spriteY = (enemy.enemySprite ? enemy.enemySprite.y : enemy.pos.y);
        for (let i = 0; i < 4; i++) {
            const tx = enemy.pos.x + Phaser.Math.Between(-22, 22);
            const ty = spriteY - Phaser.Math.Between(8, 28);
            const emb = this.add.text(tx, ty, Phaser.Math.RND.pick(icons),
                { fontSize: `${Phaser.Math.Between(10, 17)}px` }
            ).setOrigin(0.5).setDepth(1096).setAlpha(0.9);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(emb);
            this.tweens.add({
                targets: emb,
                x: 97 + Phaser.Math.Between(-14, 14),
                y: 90,
                alpha: 0,
                duration: 620,
                ease: 'Quad.easeOut',
                onComplete: () => emb.destroy()
            });
        }
    }

    /** Reckless Attack: large red X slash on a single target. */
    spawnRecklessAttackEffect(target) {
        const tx = target.pos.x, ty = target.pos.y - 10;
        const gfx = this.add.graphics().setDepth(1096);
        gfx.lineStyle(12, 0xff5500, 0.32);
        gfx.beginPath(); gfx.moveTo(tx - 32, ty - 32); gfx.lineTo(tx + 32, ty + 32); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(tx + 32, ty - 32); gfx.lineTo(tx - 32, ty + 32); gfx.strokePath();
        gfx.lineStyle(5, 0xff2200, 0.95);
        gfx.beginPath(); gfx.moveTo(tx - 32, ty - 32); gfx.lineTo(tx + 32, ty + 32); gfx.strokePath();
        gfx.beginPath(); gfx.moveTo(tx + 32, ty - 32); gfx.lineTo(tx - 32, ty + 32); gfx.strokePath();
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(gfx);
        const flash = this.add.circle(tx, ty, 22, 0xff2200, 0.5).setDepth(1095);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(flash);
        this.tweens.add({
            targets: [gfx, flash], alpha: 0, duration: 320, ease: 'Quad.easeOut',
            onComplete: () => { gfx.destroy(); flash.destroy(); }
        });
    }

    /** Cloak of Flames: fire burst radiating outward from the player. */
    spawnCloakCastEffect() {
        const cx = 97;  // hero body center X
        const cy = 90;  // hero body center Y (torso)
        const icons = ['🔥', '🔥', '💥', '✨'];
        for (let i = 0; i < 14; i++) {
            const angle = (i / 14) * Math.PI * 2;
            const dist = Phaser.Math.Between(38, 85);
            const emb = this.add.text(cx, cy, Phaser.Math.RND.pick(icons),
                { fontSize: `${Phaser.Math.Between(12, 22)}px` }
            ).setOrigin(0.5).setDepth(1096);
            if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(emb);
            this.tweens.add({
                targets: emb, x: cx + Math.cos(angle) * dist, y: cy + Math.sin(angle) * dist - 18,
                alpha: 0, scaleX: 0.3, scaleY: 0.3, delay: i * 18,
                duration: Phaser.Math.Between(330, 490), ease: 'Quad.easeOut',
                onComplete: () => emb.destroy()
            });
        }
        const ring = this.add.circle(cx, cy, 8, 0xff6600, 0.9).setDepth(1097);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.add(ring);
        this.tweens.add({
            targets: ring, scaleX: 5.5, scaleY: 5.5, alpha: 0, duration: 360, ease: 'Quad.easeOut',
            onComplete: () => ring.destroy()
        });
    }

    cycleSupportGem(slotIndex, socketIndex) {
        if (!this.playerSkills[slotIndex]) return;
        if (socketIndex < 0 || socketIndex > 2) return;

        const slot = this.playerSkills[slotIndex];
        const currentId = slot.supportIds[socketIndex] || null;
        const choices = [null, ...SUPPORT_SKILL_GEMS.map(gem => gem.id)];
        const currentChoiceIndex = choices.indexOf(currentId);
        const nextChoiceIndex = (currentChoiceIndex + 1) % choices.length;
        slot.supportIds[socketIndex] = choices[nextChoiceIndex];

        const supportName = choices[nextChoiceIndex]
            ? this.getSupportGemById(choices[nextChoiceIndex]).name
            : 'Empty';
        this.updateSkillBarUI();
        this.addCombatLog(`Skill ${slotIndex + 1} Support ${socketIndex + 1}: ${supportName}`, '#a8ffa8');
    }

    createSkillBar() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        this.skillBarContainer = this.add.container(0, 0);

        // Arrange skill slots along the bottom, not touching tiles
        // Tuned so icons are larger while staying below the grid (bottom = 630) and labels fit above screen bottom
        const minGap = 16;
        const edgePad = 26;
        const bottomPad = 44;
        const iconDiameter = Math.min(170, Math.floor((width - 2 * edgePad - 2 * minGap) / 3));
        const iconRadius = iconDiameter / 2;
        const slotSpacing = minGap;
        // Place barY at the bottom, above bottomPad
        const barY = height - iconRadius - bottomPad;

        this.skillSlotUI = [];
        for (let i = 0; i < 3; i++) {
            // Center the three slots with even spacing
            const centerX = edgePad + iconRadius + i * (iconDiameter + slotSpacing);

            // Skill icon image
            const skillIcon = this.add.image(centerX, barY, 'skill_cleave')
                .setOrigin(0.5)
                .setVisible(false);

            // Skill icon text fallback (emoji for non-image skills)
            const skillIconText = this.add.text(centerX, barY, '', {
                fontSize: '38px'
            }).setOrigin(0.5).setVisible(false);

            // Invisible interactive hitbox on top
            const bg = this.add.rectangle(centerX, barY, iconDiameter + 12, iconDiameter + 12, 0x000000, 0)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // Skill name label below icon
            const nameLabel = this.add.text(centerX, barY + iconRadius + 8, '', {
                fontSize: '16px',
                color: '#cccccc',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Charge text below name
            const threshold = this.add.text(centerX, barY + iconRadius + 30, '', {
                fontSize: '13px',
                color: '#d5d5d5'
            }).setOrigin(0.5);

            // Long press: show popup; short tap: activate skill
            let pressStartTime = 0;
            let longPressTriggered = false;

            bg.on('pointerdown', (pointer) => {
                // If gem inventory is open, do not start long press
                if (this.gemInventoryPopup && this.gemInventoryPopup.visible) return;
                pressStartTime = Date.now();
                longPressTriggered = false;
                const slotIndex = i;
                this.skillLongPressTimer = this.time.delayedCall(400, () => {
                    longPressTriggered = true;
                    this.showSkillInfoPopup(slotIndex);
                });
            });

            bg.on('pointerup', () => {
                if (this.skillLongPressTimer) {
                    this.skillLongPressTimer.remove(false);
                    this.skillLongPressTimer = null;
                }
                // If gem inventory is open, do not activate or show popup
                if (this.gemInventoryPopup && this.gemInventoryPopup.visible) return;
                if (!longPressTriggered) {
                    this.activateSkillSlot(i);
                } else {
                    // Long-press popup closes when finger lifts
                    this.skillInfoPopup.setVisible(false);
                }
            });

            bg.on('pointerout', () => {
                if (this.skillLongPressTimer) {
                    this.skillLongPressTimer.remove(false);
                    this.skillLongPressTimer = null;
                }
            });

            // Aura on/off indicator: a glowing ring + corner dot badge
            const auraRing = this.add.graphics();
            const auraDot = this.add.circle(
                centerX + Math.round(iconRadius * 0.72),
                barY   - Math.round(iconRadius * 0.72),
                8, 0x555555, 0.85
            ).setVisible(false);
            const auraDotText = this.add.text(
                centerX + Math.round(iconRadius * 0.72),
                barY   - Math.round(iconRadius * 0.72),
                '', { fontSize: '7px', color: '#ffffff', fontStyle: 'bold' }
            ).setOrigin(0.5).setVisible(false);

            this.skillSlotUI.push({
                bg, skillIcon, skillIconText,
                iconDiameter, iconRadius, centerX, centerY: barY,
                nameLabel, threshold, auraRing, auraDot, auraDotText, pulseTween: null
            });
            this.skillBarContainer.add([bg, skillIcon, skillIconText, nameLabel, threshold, auraRing, auraDot, auraDotText]);
        }

        // --- Skill Info Popup (hidden by default) ---
        this.skillInfoPopup = this.add.container(width / 2, height / 2).setVisible(false).setDepth(2000);
        const popupBg = this.add.rectangle(0, 0, 330, 310, 0x1a1a2e, 0.97)
            .setStrokeStyle(2, 0x6a6aff, 0.85)
            .setOrigin(0.5);
        const popupName = this.add.text(0, -138, '', {
            fontSize: '16px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const popupMode = this.add.text(0, -118, '', {
            fontSize: '13px', color: '#aaaaee'
        }).setOrigin(0.5);
        const popupDivider1 = this.add.rectangle(0, -103, 300, 1, 0x4444aa, 0.6).setOrigin(0.5);
        const popupDamage = this.add.text(0, -76, '', {
            fontSize: '44px', color: '#ff9944', fontStyle: 'bold'
        }).setOrigin(0.5);
        const popupDamageLabel = this.add.text(0, -38, '', {
            fontSize: '12px', color: '#aa7733'
        }).setOrigin(0.5);
        const popupCharge = this.add.text(0, -15, '', {
            fontSize: '12px', color: '#aaddaa'
        }).setOrigin(0.5);
        const popupDivider2 = this.add.rectangle(0, -5, 300, 1, 0x4444aa, 0.6).setOrigin(0.5);
        const popupSupportTitle = this.add.text(0, 8, '', {
            fontSize: '13px', color: '#ccccff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const popupSupports = this.add.text(0, 48, '', {
            fontSize: '12px', color: '#ccccbb',
            wordWrap: { width: 300, useAdvancedWrap: true },
            align: 'center',
            lineSpacing: 6
        }).setOrigin(0.5, 0);
        const popupCloseBtn = this.add.text(0, 136, '[  Close  ]', {
            fontSize: '13px', color: '#ffaaaa', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        popupCloseBtn.on('pointerup', () => this.skillInfoPopup.setVisible(false));

        this.skillInfoPopup.add([popupBg, popupName, popupMode, popupDivider1, popupDamage, popupDamageLabel, popupCharge, popupDivider2, popupSupportTitle, popupSupports, popupCloseBtn]);
        this.skillInfoPopup.popupName = popupName;
        this.skillInfoPopup.popupMode = popupMode;
        this.skillInfoPopup.popupDamage = popupDamage;
        this.skillInfoPopup.popupDamageLabel = popupDamageLabel;
        this.skillInfoPopup.popupCharge = popupCharge;
        this.skillInfoPopup.popupSupportTitle = popupSupportTitle;
        this.skillInfoPopup.popupSupports = popupSupports;
        this.skillInfoPopup.popupCloseBtn = popupCloseBtn;

        this.updateSkillBarUI();
    }

    showSkillInfoPopup(slotIndex, showCloseBtn = false) {
        const loadout = this.playerSkills[slotIndex];
        if (!loadout) return;
        const activeSkill = this.getActiveSkillById(loadout.activeId);
        if (!activeSkill) return;

        const tileData = this.getTileDataForEffect(activeSkill.tileEffect);
        const thresholdVal = this.getSkillTriggerThreshold(loadout);
        const currentCharge = this.skillCharge[activeSkill.tileEffect] || 0;
        const supports = (loadout.supportIds || []).map(id => this.getSupportGemById(id)).filter(Boolean);

        let modeLabel;
        if (activeSkill.mode === 'damage-all') {
            modeLabel = 'Deals damage to ALL enemies';
        } else if (activeSkill.mode === 'damage-all-chill') {
            modeLabel = 'Cold damage to ALL enemies + Slows 2 turns';
        } else if (activeSkill.mode === 'damage-random-2-4') {
            modeLabel = 'Lightning: 2–4 random bolt strikes';
        } else if (activeSkill.mode === 'damage-random-4') {
            modeLabel = 'Fires 4 missiles at random enemies';
        } else if (activeSkill.mode === 'damage-repeat-target') {
            modeLabel = 'Rapid multi-hit on current target';
        } else if (activeSkill.mode === 'cloak-aura') {
            modeLabel = 'Fire aura: burns all enemies each turn';
        } else if (activeSkill.mode === 'damage') {
            modeLabel = 'Deals damage to current enemy';
        } else if (activeSkill.mode === 'heal') {
            modeLabel = 'Restores your health';
        } else if (activeSkill.mode === 'transform-gold-to-health') {
            modeLabel = 'Transforms all gold tiles to heart tiles';
        } else if (activeSkill.mode === 'transform-frost-tiles') {
            modeLabel = '4 frost tiles: +4% cold dmg each. Cold dmg when matched';
        } else if (activeSkill.mode === 'transform-zap-tiles') {
            modeLabel = '4 zap tiles: tap to explode! Lightning dmg + destroys 4 adjacent';
        } else if (activeSkill.mode === 'transform-flame-tiles') {
            modeLabel = '4 flame tiles: spread each turn. BIG fire dmg when matched';
        } else {
            modeLabel = 'Generates gold';
        }

        // --- Estimate damage / output value ---
        const charBonuses = this.getCharacterStatBonuses();
        let statScale = 0;
        if (activeSkill.scalingStat === 'physical') statScale = charBonuses.physicalDamageBonus;
        else if (activeSkill.scalingStat === 'magic') statScale = charBonuses.magicDamageBonus;
        else if (activeSkill.scalingStat === 'ranged') statScale = charBonuses.rangedDamageBonus;
        else if (activeSkill.scalingStat === 'health') {
            const gearTotals = this.getEquippedStatTotals();
            statScale = Math.floor((gearTotals.health || 0) / 10);
        }
        const supportMultiplier = supports.reduce((m, g) => m + (g.powerMultiplier || 0), 1);
        const flatSupportDamage = supports.reduce((s, g) => s + (g.flatDamage || 0), 0);
        const estimatedOutput = Math.max(1, Math.round((activeSkill.basePower + statScale) * supportMultiplier)) + flatSupportDamage;

        const isDamageMode = activeSkill.mode && activeSkill.mode.startsWith('damage');
        const isHealMode = activeSkill.mode === 'heal';
        const isGoldMode = activeSkill.mode === 'loot';
        let outputLabel = isDamageMode ? 'Est. Damage per Cast'
            : isHealMode ? 'Est. Healing per Cast'
            : isGoldMode ? 'Est. Gold per Cast' : 'Est. Output';
        let outputColor = isDamageMode ? '#ff9944' : isHealMode ? '#66dd88' : isGoldMode ? '#ffdd44' : '#ffffff';

        // --- Per-support breakdown ---
        const supportLines = supports.map(s => {
            const parts = [];
            if (s.powerMultiplier) parts.push(`+${Math.round(s.powerMultiplier * 100)}% damage`);
            if (s.flatDamage) parts.push(`+${s.flatDamage} flat ${s.element || 'elemental'} dmg`);
            if (s.thresholdDelta < 0) parts.push(`${s.thresholdDelta} threshold`);
            if (s.thresholdDelta > 0) parts.push(`+${s.thresholdDelta} threshold`);
            if (s.healFlat) parts.push(`+${s.healFlat} healing`);
            if (s.goldFlat) parts.push(`+${s.goldFlat} gold`);
            if (s.extraHitChance) parts.push(`${Math.round(s.extraHitChance * 100)}% echo hit`);
            return `${s.short}: ${parts.join(', ')}`;
        });
        const supportBody = supportLines.length > 0 ? supportLines.join('\n') : 'No support gems equipped';
        const supportTitle = supportLines.length > 0 ? `Support Gem Effects (${supports.length})` : 'Support Gems';

        const popup = this.skillInfoPopup;
        popup.popupName.setText(activeSkill.name);
        popup.popupName.setColor(this.toHexColor(tileData ? tileData.color : 0xffffff));
        popup.popupMode.setText(modeLabel);
        popup.popupDamage.setText(String(estimatedOutput));
        popup.popupDamage.setColor(outputColor);
        popup.popupDamageLabel.setText(outputLabel);
        popup.popupCharge.setText(`Charge: ${currentCharge} / ${thresholdVal}`);
        popup.popupSupportTitle.setText(supportTitle);
        popup.popupSupports.setText(supportBody);
        if (popup.popupCloseBtn) popup.popupCloseBtn.setVisible(showCloseBtn);
        popup.setVisible(true);
    }

    updateSkillBarUI() {
        if (!this.skillSlotUI || this.skillSlotUI.length === 0) return;

        this.skillSlotUI.forEach((slotUI, index) => {
            const loadout = this.playerSkills[index];
            const activeSkill = this.getActiveSkillById(loadout.activeId);
            if (!activeSkill) return;

            const tileData = this.getTileDataForEffect(activeSkill.tileEffect);
            const borderColor = tileData ? tileData.color : 0xffffff;
            const thresholdVal = this.getSkillTriggerThreshold(loadout);
            const currentCharge = this.skillCharge[activeSkill.tileEffect] || 0;
            const isReady = currentCharge >= thresholdVal;

            // Skill icon: use image for skills with art, emoji for others
            const imageKey = SKILL_ICON_MAP[activeSkill.id];
            const iconTarget = imageKey ? slotUI.skillIcon : slotUI.skillIconText;

            if (imageKey) {
                slotUI.skillIcon.setTexture(imageKey);
                const iconScale = slotUI.iconDiameter / slotUI.skillIcon.width;
                slotUI.skillIcon.setScale(iconScale);
                slotUI.skillIcon.setVisible(true);
                slotUI.skillIcon.setAlpha(1);
                slotUI.skillIconText.setVisible(false);
            } else {
                slotUI.skillIcon.setVisible(false);
                slotUI.skillIconText.setText(tileData ? tileData.icon : '◆');
                slotUI.skillIconText.setVisible(true);
                slotUI.skillIconText.setAlpha(1);
            }

            // Pulse effect when charged
            if (isReady && !slotUI.pulseTween) {
                slotUI.pulseTween = this.tweens.add({
                    targets: iconTarget,
                    scaleX: iconTarget.scaleX * 1.12,
                    scaleY: iconTarget.scaleY * 1.12,
                    alpha: 0.85,
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            } else if (!isReady && slotUI.pulseTween) {
                slotUI.pulseTween.stop();
                slotUI.pulseTween = null;
                // Reset scale
                if (imageKey) {
                    const iconScale = slotUI.iconDiameter / slotUI.skillIcon.width;
                    slotUI.skillIcon.setScale(iconScale);
                    slotUI.skillIcon.setAlpha(1);
                } else {
                    slotUI.skillIconText.setScale(1);
                    slotUI.skillIconText.setAlpha(1);
                }
            }

            slotUI.threshold.setText(`${tileData ? tileData.icon : ''} ${currentCharge}/${thresholdVal}`);
            slotUI.threshold.setColor(isReady ? '#ffffff' : '#989898');

            // Aura on/off indicator
            const isAuraSkill = activeSkill.mode === 'cloak-aura';
            const isAuraActive = isAuraSkill && !!this.cloakOfFlamesActive;
            if (slotUI.auraRing) {
                slotUI.auraRing.clear();
                if (isAuraActive) {
                    slotUI.auraRing.lineStyle(3, 0xff6a00, 1);
                    slotUI.auraRing.strokeCircle(slotUI.centerX, slotUI.centerY, slotUI.iconRadius + 6);
                }
            }
            if (slotUI.auraDot) {
                slotUI.auraDot.setFillStyle(isAuraActive ? 0xff6a00 : 0x555555, isAuraActive ? 1 : 0.75);
                slotUI.auraDot.setVisible(isAuraSkill);
            }
            if (slotUI.auraDotText) {
                slotUI.auraDotText.setText(isAuraActive ? 'ON' : 'OFF');
                slotUI.auraDotText.setColor(isAuraActive ? '#ffffff' : '#aaaaaa');
                slotUI.auraDotText.setVisible(isAuraSkill);
            }

            // Update name label
            slotUI.nameLabel.setText(activeSkill.name);
            slotUI.nameLabel.setColor(this.toHexColor(borderColor));
            slotUI.nameLabel.setAlpha(1);
        });

        this.refreshSkillsScreenUI();
    }

    getSkillGemDisplay(gem) {
        if (!gem) return { icon: '?', name: 'Unknown', typeLabel: '', imageKey: null };

        if (gem.type === 'active') {
            const activeSkill = this.getActiveSkillById(gem.id);
            const tileData = activeSkill ? this.getTileDataForEffect(activeSkill.tileEffect) : null;
            return {
                icon: tileData ? tileData.icon : '◆',
                name: activeSkill ? activeSkill.name : 'Unknown Active',
                typeLabel: 'Active',
                imageKey: activeSkill ? (SKILL_ICON_MAP[activeSkill.id] || null) : null
            };
        }

        const supportGem = this.getSupportGemById(gem.id);
        return {
            icon: supportGem ? supportGem.short : 'S',
            name: supportGem ? supportGem.name : 'Unknown Support',
            typeLabel: 'Support',
            imageKey: supportGem ? (supportGem.imageKey || null) : null
        };
    }

    getSkillGemDescription(gem) {
        if (!gem) return 'Unknown gem.';

        if (gem.type === 'active') {
            const activeSkill = this.getActiveSkillById(gem.id);
            if (!activeSkill) return 'Unknown active gem.';
            const tileData = this.getTileDataForEffect(activeSkill.tileEffect);
            let modeLabel;
            if (activeSkill.mode === 'damage-all') {
                modeLabel = 'Deals damage to ALL enemies';
            } else if (activeSkill.mode === 'damage-all-chill') {
                modeLabel = 'Cold dmg to ALL + Slows 2 turns';
            } else if (activeSkill.mode === 'damage-random-2-4') {
                modeLabel = '2–4 lightning bolts at random enemies';
            } else if (activeSkill.mode === 'cloak-aura') {
                modeLabel = 'Fire aura: burns all enemies each turn';
            } else if (activeSkill.mode === 'transform-gold-to-health') {
                modeLabel = 'Transforms all gold tiles to heart tiles';
            } else if (activeSkill.mode === 'transform-frost-tiles') {
                modeLabel = '4 frost tiles: +4% cold dmg each. Cold dmg when matched';
            } else if (activeSkill.mode === 'transform-zap-tiles') {
                modeLabel = '4 zap tiles: tap to explode! Lightning dmg + destroys 4 adjacent';
            } else if (activeSkill.mode === 'transform-flame-tiles') {
                modeLabel = '4 flame tiles: spread each turn. BIG fire dmg when matched';
            } else if (activeSkill.mode === 'damage') {
                modeLabel = 'Deals damage';
            } else if (activeSkill.mode === 'heal') {
                modeLabel = 'Restores health';
            } else {
                modeLabel = 'Generates gold';
            }
            return `${modeLabel}. Charges from ${tileData ? tileData.name : activeSkill.tileEffect} matches. Base trigger threshold: ${activeSkill.baseThreshold}. Base power: ${activeSkill.basePower}.`;
        }

        const support = this.getSupportGemById(gem.id);
        if (!support) return 'Unknown support gem.';

        const thresholdText = support.thresholdDelta === 0
            ? null
            : `${support.thresholdDelta > 0 ? '+' : ''}${support.thresholdDelta} trigger threshold`;
        const powerText = support.powerMultiplier
            ? `+${Math.round(support.powerMultiplier * 100)}% increased ${support.scalingStatFilter ? support.scalingStatFilter + ' ' : ''}skill damage`
            : null;
        const flatText = support.flatDamage
            ? `+${support.flatDamage} flat ${support.element || ''} damage per activation`
            : null;
        const healText = support.healFlat ? `+${support.healFlat} flat healing per activation` : null;
        const goldText = support.goldFlat ? `+${support.goldFlat} gold per activation` : null;
        const echoText = support.extraHitChance ? `${Math.round(support.extraHitChance * 100)}% chance for bonus echo hit` : null;
        return [thresholdText, powerText, flatText, healText, goldText, echoText].filter(Boolean).join('. ') + '.';
    }

    openSkillGemPopup(gem, inventoryIndex) {
        if (!this.skillsGemModal || !gem) return;
        this.selectedSkillGem = gem;
        this.selectedGemInventoryIndex = inventoryIndex;

        const display = this.getSkillGemDisplay(gem);
        const description = this.getSkillGemDescription(gem);

        this.skillsGemModalIcon.setText(display.icon);
        if (display.imageKey && this.skillsGemModalIconImage) {
            this.skillsGemModalIconImage.setTexture(display.imageKey);
            this.skillsGemModalIconImage.setDisplaySize(56, 56);
            this.skillsGemModalIconImage.setVisible(true);
            this.skillsGemModalIcon.setVisible(false);
        } else {
            if (this.skillsGemModalIconImage) this.skillsGemModalIconImage.setVisible(false);
            this.skillsGemModalIcon.setVisible(true);
        }
        this.skillsGemModalName.setText(display.name);
        this.skillsGemModalType.setText(`${display.typeLabel} Gem`);
        this.skillsGemModalDesc.setText(description);
        // Ensure inventory-sourced popup always shows equip/discard, not unequip
        if (this.skillsGemModalEquipBtn) this.skillsGemModalEquipBtn.setVisible(true);
        if (this.skillsGemModalDiscardBtn) this.skillsGemModalDiscardBtn.setVisible(true);
        if (this.skillsGemModalUnequipBtn) this.skillsGemModalUnequipBtn.setVisible(false);
        if (this.skillsGemModalTitle) this.skillsGemModalTitle.setText('Gem Details');
        this.skillsGemModal.setVisible(true);
        this.refreshSkillsScreenUI();
    }

    closeSkillGemPopup() {
        this.selectedGemInventoryIndex = -1;
        if (this.skillsGemModal) {
            this.skillsGemModal.setVisible(false);
        }
    }

    showSupportGemInfoPopup(gem) {
        if (!gem || !this.skillsGemModal) return;
        const display = this.getSkillGemDisplay(gem);
        const description = this.getSkillGemDescription(gem);
        if (this.skillsGemModalTitle) this.skillsGemModalTitle.setText('Support Gem');
        if (display.imageKey && this.skillsGemModalIconImage) {
            this.skillsGemModalIconImage.setTexture(display.imageKey);
            this.skillsGemModalIconImage.setDisplaySize(56, 56);
            this.skillsGemModalIconImage.setVisible(true);
            if (this.skillsGemModalIcon) this.skillsGemModalIcon.setVisible(false);
        } else {
            if (this.skillsGemModalIcon) { this.skillsGemModalIcon.setText(display.icon); this.skillsGemModalIcon.setVisible(true); }
            if (this.skillsGemModalIconImage) this.skillsGemModalIconImage.setVisible(false);
        }
        if (this.skillsGemModalName) this.skillsGemModalName.setText(display.name);
        if (this.skillsGemModalType) this.skillsGemModalType.setText('Support Gem');
        if (this.skillsGemModalDesc) this.skillsGemModalDesc.setText(description);
        if (this.skillsGemModalEquipBtn) this.skillsGemModalEquipBtn.setVisible(false);
        if (this.skillsGemModalDiscardBtn) this.skillsGemModalDiscardBtn.setVisible(false);
        if (this.skillsGemModalUnequipBtn) this.skillsGemModalUnequipBtn.setVisible(false);
        this.skillsGemModal.setVisible(true);
    }

    equipSelectedGemFromPopup() {
        if (!this.selectedSkillGem) return;
        const display = this.getSkillGemDisplay(this.selectedSkillGem);
        this.armedEquipGem = { ...this.selectedSkillGem };
        this.addCombatLog(`${display.name} selected. Tap a slot to equip.`, '#ffd56b');
        this.closeSkillGemPopup();
        this.refreshSkillsScreenUI();
    }

    discardSelectedGemFromPopup() {
        if (!this.selectedSkillGem || this.selectedGemInventoryIndex < 0) return;

        const gem = this.selectedSkillGem;
        const display = this.getSkillGemDisplay(gem);
        this.skillsInventoryGems.splice(this.selectedGemInventoryIndex, 1);

        if (gem.type === 'active') {
            const availableActive = this.skillsInventoryGems.filter(entry => entry.type === 'active');
            const fallbackActiveId = availableActive.length > 0 ? availableActive[0].id : ACTIVE_SKILL_GEMS[0].id;
            this.playerSkills.forEach(slot => {
                if (slot.activeId === gem.id) {
                    slot.activeId = fallbackActiveId;
                }
            });
        } else {
            this.playerSkills.forEach(slot => {
                slot.supportIds = slot.supportIds.map(id => (id === gem.id ? null : id));
            });
        }

        if (this.selectedSkillGem && this.selectedSkillGem.id === gem.id && this.selectedSkillGem.type === gem.type) {
            this.selectedSkillGem = null;
        }

        this.addCombatLog(`Discarded ${display.name}`, '#ff9d9d');
        this.closeSkillGemPopup();
        this.updateSkillBarUI();
        this.refreshSkillsScreenUI();
    }

    equipSelectedGemToActiveSlot(slotIndex) {
        if (!this.armedEquipGem) return;
        const equipped = this.equipGemToActiveSlot(slotIndex, this.armedEquipGem);
        if (equipped) {
            this.armedEquipGem = null;
            this.refreshSkillsScreenUI();
        }
    }

    equipSelectedGemToSupportSlot(slotIndex, socketIndex) {
        if (!this.armedEquipGem) return;
        const equipped = this.equipGemToSupportSlot(slotIndex, socketIndex, this.armedEquipGem);
        if (equipped) {
            this.armedEquipGem = null;
            this.refreshSkillsScreenUI();
        }
    }

    equipGemToActiveSlot(slotIndex, gem) {
        if (!gem || gem.type !== 'active') return false;
        if (!this.playerSkills[slotIndex]) return false;

        this.playerSkills[slotIndex].activeId = gem.id;
        this.updateSkillBarUI();
        const activeSkill = this.getActiveSkillById(gem.id);
        if (activeSkill) {
            this.addCombatLog(`Skill ${slotIndex + 1} set to ${activeSkill.name}`, '#7cdcff');
        }
        return true;
    }

    equipGemToSupportSlot(slotIndex, socketIndex, gem) {
        if (!gem || gem.type !== 'support') return false;
        if (!this.playerSkills[slotIndex]) return false;
        if (socketIndex < 0 || socketIndex > 2) return false;

        this.playerSkills[slotIndex].supportIds[socketIndex] = gem.id;
        this.updateSkillBarUI();
        const support = this.getSupportGemById(gem.id);
        if (support) {
            this.addCombatLog(`Skill ${slotIndex + 1} support ${socketIndex + 1}: ${support.name}`, '#a8ffa8');
        }
        return true;
    }

    resolveSkillGemDropTarget(worldX, worldY, gem) {
        if (!gem || !this.skillsActiveSlotUI || this.skillsActiveSlotUI.length === 0) return null;

        if (gem.type === 'active') {
            for (let slotIndex = 0; slotIndex < this.skillsActiveSlotUI.length; slotIndex++) {
                const slotUI = this.skillsActiveSlotUI[slotIndex];
                const dx = worldX - slotUI.mainCenter.x;
                const dy = worldY - slotUI.mainCenter.y;
                const radius = slotUI.mainRadius + 8;
                if (dx * dx + dy * dy <= radius * radius) {
                    return { kind: 'active', slotIndex };
                }
            }
            return null;
        }

        for (let slotIndex = 0; slotIndex < this.skillsActiveSlotUI.length; slotIndex++) {
            const slotUI = this.skillsActiveSlotUI[slotIndex];
            for (let socketIndex = 0; socketIndex < slotUI.supportSockets.length; socketIndex++) {
                const socket = slotUI.supportSockets[socketIndex];
                const dx = worldX - socket.center.x;
                const dy = worldY - socket.center.y;
                const radius = socket.radius + 8;
                if (dx * dx + dy * dy <= radius * radius) {
                    return { kind: 'support', slotIndex, socketIndex };
                }
            }
        }

        return null;
    }

    handleSkillGemDrop(tile, worldX, worldY) {
        const gem = this.skillsInventoryGems[tile.index];
        if (!gem) return;

        const target = this.resolveSkillGemDropTarget(worldX, worldY, gem);
        if (!target) return;

        if (target.kind === 'active') {
            this.justDroppedSkillGem = true;
            this.equipGemToActiveSlot(target.slotIndex, gem);
        } else if (target.kind === 'support') {
            this.justDroppedSkillGem = true;
            this.equipGemToSupportSlot(target.slotIndex, target.socketIndex, gem);
        }
    }

    refreshSkillsScreenUI() {
        if (!this.skillsScreenGroup || !this.skillsActiveSlotUI || this.skillsActiveSlotUI.length === 0) return;

        const armedType = this.armedEquipGem ? this.armedEquipGem.type : null;

        this.skillsActiveSlotUI.forEach((slotUI, slotIndex) => {
            const loadout = this.playerSkills[slotIndex];
            if (!loadout) return;

            const activeSkill = this.getActiveSkillById(loadout.activeId);
            const tileData = activeSkill ? this.getTileDataForEffect(activeSkill.tileEffect) : null;
            const threshold = this.getSkillTriggerThreshold(loadout);
            const charge = activeSkill ? (this.skillCharge[activeSkill.tileEffect] || 0) : 0;
            const isReady = charge >= threshold;
            const borderColor = tileData ? tileData.color : 0xffffff;

            const activeTargetAlpha = 1; // Skills page: always full brightness
            // Borderless main gems: brighten fill when ready / armed
            slotUI.cardBg.setFillStyle(
                armedType === 'active' ? 0x564428 : (isReady ? 0x484860 : 0x343448), 1
            );
            const slotImageKey = activeSkill ? (SKILL_ICON_MAP[activeSkill.id] || null) : null;
            if (slotImageKey && slotUI.skillIconImage) {
                slotUI.skillIconImage.setTexture(slotImageKey);
                const iconDiam = slotUI.mainRadius * 2 + 2; // cover circle bg fully
                slotUI.skillIconImage.setDisplaySize(iconDiam, iconDiam);
                slotUI.skillIconImage.setAlpha(activeTargetAlpha);
                slotUI.skillIconImage.setVisible(true);
                slotUI.iconText.setVisible(false);
            } else {
                if (slotUI.skillIconImage) slotUI.skillIconImage.setVisible(false);
                slotUI.iconText.setText(tileData ? tileData.icon : '◆');
                slotUI.iconText.setAlpha(activeTargetAlpha);
                slotUI.iconText.setVisible(true);
            }
            slotUI.nameText.setText(activeSkill ? activeSkill.name : 'None');
            slotUI.nameText.setColor(this.toHexColor(borderColor));
            slotUI.chargeText.setText(`${charge}/${threshold}`);
            slotUI.chargeText.setColor(isReady ? '#ffffff' : '#9a9a9a');

            slotUI.supportSockets.forEach((socketUI, socketIndex) => {
                const supportId = loadout.supportIds[socketIndex];
                const supportGem = this.getSupportGemById(supportId);
                const supportImageKey = supportGem ? (supportGem.imageKey || null) : null;
                if (supportImageKey && socketUI.socketImage) {
                    socketUI.socketImage.setTexture(supportImageKey);
                    socketUI.socketImage.setDisplaySize(socketUI.radius * 2 + 2, socketUI.radius * 2 + 2);
                    socketUI.socketImage.setVisible(true);
                    socketUI.socketText.setVisible(false);
                } else {
                    if (socketUI.socketImage) socketUI.socketImage.setVisible(false);
                    socketUI.socketText.setText(supportGem ? supportGem.short : '·');
                    socketUI.socketText.setVisible(true);
                }
                if (armedType === 'support') {
                    socketUI.socketBg.setStrokeStyle(2, 0xfff07a, 1);
                } else {
                    socketUI.socketBg.setStrokeStyle(0, 0x000000, 0);
                }
                if (socketUI.connector) {
                    socketUI.connector.setStrokeStyle(1, isReady ? borderColor : 0x8b8b8b, isReady ? 0.95 : 0.65);
                }
                if (socketUI.socketNameText) {
                    socketUI.socketNameText.setText(supportGem ? supportGem.name : '');
                }
            });

            // Update vertical column connector line colour
            if (slotUI.columnLine) {
                slotUI.columnLine.clear();
                slotUI.columnLine.lineStyle(2, isReady ? borderColor : 0x555555, isReady ? 0.85 : 0.55);
                slotUI.columnLine.beginPath();
                slotUI.columnLine.moveTo(slotUI.mainCenter.x, slotUI.mainCenter.y + slotUI.mainRadius + 2);
                slotUI.columnLine.lineTo(slotUI.mainCenter.x, (slotUI._lastSocketY || slotUI.mainCenter.y) + (slotUI._supportRadius || 30) + 2);
                slotUI.columnLine.strokePath();
            }
        });

        if (this.selectedGemLabel) {
            if (this.armedEquipGem) {
                const display = this.getSkillGemDisplay(this.armedEquipGem);
                this.selectedGemLabel.setText(`Equip Mode: ${display.name} (${display.typeLabel})`);
                this.selectedGemLabel.setColor('#fff07a');
            } else if (!this.selectedSkillGem) {
                this.selectedGemLabel.setText('Tap gem to swap  •  Hold for stats');
                this.selectedGemLabel.setColor('#888888');
            } else {
                const display = this.getSkillGemDisplay(this.selectedSkillGem);
                this.selectedGemLabel.setText(`Selected: ${display.name} (${display.typeLabel})`);
                this.selectedGemLabel.setColor('#e9f18d');
            }
        }

        if (this.skillsInventoryTiles && this.skillsInventoryTiles.length > 0) {
            this.skillsInventoryTiles.forEach(tile => {
                const gem = this.skillsInventoryGems[tile.index] || null;
                if (!gem) {
                    tile.tileBg.setVisible(false);
                    tile.iconText.setVisible(false);
                    if (tile.tileSkillIcon) tile.tileSkillIcon.setVisible(false);
                    tile.nameText.setVisible(false);
                    tile.typeText.setVisible(false);
                    return;
                }

                tile.tileBg.setVisible(true);
                tile.nameText.setVisible(true);
                tile.typeText.setVisible(true);

                tile.tileBg.x = tile.homeX;
                tile.tileBg.y = tile.homeY;
                tile.iconText.x = tile.homeX;
                tile.iconText.y = tile.homeY;
                if (tile.tileSkillIcon) {
                    tile.tileSkillIcon.x = tile.homeX;
                    tile.tileSkillIcon.y = tile.homeY;
                }
                tile.nameText.x = tile.homeX;
                tile.nameText.y = tile.homeY + 27;
                tile.typeText.x = tile.homeX;
                tile.typeText.y = tile.homeY + 39;

                const display = this.getSkillGemDisplay(gem);
                if (display.imageKey && tile.tileSkillIcon) {
                    tile.tileSkillIcon.setTexture(display.imageKey);
                    tile.tileSkillIcon.setDisplaySize(42, 42);
                    tile.tileSkillIcon.setVisible(true);
                    tile.iconText.setVisible(false);
                } else {
                    if (tile.tileSkillIcon) tile.tileSkillIcon.setVisible(false);
                    tile.iconText.setText(display.icon);
                    tile.iconText.setVisible(true);
                }
                tile.nameText.setText(display.name);
                tile.typeText.setText(display.typeLabel);

                const isSelected = this.selectedSkillGem
                    && this.selectedSkillGem.type === gem.type
                    && this.selectedSkillGem.id === gem.id;
                tile.tileBg.setStrokeStyle(2, isSelected ? 0xfff07a : 0x666666, 1);
                tile.tileBg.setFillStyle(isSelected ? 0x383220 : 0x222222, 1);
            });
        }
    }

    getSkillTriggerThreshold(skillLoadout) {
        const activeSkill = this.getActiveSkillById(skillLoadout.activeId);
        if (!activeSkill) return 99;

        const supportThresholdShift = (skillLoadout.supportIds || [])
            .map(id => this.getSupportGemById(id))
            .filter(Boolean)
            .reduce((sum, gem) => sum + (gem.thresholdDelta || 0), 0);

        return Phaser.Math.Clamp(activeSkill.baseThreshold + supportThresholdShift, 3, 8);
    }

    resolveSkillCastEffect(activeSkill, skillLoadout, availableCharge, threshold, gear) {
        const supports = (skillLoadout.supportIds || [])
            .map(id => this.getSupportGemById(id))
            .filter(Boolean);

        const charBonuses = this.getCharacterStatBonuses();
        let statBonus = 0;
        if (activeSkill.scalingStat === 'physical') statBonus = charBonuses.physicalDamageBonus;
        else if (activeSkill.scalingStat === 'magic') statBonus = charBonuses.magicDamageBonus;
        else if (activeSkill.scalingStat === 'ranged') statBonus = charBonuses.rangedDamageBonus;

        const statScale = activeSkill.scalingStat === 'health'
            ? Math.floor((gear.health || 0) / 10)
            : Math.floor((gear[activeSkill.scalingStat] || 0) * 0.75) + statBonus;

        const overChargeBonus = Math.max(0, availableCharge - threshold) * 0.1;
        const supportMultiplier = supports.reduce((mult, gem) => {
            if (gem.scalingStatFilter && gem.scalingStatFilter !== activeSkill.scalingStat) return mult;
            return mult + (gem.powerMultiplier || 0);
        }, 1);
        const totalMultiplier = supportMultiplier + overChargeBonus;
        const flatSupportDamage = supports.reduce((sum, gem) => sum + (gem.flatDamage || 0), 0);
        const rolledPower = Math.max(1, Math.round((activeSkill.basePower + statScale) * totalMultiplier)) + flatSupportDamage;

        const extraHitDamage = supports.reduce((sum, gem) => {
            if (!gem.extraHitChance || Math.random() >= gem.extraHitChance) return sum;
            return sum + Math.max(1, Math.round(rolledPower * 0.5));
        }, 0);

        const bonusHeal = supports.reduce((sum, gem) => sum + (gem.healFlat || 0), 0);
        const bonusGold = supports.reduce((sum, gem) => sum + (gem.goldFlat || 0), 0);
        const supportNames = supports.length > 0 ? ` [${supports.map(s => s.name).join(', ')}]` : '';

        const result = {
            enemyDamage: 0,
            healAmount: 0,
            lootAmount: 0
        };


        if (activeSkill.mode === 'damage') {
            result.enemyDamage += rolledPower + extraHitDamage;
            this.addCombatLog(
                `${activeSkill.name} cast for ${rolledPower + extraHitDamage} damage${supportNames}`,
                '#ffae57'
            );
        }

        // New: damage-all mode for skills like Cleave
        if (activeSkill.mode === 'damage-all') {
            // Indicate to the caller that this is an all-enemy attack
            result.enemyDamage = { all: true, value: rolledPower + extraHitDamage };
            this.addCombatLog(
                `${activeSkill.name} cleaves all enemies for ${rolledPower + extraHitDamage} damage${supportNames}`,
                '#ffae57'
            );
        }

        // damage-random-4: Minute Missiles — 4 projectiles at random alive enemies
        if (activeSkill.mode === 'damage-random-4') {
            const perHit = Math.max(1, Math.round((rolledPower + extraHitDamage) / 4));
            result.enemyDamage = { randomHits: true, hitDamages: [perHit, perHit, perHit, perHit] };
            this.addCombatLog(
                `${activeSkill.name} fires 4 missiles for ${perHit} each${supportNames}`,
                '#ffae57'
            );
        }

        // damage-repeat-target: Multishot — dex-scaled rapid hits at same target
        if (activeSkill.mode === 'damage-repeat-target') {
            const dex = (this.player.dexterity || 0) + (gear.dexterity || 0);
            const hitCount = 2 + Math.floor(dex / 20);
            const perHit = Math.max(1, Math.round((rolledPower + extraHitDamage) / hitCount));
            result.enemyDamage = { repeatTarget: true, hitDamages: Array(hitCount).fill(perHit) };
            this.addCombatLog(
                `${activeSkill.name} fires ${hitCount} shots for ${perHit} each${supportNames}`,
                '#ffae57'
            );
        }

        // damage-random-2-4: Shock and Awe — 2-4 lightning bolts at random enemies
        if (activeSkill.mode === 'damage-random-2-4') {
            const hitCount = Phaser.Math.Between(2, 4);
            const perHit = Math.max(1, Math.round((rolledPower + extraHitDamage) / 3));
            result.enemyDamage = { randomHits: true, hitDamages: Array(hitCount).fill(perHit), isLightning: true };
            this.addCombatLog(
                `${activeSkill.name} strikes ${hitCount} times for ${perHit} each${supportNames}`,
                '#aaeeff'
            );
        }

        // damage-all-chill: Blizzard — hits all + chills for reduced damage dealt
        if (activeSkill.mode === 'damage-all-chill') {
            const frostMult = 1 + this.getFrostTileColdBonus() / 100;
            const coldDmg = Math.round((rolledPower + extraHitDamage) * frostMult);
            result.enemyDamage = {
                all: true, value: coldDmg,
                chilledTurns: 2, chilledDamageMultiplier: 0.65
            };
            this.addCombatLog(
                `${activeSkill.name} blasts all for ${coldDmg} cold dmg, Slow 2 turns${supportNames}`,
                '#aaddff'
            );
        }

        // cloak-aura: Cloak of Flames — immediate fire damage to all + persistent aura
        if (activeSkill.mode === 'cloak-aura') {
            const auraDmg = Math.max(1, Math.round((activeSkill.basePower + statScale) * totalMultiplier));
            result.enemyDamage = { all: true, value: auraDmg };
            result.cloakAuraDamage = auraDmg;
            this.addCombatLog(
                `${activeSkill.name} ignites! Burns all for ${auraDmg} fire dmg/turn${supportNames}`,
                '#ff6a00'
            );
        }

        // transform-gold-to-health: Heart of Gold — converts all gold tiles to heart tiles
        if (activeSkill.mode === 'transform-gold-to-health') {
            result.transformGoldToHealth = true;
            this.addCombatLog(`${activeSkill.name}: gold tiles → heart tiles`, '#ffd700');
        }

        // transform-frost-tiles: Frostbite — places frost tiles; each boosts cold dmg 4%
        if (activeSkill.mode === 'transform-frost-tiles') {
            result.transformSpecialTiles = { type: 'frost', count: 4 };
            this.addCombatLog(`${activeSkill.name}: 4 frost tiles placed! (+4% cold dmg each)`, '#88ddff');
        }

        // transform-zap-tiles: Burst Lightning — places zap tiles; click to explode
        if (activeSkill.mode === 'transform-zap-tiles') {
            result.transformSpecialTiles = { type: 'zap', count: 4 };
            this.addCombatLog(`${activeSkill.name}: 4 zap tiles placed! Tap to explode.`, '#ffe566');
        }

        // transform-flame-tiles: Kindling — places flame tiles; spread each turn
        if (activeSkill.mode === 'transform-flame-tiles') {
            result.transformSpecialTiles = { type: 'flame', count: 4 };
            this.addCombatLog(`${activeSkill.name}: 4 flame tiles placed! They spread each turn.`, '#ff6a00');
        }

        if (activeSkill.mode === 'heal') {
            result.healAmount += rolledPower + bonusHeal;
            this.addCombatLog(
                `${activeSkill.name} cast healing +${rolledPower + bonusHeal}${supportNames}`,
                '#8dff9b'
            );
        }

        if (activeSkill.mode === 'gold') {
            result.lootAmount += rolledPower + bonusGold;
            this.addCombatLog(
                `${activeSkill.name} gold +${rolledPower + bonusGold}${supportNames}`,
                '#ffe88a'
            );
        }

        if (activeSkill.mode !== 'damage' && extraHitDamage > 0) {
            result.enemyDamage += extraHitDamage;
            this.addCombatLog(`${activeSkill.name} Echo hit for ${extraHitDamage} bonus damage`, '#ffae57');
        }

        return result;
    }

    createCombatLog() {
        // Compact strip just below grid (between grid-bottom and fight panel)
        const logY = GRID_OFFSET_Y + GRID_HEIGHT * TILE_SIZE + 12;
        const strip = this.add.rectangle(195, logY, 386, 22, 0x000000, 0.55)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.showCombatLogPopup());
        this.hudContainer.add(strip);

        const icon = this.add.text(376, logY - 7, '📜', { fontSize: '12px' }).setOrigin(1, 0);
        this.hudContainer.add(icon);

        this.combatLogLatestText = this.add.text(10, logY - 7, '', {
            fontSize: '11px', color: '#aaffcc', fontStyle: 'bold',
            wordWrap: { width: 340 }
        });
        this.hudContainer.add(this.combatLogLatestText);

        this.createCombatLogPopup();
    }

    addCombatLog(message, color) {
        this.combatLog.push({ text: message, color });
        if (this.combatLog.length > 200) this.combatLog.shift();
        this.renderCombatLog();
    }

    renderCombatLog() {
        if (!this.combatLogLatestText) return;
        if (this.combatLog.length === 0) {
            this.combatLogLatestText.setText('').setColor('#ffffff');
            return;
        }
        const latest = this.combatLog[this.combatLog.length - 1];
        this.combatLogLatestText.setText(latest.text).setColor(latest.color);
    }

    createCombatLogPopup() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;
        const PW = 370, PH = 520;
        const VISIBLE_LINES = 18;
        this._logVisibleLines = VISIBLE_LINES;
        this.logScrollIndex = 0;

        this.combatLogPopup = this.add.container(0, 0).setVisible(false).setDepth(4000);

        // 1. Dim overlay behind everything — only closes when tapping OUTSIDE the panel
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.70)
            .setInteractive()
            .on('pointerup', () => this.hideCombatLogPopup());

        // 2. Panel — must be interactive to absorb taps so they don't reach the overlay
        const panel = this.add.rectangle(W / 2, H / 2, PW, PH, 0x0d1117, 1)
            .setStrokeStyle(2, 0x3355aa)
            .setInteractive();   // swallows taps inside the panel

        // 3. Title and close button
        const title = this.add.text(W / 2, H / 2 - PH / 2 + 22, 'Combat Log', {
            fontSize: '18px', color: '#9be7ff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        const closeBtn = this.add.text(W / 2 + PW / 2 - 18, H / 2 - PH / 2 + 20, '✕', {
            fontSize: '18px', color: '#ff6666', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.hideCombatLogPopup(); });

        // 4. Scroll buttons
        const scrollY = H / 2 + PH / 2 - 22;
        const upBtn = this.add.text(W / 2 - 40, scrollY, '▲', {
            fontSize: '22px', color: '#88aaff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        upBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.scrollCombatLog(-VISIBLE_LINES); });

        const downBtn = this.add.text(W / 2 + 40, scrollY, '▼', {
            fontSize: '22px', color: '#88aaff', fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        downBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.scrollCombatLog(VISIBLE_LINES); });

        this.combatLogScrollLabel = this.add.text(W / 2, scrollY, '', {
            fontSize: '11px', color: '#777777'
        }).setOrigin(0.5);

        // Add background elements first so text lines render on top of them
        this.combatLogPopup.add([overlay, panel, title, closeBtn, upBtn, downBtn, this.combatLogScrollLabel]);

        // 5. Line text objects added AFTER backgrounds so they appear on top
        this.combatLogLineTexts = [];
        const lineH = 20;
        const startY = H / 2 - PH / 2 + 48;
        const lineX = W / 2 - PW / 2 + 12;
        for (let i = 0; i < VISIBLE_LINES; i++) {
            const lt = this.add.text(lineX, startY + i * lineH, '', {
                fontSize: '14px', color: '#ffffff'
                // No wordWrap — wrapped text overflows fixed-height slots; lines are truncated instead
            });
            this.combatLogLineTexts.push(lt);
            this.combatLogPopup.add(lt);
        }
    }

    showCombatLogPopup() {
        if (!this.combatLogPopup) return;
        // Scroll to bottom (newest messages)
        this.logScrollIndex = Math.max(0, this.combatLog.length - this._logVisibleLines);
        this.renderCombatLogPopup();
        this.combatLogPopup.setVisible(true);
    }

    hideCombatLogPopup() {
        if (this.combatLogPopup) this.combatLogPopup.setVisible(false);
    }

    scrollCombatLog(delta) {
        const maxStart = Math.max(0, this.combatLog.length - this._logVisibleLines);
        this.logScrollIndex = Math.max(0, Math.min(maxStart, this.logScrollIndex + delta));
        this.renderCombatLogPopup();
    }

    renderCombatLogPopup() {
        const vis = this._logVisibleLines;
        const MAX_CHARS = 44; // ~panel width at 14px — truncate to stop overflow
        for (let i = 0; i < vis; i++) {
            const entry = this.combatLog[this.logScrollIndex + i];
            if (entry) {
                const txt = entry.text.length > MAX_CHARS
                    ? entry.text.slice(0, MAX_CHARS - 1) + '…'
                    : entry.text;
                this.combatLogLineTexts[i].setText(txt).setColor(entry.color).setVisible(true);
            } else {
                this.combatLogLineTexts[i].setText('').setVisible(false);
            }
        }
        const total = this.combatLog.length;
        const from = total === 0 ? 0 : this.logScrollIndex + 1;
        const to = Math.min(this.logScrollIndex + vis, total);
        this.combatLogScrollLabel.setText(total > 0 ? `${from}–${to} / ${total}` : 'No messages yet');
    }

    generateStarterInventory() {
        const items = [];
        const count = Phaser.Math.Between(3, 5);
        for (let i = 0; i < count; i++) {
            items.push(this.generateLoot(5));
        }
        // Test items with legendary affixes
        for (let i = 0; i < 3; i++) {
            items.push(this.generateLoot(80, 'Legendary'));
        }
        return items;
    }

    getSlotLabel(slotGroup) {
        if (slotGroup === 'ring') return 'Ring';
        return slotGroup.charAt(0).toUpperCase() + slotGroup.slice(1);
    }

    getEquipSlotDisplayLabel(slotKey) {
        const slotLabels = {
            helmet: 'Helmet',
            necklace: 'Necklace',
            chest: 'Chest',
            belt: 'Belt',
            gloves: 'Gloves',
            boots: 'Boots',
            mainhand: 'Main Hand',
            offhand: 'Off Hand',
            ring1: 'Ring'
        };
        return slotLabels[slotKey] || this.getSlotLabel(slotKey);
    }

    getEquipmentSlotText(slotKey, equippedItem, offhandBlockedByBow) {
        if (offhandBlockedByBow && slotKey === 'offhand') {
            return '2H LOCK';
        }
        if (!equippedItem) return '';

        const baseText = equippedItem.type || equippedItem.baseName || equippedItem.name || '';
        if (baseText.length <= 11) return baseText;
        return `${baseText.slice(0, 10)}.`;
    }

    getEmptySlotIcon(slotKey) {
        const icons = {
            helmet: '🪖',
            necklace: '📿',
            chest: '🦺',
            belt: '�',
            mainhand: '🗡️',
            offhand: '🛡️',
            gloves: '🧤',
            boots: '🥾',
            ring1: '💍'
        };

        return icons[slotKey] || '◻';
    }

    pulseUiTargets(targets, scale = 1.08, duration = 90) {
        const validTargets = (targets || []).filter(Boolean);
        if (validTargets.length === 0) return;

        this.tweens.killTweensOf(validTargets);
        validTargets.forEach(target => {
            target.setScale(1);
        });

        this.tweens.add({
            targets: validTargets,
            scaleX: scale,
            scaleY: scale,
            duration,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
    }

    refreshEquipmentScreenAnimations() {
        if (this.characterStatTiles) {
            Object.values(this.characterStatTiles).forEach(tile => {
                if (!tile || !tile.cardBg) return;
                const targets = [tile.cardBg, tile.icon, tile.valueText];
                this.tweens.killTweensOf(targets);
                targets.forEach(target => target.setScale(1));
                this.tweens.add({
                    targets,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                    delay: tile.delay || 0
                });
            });
        }

        if (this.equipmentSlotGlows) {
            Object.entries(this.equipmentSlotGlows).forEach(([key, glow]) => {
                if (!glow) return;
                this.tweens.killTweensOf(glow);
                glow.setScale(1);

                // Kill any existing pulse tweens on the slot icon and frame
                const icon = this.equipmentIconText && this.equipmentIconText[key];
                const frame = this.equipmentSlotFrames && this.equipmentSlotFrames[key];
                const shell = this.equipmentSlotShells && this.equipmentSlotShells[key];
                if (icon) { this.tweens.killTweensOf(icon); icon.setScale(1); }
                if (frame) { this.tweens.killTweensOf(frame); frame.setScale(1); }
                if (shell) { this.tweens.killTweensOf(shell); shell.setScale(1); }

                if (!this.equippedItems[key]) {
                    glow.setAlpha(1);
                    return;
                }

                // Pulse the outer glow
                glow.setAlpha(0.5);
                this.tweens.add({
                    targets: glow,
                    scaleX: 1.13,
                    scaleY: 1.13,
                    alpha: 1.0,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });

                // Pulse the item icon and inner frame for a clear visual beat
                const pulseTargets = [icon, frame].filter(Boolean);
                if (pulseTargets.length > 0) {
                    this.tweens.add({
                        targets: pulseTargets,
                        scaleX: 1.1,
                        scaleY: 1.1,
                        duration: 900,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                }
            });
        }
    }

    getStatLabel(stat) {
        const labels = {
            health: 'Health',
            physical: 'Physical',
            magic: 'Magic',
            ranged: 'Ranged',
            magicFind: 'Magic Find',
            armor: 'Armor',
            energyShield: 'Energy Shield',
            evasion: 'Evasion',
            coldResistance: 'Cold Res',
            fireResistance: 'Fire Res',
            lightningResistance: 'Lightning Res',
            coldDamage: 'Cold Dam',
            fireDamage: 'Fire Dam',
            lightningDamage: 'Lightning Dam',
            leech: 'Life Leech'
        };
        return labels[stat] || stat.charAt(0).toUpperCase() + stat.slice(1);
    }

    getEquippedStatTotals() {
        const totals = {
            health: 0,
            physical: 0,
            magic: 0,
            ranged: 0,
            magicFind: 0,
            armor: 0,
            energyShield: 0,
            evasion: 0,
            lifeRegen: 0,
            leech: 0,
            // Tile spawn bonus (gear-sourced, stacks with talents)
            redTileChance: 0, greenTileChance: 0, blueTileChance: 0,
            goldTileChance: 0, pinkTileChance: 0,
            // Extra turn
            extraTurnChance: 0,
            // Damage conversions (flag: >= 1 means active)
            physToFire: 0, physToLightning: 0, physToCold: 0,
            rangedToFire: 0, rangedToLightning: 0,
            magicToCold: 0,
            // PoE-inspired unique flags
            headhunter: 0, kaomHeart: 0, ironWill: 0, aegisAurora: 0,
            rupture: 0, voidheart: 0,
            critDamage: 0,
        };

        Object.values(this.equippedItems).forEach(item => {
            if (!item || !item.stats) return;
            Object.entries(item.stats).forEach(([stat, value]) => {
                if (totals[stat] === undefined) {
                    totals[stat] = 0;
                }
                totals[stat] += value;
            });
        });

        // Juggernaut keystone: double health from gear
        const tb = this.getTalentPercentBonuses();
        if (tb.juggernaut) {
            totals.health *= 2;
        }

        return totals;
    }

    getTalentPercentBonuses() {
        const b = {
            physicalDamage: 0, magicDamage: 0, rangedDamage: 0,
            armor: 0, health: 0, energyShield: 0, evasion: 0,
            blockChance: 0, redTileChance: 0, greenTileChance: 0, blueTileChance: 0,
            allDamage: 0, fireDamage: 0, coldDamage: 0, lightningDamage: 0, critChance: 0,
            healthRegen: 0, shieldDamage: 0,
            juggernaut: false, seeRed: false, turningGreen: false, feelingBlue: false,
            parry: false, energyForm: false, blueBlooded: false,
            polarVortex: false, heatwave: false, stormyNight: false,
            frostMage: false, burningMan: false, conduit: false,
            mortalConstitution: false, lordOfThorns: false
        };
        this.allocatedTalents.forEach(nodeId => {
            const node = TALENT_NODE_MAP.get(nodeId);
            if (!node) return;
            switch (node.stat) {
                case 'physicalDamage':      b.physicalDamage      += node.value; break;
                case 'magicDamage':         b.magicDamage         += node.value; break;
                case 'rangedDamage':        b.rangedDamage        += node.value; break;
                case 'fireDamage':          b.fireDamage          += node.value;
                                            b.physicalDamage      += node.value; break;
                case 'coldDamage':          b.coldDamage          += node.value;
                                            b.magicDamage         += node.value; break;
                case 'lightningDamage':     b.lightningDamage     += node.value;
                                            b.rangedDamage        += node.value; break;
                case 'allDamage':           b.allDamage           += node.value;
                                            b.physicalDamage      += node.value;
                                            b.magicDamage         += node.value;
                                            b.rangedDamage        += node.value; break;
                case 'armor':               b.armor               += node.value; break;
                case 'health':              b.health              += node.value; break;
                case 'energyShield':        b.energyShield        += node.value; break;
                case 'evasion':             b.evasion             += node.value; break;
                case 'blockChance':         b.blockChance         += node.value; break;
                case 'redTileChance':       b.redTileChance       += node.value; break;
                case 'greenTileChance':     b.greenTileChance     += node.value; break;
                case 'blueTileChance':      b.blueTileChance      += node.value; break;
                case 'critChance':          b.critChance          += node.value; break;
                case 'healthRegen':         b.healthRegen         += node.value; break;
                case 'shieldDamage':        b.shieldDamage        += node.value; break;
                case 'juggernaut':          b.juggernaut          = true; break;
                case 'seeRed':              b.seeRed              = true; break;
                case 'turningGreen':        b.turningGreen        = true; break;
                case 'feelingBlue':         b.feelingBlue         = true; break;
                case 'parry':               b.parry               = true; break;
                case 'energyForm':          b.energyForm          = true; break;
                case 'blueBlooded':         b.blueBlooded         = true; break;
                case 'polarVortex':         b.polarVortex         = true; b.coldDamage      += 12; break;
                case 'heatwave':            b.heatwave            = true; b.fireDamage      += 12; break;
                case 'stormyNight':         b.stormyNight         = true; b.lightningDamage += 12; break;
                case 'frostMage':           b.frostMage           = true; break; // 50% magic → cold in combat
                case 'burningMan':          b.burningMan          = true; break; // 50% physical → fire in combat
                case 'conduit':             b.conduit             = true; break; // 50% ranged → lightning in combat
                case 'mortalConstitution':  b.mortalConstitution  = true; break;
                case 'lordOfThorns':        b.lordOfThorns        = true; break;
            }
        });
        return b;
    }

    getMaxHealth() {
        const tb = this.getTalentPercentBonuses();
        const gear = this.getEquippedStatTotals();
        // Kaom's Heart: all energy shield converts to health instead
        const kaomBonus = (gear.kaomHeart >= 1) ? (gear.energyShield || 0) : 0;
        const stolenBonuses = this.getStolenAffixBonuses();
        return Math.floor((20 + gear.health + kaomBonus) * (1 + tb.health / 100) * stolenBonuses.healthMult);
    }

    getRandomTileType() {
        const tb = this.getTalentPercentBonuses();
        const gear = this.getEquippedStatTotals();
        const roll = Math.random() * 100;
        // Combine talent and gear tile-chance bonuses
        const redChance   = tb.redTileChance   + (gear.redTileChance   || 0);
        const greenChance = tb.greenTileChance + (gear.greenTileChance || 0);
        const blueChance  = tb.blueTileChance  + (gear.blueTileChance  || 0);
        const goldChance  = gear.goldTileChance  || 0;
        const pinkChance  = gear.pinkTileChance  || 0;
        const cumRed   = redChance;
        const cumGreen = cumRed   + greenChance;
        const cumBlue  = cumGreen + blueChance;
        const cumGold  = cumBlue  + goldChance;
        const cumPink  = cumGold  + pinkChance;
        if (redChance   > 0 && roll < cumRed)   return 3; // physical/red
        if (greenChance > 0 && roll < cumGreen) return 2; // ranged/green
        if (blueChance  > 0 && roll < cumBlue)  return 1; // magic/blue
        if (goldChance  > 0 && roll < cumGold)  return 4; // gold
        if (pinkChance  > 0 && roll < cumPink)  return 0; // health/pink
        return Phaser.Math.Between(0, 4); // indices 5-7 are special tiles, never generated randomly
    }

    getCharacterStatBonuses() {
        const gear = this.getEquippedStatTotals();
        const str = this.player.strength + (gear.strength || 0);
        const int = this.player.intelligence + (gear.intelligence || 0);
        const dex = this.player.dexterity + (gear.dexterity || 0);
        return {
            physicalDamageBonus: Math.floor(str / 2),
            armorBonus: Math.floor(str / 5),
            magicDamageBonus: Math.floor(int / 2),
            energyShield: Math.floor(int * 0.5),
            rangedDamageBonus: Math.floor(dex / 2),
            critChance: Math.min(75, dex * 0.3),
            evasionChance: Math.min(50, dex * 0.3)
        };
    }

    getCritMultiplier() {
        const gear = this.getEquippedStatTotals();
        // Base 1.5x crit multiplier + critDamage from gear (each point = +1%) + Rupture affix (+50%)
        return 1.5 + (gear.critDamage || 0) / 100 + (gear.rupture >= 1 ? 0.5 : 0);
    }

    getMaxEnergyShield() {
        const gear = this.getEquippedStatTotals();
        const charBonuses = this.getCharacterStatBonuses();
        const baseES = charBonuses.energyShield + gear.energyShield;
        const tb = this.getTalentPercentBonuses();
        if (tb.mortalConstitution) return 0;
        return Math.floor(baseES * (1 + tb.energyShield / 100));
    }

    refillEnergyShield() {
        this.player.currentShield = this.getMaxEnergyShield();
    }

    getRarityByName(name) {
        return ITEM_RARITIES.find(rarity => rarity.name === name) || ITEM_RARITIES[0];
    }

    rollRarity() {
        const totalWeight = ITEM_RARITIES.reduce((sum, rarity) => sum + rarity.weight, 0);
        let roll = Phaser.Math.Between(1, totalWeight);

        for (let i = 0; i < ITEM_RARITIES.length; i++) {
            roll -= ITEM_RARITIES[i].weight;
            if (roll <= 0) {
                return ITEM_RARITIES[i];
            }
        }

        return ITEM_RARITIES[0];
    }

    rollAffixes(pool, count, multiplier, usedNames, baseType, slotGroup) {
        const affixes = [];
        const isWeapon = slotGroup === 'mainhand';

        const slotAllowed = (affix) => {
            if (affix.noWeapon && isWeapon) return false;
            if (affix.allowedSlots && !affix.allowedSlots.includes(slotGroup)) return false;
            return true;
        };

        // Build weighted pool based on base type; apply slot restrictions
        const weightedPool = [];
        pool.forEach(affix => {
            if (!slotAllowed(affix)) return;
            const tags = affix.tags || [];
            // Explicit weight overrides; matching base type gets 5x, neutral/mismatch gets 1x
            const weight = affix.weight
                ? affix.weight
                : (baseType && tags.includes(baseType)) ? 5 : 1;
            for (let i = 0; i < weight; i++) weightedPool.push(affix);
        });

        const filteredPool = pool.filter(affix => slotAllowed(affix));
        while (affixes.length < count && usedNames.size < filteredPool.length) {
            const affix = Phaser.Utils.Array.GetRandom(weightedPool);
            if (!affix || usedNames.has(affix.name)) continue;

            usedNames.add(affix.name);

            const rolledStats = {};
            Object.entries(affix.stats).forEach(([stat, range]) => {
                const [min, max] = range;
                const value = Math.max(1, Math.round(Phaser.Math.Between(min, max) * multiplier));
                rolledStats[stat] = value;
            });

            affixes.push({ name: affix.name, stats: rolledStats });
        }

        return affixes;
    }

    // Rolls exactly 1 affix from the legendary-exclusive pool (stats are always fixed, no multiplier).
    // Prefers affixes matching baseType but falls back to all if nothing matches.
    rollLegendaryAffix(baseType, usedNames) {
        let pool = baseType
            ? LEGENDARY_ITEM_AFFIXES.filter(a => a.tags.length === 0 || a.tags.includes(baseType))
            : [...LEGENDARY_ITEM_AFFIXES];
        if (pool.length === 0) pool = [...LEGENDARY_ITEM_AFFIXES];
        // Exclude already-used names to avoid duplicate on reroll
        const available = pool.filter(a => !usedNames.has(a.name));
        if (available.length === 0) return null;
        const affix = Phaser.Utils.Array.GetRandom(available);
        usedNames.add(affix.name);
        const rolledStats = {};
        Object.entries(affix.stats).forEach(([stat, range]) => {
            rolledStats[stat] = Phaser.Math.Between(range[0], range[1]);
        });
        return { name: affix.name, stats: rolledStats, desc: affix.desc, isLegendary: true };
    }

    // Returns compiled bonuses from all active stolen enemy affixes (Headhunter).
    // stolenEnemyAffixes = [{ affix: ENEMY_AFFIXES entry, stolenAtBattle: N }]
    // Active when stolenAtBattle >= this.battleNumber - 1 (current + next battle).
    getStolenAffixBonuses() {
        const b = { damageMult: 1, healthMult: 1, regenerating: false, thorns: false, vampiric: false };
        (this.stolenEnemyAffixes || []).forEach(({ affix }) => {
            switch (affix.id) {
                case 'enraged':      b.damageMult *= 1.50; break;
                case 'fortified':    b.healthMult *= 1.60; break;
                case 'regenerating': b.regenerating = true; break;
                case 'thorns':       b.thorns = true; break;
                case 'berserking':   b.damageMult *= 1.30; b.healthMult *= 0.90; break;
                case 'swift':        b.damageMult *= 1.20; break;
                case 'armored':      b.healthMult *= 1.40; break;
                case 'warding':      b.healthMult *= 1.20; break;
                case 'vampiric':     b.vampiric = true; b.damageMult *= 1.25; break;
                case 'plagued':      b.damageMult *= 1.10; b.healthMult *= 1.20; break;
            }
        });
        return b;
    }

    mergeStats(target, source) {
        Object.entries(source).forEach(([stat, value]) => {
            if (!target[stat]) target[stat] = 0;
            target[stat] += value;
        });
    }

    generateItem(forcedRarity = null) {
        return this.generateLoot(this.battleNumber * 10, forcedRarity);
    }

    /**
     * Generate a reward item using magic find and monster level to determine rarity.
     */
    generateRewardItem(monsterLevel, magicFind, forcedRarity = null) {
        const base = Phaser.Utils.Array.GetRandom(ITEM_BASES);
        const rarity = forcedRarity
            ? this.getRarityByName(forcedRarity)
            : this.rollRarityWithMagicFind(monsterLevel, magicFind);

        const itemLevel = Math.max(1, monsterLevel);
        const levelScale = 1 + (itemLevel - 1) * 0.07;
        const statMultiplier = rarity.statMultiplier * levelScale;

        const prefixCount = Math.ceil(rarity.affixes / 2);
        const suffixCount = Math.floor(rarity.affixes / 2);
        const usedNames = new Set();

        const prefixes = this.rollAffixes(ITEM_PREFIXES, prefixCount, statMultiplier, usedNames, base.baseType || null, base.slotGroup);
        const suffixes = this.rollAffixes(ITEM_SUFFIXES, suffixCount, statMultiplier, usedNames, base.baseType || null, base.slotGroup);
        // Legendary items always get one extra exclusive affix
        const legendaryAffix = rarity.name === 'Legendary' ? this.rollLegendaryAffix(base.baseType || null, usedNames) : null;

        const scaledBaseStats = {};
        Object.entries(base.baseStats).forEach(([stat, value]) => {
            scaledBaseStats[stat] = Math.max(1, Math.round(value * levelScale));
        });

        const implicit = base.implicitStat
            ? { stat: base.implicitStat, value: scaledBaseStats[base.implicitStat] || 1 }
            : null;

        const innateStats = {};
        Object.entries(scaledBaseStats).forEach(([stat, value]) => {
            if (stat !== base.implicitStat) innateStats[stat] = value;
        });

        const totalStats = {};
        this.mergeStats(totalStats, scaledBaseStats);
        prefixes.forEach(prefix => this.mergeStats(totalStats, prefix.stats));
        suffixes.forEach(suffix => this.mergeStats(totalStats, suffix.stats));
        if (legendaryAffix) this.mergeStats(totalStats, legendaryAffix.stats);

        const primaryPrefix = prefixes.length > 0 ? `${prefixes[0].name} ` : '';
        const primarySuffix = suffixes.length > 0 ? ` ${suffixes[0].name}` : '';
        const rarityFlavor = rarity.name === 'Legendary' ? 'Mythic ' : '';
        const itemName = `${primaryPrefix}${rarityFlavor}${base.baseName}${primarySuffix}`.trim();

        const affixSummary = [
            ...prefixes.map(prefix => `Prefix: ${prefix.name}`),
            ...suffixes.map(suffix => `Affix: ${suffix.name}`),
            ...(legendaryAffix ? [`★ ${legendaryAffix.name}: ${legendaryAffix.desc}`] : [])
        ].join(' | ');

        const itemId = `itm-${Date.now()}-${this.itemIdCounter++}`;

        return {
            id: itemId,
            name: itemName,
            slotGroup: base.slotGroup,
            type: base.type,
            baseType: base.baseType || null,
            weaponClass: base.weaponClass || null,
            twoHanded: !!base.twoHanded,
            rarity: rarity.name,
            itemLevel,
            icon: base.icon,
            frameColor: rarity.frameColor,
            rarityTextColor: rarity.textColor,
            description: `${base.description} ${affixSummary}`.trim(),
            stats: totalStats,
            prefixes,
            suffixes,
            legendaryAffix,
            implicit,
            innateStats
        };
    }

    /**
     * Roll rarity based on magic find + monster level.
     * Magic gear starts appearing around level 5, Rare around level 10.
     * Legendary is very rare and requires magic find to realistically obtain.
     */
    rollRarityWithMagicFind(monsterLevel, magicFind) {
        const mf = Math.max(0, magicFind);
        const ml = Math.max(1, monsterLevel);

        // Normal dominates early. Magic ramps up quickly, Rare rarely, Legendary very rarely.
        let magicWeight = 0, rareWeight = 0, legendaryWeight = 0;
        if (ml > 2) {
            // Magic: starts appearing at level 3, ramps up to ~40
            const magicBase = Math.max(0, (ml - 2) * 3.0);
            magicWeight = Math.min(40, magicBase + mf * 0.15);
        }
        if (ml > 8) {
            // Rare: starts appearing at level 9, ramps up slowly to ~12
            const rareBase = Math.max(0, (ml - 8) * 0.8);
            rareWeight = Math.min(12, rareBase + mf * 0.08);
        }
        if (ml > 18) {
            // Legendary: only at level 19+ or high magic find, caps at ~3
            const legendaryBase = Math.max(0, (ml - 18) * 0.12);
            legendaryWeight = Math.min(3, legendaryBase + mf * 0.02);
        }
        const normalWeight = Math.max(30, 100 - magicWeight - rareWeight - legendaryWeight);

        const weights = {
            Normal:    normalWeight,
            Magic:     magicWeight,
            Rare:      rareWeight,
            Legendary: legendaryWeight
        };

        const weightedTable = ITEM_RARITIES.map(r => ({
            name: r.name,
            weight: weights[r.name] || r.weight
        }));

        const totalWeight = weightedTable.reduce((sum, r) => sum + r.weight, 0);
        let roll = Phaser.Math.Between(1, Math.round(totalWeight));

        for (let i = 0; i < weightedTable.length; i++) {
            roll -= weightedTable[i].weight;
            if (roll <= 0) {
                return this.getRarityByName(weightedTable[i].name);
            }
        }

        return ITEM_RARITIES[0];
    }

    /**
     * generateLoot(lootScore, forcedRarity)
     *
     * Creates a Path of Exile style item object.
     *
     * lootScore drives both rarity probability and stat power:
     *   - 0-20   → mostly Normal (white) items with no affixes
     *   - 20-50  → Magic (blue) items start appearing (1-2 affixes)
     *   - 50-80  → Rare (yellow) items with 4 affixes become possible
     *   - 80+    → Legendary (orange) items with 6 affixes can drop
     *
     * Item data structure:
     *   {
     *     id, name, slotGroup, type, rarity, itemLevel,
     *     icon, frameColor, rarityTextColor,
     *     description,
     *     stats: { physical, magic, ranged, armor, health, loot, ... },
     *     prefixes: [{ name, stats }],
     *     suffixes: [{ name, stats }]
     *   }
     */
    generateLoot(lootScore, forcedRarity = null) {
        const base = Phaser.Utils.Array.GetRandom(ITEM_BASES);
        const rarity = forcedRarity
            ? this.getRarityByName(forcedRarity)
            : this.rollRarityFromScore(lootScore);

        // itemLevel scales stat ranges: floor 1, soft-caps around 2.5×
        const itemLevel = Math.max(1, Math.floor(lootScore / 10));
        const levelScale = 1 + (itemLevel - 1) * 0.07;
        const statMultiplier = rarity.statMultiplier * levelScale;

        // Affix counts: Normal=0, Magic=1-2, Rare=4, Legendary=6
        const prefixCount = Math.ceil(rarity.affixes / 2);
        const suffixCount = Math.floor(rarity.affixes / 2);
        const usedNames = new Set();

        const prefixes = this.rollAffixes(ITEM_PREFIXES, prefixCount, statMultiplier, usedNames, base.baseType || null, base.slotGroup);
        const suffixes = this.rollAffixes(ITEM_SUFFIXES, suffixCount, statMultiplier, usedNames, base.baseType || null, base.slotGroup);
        // Legendary items always get one extra exclusive affix
        const legendaryAffix = rarity.name === 'Legendary' ? this.rollLegendaryAffix(base.baseType || null, usedNames) : null;

        // Base stats also scale with item level
        const scaledBaseStats = {};
        Object.entries(base.baseStats).forEach(([stat, value]) => {
            scaledBaseStats[stat] = Math.max(1, Math.round(value * levelScale));
        });

        const implicit = base.implicitStat
            ? { stat: base.implicitStat, value: scaledBaseStats[base.implicitStat] || 1 }
            : null;

        const innateStats = {};
        Object.entries(scaledBaseStats).forEach(([stat, value]) => {
            if (stat !== base.implicitStat) innateStats[stat] = value;
        });

        const totalStats = {};
        this.mergeStats(totalStats, scaledBaseStats);
        prefixes.forEach(prefix => this.mergeStats(totalStats, prefix.stats));
        suffixes.forEach(suffix => this.mergeStats(totalStats, suffix.stats));
        if (legendaryAffix) this.mergeStats(totalStats, legendaryAffix.stats);

        // Build PoE-style name
        const primaryPrefix = prefixes.length > 0 ? `${prefixes[0].name} ` : '';
        const primarySuffix = suffixes.length > 0 ? ` ${suffixes[0].name}` : '';
        const rarityFlavor = rarity.name === 'Legendary' ? 'Mythic ' : '';
        const itemName = `${primaryPrefix}${rarityFlavor}${base.baseName}${primarySuffix}`.trim();

        const affixSummary = [
            ...prefixes.map(prefix => `Prefix: ${prefix.name}`),
            ...suffixes.map(suffix => `Affix: ${suffix.name}`),
            ...(legendaryAffix ? [`★ ${legendaryAffix.name}: ${legendaryAffix.desc}`] : [])
        ].join(' | ');

        const itemId = `itm-${Date.now()}-${this.itemIdCounter++}`;

        return {
            id: itemId,
            name: itemName,
            slotGroup: base.slotGroup,
            type: base.type,
            baseType: base.baseType || null,
            weaponClass: base.weaponClass || null,
            twoHanded: !!base.twoHanded,
            rarity: rarity.name,
            itemLevel,
            icon: base.icon,
            frameColor: rarity.frameColor,
            rarityTextColor: rarity.textColor,
            description: `${base.description} ${affixSummary}`.trim(),
            stats: totalStats,
            prefixes,
            suffixes,
            legendaryAffix,
            implicit,
            innateStats
        };
    }

    /**
     * Rarity roll driven entirely by a single lootScore number.
     * Low scores → almost all Normal. High scores → Legendary possible.
     */
    rollRarityFromScore(lootScore) {
        const s = Math.max(0, lootScore);

        // Normal dominates. Magic ramps up quickly from score 20. Rare from 80. Legendary from 180.
        let magicWeight = 0, rareWeight = 0, legendaryWeight = 0;
        if (s >= 20) {
            // Magic: starts at score 20 (level 2+), ramps up to ~40
            const magicBase = Math.max(0, (s - 20) * 0.30);
            magicWeight = Math.min(40, magicBase);
        }
        if (s >= 80) {
            // Rare: starts at score 80 (level 8+), ramps up to ~12
            const rareBase = Math.max(0, (s - 80) * 0.08);
            rareWeight = Math.min(12, rareBase);
        }
        if (s >= 180) {
            // Legendary: only at score 180 (level 18+), caps at ~3
            const legendaryBase = Math.max(0, (s - 180) * 0.015);
            legendaryWeight = Math.min(3, legendaryBase);
        }
        const normalWeight = Math.max(30, 100 - magicWeight - rareWeight - legendaryWeight);
        const weights = {
            Normal:    normalWeight,
            Magic:     magicWeight,
            Rare:      rareWeight,
            Legendary: legendaryWeight
        };

        const weightedTable = ITEM_RARITIES.map(r => ({
            name: r.name,
            weight: weights[r.name] || r.weight
        }));

        const totalWeight = weightedTable.reduce((sum, r) => sum + r.weight, 0);
        let roll = Phaser.Math.Between(1, Math.round(totalWeight));

        for (let i = 0; i < weightedTable.length; i++) {
            roll -= weightedTable[i].weight;
            if (roll <= 0) {
                return this.getRarityByName(weightedTable[i].name);
            }
        }

        return ITEM_RARITIES[0];
    }

    addItemToInventory(item) {
        if (this.inventory.length >= this.maxInventorySlots) {
            this.addCombatLog('Inventory full. Item dropped on the ground.', '#ff8888');
            return false;
        }

        this.inventory.push(item);
        this.updateInventoryGridUI();
        return true;
    }

    tryDropLootItem(lootAmount) {
        const gear = this.getEquippedStatTotals();
        const dropChance = Phaser.Math.Clamp(0.10 + lootAmount / 90 + gear.magicFind / 120, 0, 0.85);

        if (Math.random() > dropChance) return;

        const item = this.generateItem();
        if (this.addItemToInventory(item)) {
            this.addCombatLog(`Loot Drop: ${item.rarity} ${item.name}`, item.rarityTextColor);
        }
    }

    rollRarityWithLootBonus() {
        const gear = this.getEquippedStatTotals();
        const magicFindPower = gear.magicFind;
        const tierShift = Math.floor(magicFindPower / 120);

        const weights = {
            Normal: Math.max(5, 60 - tierShift * 5),
            Magic: Math.min(50, 25 + tierShift * 2),
            Rare: Math.min(40, 12 + tierShift * 2),
            Legendary: Math.min(25, 3 + tierShift)
        };

        const weightedTable = ITEM_RARITIES.map(rarity => ({
            name: rarity.name,
            weight: weights[rarity.name] || rarity.weight
        }));

        const totalWeight = weightedTable.reduce((sum, rarity) => sum + rarity.weight, 0);
        let roll = Phaser.Math.Between(1, totalWeight);

        for (let i = 0; i < weightedTable.length; i++) {
            roll -= weightedTable[i].weight;
            if (roll <= 0) {
                return this.getRarityByName(weightedTable[i].name);
            }
        }

        return ITEM_RARITIES[0];
    }

    getItemPowerScore(item) {
        if (!item || !item.stats) return 0;
        const weights = {
            health: 0.1,
            physical: 1.4,
            magic: 1.4,
            ranged: 1.3,
            magicFind: 0.5,
            armor: 1.0
        };

        return Object.entries(item.stats).reduce((score, [stat, value]) => {
            const weight = weights[stat] || 1;
            return score + value * weight;
        }, 0);
    }

    getEquipTargetSlot(item) {
        if (!item || !item.slotGroup) return null;

        const slotGroup = item.slotGroup;
        const standardSlots = ['helmet', 'necklace', 'chest', 'belt', 'gloves', 'boots', 'mainhand', 'offhand'];

        if (slotGroup === 'ring') {
            return 'ring1';
        }

        if (standardSlots.includes(slotGroup)) {
            return slotGroup;
        }

        return null;
    }

    formatSignedValue(value) {
        if (value > 0) return `+${value}`;
        if (value < 0) return `${value}`;
        return '0';
    }

    getRewardCompareData(item) {
        const targetSlot = this.getEquipTargetSlot(item);
        const displacedItems = targetSlot ? this.getDisplacedItemsForEquip(item, targetSlot) : [];

        const targetSlotLabel = targetSlot
            ? this.getEquipSlotDisplayLabel(targetSlot)
            : this.getSlotLabel(item.slotGroup || '');

        if (!targetSlot) {
            return {
                targetSlot,
                targetSlotLabel,
                equippedName: 'None equipped',
                equippedSummary: `Current ${targetSlotLabel}: None`,
                compareLines: ['New slot item']
            };
        }

        if (!displacedItems || displacedItems.length === 0) {
            return {
                targetSlot,
                targetSlotLabel,
                equippedName: 'None equipped',
                equippedSummary: `Current ${targetSlotLabel}: None`,
                compareLines: ['New slot item']
            };
        }

        const equippedStats = {};
        displacedItems.forEach(entry => {
            const stats = (entry && entry.item && entry.item.stats) || {};
            Object.entries(stats).forEach(([stat, value]) => {
                equippedStats[stat] = (equippedStats[stat] || 0) + value;
            });
        });

        const statKeys = new Set([
            ...Object.keys(item.stats || {}),
            ...Object.keys(equippedStats)
        ]);

        const compareLines = Array.from(statKeys)
            .map(stat => {
                const nextValue = (item.stats && item.stats[stat]) || 0;
                const currentValue = equippedStats[stat] || 0;
                const delta = nextValue - currentValue;
                return {
                    stat,
                    delta,
                    text: `${this.getStatLabel(stat)} ${this.formatSignedValue(delta)}`
                };
            })
            .filter(entry => entry.delta !== 0)
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
            .slice(0, 3);

        const replacedSlotsLabel = displacedItems
            .map(entry => this.getEquipSlotDisplayLabel(entry.slotKey))
            .join(' + ');
        const equippedName = displacedItems
            .map(entry => entry.item.name)
            .join(' + ');

        return {
            targetSlot,
            targetSlotLabel,
            equippedName,
            equippedSummary: `Current ${replacedSlotsLabel}: ${equippedName}`,
            compareLines: compareLines.length > 0 ? compareLines : [{ text: 'No stat change', delta: 0 }]
        };
    }

    resolveEquipSlot(slotGroup) {
        return this.getEquipTargetSlot({ slotGroup });
    }

    canEquipItemInSlot(item, targetSlot) {
        if (!item || !targetSlot) return false;
        const requiredGroup = EQUIPMENT_SLOT_GROUP_BY_KEY[targetSlot];
        return requiredGroup === item.slotGroup;
    }

    isTwoHandedItem(item) {
        return !!(item && item.slotGroup === 'mainhand' && item.twoHanded);
    }

    getDisplacedItemsForEquip(item, targetSlot) {
        if (!item || !targetSlot) return [];

        if (targetSlot !== 'mainhand' && targetSlot !== 'offhand') {
            const existing = this.equippedItems[targetSlot] || null;
            return existing ? [{ slotKey: targetSlot, item: existing }] : [];
        }

        const displaced = [];
        const mainhandItem = this.equippedItems.mainhand || null;
        const offhandItem = this.equippedItems.offhand || null;

        if (targetSlot === 'mainhand') {
            if (mainhandItem) displaced.push({ slotKey: 'mainhand', item: mainhandItem });
            if (this.isTwoHandedItem(item) && offhandItem) displaced.push({ slotKey: 'offhand', item: offhandItem });
            return displaced;
        }

        if (offhandItem) displaced.push({ slotKey: 'offhand', item: offhandItem });
        if (mainhandItem && this.isTwoHandedItem(mainhandItem)) {
            displaced.push({ slotKey: 'mainhand', item: mainhandItem });
        }
        return displaced;
    }

    canStoreDisplacedItems(displacedItems, inventorySlotsFreed = 0) {
        const freed = Math.max(0, inventorySlotsFreed);
        return (this.inventory.length - freed + displacedItems.length) <= this.maxInventorySlots;
    }

    applyEquippedItemToSlot(item, targetSlot) {
        this.player.equipment[targetSlot] = item.name;
        this.equippedItems[targetSlot] = item;

        if (targetSlot === 'mainhand' && this.isTwoHandedItem(item)) {
            this.player.equipment.offhand = 'Occupied by Bow';
            this.equippedItems.offhand = null;
        }
    }

    clearEquippedSlot(slotKey) {
        this.equippedItems[slotKey] = null;
        this.player.equipment[slotKey] = 'None';
    }

    /** Play the warrior sprite attack animation, then return to idle. */
    playPlayerAttackAnim() {
        if (!this.playerSprite) return;
        this.playerSprite.play('warrior_attack');
    }

    /** Play the warrior sprite hit animation, then return to idle. */
    playPlayerHitAnim() {
        if (!this.playerSprite) return;
        if (this.player.health <= 0) return;  // Don't override death animation
        this.playerSprite.play('warrior_hit');
        // Flash tint
        this.playerSprite.setTint(0xff4444);
        this.time.delayedCall(200, () => {
            if (this.playerSprite) this.playerSprite.clearTint();
        });
    }

    /** Play an enemy's attack animation. */
    playEnemyAttackAnim(enemy) {
        if (!enemy || !enemy.alive) return;
        const bodyCfg = MONSTER_BODIES[enemy.bodyIndex];
        if (enemy.enemySprite) {
            const sk = bodyCfg.spriteKey;
            enemy.enemySprite.play(sk + '_attack');
            // Guinea Pig Lich fires an evil energy bolt at the hero when it attacks
            if (sk === 'guineapiglich') {
                this.time.delayedCall(80, () => this.spawnEvilEnergyEffect(enemy));
            }
        }
    }

    /** Play an enemy's hit reaction animation. */
    playEnemyHitAnim(enemy) {
        if (!enemy || !enemy.alive) return;
        const bodyCfg = MONSTER_BODIES[enemy.bodyIndex];
        if (enemy.enemySprite) {
            enemy.enemySprite.play(bodyCfg.spriteKey + '_hit');
            enemy.enemySprite.setTint(0xff4444);
            this.time.delayedCall(200, () => {
                if (enemy.enemySprite) enemy.enemySprite.clearTint();
            });
        }
    }

    createPlayerUI() {
        // Portrait layout: player LEFT (below grid), enemy RIGHT (below grid)
        const leftCX = 97;
        const rightCX = 293;
        const panelW = 188;
        const barW = 166;
        const FP = FIGHT_PANEL_Y; // fight panel top in world-space

        // Divider line between panels (spans fight area)
        this.hudContainer.add(this.add.rectangle(195, FP + 90, 2, 185, 0x444444, 0.5));

        // --- Player panel (left) ---
        this.playerSprite = this.add.sprite(leftCX, FP + 55, 'warrior').setOrigin(0.5, 0.5);
        this.playerSprite.setScale(1.0);
        this.playerSprite.play('warrior_idle');
        this.playerSprite.on('animationcomplete', (anim) => {
            if (!anim.key.endsWith('_idle') && !anim.key.endsWith('_death') && this.playerSprite && this.playerSprite.active) {
                this.playerSprite.play('warrior_idle');
            }
        });
        this.hudContainer.add(this.playerSprite);
        this.heroTitleText = this.add.text(leftCX, FP + 118, `Hero (Lv. ${this.player.level})`, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        this.hudContainer.add(this.heroTitleText);
        // --- Energy Shield bar ---
        this.playerShieldLabel = this.add.text(14, FP + 126, 'ES', { fontSize: '9px', color: '#66aaff' });
        this.hudContainer.add(this.playerShieldLabel);
        this.playerShieldBarBg = this.add.rectangle(14, FP + 134, barW, 8, 0x333344).setOrigin(0, 0.5);
        this.hudContainer.add(this.playerShieldBarBg);
        this.playerShieldBar = this.add.rectangle(14, FP + 134, 0, 8, 0x3388ff).setOrigin(0, 0.5);
        this.hudContainer.add(this.playerShieldBar);
        this.playerShieldText = this.add.text(14 + barW / 2, FP + 134, '', { fontSize: '7px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.hudContainer.add(this.playerShieldText);
        // --- HP bar ---
        this.hudContainer.add(this.add.text(14, FP + 140, 'HP', { fontSize: '11px', color: '#aaa' }));
        this.playerHealthBarBg = this.add.rectangle(14, FP + 151, barW, 12, 0x444444).setOrigin(0, 0.5);
        this.hudContainer.add(this.playerHealthBarBg);
        this.playerHealthBar = this.add.rectangle(14, FP + 151, barW, 12, 0x00cc00).setOrigin(0, 0.5);
        this.hudContainer.add(this.playerHealthBar);
        this.playerHealthText = this.add.text(14 + barW / 2, FP + 151, '', { fontSize: '9px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
        this.hudContainer.add(this.playerHealthText);
        // --- Enemy panel (right) ---
        this.encounterSize = 1;
        this.buildEnemyGroup(this.battleNumber, this.hudContainer);
        if (this.enemyEncounterLabel) this.enemyEncounterLabel.setText('');
        // --- Gold display ---
        this.goldDisplayIcon = this.add.text(14, FP + 164, '\ud83e\ude99', { fontSize: '14px' }).setOrigin(0, 0.5);
        this.goldDisplayText = this.add.text(32, FP + 164, '0', { fontSize: '13px', color: '#ffd966', fontStyle: 'bold' }).setOrigin(0, 0.5);
        this.hudContainer.add([this.goldDisplayIcon, this.goldDisplayText]);

        this.createEquipmentScreen();
        this.createSkillsScreen();
        this.createTalentScreen();
        this.createStoreScreen();
        // 4 buttons evenly spaced across 390px width
        this.createEquipmentButton(49, FP + 178);
        this.createSkillsButton(147, FP + 178);
        this.createTalentButton(245, FP + 178);
        this.createStoreButton(343, FP + 178);

        this.updatePlayerUI();
        this.updateEnemyUI();
    }

    createDeathScreen() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        this.deathScreenGroup = this.add.container(0, 0).setVisible(false).setDepth(5000);

        const bg = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.88);
        const panel = this.add.rectangle(W / 2, H / 2 - 20, 320, 290, 0x1a0000, 1)
            .setStrokeStyle(2, 0x880000);

        const title = this.add.text(W / 2, H / 2 - 130, 'DEFEATED', {
            fontSize: '44px', color: '#ff2222', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 4
        }).setOrigin(0.5);

        this.deathHeroText = this.add.text(W / 2, H / 2 - 65, '', {
            fontSize: '20px', color: '#ffcc66', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.deathKillerText = this.add.text(W / 2, H / 2 - 30, '', {
            fontSize: '16px', color: '#ff8888',
            stroke: '#000000', strokeThickness: 2,
            wordWrap: { width: 290 }
        }).setOrigin(0.5);

        const btnBg = this.add.rectangle(W / 2, H / 2 + 55, 200, 44, 0x550000, 1)
            .setStrokeStyle(2, 0xff5555)
            .setInteractive({ useHandCursor: true });
        const btnText = this.add.text(W / 2, H / 2 + 55, 'Back to Town', {
            fontSize: '20px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 2
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x880000));
        btnBg.on('pointerout',  () => btnBg.setFillStyle(0x550000));
        btnBg.on('pointerup',   () => this.scene.start('TownScene'));

        this.deathScreenGroup.add([bg, panel, title, this.deathHeroText, this.deathKillerText, btnBg, btnText]);
    }

    showDeathScreen(killerName) {
        if (!this.deathScreenGroup) return;
        const level = (this.player && typeof this.player.level === 'number') ? this.player.level : 1;
        this.deathHeroText.setText(`Hero  ·  Level ${level}`);
        this.deathKillerText.setText(`Slain by ${killerName}`);
        this.deathScreenGroup.setVisible(true);
    }

    createRewardScreen() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.rewardScreenGroup = this.add.container(0, 0).setVisible(false);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x121212, 0.96)
            .setInteractive();  // absorb stray taps so they don't pass through
        const panel = this.add.rectangle(width / 2, height / 2, width - 20, height - 20, 0x1f1f1f, 1).setStrokeStyle(2, 0x666666);
        const title = this.add.text(width / 2, 40, 'Victory Rewards', {
            fontSize: '26px',
            color: '#ffd166',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.rewardLootInfoText = this.add.text(width / 2, 68, '', {
            fontSize: '12px',
            color: '#9be7ff'
        }).setOrigin(0.5);

        this.rewardScreenGroup.add([bg, panel, title, this.rewardLootInfoText]);

        this.rewardCards = [];
        // Horizontal card layout: wide cards stacked vertically
        const cardWidth = 370;
        const cardHeight = 166;
        const spacing = 9;
        const startY = 85;
        const cx = width / 2;
        const iconX = cx - 148;          // left column: icon
        const textLeft = cx - 106;       // text column start
        const textWrap = cardWidth - 116; // wrap width for text column

        for (let i = 0; i < 3; i++) {
            const cy = startY + i * (cardHeight + spacing) + cardHeight / 2;

            const cardBg = this.add.rectangle(cx, cy, cardWidth, cardHeight, 0x2a2a2a, 1).setStrokeStyle(2, 0x999999);
            const icon = this.add.text(iconX, cy - 18, '', { fontSize: '38px' }).setOrigin(0.5);
            const name = this.add.text(textLeft, cy - 60, '', {
                fontSize: '14px',
                fontFamily: 'Georgia, Verdana, sans-serif',
                color: '#ffffff',
                fontStyle: 'bold',
                wordWrap: { width: textWrap, useAdvancedWrap: true }
            }).setOrigin(0, 0.5);
            const rarity = this.add.text(textLeft, cy - 43, '', {
                fontSize: '11px',
                fontFamily: 'Georgia, Verdana, sans-serif',
                color: '#ffffff'
            }).setOrigin(0, 0.5);
            // stats block hidden — compareLines carry all stat info
            const stats = this.add.text(cx, cy - 2000, '', {
                fontSize: '11px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#ffd966',
                align: 'center',
                wordWrap: { width: cardWidth - 10, useAdvancedWrap: true }
            }).setOrigin(0.5);
            const equippedLabel = this.add.text(textLeft, cy - 28, '', {
                fontSize: '11px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#aaaaaa',
                wordWrap: { width: textWrap, useAdvancedWrap: true }
            }).setOrigin(0, 0.5);
            const compareLines = [];
            const colRightX = textLeft + textWrap / 2;
            for (let li = 0; li < 6; li++) {
                const col = Math.floor(li / 3);
                const row = li % 3;
                const cl = this.add.text(col === 0 ? textLeft : colRightX, cy - 12 + row * 16, '', {
                    fontSize: '13px',
                    fontFamily: 'Verdana, Georgia, sans-serif',
                    color: '#8aff8a'
                }).setOrigin(0, 0.5);
                compareLines.push(cl);
            }

            // Innate (implicit) affix displayed in the right column, aligned with the item level row
            const innateText = this.add.text(colRightX, cy - 43, '', {
                fontSize: '11px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#aaddff'
            }).setOrigin(0, 0.5);

            // Buttons run along the bottom of each card
            // Equip is on the right so right-handed players can reach it more easily
            const btnY = cy + 62;
            const sellBtn = this.add.text(cx - 100, btnY, 'Sell', {
                fontSize: '13px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#111111',
                backgroundColor: '#ffd166',
                padding: { left: 8, right: 8, top: 4, bottom: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const stashBtn = this.add.text(cx, btnY, 'Stash', {
                fontSize: '13px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#ffffff',
                backgroundColor: '#3b5ccc',
                padding: { left: 8, right: 8, top: 4, bottom: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            const equipBtn = this.add.text(cx + 100, btnY, 'Equip', {
                fontSize: '13px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#111111',
                backgroundColor: '#5aff9c',
                padding: { left: 8, right: 8, top: 4, bottom: 4 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            this.rewardScreenGroup.add([cardBg, icon, name, rarity, stats, equippedLabel, ...compareLines, innateText, equipBtn, stashBtn, sellBtn]);
            this.rewardCards.push({ cardBg, icon, name, rarity, stats, equippedLabel, compareLines, innateText, equipBtn, stashBtn, sellBtn, cy });
        }
    }

    showRewardScreen() {
        // Remove all floating combat texts
        if (this.activeCombatTexts && Array.isArray(this.activeCombatTexts)) {
            this.activeCombatTexts.forEach(txt => txt.destroy());
            this.activeCombatTexts.length = 0;
        }
        if (!this.rewardScreenGroup) return;
        this.currentScreen = 'reward';
        this.closeSkillGemPopup();

        // Stop all in-flight particle effects so they don't overlay the reward screen
        this.stopAllParticleEffects();
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.setVisible(false);

        this.boardContainer.setVisible(false);
        this.hudContainer.setVisible(false);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(false);
        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(false);
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(false);
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(false);
        this.rewardScreenGroup.setVisible(true);
        this.setGameBoardActive(false);
        this.closeInventoryItemPopup();

        const gear = this.getEquippedStatTotals();
        const bossMFBonus = this.bossMagicFindBonus || 0;
        const magicFind = gear.magicFind + bossMFBonus;
        // Consume the boss magic find bonus — it applies to this reward screen only
        this.bossMagicFindBonus = 0;
        const monsterLevel = this.battleNumber;
        const foeCount = this.encounterSize;
        const bossBonusStr = bossMFBonus > 0 ? ` (+${bossMFBonus} Boss Bonus!)` : '';
        this.rewardLootInfoText.setText(`Battle Lv.${monsterLevel} (${foeCount} foe${foeCount > 1 ? 's' : ''}) | Magic Find: ${magicFind}${bossBonusStr}`);

        this.rewardChoices = [];
        for (let i = 0; i < 3; i++) {
            this.rewardChoices.push(this.generateRewardItem(monsterLevel, magicFind));
        }

        // Raccoon Bandit guarantee: at least one item must be Magic rarity or better
        if (this.raccoonBanditRewardGuarantee) {
            this.raccoonBanditRewardGuarantee = false;
            const MAGIC_TIER = 1; // index in ITEM_RARITIES
            const hasMagicPlus = this.rewardChoices.some(item =>
                ITEM_RARITIES.findIndex(r => r.name === item.rarity) >= MAGIC_TIER
            );
            if (!hasMagicPlus) {
                // Upgrade the first Normal item to Magic
                this.rewardChoices[0] = this.generateRewardItem(monsterLevel, magicFind, 'Magic');
            }
        }

        this.rewardCards.forEach((card, index) => {
            const item = this.rewardChoices[index];
            const statText = Object.entries(item.stats)
                .map(([key, value]) => `${this.getStatLabel(key)} +${value}`)
                .join('\n');
            const compareData = this.getRewardCompareData(item);

            // Build per-stat comparison lines with color coding and delta values
            const targetSlot = compareData.targetSlot;
            const displacedItems = targetSlot ? this.getDisplacedItemsForEquip(item, targetSlot) : [];
            const equippedStats = {};
            displacedItems.forEach(entry => {
                const s = (entry && entry.item && entry.item.stats) || {};
                Object.entries(s).forEach(([stat, value]) => {
                    equippedStats[stat] = (equippedStats[stat] || 0) + value;
                });
            });
            const itemStats = item.stats || {};
            // Filter legendary affix stat keys from numeric comparison lines
            const legStatKeys = new Set(item.legendaryAffix ? Object.keys(item.legendaryAffix.stats) : []);
            // Filter implicit stat key from regular lines
            const itemImplicitKey = item.implicit ? item.implicit.stat : null;
            const allStatKeys = Array.from(new Set([...Object.keys(itemStats), ...Object.keys(equippedStats)]))
                .filter(k => !legStatKeys.has(k) && k !== itemImplicitKey);
            const hasEquipped = displacedItems.length > 0 && displacedItems.some(e => e && e.item);

            // Build implicit line first
            const perStatLines = [];
            if (itemImplicitKey) {
                const newVal = item.implicit.value || 0;
                const label = this.getStatLabel(itemImplicitKey);
                card.innateText.setText(`${label}: ${newVal}`);
            } else {
                card.innateText.setText('');
            }

            allStatKeys.slice(0, 4).forEach(stat => {
                const newVal = itemStats[stat] || 0;
                const oldVal = equippedStats[stat] || 0;
                const delta = newVal - oldVal;
                const label = this.getStatLabel(stat);
                if (!hasEquipped || oldVal === 0) {
                    perStatLines.push({ text: `${label} +${newVal}`, color: '#4eff8a' });
                } else if (delta > 0) {
                    perStatLines.push({ text: `${label} +${newVal} (+${delta})`, color: '#4eff8a' });
                } else if (delta < 0) {
                    perStatLines.push({ text: `${label} +${newVal} (${delta})`, color: '#ff6b6b' });
                } else {
                    perStatLines.push({ text: `${label} +${newVal}`, color: '#ffd966' });
                }
            });
            // Append legendary affix description in orange
            if (item.legendaryAffix) {
                perStatLines.push({ text: `★ ${item.legendaryAffix.name}: ${item.legendaryAffix.desc}`, color: '#ff7f11' });
            }

            card.cardBg.setStrokeStyle(3, item.frameColor, 1);
            card.icon.setText(item.icon);
            card.name.setText(item.name);
            card.name.setColor(item.rarityTextColor || '#ffffff');
            card.rarity.setText(`iLvl ${item.itemLevel || 1} ${item.rarity} ${item.type}`);
            card.rarity.setColor(item.rarityTextColor || '#ffffff');
            card.stats.setText('');
            const equippedName = compareData.equippedName || 'empty';
            card.equippedLabel.setText(`vs: ${equippedName}`);

            // Reposition rarity and lower elements to avoid overlapping a wrapped name
            {
                const cy = card.cy;
                const nameBottom = card.name.y + card.name.height / 2;
                const defaultRarityY = cy - 43;
                const actualRarityY = Math.max(defaultRarityY, nameBottom + 5);
                const shift = actualRarityY - defaultRarityY;
                card.rarity.setY(actualRarityY);
                card.innateText.setY(actualRarityY);
                card.equippedLabel.setY(cy - 28 + shift);
                card.compareLines.forEach((cl, li) => {
                    const row = li % 3;
                    cl.setY(cy - 12 + row * 16 + shift);
                });
            }

            card.compareLines.forEach((lineObj, i) => {
                if (i < perStatLines.length) {
                    lineObj.setText(perStatLines[i].text);
                    lineObj.setColor(perStatLines[i].color);
                    lineObj.setVisible(true);
                } else {
                    lineObj.setText('');
                    lineObj.setVisible(false);
                }
            });

            const sellPrice = Math.max(1, Math.floor(this.getItemPrice(item) / 2));
            card.sellBtn.setText(`Sell 🪙${sellPrice}`);

            card.equipBtn.removeAllListeners('pointerup');
            card.stashBtn.removeAllListeners('pointerup');
            card.sellBtn.removeAllListeners('pointerup');
            card.equipBtn.on('pointerup', (p, lx, ly, e) => {
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                this.claimRewardItem(item, 'equip');
            });
            card.stashBtn.on('pointerup', (p, lx, ly, e) => {
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                this.claimRewardItem(item, 'inventory');
            });
            card.sellBtn.on('pointerup', (p, lx, ly, e) => {
                if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
                this.claimRewardItem(item, 'sell', sellPrice);
            });
        });

        this.addCombatLog('Choose one reward before the next battle.', '#ffd966');
    }

    equipItemDirectly(item) {
        const targetSlot = this.resolveEquipSlot(item.slotGroup);
        if (!targetSlot || !this.canEquipItemInSlot(item, targetSlot)) {
            this.addCombatLog(`Cannot equip ${item.name}: invalid slot`, '#ff8888');
            return;
        }
        const displacedItems = this.getDisplacedItemsForEquip(item, targetSlot);
        if (!this.canStoreDisplacedItems(displacedItems)) {
            this.addCombatLog('Not enough inventory space to swap gear.', '#ff8888');
            return;
        }

        for (let i = 0; i < displacedItems.length; i++) {
            const displaced = displacedItems[i];
            if (displaced && displaced.item) {
                this.addItemToInventory(displaced.item);
                this.clearEquippedSlot(displaced.slotKey);
            }
        }

        this.applyEquippedItemToSlot(item, targetSlot);
        this.updateEquipmentScreen();
        this.addCombatLog(`Equipped ${item.name} in ${targetSlot}${this.isTwoHandedItem(item) ? ' (2H)' : ''}`, '#99ff99');
    }

    claimRewardItem(item, destination, sellPrice) {
        if (!this.awaitingRewardChoice) return;
        // Lock immediately so any lingering pointer events cannot fire twice
        this.awaitingRewardChoice = false;

        // Manage visibility so there is no blank-screen intermediate state
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        if (this.boardContainer) this.boardContainer.setVisible(true);
        if (this.hudContainer) this.hudContainer.setVisible(true);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(true);

        try {
            if (destination === 'equip') {
                this.equipItemDirectly(item);
            } else if (destination === 'sell') {
                const price = sellPrice !== undefined ? sellPrice : Math.max(1, Math.floor(this.getItemPrice(item) / 2));
                this.player.gold += price;
                this.updateGoldDisplay();
                this.addCombatLog(`Sold ${item.rarity} ${item.name} for ${price} gold!`, '#ffd966');
            } else {
                const added = this.addItemToInventory(item);
                if (added) {
                    this.addCombatLog(`Added ${item.name} to inventory`, '#99ddff');
                } else {
                    this.addCombatLog('Inventory full, auto-equipping selected reward.', '#ffaaaa');
                    this.equipItemDirectly(item);
                }
            }
        } catch (e) {
            console.error('claimRewardItem action error:', e);
        }

        this.startNextBattle();
    }

    startNextBattle() {
        this.battleNumber += 1;
        // Level up the hero after each battle
        if (this.player && typeof this.player.level === 'number') {
            this.player.level += 1;
        }
        this.skillCharge = this.createInitialSkillCharge();
        this.cloakOfFlamesActive = false;
        this.cloakOfFlamesDamage = 0;
        this.headhunterKills = 0;
        // Expire stolen affixes older than 1 previous battle (Headhunter: lasts current + next battle)
        this.stolenEnemyAffixes = (this.stolenEnemyAffixes || []).filter(
            ({ stolenAtBattle }) => stolenAtBattle >= this.battleNumber - 1
        );
        this.encounterSize = this.getEncounterSize(this.battleNumber);

        // Build enemy group (destroys old UI, creates new enemies)
        this.buildEnemyGroup(this.battleNumber, this.hudContainer);

        if (this.enemyEncounterLabel) this.enemyEncounterLabel.setText('');

        // Update hero level display
        if (this.heroTitleText && this.player && typeof this.player.level === 'number') {
            this.heroTitleText.setText(`Hero (Lv. ${this.player.level})`);
        }

        this.refillEnergyShield();

        // Mortal Constitution: restore 20% max HP after each battle (no energy shield)
        const tb_mc = this.getTalentPercentBonuses();
        if (tb_mc.mortalConstitution) {
            const mcHeal = Math.floor(this.getMaxHealth() * 0.20);
            this.player.health = Math.min(this.getMaxHealth(), this.player.health + mcHeal);
            this.addCombatLog(`\ud83d\udcaa Mortal Constitution: restored ${mcHeal} HP`, '#ffaa55');
        }

        this.createGrid();
        this.renderGrid();
        this.updateSkillBarUI();
        this.updatePlayerUI();
        this.updateEnemyUI();

        this.isSwapping = false;
        this.player.talentPoints += 1;
        this.updateTalentButtonGlow();
        this.showGameScreen();
        const enemyNames = this.enemies.map(e => e.name).join(', ');
        this.addCombatLog(`Battle ${this.battleNumber}: ${enemyNames} appear! (${this.encounterSize} foe${this.encounterSize > 1 ? 's' : ''})`, '#ffcc66');
        this.addCombatLog(`Talent point earned! (${this.player.talentPoints} available)`, '#ffd700');
    }

    createEquipmentButton(x, y) {
        this.equipmentButton = this.add.text(x, y, 'Char', {
            fontSize: '12px',
            color: '#00ffcc',
            backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.hudContainer.add(this.equipmentButton);

        this.equipmentButton.on('pointerup', () => {
            this.showEquipmentScreen();
        });
    }

    createSkillsButton(x, y) {
        this.skillsButton = this.add.text(x, y, 'Skills', {
            fontSize: '12px',
            color: '#ffd56b',
            backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.hudContainer.add(this.skillsButton);

        this.skillsButton.on('pointerup', () => {
            this.showSkillsScreen();
        });
    }

    createTalentButton(x, y) {
        this.talentButton = this.add.text(x, y, 'Talents', {
            fontSize: '12px',
            color: '#ffd700',
            backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.hudContainer.add(this.talentButton);
        this.talentButton.on('pointerup', () => {
            this.showTalentScreen();
        });
    }

    updateTalentButtonGlow() {
        if (!this.talentButton) return;
        const pts = this.player.talentPoints;
        if (this._talentButtonGlowTween) {
            this._talentButtonGlowTween.stop();
            this._talentButtonGlowTween = null;
        }
        if (pts > 0) {
            this.talentButton.setStyle({ backgroundColor: '#6b3a00', color: '#ffd700' });
            this.talentButton.setAlpha(1);
            this._talentButtonGlowTween = this.tweens.add({
                targets: this.talentButton,
                alpha: { from: 1.0, to: 0.45 },
                duration: 650,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        } else {
            this.talentButton.setStyle({ backgroundColor: '#333333', color: '#ffd700' });
            this.talentButton.setAlpha(1);
        }
    }

    createStoreButton(x, y) {
        this.storeButton = this.add.text(x, y, 'Store', {
            fontSize: '12px',
            color: '#ff99cc',
            backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.hudContainer.add(this.storeButton);
        this.storeButton.on('pointerup', () => {
            this.showStoreScreen();
        });
    }

    showStoreScreen() {
        this.currentScreen = 'store';
        this.armedEquipGem = null;
        this.closeSkillGemPopup();
        this.closeInventoryItemPopup();
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(true);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(false);
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(false);
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        this.boardContainer.setVisible(false);
        this.hudContainer.setVisible(false);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(false);
        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
        this.setGameBoardActive(false);
        // Only refresh store inventory every 10 battles
        if (!this.lastStoreRefreshBattle || (this.battleNumber - this.lastStoreRefreshBattle >= 10)) {
            this.generateStoreInventory();
            this.lastStoreRefreshBattle = this.battleNumber;
        }
        this.refreshStoreUI();
    }

    getItemPrice(item) {
        const rarityMultipliers = { Normal: 1, Magic: 3, Rare: 8, Legendary: 20 };
        const mult = rarityMultipliers[item.rarity] || 1;
        const levelFactor = Math.max(1, item.itemLevel);
        const statTotal = Object.values(item.stats).reduce((sum, v) => sum + v, 0);
        return Math.max(5, Math.round((10 + statTotal * 0.8) * mult * (1 + levelFactor * 0.1) * 0.85));
    }

    generateStoreInventory() {
        this.storeItems = [];
        const lootScore = this.battleNumber * 10;
        for (let i = 0; i < 4; i++) {
            let item;
            let tries = 0;
            do {
                item = this.generateLoot(lootScore);
                tries++;
            } while (item.rarity === 'Normal' && tries < 20);
            // Guarantee at least Magic quality
            if (item.rarity === 'Normal') item = this.generateLoot(lootScore, 'Magic');
            item.price = this.getItemPrice(item);
            this.storeItems.push(item);
        }
    }

    refreshStoreUI() {
        if (!this.storeScreenGroup) return;

        // Update gold label
        if (this.storeGoldLabel) {
            this.storeGoldLabel.setText(`🪙 Gold: ${this.player.gold}`);
        }

        // Clear old item cards
        this.storeItemCards.forEach(card => {
            card.forEach(obj => obj.destroy());
        });
        this.storeItemCards = [];

        const width = this.sys.game.config.width;
        // 2×2 grid layout below shopkeeper / gold display
        const cardW = 182;
        const cardH = 200;
        const colGap = 6;
        const rowGap = 8;
        const gridStartY = 365; // below divider + gold label
        const col0X = (width / 2) - (cardW / 2) - (colGap / 2);
        const col1X = (width / 2) + (cardW / 2) + (colGap / 2);
        const row0Y = gridStartY + cardH / 2;
        const row1Y = gridStartY + cardH + rowGap + cardH / 2;
        const positions = [
            { cx: col0X, cy: row0Y },
            { cx: col1X, cy: row0Y },
            { cx: col0X, cy: row1Y },
            { cx: col1X, cy: row1Y }
        ];

        this.storeItems.forEach((item, i) => {
            const cardObjs = [];
            const { cx, cy } = positions[i];

            // Card background
            const cardBg = this.add.rectangle(cx, cy, cardW, cardH, 0x1e1e2e, 1)
                .setStrokeStyle(2, item.frameColor, 1);
            cardObjs.push(cardBg);

            // Item icon
            const icon = this.add.text(cx, cy - 88, item.icon, { fontSize: '22px' }).setOrigin(0.5, 0.5);
            cardObjs.push(icon);

            // Item name (rarity color)
            const nameText = this.add.text(cx, cy - 66, item.name, {
                fontSize: '12px', color: item.rarityTextColor, fontStyle: 'bold',
                align: 'center', wordWrap: { width: cardW - 12, useAdvancedWrap: true }
            }).setOrigin(0.5, 0);
            cardObjs.push(nameText);

            // Type / level / rarity
            const typeText = this.add.text(cx, cy - 30, `iLvl ${item.itemLevel} | ${item.rarity} | ${item.type}`, {
                fontSize: '10px', color: item.rarityTextColor, align: 'center'
            }).setOrigin(0.5, 0);
            cardObjs.push(typeText);

            // Build comparison lines (green = better, red = worse, yellow = equal)
            const compareData = this.getRewardCompareData(item);
            const targetSlot = compareData.targetSlot;
            const displacedItems = targetSlot ? this.getDisplacedItemsForEquip(item, targetSlot) : [];
            const equippedStats = {};
            displacedItems.forEach(entry => {
                const s = (entry && entry.item && entry.item.stats) || {};
                Object.entries(s).forEach(([stat, value]) => {
                    equippedStats[stat] = (equippedStats[stat] || 0) + value;
                });
            });
            const itemStats = item.stats || {};
            const allStatKeys = Array.from(new Set([...Object.keys(itemStats), ...Object.keys(equippedStats)]));
            const hasEquipped = displacedItems.length > 0 && displacedItems.some(e => e && e.item);
            const perStatLines = allStatKeys.slice(0, 5).map(stat => {
                const newVal = itemStats[stat] || 0;
                const oldVal = equippedStats[stat] || 0;
                const delta = newVal - oldVal;
                const label = this.getStatLabel(stat);
                if (!hasEquipped || oldVal === 0 || delta > 0) {
                    return { text: `${label} +${newVal}`, color: '#4eff8a' };
                } else if (delta < 0) {
                    return { text: `${label} +${newVal}`, color: '#ff6b6b' };
                } else {
                    return { text: `${label} +${newVal}`, color: '#ffd966' };
                }
            });

            let lineY = cy - 14;
            perStatLines.forEach(line => {
                const lt = this.add.text(cx, lineY, line.text, {
                    fontSize: '13px', color: line.color, align: 'center'
                }).setOrigin(0.5, 0);
                cardObjs.push(lt);
                lineY += 16;
            });

            // Price label (non-interactive display only)
            const canAfford = this.player.gold >= item.price;
            const priceLabel = this.add.text(cx, cy + 78, canAfford ? `🪙 ${item.price}  Buy` : `🪙 ${item.price}`, {
                fontSize: '12px',
                color: canAfford ? '#111111' : '#ff4444',
                backgroundColor: canAfford ? '#ffd966' : '#1a0a0a',
                fontStyle: 'bold',
                padding: { left: 7, right: 7, top: 4, bottom: 4 }
            }).setOrigin(0.5, 0.5);
            cardObjs.push(priceLabel);

            // Make the whole card interactive so the tap target is as large as possible.
            // Capture the item by reference so the closure stays valid even if the
            // storeItems array is spliced before the deferred call executes.
            const capturedItem = item;
            cardBg.setInteractive({ useHandCursor: true });
            cardBg.on('pointerup', () => {
                // Defer one frame so Phaser finishes processing the current pointer event
                // before we destroy and rebuild all card objects via refreshStoreUI.
                this.time.delayedCall(0, () => {
                    const idx = this.storeItems.indexOf(capturedItem);
                    if (idx !== -1) this.buyStoreItem(idx);
                });
            });

            cardObjs.forEach(obj => this.storeScreenGroup.add(obj));
            this.storeItemCards.push(cardObjs);
        });
    }

    buyStoreItem(index) {
        const item = this.storeItems[index];
        if (!item) return;

        if (this.player.gold < item.price) {
            this.addCombatLog('Not enough gold!', '#ff8888');
            return;
        }

        if (this.inventory.length >= this.maxInventorySlots) {
            this.addCombatLog('Inventory full! Cannot buy.', '#ff8888');
            return;
        }

        this.player.gold -= item.price;
        const bought = { ...item };
        delete bought.price;
        this.inventory.push(bought);
        this.updateInventoryGridUI();
        this.addCombatLog(`Bought ${item.rarity} ${item.name} for ${item.price} gold!`, item.rarityTextColor);

        // Remove from store
        this.storeItems.splice(index, 1);
        this.refreshStoreUI();
        this.updateGoldDisplay();
    }

    createStoreScreen() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.storeScreenGroup = this.add.container(0, 0).setVisible(false);

        const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a14, 1);
        const panel = this.add.rectangle(width / 2, height / 2, width - 10, height - 10, 0x12121e, 1)
            .setStrokeStyle(2, 0xff99cc, 0.8);
        this.storeScreenGroup.add([bg, panel]);

        // Title
        const title = this.add.text(width / 2, 22, 'Rodent Emporium', {
            fontSize: '20px', color: '#ff99cc', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.storeScreenGroup.add(title);

        // --- Shopkeeper image ---
        const cx = width / 2;
        // Move image up and make it larger, but not colliding with shop items
        const baseY = 170; // move up
        const maxImgHeight = 280;
        const maxImgWidth = 250;
        const shopkeeperImg = this.add.image(cx, baseY, 'Shoppkeeper').setOrigin(0.5, 0.5);
        shopkeeperImg.setDisplaySize(maxImgWidth, maxImgHeight);
        this.storeScreenGroup.add(shopkeeperImg);

        // Shopkeeper dialogue
        const dialogue = this.add.text(cx, baseY + 145, '"Take a look, yes-yes! Fine wares!"', {
            fontSize: '12px', color: '#ffddaa', fontStyle: 'italic'
        }).setOrigin(0.5);
        this.storeScreenGroup.add(dialogue);

        // Divider line
        const divider = this.add.rectangle(width / 2, 340, width - 30, 2, 0xff99cc, 0.3);
        this.storeScreenGroup.add(divider);

        // Gold display on store screen
        this.storeGoldLabel = this.add.text(width / 2, 352, `🪙 Gold: ${this.player.gold}`, {
            fontSize: '14px', color: '#ffd966', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.storeScreenGroup.add(this.storeGoldLabel);

        // Back button — top-left so it is always visible above the item grid
        const backBtn = this.add.text(12, 12, 'Back to Game', {
            fontSize: '14px', color: '#00ff00', backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerup', () => this.showGameScreen());
        this.storeScreenGroup.add(backBtn);
    }

    showTalentScreen() {
        this.currentScreen = 'talents';
        this.armedEquipGem = null;
        this.closeSkillGemPopup();
        this.closeInventoryItemPopup();
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(true);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(false);
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(false);
        this.boardContainer.setVisible(false);
        this.hudContainer.setVisible(false);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(false);
        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
        this.setGameBoardActive(false);
        // Reset zoom/pan — centre on the starting-node triangle
        this._talentZoom = 0.70;
        this._talentPanX = 45;
        this._talentPanY = 35;
        this._talentIsPinching = false;
        this._talentPinchStartDist = null;
        this._talentPinchStartZoom = null;
        this._applyTalentTreeTransform();
        this.refreshTalentScreenUI();
    }

    // ----------------------------------------------------------------
    // Talent prerequisite logic
    // ----------------------------------------------------------------
    isTalentAvailable(nodeId) {
        const node = TALENT_NODE_MAP.get(nodeId);
        if (!node || this.allocatedTalents.has(nodeId)) return false;
        if (node.isStart) {
            // Only one starting node may be chosen (ids 1=STR, 2=DEX, 104=INT)
            return ![1, 2, 104].some(sid => this.allocatedTalents.has(sid));
        }
        if (!Array.isArray(node.prereqs) || node.prereqs.length === 0) return false;
        // OR logic: available if ANY prerequisite is already allocated
        return node.prereqs.some(pid => this.allocatedTalents.has(pid));
    }

    canUndoTalent(nodeId) {
        if (!this.allocatedTalents.has(nodeId)) return false;
        for (const allocId of this.allocatedTalents) {
            if (allocId === nodeId) continue;
            const n = TALENT_NODE_MAP.get(allocId);
            if (n && Array.isArray(n.prereqs) && n.prereqs.includes(nodeId)) {
                // This allocated node depends on nodeId.
                // It's safe to undo only if it has another allocated prereq.
                const hasAlternate = n.prereqs.filter(p => p !== nodeId).some(p => this.allocatedTalents.has(p));
                if (!hasAlternate) return false;
            }
        }
        return true;
    }

    allocateTalent(nodeId) {
        const node = TALENT_NODE_MAP.get(nodeId);
        if (!node) return;
        if (this.allocatedTalents.has(nodeId)) return;
        if (!this.isTalentAvailable(nodeId)) {
            const msg = node.isStart
                ? 'You have already chosen a starting path!'
                : 'Prerequisite nodes must be allocated first.';
            this.addCombatLog(msg, '#ff8888');
            return;
        }
        if (this.player.talentPoints <= 0) {
            this.addCombatLog('No talent points — defeat an enemy to earn one!', '#ff8888');
            return;
        }
        this.player.talentPoints -= 1;
        this.allocatedTalents.add(nodeId);
        if (node.stat === 'strength' || node.stat === 'intelligence' || node.stat === 'dexterity') {
            this.player[node.stat] = (this.player[node.stat] || 0) + node.value;
        }
        this.addCombatLog(`Learned ${node.name}! ${node.shortDesc}`, '#ffd700');
        this.closeTalentNodePopup();
        this.refreshTalentScreenUI();
    }

    undoTalent(nodeId) {
        if (!this.canUndoTalent(nodeId)) {
            this.addCombatLog('Cannot refund — other allocated nodes depend on this one.', '#ff8888');
            return;
        }
        const node = TALENT_NODE_MAP.get(nodeId);
        if (!node) return;
        this.allocatedTalents.delete(nodeId);
        this.player.talentPoints += 1;
        if (node.stat === 'strength' || node.stat === 'intelligence' || node.stat === 'dexterity') {
            this.player[node.stat] = Math.max(0, (this.player[node.stat] || 0) - node.value);
        }
        this.addCombatLog(`Refunded ${node.name}.`, '#aaaaaa');
        this.closeTalentNodePopup();
        this.refreshTalentScreenUI();
    }

    // ----------------------------------------------------------------
    // Talent node popup
    // ----------------------------------------------------------------
    openTalentNodePopup(nodeId) {
        this.closeTalentNodePopup();
        const node = TALENT_NODE_MAP.get(nodeId);
        if (!node) return;

        const width  = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const panelW = 310;
        const panelH = 300;
        const cx = width  / 2;
        const cy = height / 2;

        const isAllocated = this.allocatedTalents.has(nodeId);
        const isAvailable = this.isTalentAvailable(nodeId);
        const hasPoints   = this.player.talentPoints > 0;
        const nodeColor   = this.toHexColor(node.color);

        const overlay = this.add.rectangle(cx, cy, width, height, 0x000000, 0.65)
            .setInteractive()
            .on('pointerup', () => this.closeTalentNodePopup());

        // Outer glow ring for the panel
        const glowRing = this.add.rectangle(cx, cy, panelW + 6, panelH + 6, node.color, 0.25)
            .setStrokeStyle(2, node.color, 0.7);
        const panel = this.add.rectangle(cx, cy, panelW, panelH, 0x07070f, 1)
            .setStrokeStyle(2, node.color, 0.9);

        // Keystone badge
        const badgeSize = node.isKeystone ? 36 : 28;
        const iconY = cy - 108;
        const iconText = this.add.text(cx, iconY, node.icon, {
            fontSize: `${badgeSize}px`
        }).setOrigin(0.5);

        const nameText = this.add.text(cx, cy - 76, node.name, {
            fontSize: '17px', color: nodeColor, fontStyle: 'bold'
        }).setOrigin(0.5);

        const shortText = this.add.text(cx, cy - 56, node.shortDesc, {
            fontSize: '13px', color: '#ffd700'
        }).setOrigin(0.5);

        // Separator line
        const sep = this.add.rectangle(cx, cy - 38, panelW - 24, 1, node.color, 0.4);

        const descText = this.add.text(cx, cy - 8, node.desc || '', {
            fontSize: '14px', color: '#b0b0cc', align: 'center',
            wordWrap: { width: panelW - 32, useAdvancedWrap: true }
        }).setOrigin(0.5, 0);

        let statusColor = '#666688';
        let statusMsg   = 'Not yet reachable';
        if (isAllocated)                        { statusColor = '#00ff88'; statusMsg = '✓ Allocated'; }
        else if (isAvailable && hasPoints)      { statusColor = '#ffd700'; statusMsg = '● Available'; }
        else if (isAvailable && !hasPoints)     { statusColor = '#ff6666'; statusMsg = '✗ No talent points'; }

        const statusText = this.add.text(cx, cy + 90, statusMsg, {
            fontSize: '11px', color: statusColor, fontStyle: 'italic'
        }).setOrigin(0.5);

        const items = [overlay, glowRing, panel, iconText, nameText, shortText, sep, descText, statusText];

        if (!isAllocated && isAvailable && hasPoints) {
            const assignBtn = this.add.text(cx, cy + 115, '  Assign Point  ', {
                fontSize: '14px', color: '#111111',
                backgroundColor: '#ffd700',
                padding: { left: 12, right: 12, top: 5, bottom: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            assignBtn.on('pointerup', () => this.allocateTalent(nodeId));
            items.push(assignBtn);
        } else if (!isAllocated) {
            // Greyed-out assign button
            const disabledBtn = this.add.text(cx, cy + 115, '  Assign Point  ', {
                fontSize: '14px', color: '#555577',
                backgroundColor: '#1c1c2e',
                padding: { left: 12, right: 12, top: 5, bottom: 6 }
            }).setOrigin(0.5);
            items.push(disabledBtn);
        }

        if (isAllocated && this.canUndoTalent(nodeId)) {
            const undoX = !isAllocated ? cx : cx + 60;
            const undoBtn = this.add.text(cx - 70, cy + 115, ' Refund ', {
                fontSize: '13px', color: '#ffaaaa',
                backgroundColor: '#5a0a0a',
                padding: { left: 8, right: 8, top: 5, bottom: 6 }
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            undoBtn.on('pointerup', () => this.undoTalent(nodeId));
            items.push(undoBtn);
        }

        const closeBtn = this.add.text(cx + panelW / 2 - 4, cy - panelH / 2 + 8, '✕', {
            fontSize: '16px', color: '#888899'
        }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerup', () => this.closeTalentNodePopup());
        items.push(closeBtn);

        this.talentNodePopup = this.add.container(0, 0, items);
        this.talentScreenGroup.add(this.talentNodePopup);
    }

    closeTalentNodePopup() {
        if (this.talentNodePopup) {
            this.talentNodePopup.destroy();
            this.talentNodePopup = null;
        }
    }

    createTalentScreen() {
        const width  = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.talentScreenGroup = this.add.container(0, 0).setVisible(false);

        const bg    = this.add.rectangle(width / 2, height / 2, width, height, 0x060610, 1);
        const panel = this.add.rectangle(width / 2, height / 2, width - 10, height - 10, 0x0a0a18, 1)
            .setStrokeStyle(2, 0xffd700, 0.7);
        this.talentScreenGroup.add([bg, panel]);

        // --- Zoomable/pannable tree container ---
        this.talentTreeContainer = this.add.container(0, 0);
        this.talentScreenGroup.add(this.talentTreeContainer);

        // Clip to panel border
        const maskShape = this.make.graphics({ add: false });
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(5, 5, width - 10, height - 10);
        this.talentTreeContainer.setMask(maskShape.createGeometryMask());

        // Connection-lines layer (drawn first so nodes sit on top)
        this.talentConnectionGraphics = this.add.graphics();
        this.talentTreeContainer.add(this.talentConnectionGraphics);

        // --- Build node UI elements ---
        this.talentNodeUI = {};

        TALENT_TREE_NODES.forEach(node => {
            const r = node.isStart ? 20 : node.isKeystone ? 17 : 13;

            // Outer glow ring (animated pulse for available nodes)
            const glow = this.add.circle(node.x, node.y, r + 9, node.color, 0).setAlpha(0);

            // Node body
            const circle = this.add.circle(node.x, node.y, r, 0x0c0c20, 1)
                .setStrokeStyle(node.isStart ? 3 : 2, 0x333355, 1)
                .setInteractive({ useHandCursor: true });

            const iconText = this.add.text(node.x, node.y, node.icon, {
                fontSize: node.isStart ? '16px' : node.isKeystone ? '13px' : '10px'
            }).setOrigin(0.5);

            // Open popup instead of allocating directly
            circle.on('pointerup', () => {
                if (!this._talentIsDragging) this.openTalentNodePopup(node.id);
            });
            // Cancel any pending drag when the pointer lands on a node
            circle.on('pointerdown', () => {
                this._talentPointerOnNode = true;
                this._talentDragStartX = null;
                this._talentDragStartY = null;
                this._talentIsDragging = false;
            });

            this.talentNodeUI[node.id] = { circle, glow, iconText };
            this.talentTreeContainer.add([glow, circle, iconText]);
        });

        // --- Fixed HUD overlay (not affected by pan/zoom) ---
        const title = this.add.text(width / 2, 22, 'Talent Tree', {
            fontSize: '20px', color: '#ffd700', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.talentPointsLabel = this.add.text(width / 2, 44, 'Points: 0', {
            fontSize: '13px', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.talentHintText = this.add.text(width / 2, 63, 'Tap a node to view and assign', {
            fontSize: '10px', color: '#886644', align: 'center'
        }).setOrigin(0.5);

        const backBtn = this.add.text(12, 8, '← Back', {
            fontSize: '13px', color: '#00ffcc', backgroundColor: '#1a1a2e',
            padding: { left: 8, right: 8, top: 3, bottom: 3 }
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerup', () => this.showGameScreen());

        this.talentZoomText = this.add.text(width - 12, 8, '100%', {
            fontSize: '11px', color: '#888899'
        }).setOrigin(1, 0);

        this.talentScreenGroup.add([title, this.talentPointsLabel, this.talentHintText, backBtn, this.talentZoomText]);

        // --- Zoom / pan state ---
        this._talentZoom = 0.70;
        this._talentPanX = 45;
        this._talentPanY = 35;
        this._talentMinZoom = 0.35;
        this._talentMaxZoom = 2.5;
        this._talentPinchStartDist = null;
        this._talentPinchStartZoom = null;
        this._talentIsPinching = false;
        this._talentDragStartX = null;
        this._talentDragStartY = null;
        this._talentIsDragging = false;
        this._talentPointerOnNode = false;

        // --- Pinch-to-zoom via native DOM touch events ---
        const canvas = this.game.canvas;
        const canvasRect = () => canvas.getBoundingClientRect();

        canvas.addEventListener('touchstart', (e) => {
            if (this.currentScreen !== 'talents') return;
            if (e.touches.length === 2) {
                this._talentIsPinching = true;
                const t1 = e.touches[0], t2 = e.touches[1];
                this._talentPinchStartDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                this._talentPinchStartZoom = this._talentZoom;
                this._talentDragStartX = null;
                this._talentIsDragging = false;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (this.currentScreen !== 'talents') return;
            if (e.touches.length === 2 && this._talentPinchStartDist !== null) {
                this._talentIsPinching = true;
                const t1 = e.touches[0], t2 = e.touches[1];
                const dist  = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
                const scale = dist / this._talentPinchStartDist;
                const oldZoom = this._talentZoom;
                this._talentZoom = Phaser.Math.Clamp(
                    this._talentPinchStartZoom * scale, this._talentMinZoom, this._talentMaxZoom);
                const rect  = canvasRect();
                const scaleX = this.scale.width  / rect.width;
                const scaleY = this.scale.height / rect.height;
                const cx = ((t1.clientX + t2.clientX) / 2 - rect.left) * scaleX;
                const cy = ((t1.clientY + t2.clientY) / 2 - rect.top)  * scaleY;
                if (oldZoom !== 0) {
                    this._talentPanX = cx - (cx - this._talentPanX) * (this._talentZoom / oldZoom);
                    this._talentPanY = cy - (cy - this._talentPanY) * (this._talentZoom / oldZoom);
                }
                this._applyTalentTreeTransform();
                e.preventDefault();
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            if (this.currentScreen !== 'talents') return;
            if (e.touches.length < 2) {
                this._talentPinchStartDist = null;
                this._talentPinchStartZoom = null;
                this.time.delayedCall(100, () => { this._talentIsPinching = false; });
            }
        }, { passive: true });

        // --- Drag-to-pan ---
        this.input.on('pointerdown', (pointer) => {
            if (this.currentScreen !== 'talents') return;
            if (this._talentIsPinching) return;
            // Set drag start immediately; node pointerdown will cancel it if a node was hit
            this._talentPointerOnNode = false;
            this._talentDragStartX = pointer.x;
            this._talentDragStartY = pointer.y;
            this._talentIsDragging = false;
        });

        this.input.on('pointermove', (pointer) => {
            if (this.currentScreen !== 'talents') return;
            if (this._talentIsPinching || !pointer.isDown || this._talentDragStartX === null) return;
            const dx = pointer.x - this._talentDragStartX;
            const dy = pointer.y - this._talentDragStartY;
            if (!this._talentIsDragging && Math.abs(dx) + Math.abs(dy) > 10) {
                this._talentIsDragging = true;
            }
            if (this._talentIsDragging) {
                this._talentPanX += dx;
                this._talentPanY += dy;
                this._talentDragStartX = pointer.x;
                this._talentDragStartY = pointer.y;
                this._applyTalentTreeTransform();
            }
        });

        this.input.on('pointerup', () => {
            if (this.currentScreen !== 'talents') return;
            this._talentDragStartX = null;
            this._talentDragStartY = null;
            this._talentIsDragging = false;
            this._talentPointerOnNode = false;
        });

        // --- Mouse-wheel zoom (desktop) ---
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.currentScreen !== 'talents') return;
            const oldZoom = this._talentZoom;
            this._talentZoom = Phaser.Math.Clamp(
                this._talentZoom + (deltaY > 0 ? -0.1 : 0.1),
                this._talentMinZoom, this._talentMaxZoom);
            const cx = pointer.x, cy = pointer.y;
            this._talentPanX = cx - (cx - this._talentPanX) * (this._talentZoom / oldZoom);
            this._talentPanY = cy - (cy - this._talentPanY) * (this._talentZoom / oldZoom);
            this._applyTalentTreeTransform();
        });

        this.refreshTalentScreenUI();
    }

    _applyTalentTreeTransform() {
        if (!this.talentTreeContainer) return;
        this.talentTreeContainer.setScale(this._talentZoom);
        this.talentTreeContainer.setPosition(this._talentPanX, this._talentPanY);
        if (this.talentZoomText) {
            this.talentZoomText.setText(`${Math.round(this._talentZoom * 100)}%`);
        }
    }

    refreshTalentScreenUI() {
        if (!this.talentScreenGroup) return;

        const pts = this.player.talentPoints;
        if (this.talentPointsLabel) {
            this.talentPointsLabel.setText(`Talent Points: ${pts}`);
            this.talentPointsLabel.setColor(pts > 0 ? '#ffd700' : '#888888');
        }
        this.updateTalentButtonGlow();

        // Did the player pick a starting node yet?
        const startChosen = [1, 2, 104].some(sid => this.allocatedTalents.has(sid));

        // Update hint text
        if (this.talentHintText) {
            if (!startChosen) {
                this.talentHintText.setText('Choose a starting path: Strength, Dexterity, or Intelligence');
                this.talentHintText.setColor('#ffcc44');
            } else {
                this.talentHintText.setText(pts > 0 ? 'Glowing nodes are available — tap to assign' : 'Defeat enemies to earn talent points');
                this.talentHintText.setColor(pts > 0 ? '#88dd88' : '#886644');
            }
        }

        // Redraw connection lines
        if (this.talentConnectionGraphics) {
            this.talentConnectionGraphics.clear();
            TALENT_TREE_CONNECTIONS.forEach(conn => {
                const fromNode = TALENT_NODE_MAP.get(conn.from);
                const toNode   = TALENT_NODE_MAP.get(conn.to);
                if (!fromNode || !toNode) return;

                const fromAlloc = this.allocatedTalents.has(conn.from);
                const toAlloc   = this.allocatedTalents.has(conn.to);

                const lineW = (fromAlloc && toAlloc) ? 3 : 2;
                const color = (fromAlloc && toAlloc) ? 0xffd700
                            : (fromAlloc || toAlloc) ? 0x887733
                            : 0x3a3a55;
                const alpha = (fromAlloc && toAlloc) ? 1.0
                            : (fromAlloc || toAlloc) ? 0.65
                            : 0.45;

                this.talentConnectionGraphics.lineStyle(lineW, color, alpha);
                this.talentConnectionGraphics.beginPath();
                this.talentConnectionGraphics.moveTo(fromNode.x, fromNode.y);
                this.talentConnectionGraphics.lineTo(toNode.x, toNode.y);
                this.talentConnectionGraphics.strokePath();
            });
        }

        // Kill any leftover glow tweens from last refresh
        if (this._talentGlowTweens) {
            this._talentGlowTweens.forEach(t => { if (t && t.isPlaying && t.isPlaying()) t.stop(); });
        }
        this._talentGlowTweens = [];

        // Update each node's visual state
        Object.entries(this.talentNodeUI).forEach(([idStr, ui]) => {
            const nodeId   = parseInt(idStr);
            const node     = TALENT_NODE_MAP.get(nodeId);
            if (!node || !ui) return;

            const isAllocated  = this.allocatedTalents.has(nodeId);
            const isAvailable  = this.isTalentAvailable(nodeId);
            const strokeW      = node.isStart ? 3 : 2;

            // Stop any existing glow tween on this node
            if (ui.glowTween) { ui.glowTween.stop(); ui.glowTween = null; }

            if (isAllocated) {
                // Bright, coloured — node is spent
                ui.circle.setFillStyle(0x1a1000, 1).setStrokeStyle(strokeW, node.color, 1);
                ui.glow.setFillStyle(node.color, 0.2).setAlpha(0.6);
                ui.iconText.setAlpha(1);
            } else if (isAvailable && pts > 0) {
                // Pulsing golden glow — next available
                ui.circle.setFillStyle(0x101820, 1).setStrokeStyle(strokeW, 0xffd700, 1);
                ui.glow.setFillStyle(0xffd700, 0.3).setAlpha(0.4);
                ui.iconText.setAlpha(1);
                // Animate the glow pulse
                const tween = this.tweens.add({
                    targets: ui.glow,
                    alpha: { from: 0.2, to: 0.85 },
                    duration: 700,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                ui.glowTween = tween;
                this._talentGlowTweens.push(tween);
            } else if (isAvailable && pts === 0) {
                // Available path but no points
                ui.circle.setFillStyle(0x0e0e1c, 1).setStrokeStyle(strokeW, 0x556688, 1);
                ui.glow.setAlpha(0);
                ui.iconText.setAlpha(0.7);
            } else if (node.isStart && startChosen) {
                // Locked starting node (player chose a different one)
                ui.circle.setFillStyle(0x0a0a18, 1).setStrokeStyle(strokeW, 0x2a2a44, 1);
                ui.glow.setAlpha(0);
                ui.iconText.setAlpha(0.2);
            } else {
                // Not yet reachable — visible but dimmed
                ui.circle.setFillStyle(0x0d0d1e, 1).setStrokeStyle(strokeW, 0x44446a, 1);
                ui.glow.setAlpha(0);
                ui.iconText.setAlpha(0.5);
            }
        });
    }

    openGemInventoryPopup(gemType = 'active', slotIndex = 0, socketIndex = -1) {
        if (!this.gemInventoryPopup) return;
        this._gemInvType = gemType || 'active';
        this._gemInvTargetSlot = slotIndex;
        this._gemInvTargetSocket = socketIndex;
        this.gemInventoryPage = 0;
        this.refreshGemInventoryPopup();
        this.gemInventoryPopup.setVisible(true);
    }

    closeGemInventoryPopup() {
        if (this.gemInventoryPopup) this.gemInventoryPopup.setVisible(false);
    }

    refreshGemInventoryPopup() {
        if (!this.gemInventoryGridCells) return;
        const gemType = this._gemInvType || 'active';
        const slotIndex = this._gemInvTargetSlot !== undefined ? this._gemInvTargetSlot : 0;
        const socketIndex = this._gemInvTargetSocket !== undefined ? this._gemInvTargetSocket : -1;

        // Update title
        if (this.gemInvTitleLabel) {
            this.gemInvTitleLabel.setText(gemType === 'active' ? 'Skill Gems' : 'Support Gems');
        }

        // Filter gems by type
        const filteredGems = this.skillsInventoryGems.filter(g => g.type === gemType);

        const pageSize = this._gemInvPageSize || 20;
        const page = this.gemInventoryPage || 0;
        const start = page * pageSize;
        const maxPage = Math.max(0, Math.ceil(filteredGems.length / pageSize) - 1);
        const cellImgSize = this._invCellImageSize || 50;

        // Remove Gem button: visible only for support when that socket has a gem
        if (this.gemInvRemoveBtn) {
            const loadout = this.playerSkills[slotIndex];
            const socketOccupied = gemType === 'support' && socketIndex >= 0
                && loadout && loadout.supportIds && loadout.supportIds[socketIndex] != null;
            this.gemInvRemoveBtn.setVisible(socketOccupied);
        }

        this.gemInventoryGridCells.forEach((cell, idx) => {
            const gem = filteredGems[start + idx] || null;
            if (!gem) {
                cell.cellBg.setVisible(false);
                cell.cellImage.setVisible(false);
                cell.cellIcon.setVisible(false);
                cell.cellName.setVisible(false);
                return;
            }
            cell.cellBg.setVisible(true);
            cell.cellName.setVisible(true);

            const display = this.getSkillGemDisplay(gem);
            if (display.imageKey) {
                cell.cellImage.setTexture(display.imageKey);
                cell.cellImage.setDisplaySize(cellImgSize, cellImgSize);
                cell.cellImage.setVisible(true);
                cell.cellIcon.setVisible(false);
            } else {
                cell.cellImage.setVisible(false);
                cell.cellIcon.setText(display.icon);
                cell.cellIcon.setVisible(true);
            }
            cell.cellName.setText(display.name);
            // Shrink font for longer names so the full name fits within the cell's 2 allowed lines
            cell.cellName.setFontSize(display.name.length > 13 ? '11px' : '13px');
            cell.cellBg.setStrokeStyle(2, 0x2a3d50, 1);
            cell.cellBg.setFillStyle(0x141e2a, 1);

            cell.cellBg.removeAllListeners('pointerdown');
            cell.cellBg.removeAllListeners('pointerup');
            cell.cellBg.removeAllListeners('pointerout');
            if (gemType === 'support') {
                let cellLpTimer = null;
                let cellLpFired = false;
                cell.cellBg.on('pointerdown', () => {
                    cellLpFired = false;
                    cellLpTimer = this.time.delayedCall(500, () => {
                        cellLpFired = true;
                        this.showSupportGemInfoPopup(gem);
                    });
                });
                cell.cellBg.on('pointerup', () => {
                    if (cellLpTimer) { cellLpTimer.remove(false); cellLpTimer = null; }
                    if (cellLpFired) {
                        cellLpFired = false;
                        if (this.skillsGemModal) this.skillsGemModal.setVisible(false);
                    } else {
                        this.equipGemToSupportSlot(slotIndex, socketIndex, gem);
                        this.closeGemInventoryPopup();
                        this.refreshSkillsScreenUI();
                    }
                });
                cell.cellBg.on('pointerout', () => {
                    if (cellLpTimer) { cellLpTimer.remove(false); cellLpTimer = null; }
                });
            } else {
                cell.cellBg.on('pointerup', () => {
                    this.equipGemToActiveSlot(slotIndex, gem);
                    this.closeGemInventoryPopup();
                    this.refreshSkillsScreenUI();
                });
            }
        });

        if (this.gemInvCountLabel) {
            this.gemInvCountLabel.setText(`${filteredGems.length} gem(s)`);
        }
        if (this.gemInvPageLabel) {
            this.gemInvPageLabel.setText(`Page ${page + 1} / ${maxPage + 1}`);
        }
        if (this.gemInvPrevBtn) this.gemInvPrevBtn.setAlpha(page > 0 ? 1 : 0.4);
        if (this.gemInvNextBtn) this.gemInvNextBtn.setAlpha(page < maxPage ? 1 : 0.4);
    }

    createSkillsScreen() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.skillsScreenGroup = this.add.container(0, 0).setVisible(false);

        const bg = this.add.rectangle(width / 2, height / 2, width - 20, height - 20, 0x151515, 0.98)
            .setStrokeStyle(2, 0xffffff, 1);
        const title = this.add.text(width / 2, 44, 'Skill Gems', {
            fontSize: '24px',
            color: '#ffd56b',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        const subtitle = this.add.text(width / 2, 70, 'Tap skill gem to switch • Hold for info • Tap socket for support', {
            fontSize: '12px',
            color: '#bfbfbf'
        }).setOrigin(0.5);
        const backBtn = this.add.text(12, 12, 'Back to Game', {
            fontSize: '14px',
            color: '#00ffcc',
            backgroundColor: '#333333',
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
        }).setOrigin(0, 0).setInteractive({ useHandCursor: true });
        backBtn.on('pointerup', () => this.showGameScreen());

        this.skillsScreenGroup.add([bg, title, subtitle, backBtn]);

        // --- Three horizontal skill columns ---
        // Screen: 390 wide. Column centers at ~65, 195, 325
        const colCentersX = [
            Math.round(width / 6),
            Math.round(width / 2),
            Math.round(width * 5 / 6)
        ];
        const mainY = 165;
        const mainRadius = 62;     // borderless — no stroke
        const supportRadius = 38;
        const supportStartY = 328;
        const supportGapY = 88;
        this.skillsActiveSlotUI = [];

        for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
            const centerX = colCentersX[slotIndex];
            const centerY = mainY;

            // Label above gem
            const cardLabel = this.add.text(centerX, centerY - mainRadius - 14, `Skill ${slotIndex + 1}`, {
                fontSize: '15px',
                color: '#d9d9d9',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // Borderless main gem background — slightly brighter so art reads clearly
            const cardBg = this.add.circle(centerX, centerY, mainRadius, 0x3e3e52, 1)
                .setInteractive({ useHandCursor: true });

            const iconText = this.add.text(centerX, centerY, '', {
                fontSize: '50px'
            }).setOrigin(0.5);

            const skillIconImage = this.add.image(centerX, centerY, 'skill_cleave')
                .setOrigin(0.5).setVisible(false);
            skillIconImage.setDisplaySize(mainRadius * 2 + 2, mainRadius * 2 + 2);

            const nameText = this.add.text(centerX, centerY + mainRadius + 8, '', {
                fontSize: '11px',
                color: '#ffffff',
                fontStyle: 'bold',
                maxLines: 2,
                wordWrap: { width: 118, useAdvancedWrap: true },
                align: 'center',
                lineSpacing: 1
            }).setOrigin(0.5, 0);

            const chargeText = this.add.text(centerX, centerY + mainRadius + 42, '', {
                fontSize: '11px',
                color: '#cccccc'
            }).setOrigin(0.5);

            // Continuous vertical connector line through all sockets
            const lastSocketY = supportStartY + 2 * supportGapY;
            const columnLine = this.add.graphics();
            columnLine.lineStyle(2, 0x555555, 0.6);
            columnLine.beginPath();
            columnLine.moveTo(centerX, centerY + mainRadius + 2);
            columnLine.lineTo(centerX, lastSocketY + supportRadius + 2);
            columnLine.strokePath();

            const supportSockets = [];
            for (let socketIndex = 0; socketIndex < 3; socketIndex++) {
                const socketX = centerX;
                const socketY = supportStartY + socketIndex * supportGapY;

                const socketBg = this.add.circle(socketX, socketY, supportRadius, 0x383850, 1)
                    .setInteractive({ useHandCursor: true });

                const socketText = this.add.text(socketX, socketY, '·', {
                    fontSize: '20px',
                    color: '#888888'
                }).setOrigin(0.5);

                const socketImage = this.add.image(socketX, socketY, 'skill_cleave')
                    .setOrigin(0.5).setVisible(false);
                socketImage.setDisplaySize(supportRadius * 2 + 2, supportRadius * 2 + 2);

                const socketNameText = this.add.text(socketX, socketY + supportRadius + 4, '', {
                    fontSize: '10px',
                    color: '#b0b0cc',
                    align: 'center',
                    maxLines: 2,
                    wordWrap: { width: 110, useAdvancedWrap: true }
                }).setOrigin(0.5, 0);

                // Socket: short tap opens inventory; long press shows info popup and closes on release
                {
                    let socketLpTimer = null;
                    let socketLpFired = false;
                    socketBg.on('pointerdown', () => {
                        socketLpFired = false;
                        const loadout = this.playerSkills[slotIndex];
                        const supportId = loadout && loadout.supportIds ? loadout.supportIds[socketIndex] : null;
                        if (supportId) {
                            socketLpTimer = this.time.delayedCall(500, () => {
                                socketLpFired = true;
                                this.showSupportGemInfoPopup({ type: 'support', id: supportId });
                            });
                        }
                    });
                    socketBg.on('pointerup', () => {
                        if (socketLpTimer) { socketLpTimer.remove(false); socketLpTimer = null; }
                        if (socketLpFired) {
                            socketLpFired = false;
                            if (this.skillsGemModal) this.skillsGemModal.setVisible(false);
                        } else {
                            this.openGemInventoryPopup('support', slotIndex, socketIndex);
                        }
                    });
                    socketBg.on('pointerout', () => {
                        if (socketLpTimer) { socketLpTimer.remove(false); socketLpTimer = null; }
                    });
                }

                supportSockets.push({
                    socketBg, socketText, socketImage, socketNameText,
                    connector: null,
                    center: { x: socketX, y: socketY },
                    radius: supportRadius
                });
                this.skillsScreenGroup.add([socketBg, socketText, socketImage, socketNameText]);
            }

            {
                let mainLpTimer = null;
                let mainLpFired = false;
                cardBg.on('pointerdown', () => {
                    mainLpFired = false;
                    mainLpTimer = this.time.delayedCall(500, () => {
                        mainLpFired = true;
                        this.showSkillInfoPopup(slotIndex, true);
                    });
                });
                cardBg.on('pointerup', () => {
                    if (mainLpTimer) { mainLpTimer.remove(false); mainLpTimer = null; }
                    if (!mainLpFired) {
                        this.openGemInventoryPopup('active', slotIndex);
                    } else {
                        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
                    }
                });
                cardBg.on('pointerout', () => {
                    if (mainLpTimer) { mainLpTimer.remove(false); mainLpTimer = null; }
                });
            }

            this.skillsActiveSlotUI.push({
                cardBg,
                cardLabel,
                iconText,
                skillIconImage,
                nameText,
                chargeText,
                columnLine,
                supportSockets,
                mainCenter: { x: centerX, y: centerY },
                mainRadius,
                _lastSocketY: lastSocketY,
                _supportRadius: supportRadius
            });
            this.skillsScreenGroup.add([columnLine, cardBg, cardLabel, iconText, skillIconImage, nameText, chargeText]);
        }

        // Armed-equip label shown on main screen so player can see which gem is queued
        this.selectedGemLabel = this.add.text(width / 2, height - 64, 'Selected: none', {
            fontSize: '11px',
            color: '#bbbbbb'
        }).setOrigin(0.5);
        this.skillsScreenGroup.add(this.selectedGemLabel);

        // --- Support Gem Popup (for equipped sockets) ---
        this.openSupportGemPopup = (gem, slotIndex, socketIndex) => {
            if (!gem) return;
            this.skillsGemModalTitle.setText('Support Gem');
            const display = this.getSkillGemDisplay(gem);
            if (display.imageKey && this.skillsGemModalIconImage) {
                this.skillsGemModalIconImage.setTexture(display.imageKey);
                this.skillsGemModalIconImage.setDisplaySize(56, 56);
                this.skillsGemModalIconImage.setVisible(true);
                this.skillsGemModalIcon.setVisible(false);
            } else {
                this.skillsGemModalIcon.setText(display.icon);
                this.skillsGemModalIcon.setVisible(true);
                if (this.skillsGemModalIconImage) this.skillsGemModalIconImage.setVisible(false);
            }
            this.skillsGemModalName.setText(display.name);
            this.skillsGemModalType.setText('Support Gem');
            this.skillsGemModalDesc.setText(this.getSkillGemDescription({ type: 'support', id: gem.id }));
            if (this.skillsGemModalEquipBtn) this.skillsGemModalEquipBtn.setVisible(false);
            if (this.skillsGemModalDiscardBtn) this.skillsGemModalDiscardBtn.setVisible(false);

            if (!this.skillsGemModalUnequipBtn) {
                this.skillsGemModalUnequipBtn = this.add.text(width / 2, height / 2 + 130, 'Unequip', {
                    fontSize: '14px',
                    color: '#111111',
                    backgroundColor: '#ffb366',
                    padding: { left: 8, right: 8, top: 4, bottom: 4 }
                }).setOrigin(0.5).setInteractive({ useHandCursor: true });
                this.skillsGemModal.add(this.skillsGemModalUnequipBtn);
            }
            this.skillsGemModalUnequipBtn.setVisible(true);
            this.skillsGemModalUnequipBtn.removeAllListeners && this.skillsGemModalUnequipBtn.removeAllListeners();
            this.skillsGemModalUnequipBtn.on('pointerup', () => {
                if (this.playerSkills[slotIndex] && this.playerSkills[slotIndex].supportIds) {
                    this.playerSkills[slotIndex].supportIds[socketIndex] = null;
                    this.refreshSkillsScreenUI();
                    this.closeSkillGemPopup();
                }
            });
            this.skillsGemModal.setVisible(true);
        };

        // (Gem Inventory Button removed — inventory opens via slot clicks)

        // --- Gem Inventory Popup (modeled after item inventory) ---
        // 4 cols × 4 rows = 16 gems per page (larger cells for readability)
        const invCols = 4;
        const invRows = 4;
        this.gemInventoryPage = 0;
        this._gemInvPageSize = invCols * invRows;

        // Cell layout: 4 evenly-spaced columns
        const invCellSpacing = Math.floor(width / invCols);  // 97px each
        const invCellRadius = 36;
        this._invCellImageSize = invCellRadius * 2 - 8;  // 64px — reused in refreshGemInventoryPopup
        // Card: center at (width/2, height/2 - 10), height 520
        const invCardCenterY = height / 2 - 10;
        const invCardHalfH  = 260;
        const invGridTopY = invCardCenterY - invCardHalfH + 88;  // first row center

        const invOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.85)
            .setInteractive({ useHandCursor: false });
        const invCard = this.add.rectangle(width / 2, invCardCenterY, width - 20, invCardHalfH * 2, 0x0e1720, 1)
            .setStrokeStyle(2, 0x336688)
            .setInteractive();  // absorbs clicks inside card

        this.gemInvTitleLabel = this.add.text(width / 2, invCardCenterY - invCardHalfH + 18, 'Skill Gems', {
            fontSize: '18px', color: '#7ee8ff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const invTitle = this.gemInvTitleLabel;

        // Remove Gem button — shown only for support inventory when socket is occupied
        this.gemInvRemoveBtn = this.add.text(18, invCardCenterY - invCardHalfH + 18, 'Remove Gem', {
            fontSize: '12px', color: '#111111', backgroundColor: '#ffb366',
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
        }).setOrigin(0, 0.5).setVisible(false).setInteractive({ useHandCursor: true });
        this.gemInvRemoveBtn.on('pointerup', () => {
            const si = this._gemInvTargetSlot !== undefined ? this._gemInvTargetSlot : 0;
            const so = this._gemInvTargetSocket !== undefined ? this._gemInvTargetSocket : -1;
            if (so >= 0 && this.playerSkills[si] && this.playerSkills[si].supportIds) {
                this.playerSkills[si].supportIds[so] = null;
                this.updateSkillBarUI();
                this.addCombatLog(`Removed support gem from Skill ${si + 1} socket ${so + 1}`, '#ffb366');
            }
            this.closeGemInventoryPopup();
            this.refreshSkillsScreenUI();
        });
        const invCloseBtn = this.add.text(width - 18, invCardCenterY - invCardHalfH + 18, '✕', {
            fontSize: '16px', color: '#ffffff', backgroundColor: '#443333',
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

        this.gemInvCountLabel = this.add.text(width / 2, invCardCenterY - invCardHalfH + 42, '', {
            fontSize: '11px', color: '#778899'
        }).setOrigin(0.5);

        this.gemInventoryGridCells = [];
        for (let row = 0; row < invRows; row++) {
            for (let col = 0; col < invCols; col++) {
                const cx = Math.round((col + 0.5) * invCellSpacing);
                const cy = invGridTopY + row * 110;

                const cellBg = this.add.circle(cx, cy, invCellRadius, 0x141e2a, 1)
                    .setStrokeStyle(2, 0x2a3d50)
                    .setInteractive({ useHandCursor: true });

                const cellImage = this.add.image(cx, cy, 'skill_cleave')
                    .setOrigin(0.5).setVisible(false);
                cellImage.setDisplaySize(invCellRadius * 2 - 8, invCellRadius * 2 - 8);

                const cellIcon = this.add.text(cx, cy, '', { fontSize: '26px' }).setOrigin(0.5);

                const cellName = this.add.text(cx, cy + invCellRadius + 2, '', {
                    fontSize: '13px', color: '#cccccc',
                    maxLines: 2,
                    align: 'center',
                    wordWrap: { width: invCellSpacing - 6, useAdvancedWrap: true }
                }).setOrigin(0.5, 0);

                this.gemInventoryGridCells.push({ cellBg, cellImage, cellIcon, cellName });
            }
        }

        this.gemInvPrevBtn = this.add.text(72, invCardCenterY + invCardHalfH - 28, '◄ Prev', {
            fontSize: '13px', color: '#aaaaaa', backgroundColor: '#1e2a38',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.gemInvNextBtn = this.add.text(width - 72, invCardCenterY + invCardHalfH - 28, 'Next ►', {
            fontSize: '13px', color: '#aaaaaa', backgroundColor: '#1e2a38',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.gemInvPageLabel = this.add.text(width / 2, invCardCenterY + invCardHalfH - 28, '', {
            fontSize: '11px', color: '#556677'
        }).setOrigin(0.5);

        invCloseBtn.on('pointerup', () => this.closeGemInventoryPopup());
        invOverlay.on('pointerup', () => this.closeGemInventoryPopup());
        this.gemInvPrevBtn.on('pointerup', () => {
            if (this.gemInventoryPage > 0) {
                this.gemInventoryPage--;
                this.refreshGemInventoryPopup();
            }
        });
        this.gemInvNextBtn.on('pointerup', () => {
            const gemType = this._gemInvType || 'active';
            const filteredGems = this.skillsInventoryGems.filter(g => g.type === gemType);
            const maxPage = Math.max(0, Math.ceil(filteredGems.length / this._gemInvPageSize) - 1);
            if (this.gemInventoryPage < maxPage) {
                this.gemInventoryPage++;
                this.refreshGemInventoryPopup();
            }
        });

        const invGridCellObjs = this.gemInventoryGridCells.reduce(
            (acc, c) => acc.concat([c.cellBg, c.cellImage, c.cellIcon, c.cellName]), []
        );

        this.gemInventoryPopup = this.add.container(0, 0, [
            invOverlay, invCard, invTitle, invCloseBtn,
            this.gemInvCountLabel, this.gemInvRemoveBtn,
            ...invGridCellObjs,
            this.gemInvPrevBtn, this.gemInvNextBtn, this.gemInvPageLabel
        ]).setVisible(false);

        this.skillsScreenGroup.add(this.gemInventoryPopup);

        // --- Gem Detail Modal ---
        const gemModalOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setInteractive({ useHandCursor: true });
        const gemModalCard = this.add.rectangle(width / 2, height / 2, 350, 340, 0x111111, 1)
            .setStrokeStyle(2, 0xffffff, 1)
            .setInteractive();  // absorbs clicks

        this.skillsGemModalTitle = this.add.text(width / 2, height / 2 - 118, 'Gem Details', {
            fontSize: '20px',
            color: '#ffd56b',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.skillsGemModalIcon = this.add.text(width / 2, height / 2 - 70, '', {
            fontSize: '28px'
        }).setOrigin(0.5);
        this.skillsGemModalIconImage = this.add.image(width / 2, height / 2 - 70, 'skill_cleave')
            .setOrigin(0.5).setVisible(false);
        this.skillsGemModalIconImage.setDisplaySize(56, 56);
        this.skillsGemModalName = this.add.text(width / 2, height / 2 - 30, '', {
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
            align: 'center',
            wordWrap: { width: 320, useAdvancedWrap: true }
        }).setOrigin(0.5);
        this.skillsGemModalType = this.add.text(width / 2, height / 2 - 4, '', {
            fontSize: '14px',
            color: '#9de9ff'
        }).setOrigin(0.5);
        this.skillsGemModalDesc = this.add.text(width / 2, height / 2 + 55, '', {
            fontSize: '14px',
            color: '#d8d8d8',
            align: 'center',
            wordWrap: { width: 320, useAdvancedWrap: true }
        }).setOrigin(0.5);

        const gemCloseBtn = this.add.text(width / 2 - 90, height / 2 + 130, 'Close', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.skillsGemModalDiscardBtn = this.add.text(width / 2, height / 2 + 130, 'Discard', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#aa3f3f',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.skillsGemModalEquipBtn = this.add.text(width / 2 + 92, height / 2 + 130, 'Equip', {
            fontSize: '14px',
            color: '#111111',
            backgroundColor: '#86ff9e',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        gemModalOverlay.on('pointerup', () => this.closeSkillGemPopup());
        gemCloseBtn.on('pointerup', () => this.closeSkillGemPopup());
        this.skillsGemModalDiscardBtn.on('pointerup', () => this.discardSelectedGemFromPopup());
        this.skillsGemModalEquipBtn.on('pointerup', () => {
            this.equipSelectedGemFromPopup();
            this.closeGemInventoryPopup();
        });

        this.skillsGemModal = this.add.container(0, 0, [
            gemModalOverlay,
            gemModalCard,
            this.skillsGemModalTitle,
            this.skillsGemModalIcon,
            this.skillsGemModalIconImage,
            this.skillsGemModalName,
            this.skillsGemModalType,
            this.skillsGemModalDesc,
            gemCloseBtn,
            this.skillsGemModalDiscardBtn,
            this.skillsGemModalEquipBtn
        ]).setVisible(false);

        // Patch closeSkillGemPopup to also hide unequip button
        const origCloseSkillGemPopup = this.closeSkillGemPopup.bind(this);
        this.closeSkillGemPopup = () => {
            if (this.skillsGemModalUnequipBtn) this.skillsGemModalUnequipBtn.setVisible(false);
            origCloseSkillGemPopup();
        };

        this.skillsScreenGroup.add(this.skillsGemModal);

        this.refreshSkillsScreenUI();
    }

    createEquipmentScreen() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        this.equipmentScreenGroup = this.add.container(0, 0).setVisible(false);

        const topCenterX = Math.floor(width * 0.5);
        const topPanelTopY = 86;
        const slotSize = 56;

        const bg = this.add.rectangle(width / 2, height / 2, width - 40, height - 40, 0x1a1a1a, 1).setStrokeStyle(2, 0xffffff);
        const splitY = 446;
        const divider = this.add.rectangle(width / 2, splitY, width - 52, 2, 0x555555, 1);

        const topPanelBg = this.add.rectangle(width / 2, 260, width - 56, 368, 0x222222, 0.95).setStrokeStyle(1, 0x666666);
        const bottomPanelBg = this.add.rectangle(width / 2, 610, width - 56, 292, 0x232323, 0.95).setStrokeStyle(1, 0x666666);

        const title = this.add.text(width / 2, 50, 'Character', { fontSize: '22px', color: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);

        const slotsHeader = this.add.text(topCenterX, 76, 'Loadout', { fontSize: '15px', color: '#00ffcc', fontStyle: 'bold' }).setOrigin(0.5);

        // Draw a high-contrast translucent warrior body so slot placement is easy to parse.
        const silhouette = this.add.graphics();
        silhouette.fillStyle(0x88a3b8, 0.28);
        silhouette.lineStyle(3, 0xdde8f3, 0.82);
        silhouette.fillCircle(topCenterX, topPanelTopY + 34, 28); // head
        silhouette.strokeCircle(topCenterX, topPanelTopY + 34, 28);
        silhouette.fillRoundedRect(topCenterX - 30, topPanelTopY + 64, 60, 96, 12); // torso
        silhouette.strokeRoundedRect(topCenterX - 30, topPanelTopY + 64, 60, 96, 12);
        silhouette.fillRoundedRect(topCenterX - 66, topPanelTopY + 84, 24, 72, 10); // left arm
        silhouette.strokeRoundedRect(topCenterX - 66, topPanelTopY + 84, 24, 72, 10);
        silhouette.fillRoundedRect(topCenterX + 42, topPanelTopY + 84, 24, 72, 10); // right arm
        silhouette.strokeRoundedRect(topCenterX + 42, topPanelTopY + 84, 24, 72, 10);
        silhouette.fillRoundedRect(topCenterX - 24, topPanelTopY + 164, 20, 76, 9); // left leg
        silhouette.strokeRoundedRect(topCenterX - 24, topPanelTopY + 164, 20, 76, 9);
        silhouette.fillRoundedRect(topCenterX + 4, topPanelTopY + 164, 20, 76, 9); // right leg
        silhouette.strokeRoundedRect(topCenterX + 4, topPanelTopY + 164, 20, 76, 9);
        silhouette.fillStyle(0xffffff, 0.14);
        silhouette.fillEllipse(topCenterX, topPanelTopY + 136, 48, 26);
        const warriorGlyph = this.add.text(topCenterX, topPanelTopY + 116, '⚔', { fontSize: '54px', color: '#eaf4ff' }).setOrigin(0.5).setAlpha(0.32);

        this.equipmentScreenGroup.add([
            bg,
            divider,
            topPanelBg,
            bottomPanelBg,
            title,
            slotsHeader,
            silhouette,
            warriorGlyph
        ]);

        const statsHeaderText = this.add.text(topCenterX, 366, 'Character Stats', {
            fontSize: '11px',
            color: '#00ffcc',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const statCardConfig = [
            { key: 'strength', short: 'STR', x: topCenterX - 108, color: 0xff8a5b, accent: '#ffb08b',
              desc: 'Increases physical damage and armor.' },
            { key: 'intelligence', short: 'INT', x: topCenterX, color: 0x4c8dff, accent: '#8bb7ff',
              desc: 'Increases magic damage and energy shield.' },
            { key: 'dexterity', short: 'DEX', x: topCenterX + 108, color: 0x49c46b, accent: '#8ae2a0',
              desc: 'Increases ranged damage, crit chance, and evasion.' }
        ];

        // Stat description popup (shown on long press) — created outside equipmentScreenGroup so depth applies scene-wide
        const sdPopBg = this.add.rectangle(0, 0, 270, 110, 0x0a0a14, 1).setStrokeStyle(2, 0x888888, 1);
        const sdPopText = this.add.text(-126, -42, '', {
            fontSize: '14px',
            color: '#e0e0e0',
            align: 'left',
            wordWrap: { width: 252, useAdvancedWrap: true }
        }).setOrigin(0, 0);
        this.statDescPopup = this.add.container(0, 400, [sdPopBg, sdPopText]).setVisible(false).setDepth(10000);
        // Add directly to the scene (not equipmentScreenGroup) so depth takes full effect
        this.add.existing(this.statDescPopup);

        this.characterStatTiles = {};
        statCardConfig.forEach(card => {
            const cardBg = this.add.rectangle(card.x, 406, 96, 44, 0x151515, 0.98)
                .setStrokeStyle(2, card.color, 1);
            cardBg.setInteractive({ useHandCursor: true });
            const cardTitle = this.add.text(card.x, 397, card.short, {
                fontSize: '13px',
                color: card.accent,
                fontStyle: 'bold'
            }).setOrigin(0.5);
            const cardValue = this.add.text(card.x, 413, '', {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.characterStatTiles[card.key] = {
                cardBg,
                valueText: cardValue,
                delay: card.key === 'strength' ? 0 : (card.key === 'intelligence' ? 110 : 220)
            };

            let longPressTimer = null;
            cardBg.on('pointerdown', () => {
                longPressTimer = this.time.delayedCall(500, () => {
                    const b = this.getCharacterStatBonuses();
                    let bonusLines = '';
                    if (card.key === 'strength') {
                        bonusLines = `+${b.physicalDamageBonus} physical damage\n+${b.armorBonus} armor`;
                    } else if (card.key === 'intelligence') {
                        bonusLines = `+${b.magicDamageBonus} magic damage\n+${b.energyShield} energy shield`;
                    } else {
                        bonusLines = `+${b.rangedDamageBonus} ranged damage\n${b.critChance.toFixed(0)}% crit  ${b.evasionChance.toFixed(0)}% evasion`;
                    }
                    sdPopText.setText(bonusLines);
                    const popX = Phaser.Math.Clamp(card.x, 135, width - 135);
                    this.statDescPopup.setPosition(popX, 376);
                    this.statDescPopup.setVisible(true);
                });
            });
            const cancelLongPress = () => {
                if (longPressTimer) { longPressTimer.remove(false); longPressTimer = null; }
                this.statDescPopup.setVisible(false);
            };
            cardBg.on('pointerup', () => {
                if (longPressTimer) { cancelLongPress(); }
                this.pulseUiTargets([cardBg, cardValue], 1.06, 110);
            });
            cardBg.on('pointerout', cancelLongPress);

            this.equipmentScreenGroup.add([cardBg, cardTitle, cardValue]);
        });

        this.charStatsFooter = this.add.text(topCenterX, 444, '', { fontSize: '9px', color: '#9aa7b5', align: 'center' }).setOrigin(0.5);
        this.equipmentScreenGroup.add([statsHeaderText, this.charStatsFooter]);

        const slotConfig = [
            { key: 'helmet', label: 'Helmet', x: topCenterX, y: topPanelTopY + 28 },
            { key: 'necklace', label: 'Necklace', x: topCenterX - 84, y: topPanelTopY + 80 },
            { key: 'mainhand', label: 'Main Hand', x: topCenterX - 108, y: topPanelTopY + 134 },
            { key: 'chest', label: 'Chest', x: topCenterX, y: topPanelTopY + 104 },
            { key: 'offhand', label: 'Off Hand', x: topCenterX + 108, y: topPanelTopY + 134 },
            { key: 'gloves', label: 'Gloves', x: topCenterX - 108, y: topPanelTopY + 196 },
            { key: 'belt', label: 'Belt', x: topCenterX, y: topPanelTopY + 160 },
            { key: 'ring1', label: 'Ring', x: topCenterX + 84, y: topPanelTopY + 196 },
            { key: 'boots', label: 'Boots', x: topCenterX, y: topPanelTopY + 236 }
        ];

        this.equipmentText = {};
        this.equipmentIconText = {};
        this.equipmentSlotFrames = {};
        this.equipmentSlotGhostIcons = {};
        this.equipmentSlotShells = {};
        this.equipmentSlotGlows = {};

        slotConfig.forEach(slot => {
            const slotGlow = this.add.rectangle(slot.x, slot.y, slotSize + 10, slotSize + 10, 0xffffff, 0)
                .setStrokeStyle(3, 0xffffff, 0)
                .setOrigin(0.5);

            // Square slot for equipment
            const slotBg = this.add.rectangle(slot.x, slot.y, slotSize, slotSize, 0x26303a, 0.9)
                .setStrokeStyle(2, 0x6d7d8a, 1)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });

            // Inner tile area for item image/icon
            const slotImageBg = this.add.rectangle(slot.x, slot.y, slotSize * 0.7, slotSize * 0.7, 0x0e1318, 0.8)
                .setStrokeStyle(1, 0x8ea2b3, 0.9)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true });
            const slotGhostIcon = this.add.text(slot.x, slot.y - 4, this.getEmptySlotIcon(slot.key), {
                fontSize: '19px',
                color: '#778593'
            }).setOrigin(0.5).setAlpha(0.52);
            const slotIcon = this.add.text(slot.x, slot.y - 2, '', { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

            const inspectEquippedItem = () => {
                const equippedItem = this.equippedItems[slot.key];
                if (equippedItem) {
                    this.openInventoryItemPopup(equippedItem, 'equipped', slot.key);
                }
            };
            const pulseSlot = () => {
                this.pulseUiTargets([slotBg, slotImageBg, slotIcon, slotGhostIcon], 1.08, 95);
            };
            slotBg.on('pointerdown', pulseSlot);
            slotImageBg.on('pointerdown', pulseSlot);
            slotBg.on('pointerup', inspectEquippedItem);
            slotImageBg.on('pointerup', inspectEquippedItem);

            this.equipmentText[slot.key] = null;
            this.equipmentIconText[slot.key] = slotIcon;
            this.equipmentSlotFrames[slot.key] = slotImageBg;
            this.equipmentSlotGhostIcons[slot.key] = slotGhostIcon;
            this.equipmentSlotShells[slot.key] = slotBg;
            this.equipmentSlotGlows[slot.key] = slotGlow;

            this.equipmentScreenGroup.add([slotGlow, slotBg, slotImageBg, slotGhostIcon, slotIcon]);
        });

        // ---- BOTTOM PANEL: Character Stat Readout ----
        const offenseHeader = this.add.text(topCenterX, 468, '\u2694 OFFENSE', {
            fontSize: '14px', color: '#ff9966', fontStyle: 'bold'
        }).setOrigin(0.5);
        const defenseHeader = this.add.text(topCenterX, 584, '\ud83d\udee1 DEFENSE', {
            fontSize: '14px', color: '#66ccff', fontStyle: 'bold'
        }).setOrigin(0.5);
        const statPanelDivider = this.add.rectangle(topCenterX, 577, width - 72, 1, 0x444444, 1);

        const statRowDefs = [
            { key: 'physDmg',       label: 'Physical DMG',      y: 484, color: '#ffaa88' },
            { key: 'elemDmg',       label: 'Magical DMG',        y: 498, color: '#88bbff' },
            { key: 'rangedDmg',     label: 'Ranged DMG',         y: 512, color: '#88ff99' },
            { key: 'critChance',    label: 'Crit Chance',        y: 526, color: '#ffee55' },
            { key: 'fireDmg',       label: 'Fire DMG',           y: 540, color: '#ff6633' },
            { key: 'lightningDmg',  label: 'Lightning DMG',      y: 554, color: '#ffff44' },
            { key: 'coldDmg',       label: 'Cold DMG',           y: 568, color: '#88ddff' },
            { key: 'maxHp',         label: 'Max HP',             y: 600, color: '#ff6688' },
            { key: 'armor',         label: 'Armor',              y: 614, color: '#ddbb88' },
            { key: 'energyShield',  label: 'Energy Shield',      y: 628, color: '#88aaff' },
            { key: 'evasion',       label: 'Evasion',            y: 642, color: '#88ffcc' },
            { key: 'blockChance',   label: 'Block Chance',       y: 656, color: '#aaaaff' },
            { key: 'fireRes',       label: 'Fire Resistance',    y: 670, color: '#ff8855' },
            { key: 'lightningRes',  label: 'Lightning Res',      y: 684, color: '#ffff77' },
            { key: 'coldRes',       label: 'Cold Resistance',    y: 698, color: '#aaeeff' },
            { key: 'magicFind',     label: 'Magic Find',         y: 712, color: '#ffdd44' }
        ];

        this.charScreenStats = {};
        const statRowObjs = [];
        statRowDefs.forEach(row => {
            const lbl = this.add.text(36, row.y, row.label, {
                fontSize: '13px', color: '#9aabbf'
            }).setOrigin(0, 0.5);
            const val = this.add.text(width - 36, row.y, '\u2014', {
                fontSize: '13px', color: row.color, fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            this.charScreenStats[row.key] = val;
            statRowObjs.push(lbl, val);
        });

        // Inventory button placed above the shield (offhand) slot
        const inventoryBtn = this.add.text(topCenterX + 108, topPanelTopY + 52, '\ud83c\udf92  Inventory', {
            fontSize: '13px', fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#ffffff', backgroundColor: '#1e3a56',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        inventoryBtn.on('pointerup', () => this.openInventoryListPopup());

        this.equipmentScreenGroup.add([
            offenseHeader, defenseHeader, statPanelDivider,
            ...statRowObjs, inventoryBtn
        ]);

        // ---- INVENTORY GRID POPUP ----
        // 4 cols × 5 rows = 20 items per page; cell 70px, gap 6px
        const invCols = 4;
        const invRows = 5;
        this.inventoryListPage = 0;
        this.inventoryListPageSize = invCols * invRows;
        const invCellSize = 70;
        const invCellGap = 6;
        const invGridW = invCols * invCellSize + (invCols - 1) * invCellGap; // 298
        const invGridLeft = (width - invGridW) / 2;                          // 46
        const invGridTopY = height / 2 - 196;                                // first row center Y

        const invListOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.82)
            .setInteractive({ useHandCursor: false });
        const invListCard = this.add.rectangle(width / 2, height / 2, width - 20, 530, 0x0e1720, 1)
            .setStrokeStyle(2, 0x336688);
        const invListTitle = this.add.text(width / 2, height / 2 - 253, 'Inventory', {
            fontSize: '18px', color: '#00ffcc', fontStyle: 'bold'
        }).setOrigin(0.5);
        const invListCloseBtn = this.add.text(width - 24, height / 2 - 253, '\u2715', {
            fontSize: '16px', color: '#ffffff', backgroundColor: '#443333',
            padding: { left: 6, right: 6, top: 3, bottom: 3 }
        }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
        this.invListSlotCountLabel = this.add.text(width / 2, height / 2 - 233, '', {
            fontSize: '11px', color: '#778899'
        }).setOrigin(0.5);

        this.inventoryGridCells = [];
        for (let row = 0; row < invRows; row++) {
            for (let col = 0; col < invCols; col++) {
                const cx = invGridLeft + col * (invCellSize + invCellGap) + invCellSize / 2;
                const cy = invGridTopY + row * (invCellSize + invCellGap) + invCellSize / 2;
                const cellBg = this.add.rectangle(cx, cy, invCellSize, invCellSize, 0x141e2a, 1)
                    .setStrokeStyle(2, 0x2a3d50)
                    .setInteractive({ useHandCursor: true });
                const cellIcon = this.add.text(cx, cy - 8, '', { fontSize: '24px' }).setOrigin(0.5);
                const cellName = this.add.text(cx, cy + 24, '', {
                    fontSize: '8px', color: '#cccccc',
                    align: 'center',
                    wordWrap: { width: invCellSize - 4, useAdvancedWrap: true }
                }).setOrigin(0.5, 0);
                this.inventoryGridCells.push({ cellBg, cellIcon, cellName });
            }
        }

        this.invListPrevBtn = this.add.text(72, height / 2 + 230, '\u25c4 Prev', {
            fontSize: '13px', color: '#aaaaaa', backgroundColor: '#1e2a38',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.invListNextBtn = this.add.text(width - 72, height / 2 + 230, 'Next \u25ba', {
            fontSize: '13px', color: '#aaaaaa', backgroundColor: '#1e2a38',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        this.invListPageLabel = this.add.text(width / 2, height / 2 + 230, '', {
            fontSize: '11px', color: '#556677'
        }).setOrigin(0.5);

        invListCloseBtn.on('pointerup', () => this.closeInventoryListPopup());
        invListOverlay.on('pointerup', () => this.closeInventoryListPopup());
        this.invListPrevBtn.on('pointerup', () => {
            if (this.inventoryListPage > 0) {
                this.inventoryListPage--;
                this.refreshInventoryListPopup();
            }
        });
        this.invListNextBtn.on('pointerup', () => {
            const maxPage = Math.max(0, Math.ceil(this.inventory.length / this.inventoryListPageSize) - 1);
            if (this.inventoryListPage < maxPage) {
                this.inventoryListPage++;
                this.refreshInventoryListPopup();
            }
        });

        const invGridCellObjs = this.inventoryGridCells.reduce(
            (acc, c) => acc.concat([c.cellBg, c.cellIcon, c.cellName]), []
        );

        this.inventoryListPopup = this.add.container(0, 0, [
            invListOverlay, invListCard, invListTitle, invListCloseBtn,
            this.invListSlotCountLabel,
            ...invGridCellObjs,
            this.invListPrevBtn, this.invListNextBtn, this.invListPageLabel
        ]).setVisible(false);

        this.equipmentScreenGroup.add(this.inventoryListPopup);

        const modalOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.78)
            .setInteractive({ useHandCursor: true });
        const modalCard = this.add.rectangle(width / 2, height / 2, 370, 410, 0x111111, 1)
            .setStrokeStyle(2, 0x555555)
            .setInteractive();   // absorbs clicks inside the card so overlay doesn't fire

        this.inventoryModalTitle = this.add.text(width / 2, height / 2 - 198, '', {
            fontSize: '18px',
            fontFamily: 'Georgia, Verdana, sans-serif',
            color: '#ffdd44',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0);
        this.inventoryModalFrame = this.add.rectangle(width / 2, height / 2 - 162, 46, 46, 0x1f1f1f, 1).setStrokeStyle(2, 0x888888);
        this.inventoryModalIcon = this.add.text(width / 2, height / 2 - 162, '', { fontSize: '24px' }).setOrigin(0.5);
        this.inventoryModalName = this.add.text(width / 2, height / 2 - 130, '', {
            fontSize: '16px',
            fontFamily: 'Georgia, Verdana, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            wordWrap: { width: 340, useAdvancedWrap: true },
            align: 'center'
        }).setOrigin(0.5);
        this.inventoryModalSlotBadge = this.add.text(width / 2, height / 2 - 110, '', {
            fontSize: '12px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#111111',
            backgroundColor: '#8bb7ff',
            padding: { left: 7, right: 7, top: 3, bottom: 3 }
        }).setOrigin(0.5);
        this.inventoryModalType = this.add.text(width / 2, height / 2 - 92, '', {
            fontSize: '12px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#00ffcc',
            align: 'center',
            wordWrap: { width: 340, useAdvancedWrap: true }
        }).setOrigin(0.5);

        const modalStatsDivider = this.add.rectangle(width / 2, height / 2 - 78, 340, 1, 0x444444, 1);

        // 7 pre-allocated per-stat comparison lines (non-legendary stats only)
        this.inventoryAffixLines = [];
        for (let li = 0; li < 7; li++) {
            const lineObj = this.add.text(width / 2, height / 2 - 66 + li * 22, '', {
                fontSize: '13px',
                fontFamily: 'Verdana, Georgia, sans-serif',
                color: '#ffd966',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setVisible(false);
            this.inventoryAffixLines.push(lineObj);
        }

        // Dedicated legendary affix line — always positioned below regular stat lines
        this.inventoryLegendaryAffixText = this.add.text(width / 2, height / 2 + 90, '', {
            fontSize: '13px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#ff7f11',
            align: 'center',
            wordWrap: { width: 330, useAdvancedWrap: true }
        }).setOrigin(0.5).setVisible(false);

        this.inventoryAffixCompareLabel = this.add.text(width / 2, height / 2 + 115, '', {
            fontSize: '13px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#888888',
            align: 'center',
            wordWrap: { width: 340, useAdvancedWrap: true }
        }).setOrigin(0.5);

        const closeModalBtn = this.add.text(width / 2 - 120, height / 2 + 164, 'Close', {
            fontSize: '14px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#ffffff',
            backgroundColor: '#444444',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const removeBtn = this.add.text(width / 2 - 40, height / 2 + 164, 'Unequip', {
            fontSize: '14px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#ffffff',
            backgroundColor: '#a33d3d',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const equipBtn = this.add.text(width / 2 + 40, height / 2 + 164, 'Equip', {
            fontSize: '14px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#111111',
            backgroundColor: '#00ff99',
            strokeThickness: 0,
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        const sellBtn = this.add.text(width / 2 + 120, height / 2 + 164, 'Sell', {
            fontSize: '14px',
            fontFamily: 'Verdana, Georgia, sans-serif',
            color: '#ffd966',
            backgroundColor: '#4a3d1a',
            padding: { left: 8, right: 8, top: 4, bottom: 4 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        modalOverlay.on('pointerup', () => {
            // Skip if the modal was just opened on this same tap
            if (this._inventoryModalJustOpened) { this._inventoryModalJustOpened = false; return; }
            this.closeInventoryItemPopup();
        });
        closeModalBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.closeInventoryItemPopup(); });
        equipBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.equipSelectedInventoryItem(); });
        removeBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.removeSelectedEquippedItem(); });
        sellBtn.on('pointerup', (p, lx, ly, e) => { e.stopPropagation(); this.sellSelectedItem(); });

        this.inventoryModalEquipBtn = equipBtn;
        this.inventoryModalRemoveBtn = removeBtn;
        this.inventoryModalSellBtn = sellBtn;

        this.inventoryModal = this.add.container(0, 0, [
            modalOverlay,
            modalCard,
            this.inventoryModalTitle,
            this.inventoryModalFrame,
            this.inventoryModalIcon,
            this.inventoryModalName,
            this.inventoryModalSlotBadge,
            this.inventoryModalType,
            modalStatsDivider,
            ...this.inventoryAffixLines,
            this.inventoryLegendaryAffixText,
            this.inventoryAffixCompareLabel,
            closeModalBtn,
            removeBtn,
            equipBtn,
            sellBtn
        ]).setVisible(false);

        this.equipmentScreenGroup.add(this.inventoryModal);

        // Return to Game button at the bottom
        const returnBtn = this.add.text(width / 2, height - 22, '↩  Return to Game', {
            fontSize: '15px', color: '#00ffcc', fontStyle: 'bold',
            backgroundColor: '#0d2a2a',
            padding: { left: 18, right: 18, top: 6, bottom: 6 }
        }).setOrigin(0.5, 1).setInteractive({ useHandCursor: true });
        returnBtn.on('pointerup', () => this.showGameScreen());
        this.equipmentScreenGroup.add(returnBtn);

        this.updateInventoryGridUI();
    }

    showEquipmentScreen() {
        this.currentScreen = 'equipment';
        this.armedEquipGem = null;
        this.closeSkillGemPopup();
        this.closeInventoryListPopup();
        if (this.statDescPopup) this.statDescPopup.setVisible(false);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(true);
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(false);
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(false);
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(false);
        this.boardContainer.setVisible(false);
        this.hudContainer.setVisible(false);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(false);
        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
        this.setGameBoardActive(false);
        this.updateEquipmentScreen();
        this.refreshEquipmentScreenAnimations();
    }

    showSkillsScreen() {
        this.currentScreen = 'skills';
        this.closeInventoryItemPopup();
        if (this.statDescPopup) this.statDescPopup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(true);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(false);
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(false);
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(false);
        this.boardContainer.setVisible(false);
        this.hudContainer.setVisible(false);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(false);
        if (this.skillInfoPopup) this.skillInfoPopup.setVisible(false);
        this.setGameBoardActive(false);
        this.refreshSkillsScreenUI();
    }

    showGameScreen() {
        this.currentScreen = 'game';
        this.armedEquipGem = null;
        this.closeSkillGemPopup();
        this.closeTalentNodePopup();
        if (this.statDescPopup) this.statDescPopup.setVisible(false);
        if (this.equipmentScreenGroup) this.equipmentScreenGroup.setVisible(false);
        if (this.skillsScreenGroup) this.skillsScreenGroup.setVisible(false);
        if (this.rewardScreenGroup) this.rewardScreenGroup.setVisible(false);
        if (this.talentScreenGroup) this.talentScreenGroup.setVisible(false);
        if (this.storeScreenGroup) this.storeScreenGroup.setVisible(false);
        this.closeInventoryItemPopup();
        this.boardContainer.setVisible(true);
        this.hudContainer.setVisible(true);
        if (this.skillBarContainer) this.skillBarContainer.setVisible(true);
        if (this.skillChargeFxContainer) this.skillChargeFxContainer.setVisible(true);
        this.setGameBoardActive(true);
    }

    updateEquipmentScreen() {
        if (!this.equipmentText || !this.equipmentIconText) return;

        Object.entries(this.player.equipment).forEach(([key, value]) => {
            const equippedItem = this.equippedItems[key] || null;
            const offhandBlockedByBow = key === 'offhand' && this.isTwoHandedItem(this.equippedItems.mainhand || null);
            if (this.equipmentText[key]) {
                const slotText = this.getEquipmentSlotText(key, equippedItem, offhandBlockedByBow);
                this.equipmentText[key].setText(slotText);
                this.equipmentText[key].setColor(
                    offhandBlockedByBow
                        ? '#d7e26f'
                        : (equippedItem ? (equippedItem.rarityTextColor || '#ffffff') : '#94a1ab')
                );
            }
            if (this.equipmentIconText[key]) {
                this.equipmentIconText[key].setText(offhandBlockedByBow ? '🏹' : (equippedItem ? equippedItem.icon : ''));
            }
            if (this.equipmentSlotFrames[key]) {
                this.equipmentSlotFrames[key].setStrokeStyle(
                    2,
                    offhandBlockedByBow ? 0xd0e060 : (equippedItem ? equippedItem.frameColor : 0x8ea2b3),
                    offhandBlockedByBow ? 1 : (equippedItem ? 1 : 0.8)
                );
            }
            if (this.equipmentSlotGhostIcons[key]) {
                this.equipmentSlotGhostIcons[key].setVisible(!equippedItem && !offhandBlockedByBow);
            }
            if (this.equipmentSlotShells[key]) {
                this.equipmentSlotShells[key]
                    .setFillStyle(
                        offhandBlockedByBow ? 0x334022 : (equippedItem ? 0x2d3640 : 0x26303a),
                        offhandBlockedByBow ? 0.95 : (equippedItem ? 0.98 : 0.9)
                    )
                    .setStrokeStyle(
                        2,
                        offhandBlockedByBow ? 0xd0e060 : (equippedItem ? equippedItem.frameColor : 0x6d7d8a),
                        offhandBlockedByBow ? 1 : (equippedItem ? 1 : 0.95)
                    );
            }
            if (this.equipmentSlotGlows[key]) {
                this.equipmentSlotGlows[key].setFillStyle(
                    offhandBlockedByBow ? 0xd0e060 : (equippedItem ? equippedItem.frameColor : 0xffffff),
                    offhandBlockedByBow ? 0.08 : (equippedItem ? 0.14 : 0)
                );
                this.equipmentSlotGlows[key].setStrokeStyle(
                    4,
                    offhandBlockedByBow ? 0xd0e060 : (equippedItem ? equippedItem.frameColor : 0xffffff),
                    offhandBlockedByBow ? 0.7 : (equippedItem ? 0.9 : 0)
                );
            }
        });

        // Update character stats display (attribute tiles in top panel)
        if (this.characterStatTiles) {
            const p = this.player;
            const gearForStats = this.getEquippedStatTotals();
            const totalStr = p.strength + (gearForStats.strength || 0);
            const totalInt = p.intelligence + (gearForStats.intelligence || 0);
            const totalDex = p.dexterity + (gearForStats.dexterity || 0);
            this.characterStatTiles.strength.valueText.setText(String(totalStr));
            this.characterStatTiles.intelligence.valueText.setText(String(totalInt));
            this.characterStatTiles.dexterity.valueText.setText(String(totalDex));
        }

        // Update bottom panel stat readout
        if (this.charScreenStats) {
            const gear = this.getEquippedStatTotals();
            const b = this.getCharacterStatBonuses();
            const tb = this.getTalentPercentBonuses();
            const totalPhys = (gear.physical || 0) + b.physicalDamageBonus;
            const totalMagic = (gear.magic || 0) + b.magicDamageBonus;
            const totalRanged = (gear.ranged || 0) + b.rangedDamageBonus;
            const totalArmor = Math.floor((gear.armor + b.armorBonus) * (1 + tb.armor / 100));
            const totalES = this.getMaxEnergyShield();
            const totalHP = this.getMaxHealth();
            const critPct = Math.min(75, b.critChance).toFixed(0);
            const evasionPct = Math.min(75, b.evasionChance + (gear.evasion || 0) * 0.3 + (tb.evasion || 0));
            const blockPct = Math.min(75, tb.blockChance || 0);
            const mf = gear.magicFind || 0;

            if (this.charScreenStats.physDmg)      this.charScreenStats.physDmg.setText(`${totalPhys}  (${gear.physical || 0} gear + ${b.physicalDamageBonus} str)`);
            if (this.charScreenStats.elemDmg)      this.charScreenStats.elemDmg.setText(`${totalMagic}  (${gear.magic || 0} gear + ${b.magicDamageBonus} int)`);
            if (this.charScreenStats.rangedDmg)    this.charScreenStats.rangedDmg.setText(`${totalRanged}  (${gear.ranged || 0} gear + ${b.rangedDamageBonus} dex)`);
            if (this.charScreenStats.critChance)   this.charScreenStats.critChance.setText(`${critPct}%`);
            if (this.charScreenStats.fireDmg)      this.charScreenStats.fireDmg.setText(`${gear.fireDamage || 0}`);
            if (this.charScreenStats.lightningDmg) this.charScreenStats.lightningDmg.setText(`${gear.lightningDamage || 0}`);
            if (this.charScreenStats.coldDmg)      this.charScreenStats.coldDmg.setText(`${gear.coldDamage || 0}`);
            if (this.charScreenStats.maxHp)        this.charScreenStats.maxHp.setText(`${totalHP}`);
            if (this.charScreenStats.armor)        this.charScreenStats.armor.setText(`${totalArmor}  (-${Math.floor(totalArmor / 4)} dmg/hit)`);
            if (this.charScreenStats.energyShield) this.charScreenStats.energyShield.setText(`${totalES}`);
            if (this.charScreenStats.evasion)      this.charScreenStats.evasion.setText(`${evasionPct.toFixed(0)}%`);
            if (this.charScreenStats.blockChance)  this.charScreenStats.blockChance.setText(`${blockPct.toFixed(0)}%`);
            if (this.charScreenStats.fireRes)      this.charScreenStats.fireRes.setText(`${gear.fireResistance || 0}%`);
            if (this.charScreenStats.lightningRes) this.charScreenStats.lightningRes.setText(`${gear.lightningResistance || 0}%`);
            if (this.charScreenStats.coldRes)      this.charScreenStats.coldRes.setText(`${gear.coldResistance || 0}%`);
            if (this.charScreenStats.magicFind)    this.charScreenStats.magicFind.setText(`${mf}`);
        }

        this.refreshEquipmentScreenAnimations();
        this.updateInventoryGridUI();
    }

    updateInventoryGridUI() {
        // Refresh the inventory list popup if it is currently open
        if (this.inventoryListPopup && this.inventoryListPopup.visible) {
            this.refreshInventoryListPopup();
        }
    }

    openInventoryListPopup() {
        this.inventoryListPage = 0;
        this.refreshInventoryListPopup();
        if (this.inventoryListPopup) this.inventoryListPopup.setVisible(true);
    }

    closeInventoryListPopup() {
        if (this.inventoryListPopup) this.inventoryListPopup.setVisible(false);
    }

    refreshInventoryListPopup() {
        if (!this.inventoryListPopup || !this.inventoryGridCells) return;
        const pageSize = this.inventoryListPageSize || 20;
        const page = this.inventoryListPage || 0;
        const start = page * pageSize;
        const items = this.inventory;
        const maxPage = Math.max(0, Math.ceil(items.length / pageSize) - 1);

        if (this.invListSlotCountLabel) {
            this.invListSlotCountLabel.setText(`${items.length} / ${this.maxInventorySlots} slots used`);
        }
        if (this.invListPageLabel) {
            this.invListPageLabel.setText(`Page ${page + 1} / ${Math.max(1, maxPage + 1)}`);
        }
        if (this.invListPrevBtn) this.invListPrevBtn.setAlpha(page > 0 ? 1 : 0.3);
        if (this.invListNextBtn) this.invListNextBtn.setAlpha(page < maxPage ? 1 : 0.3);

        this.inventoryGridCells.forEach((cell, ci) => {
            const item = items[start + ci];
            cell.cellBg.removeAllListeners('pointerup');
            if (!item) {
                cell.cellBg.setFillStyle(0x101820, 0.6);
                cell.cellBg.setStrokeStyle(1, 0x2a3d50, 0.5);
                cell.cellIcon.setText('');
                cell.cellName.setText('');
                return;
            }
            cell.cellBg.setFillStyle(0x141e2a, 1);
            cell.cellBg.setStrokeStyle(2, item.frameColor, 1);
            cell.cellIcon.setText(item.icon);
            cell.cellName.setText(item.name).setColor(item.rarityTextColor || '#cccccc');
            cell.cellBg.on('pointerup', () => {
                this.openInventoryItemPopup(item, 'inventory', null);
            });
        });
    }

    openInventoryItemPopup(item, source = 'inventory', equippedSlot = null) {
        if (!this.inventoryModal) return;
        this.closeInventoryListPopup();   // remove list overlay from receiving the same tap
        this.selectedInventoryItem = item;
        this.selectedItemSource = source;
        this.selectedEquippedSlot = equippedSlot;

        // Determine comparison item:
        //   'equipped' view → compare vs empty (all green)
        //   'inventory' view   → compare vs whatever is currently in the target slot
        let compareItem = null;
        if (source === 'inventory') {
            const targetSlot = this.getEquipTargetSlot(item);
            if (targetSlot) {
                compareItem = this.equippedItems[targetSlot] || null;
            }
        }

        const itemStats = item.stats || {};
        const compareStats = (compareItem && compareItem.stats) || {};

        // Collect stat keys that belong to the legendary affix so we can exclude them from
        // the regular numeric display and show a single orange description line instead.
        const legendaryStatKeys = new Set(
            item.legendaryAffix ? Object.keys(item.legendaryAffix.stats) : []
        );
        const compareLegendaryStatKeys = new Set(
            compareItem && compareItem.legendaryAffix ? Object.keys(compareItem.legendaryAffix.stats) : []
        );

        // Collect implicit stat key(s) to exclude from regular lines
        const implicitStatKey = item.implicit ? item.implicit.stat : null;
        const compareImplicitStatKey = compareItem && compareItem.implicit ? compareItem.implicit.stat : null;
        const allImplicitKeys = new Set([implicitStatKey, compareImplicitStatKey].filter(Boolean));

        const allStatKeys = Array.from(new Set([
            ...Object.keys(itemStats),
            ...Object.keys(compareStats)
        ])).filter(k => !legendaryStatKeys.has(k) && !compareLegendaryStatKeys.has(k) && !allImplicitKeys.has(k));

        // Build implicit line(s) first (shown above a separator)
        const statLines = [];
        if (implicitStatKey || compareImplicitStatKey) {
            const stat = implicitStatKey || compareImplicitStatKey;
            const newVal = implicitStatKey ? (item.implicit.value || 0) : 0;
            const oldVal = compareImplicitStatKey ? (compareItem.implicit.value || 0) : 0;
            const delta = newVal - oldVal;
            const label = this.getStatLabel(stat);
            let implicitLine;
            if (!compareItem || oldVal === 0) {
                implicitLine = { text: `${label}: ${newVal}`, color: '#aaddff' };
            } else if (delta > 0) {
                implicitLine = { text: `${label}: ${newVal} (+${delta})`, color: '#aaddff' };
            } else if (delta < 0) {
                implicitLine = { text: `${label}: ${newVal} (${delta})`, color: '#ff9999' };
            } else {
                implicitLine = { text: `${label}: ${newVal}`, color: '#aaddff' };
            }
            statLines.push(implicitLine);
            statLines.push({ text: '───────────────', color: '#555555' });
        }

        // Build one line per unique stat type with color coding and delta values
        allStatKeys.forEach(stat => {
            const newVal = itemStats[stat] || 0;
            const oldVal = compareStats[stat] || 0;
            const delta = newVal - oldVal;
            const label = this.getStatLabel(stat);

            if (!compareItem || oldVal === 0) {
                statLines.push({ text: `${label}: +${newVal}`, color: '#4eff8a' });
            } else if (delta > 0) {
                statLines.push({ text: `${label}: +${newVal} (+${delta})`, color: '#4eff8a' });
            } else if (delta < 0) {
                statLines.push({ text: `${label}: +${newVal} (${delta})`, color: '#ff6b6b' });
            } else {
                statLines.push({ text: `${label}: +${newVal}`, color: '#ffd966' });
            }
        });

        // Populate pre-allocated line objects (regular stats only — no legendary affix here)
        if (this.inventoryAffixLines) {
            this.inventoryAffixLines.forEach((lineObj, i) => {
                if (i < statLines.length) {
                    lineObj.setText(statLines[i].text);
                    lineObj.setColor(statLines[i].color);
                    lineObj.setVisible(true);
                } else {
                    lineObj.setText('');
                    lineObj.setVisible(false);
                }
            });
        }

        // Show legendary affix description in dedicated slot (below regular stat lines)
        if (this.inventoryLegendaryAffixText) {
            const legLines = [];
            if (item.legendaryAffix) {
                legLines.push(`★ ${item.legendaryAffix.name}: ${item.legendaryAffix.desc}`);
            }
            if (compareItem && compareItem.legendaryAffix) {
                legLines.push(`[vs] ★ ${compareItem.legendaryAffix.name}: ${compareItem.legendaryAffix.desc}`);
            }
            if (legLines.length > 0) {
                this.inventoryLegendaryAffixText.setText(legLines.join('\n'));
                this.inventoryLegendaryAffixText.setVisible(true);
            } else {
                this.inventoryLegendaryAffixText.setText('');
                this.inventoryLegendaryAffixText.setVisible(false);
            }
        }

        // Footer: what we're comparing against
        if (this.inventoryAffixCompareLabel) {
            if (source === 'equipped') {
                this.inventoryAffixCompareLabel.setText('Currently equipped  —  tap Unequip to remove');
            } else if (compareItem) {
                this.inventoryAffixCompareLabel.setText(`Replacing: ${compareItem.name}`);
            } else {
                this.inventoryAffixCompareLabel.setText('Filling an empty slot');
            }
        }

        if (this.inventoryModalTitle) {
            this.inventoryModalTitle.setText('');
        }
        this.inventoryModalFrame.setStrokeStyle(2, item.frameColor, 1);
        this.inventoryModalIcon.setText(item.icon);
        this.inventoryModalName.setText(item.name);
        this.inventoryModalName.setColor(item.rarityTextColor || '#ffffff');
        if (this.inventoryModalSlotBadge) {
            this.inventoryModalSlotBadge.setText(`${this.getEmptySlotIcon(item.slotGroup === 'ring' ? 'ring1' : item.slotGroup)}  ${this.getSlotLabel(item.slotGroup)}`);
            this.inventoryModalSlotBadge.setBackgroundColor(item.rarityTextColor || '#8bb7ff');
            this.inventoryModalSlotBadge.setColor('#111111');
        }
        const handlingLabel = item.twoHanded ? '  |  Two-Handed' : '';
        this.inventoryModalType.setText(`iLvl ${item.itemLevel || 1} ${item.rarity}  |  ${this.getSlotLabel(item.slotGroup)}${handlingLabel}`);
        if (this.inventoryModalEquipBtn) {
            this.inventoryModalEquipBtn.setVisible(source === 'inventory');
        }
        if (this.inventoryModalRemoveBtn) {
            this.inventoryModalRemoveBtn.setVisible(source === 'equipped');
        }
        if (this.inventoryModalSellBtn) {
            const sellPrice = Math.max(1, Math.floor(this.getItemPrice(item) / 2));
            this.inventoryModalSellBtn.setText(`Sell 🪙${sellPrice}`);
            this.inventoryModalSellBtn.setVisible(true);
        }
        this._inventoryModalJustOpened = true;
        this.inventoryModal.setVisible(true);
    }

    closeInventoryItemPopup() {
        this.selectedInventoryItem = null;
        this.selectedItemSource = null;
        this.selectedEquippedSlot = null;
        if (this.inventoryModal) {
            this.inventoryModal.setVisible(false);
        }
    }

    sellSelectedItem() {
        const item = this.selectedInventoryItem;
        const source = this.selectedItemSource;
        const slot = this.selectedEquippedSlot;
        this.closeInventoryItemPopup();
        if (!item) return;
        const sellPrice = Math.max(1, Math.floor(this.getItemPrice(item) / 2));

        if (source === 'inventory') {
            const idx = this.inventory.indexOf(item);
            if (idx === -1) return;
            this.inventory.splice(idx, 1);
        } else if (source === 'equipped') {
            if (!slot) return;
            this.equippedItems[slot] = null;
            this.player.equipment[slot] = 0;
        }

        this.player.gold += sellPrice;
        this.addCombatLog(`Sold ${item.rarity} ${item.name} for ${sellPrice} gold!`, '#ffd966');
        this.updateGoldDisplay();
        this.updateInventoryGridUI();
        this.updateEquipmentScreen();
    }

    equipSelectedInventoryItem() {
        const item = this.selectedInventoryItem;
        const source = this.selectedItemSource;
        this.closeInventoryItemPopup();
        if (!item || source !== 'inventory') return;

        const targetSlot = this.resolveEquipSlot(item.slotGroup);
        if (!targetSlot || !this.canEquipItemInSlot(item, targetSlot)) {
            this.addCombatLog(`Cannot equip ${item.name}: invalid slot`, '#ff8888');
            return;
        }
        const displacedItems = this.getDisplacedItemsForEquip(item, targetSlot);
        if (!this.canStoreDisplacedItems(displacedItems, 1)) {
            this.addCombatLog('Not enough inventory space to swap gear.', '#ff8888');
            return;
        }

        const inventoryIndex = this.inventory.findIndex(inventoryItem => inventoryItem.id === item.id);
        if (inventoryIndex === -1) return;

        this.inventory.splice(inventoryIndex, 1);
        for (let i = 0; i < displacedItems.length; i++) {
            const displaced = displacedItems[i];
            if (displaced && displaced.item) {
                this.inventory.push(displaced.item);
                this.clearEquippedSlot(displaced.slotKey);
            }
        }

        this.applyEquippedItemToSlot(item, targetSlot);
        this.updateEquipmentScreen();
        this.addCombatLog(`Equipped ${item.name} in ${targetSlot}${this.isTwoHandedItem(item) ? ' (2H)' : ''}`, '#99ff99');
    }

    removeSelectedEquippedItem() {
        const item = this.selectedInventoryItem;
        const source = this.selectedItemSource;
        const slotKey = this.selectedEquippedSlot;
        this.closeInventoryItemPopup();
        if (!item || source !== 'equipped' || !slotKey) return;

        if (this.inventory.length >= this.maxInventorySlots) {
            this.addCombatLog('Inventory full. Cannot remove equipped item.', '#ff8888');
            return;
        }

        const equippedItem = this.equippedItems[slotKey];
        if (!equippedItem) return;

        this.inventory.push(equippedItem);
        this.clearEquippedSlot(slotKey);

        if (slotKey === 'mainhand' && this.player.equipment.offhand === 'Occupied by Bow') {
            this.player.equipment.offhand = 'None';
        }

        this.updateEquipmentScreen();
        this.addCombatLog(`Removed ${equippedItem.name} from ${slotKey}`, '#ffcc88');
    }

    setGameBoardActive(active) {
        if (!this.tileSprites) return;
        for (let y = 0; y < this.tileSprites.length; y++) {
            for (let x = 0; x < this.tileSprites[y].length; x++) {
                const tile = this.tileSprites[y][x];
                if (!tile || !tile.rect) continue;

                if (!tile.rect.input) {
                    if (active) {
                        tile.rect.setInteractive({ draggable: true });
                    }
                } else {
                    tile.rect.input.enabled = active;
                }
            }
        }
    }

    updatePlayerUI() {
        const gear = this.getEquippedStatTotals();
        const charBonuses = this.getCharacterStatBonuses();

        if (this.playerHealthBar) {
            const fraction = Phaser.Math.Clamp(this.player.health / this.getMaxHealth(), 0, 1);
            const targetWidth = 166 * fraction;
            const targetColor = (fraction > 0.5 ? 0x00cc00 : (fraction > 0.25 ? 0xffcc00 : 0xff0000));
            this.tweens.killTweensOf(this.playerHealthBar);
            this.tweens.add({
                targets: this.playerHealthBar,
                width: targetWidth,
                duration: 300,
                ease: 'Power2'
            });
            this.playerHealthBar.fillColor = targetColor;
        }
        if (this.playerHealthText) {
            this.playerHealthText.setText(`${Math.ceil(this.player.health)} / ${this.getMaxHealth()}`);
        }

        // Update energy shield bar
        if (this.playerShieldBar) {
            const maxES = this.getMaxEnergyShield();
            const currentES = this.player.currentShield;
            const hasShield = maxES > 0;
            this.playerShieldBarBg.setVisible(hasShield);
            this.playerShieldBar.setVisible(hasShield);
            this.playerShieldLabel.setVisible(hasShield);
            this.playerShieldText.setVisible(hasShield);
            if (hasShield) {
                const fraction = Phaser.Math.Clamp(currentES / maxES, 0, 1);
                const shieldWidth = 166 * fraction;
                this.tweens.killTweensOf(this.playerShieldBar);
                this.tweens.add({
                    targets: this.playerShieldBar,
                    width: shieldWidth,
                    duration: 300,
                    ease: 'Power2'
                });
                this.playerShieldText.setText(`${currentES} / ${maxES}`);
            }
        }

        this.updateGoldDisplay();
    }

    updateGoldDisplay() {
        if (this.goldDisplayText) {
            this.goldDisplayText.setText(`${this.player.gold}`);
        }
    }

    updateEnemyUI() {
        this.enemies.forEach(enemy => {
            if (!enemy.healthBar) return;
            if (!enemy.alive) {
                enemy.healthBar.width = 0;
                if (enemy.healthText) {
                    enemy.healthText.setText(`0 / ${enemy.maxHealth}`);
                }
                return;
            }
            const fraction = Phaser.Math.Clamp(enemy.health / enemy.maxHealth, 0, 1);
            const maxBarW = enemy.pos.barW;
            const targetWidth = maxBarW * fraction;
            const targetColor = (fraction > 0.5 ? 0xff5555 : (fraction > 0.25 ? 0xffcc00 : 0xff0000));
            this.tweens.killTweensOf(enemy.healthBar);
            this.tweens.add({
                targets: enemy.healthBar,
                width: targetWidth,
                duration: 300,
                ease: 'Power2'
            });
            enemy.healthBar.fillColor = targetColor;
            if (enemy.healthText) {
                enemy.healthText.setText(`${Math.max(0, Math.ceil(enemy.health))} / ${enemy.maxHealth}`);
            }
        });
    }

    showCombatMessage(text, color, x, y) {
        if (!this.activeCombatTexts) this.activeCombatTexts = [];
        const combatText = this.add.text(x, y, text, { fontSize: '20px', color, fontStyle: 'bold', stroke: '#000000', strokeThickness: 2 }).setOrigin(0.5);
        this.activeCombatTexts.push(combatText);
        // Calculate how far to move so it floats off the top
        const finalY = -30; // Off the top of the screen
        const distance = y - finalY;
        const speed = 0.12; // pixels/ms (slower = longer on screen)
        const duration = Math.max(1200, distance / speed); // Minimum duration 1200ms
        this.tweens.add({
            targets: combatText,
            y: finalY,
            alpha: 0,
            duration: duration,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                combatText.destroy();
                if (this.activeCombatTexts) {
                    const idx = this.activeCombatTexts.indexOf(combatText);
                    if (idx !== -1) this.activeCombatTexts.splice(idx, 1);
                }
            }
        });
    }

    handleEnemyDeath(enemy) {
        if (!enemy) return;

        // Undead innate: Hamster Skeleton has a 33% chance to resurrect at 50% health (once per fight)
        const deadBodyCfg = MONSTER_BODIES[enemy.bodyIndex];
        const hasUndead = deadBodyCfg && deadBodyCfg.innate && deadBodyCfg.innate.some(t => t.id === 'undead');
        if (hasUndead && !enemy.hasResurrected && Math.random() < 0.33) {
            enemy.hasResurrected = true;
            enemy.health = Math.floor(enemy.maxHealth * 0.5);
            if (enemy.healthBar) {
                this.tweens.killTweensOf(enemy.healthBar);
                enemy.healthBar.width = Math.floor((enemy.health / enemy.maxHealth) * enemy.healthBarMaxWidth);
            }
            if (enemy.healthText) enemy.healthText.setText(`${enemy.health} / ${enemy.maxHealth}`);
            this.showCombatMessage('💀 RISEN!', '#44ff66', enemy.pos.x, enemy.pos.y - 50);
            this.addCombatLog(`💀 ${enemy.name}'s Undead trait triggers — it rises again at 50% health!`, '#44ff66');
            this.updateEnemyUI();
            return;
        }

        enemy.alive = false;
        enemy.health = 0;
        // Immediately zero the health bar — kill any in-progress tween so yellow/partial fill disappears
        if (enemy.healthBar) {
            this.tweens.killTweensOf(enemy.healthBar);
            enemy.healthBar.width = 0;
        }
        if (enemy.healthText) enemy.healthText.setText(`0 / ${enemy.maxHealth}`);

        if (enemy.enemySprite) {
            // Sprite-based enemy: play death animation then fade out
            const spriteKey = MONSTER_BODIES[enemy.bodyIndex].spriteKey;
            enemy.enemySprite.play(spriteKey + '_death');
            enemy.enemySprite.once('animationcomplete', () => {
                this.tweens.add({
                    targets: enemy.enemySprite,
                    alpha: 0,
                    duration: 400,
                    ease: 'Power2'
                });
            });
        }

        // Update target markers
        this.updateEnemyTargetMarkers();

        this.addCombatLog(`${enemy.name} defeated!`, '#66ff66');

        // Raccoon Bandit kill: guarantee at least one Magic-rarity item on the next reward screen
        const killedBodyCfg = MONSTER_BODIES[enemy.bodyIndex];
        if (killedBodyCfg && killedBodyCfg.spriteKey === 'raccoonbandit') {
            this.raccoonBanditRewardGuarantee = true;
            this.addCombatLog(`🪙 The bandit drops their loot — at least one Magic item guaranteed!`, '#ffd966');
        }

        // Boss kill: grant a large temporary magic find bonus for the upcoming reward screen
        if (killedBodyCfg && killedBodyCfg.isBoss) {
            this.bossMagicFindBonus = 100;
            this.addCombatLog(`✨ Boss defeated! +100 Magic Find on the next reward screen!`, '#ffb35c');
            this.showCombatMessage('✨ BOSS LOOT BONUS!', '#ffb35c',
                GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) / 2, FIGHT_PANEL_Y + 30);
        }

        // Above-Normal rarity kill: add temporary magic find bonus scaled by rarity
        if (!(killedBodyCfg && killedBodyCfg.isBoss) && enemy.rarity) {
            const rarityIdx = ENEMY_RARITIES.findIndex(r => r === enemy.rarity);
            if (rarityIdx >= 1) {
                const mfBonus = rarityIdx === 1 ? 15 : rarityIdx === 2 ? 35 : 60;
                this.bossMagicFindBonus = (this.bossMagicFindBonus || 0) + mfBonus;
                this.addCombatLog(`✨ ${enemy.rarity.name} enemy slain! +${mfBonus} Magic Find bonus!`, enemy.rarity.textColor);
            }
        }

        // Headhunter: steal a random affix from the killed enemy (active current + next battle)
        const gear = this.getEquippedStatTotals();
        if (gear.headhunter >= 1 && enemy.affixes && enemy.affixes.length > 0) {
            const stolen = Phaser.Utils.Array.GetRandom(enemy.affixes);
            this.stolenEnemyAffixes = this.stolenEnemyAffixes || [];
            this.stolenEnemyAffixes.push({ affix: stolen, stolenAtBattle: this.battleNumber });
            this.addCombatLog(`🗡️ Soul Steal! Stole [${stolen.icon} ${stolen.name}] — active this battle and next.`, '#ffb35c');
            this.showCombatMessage(`SOUL STEAL: ${stolen.icon} ${stolen.name}`, '#ffb35c',
                GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) / 2, FIGHT_PANEL_Y + 30);
        }
    }

    showVictoryPopup() {
        const popup = this.add.text(this.sys.game.config.width / 2, this.sys.game.config.height / 2, 'Victory!', {
            fontSize: '52px',
            color: '#00ff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 5
        }).setOrigin(0.5);

        this.tweens.add({
            targets: popup,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 300,
            ease: 'Back.easeOut'
        });

        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: popup,
                alpha: 0,
                duration: 900,
                ease: 'Power2',
                onComplete: () => popup.destroy()
            });
        });
    }

    createGrid() {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.grid[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                let type;
                do {
                    type = this.getRandomTileType();
                } while (!this.isValidPlacement(x, y, type));
                this.grid[y][x] = type;
            }
        }
    }

    renderGrid() {
        // Clear existing sprites and board container children
        if (this.boardContainer) {
            this.boardContainer.removeAll(true);
        }
        this.tileSprites.forEach(row => {
            row.forEach(sprite => {
                if (sprite && sprite.rect) sprite.rect.destroy();
                if (sprite && sprite.icon) sprite.icon.destroy();
            });
        });
        this.tileSprites = [];

        // Create new sprites
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.tileSprites[y] = [];
            for (let x = 0; x < GRID_WIDTH; x++) {
                const type = this.grid[y][x];
                const posX = GRID_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2;
                const posY = GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;

                if (type === -1) {
                    this.tileSprites[y][x] = { x, y, type };
                    continue;
                }

                const tileInfo = TILE_TYPES[type];
                if (!tileInfo) {
                    this.tileSprites[y][x] = { x, y, type };
                    continue;
                }

                // Background rectangle
                const rect = this.add.rectangle(posX, posY, TILE_SIZE - 4, TILE_SIZE - 4, tileInfo.color);
                rect.setStrokeStyle(2, 0xffffff);
                rect.setInteractive({ draggable: true });
                rect.on('dragstart', () => this.handleDragStart(x, y));
                rect.on('drag', (pointer) => this.handleDrag(pointer, x, y));
                rect.on('dragend', (pointer) => this.handleDragEnd(pointer, x, y));

                // Tile image icon (uses special textureKey for special tile types)
                const texKey = tileInfo.special ? tileInfo.textureKey : 'tile_' + tileInfo.name;
                let icon;
                if (this.textures.exists(texKey)) {
                    icon = this.add.image(posX, posY, texKey)
                        .setDisplaySize(TILE_SIZE - 4, TILE_SIZE - 4)
                        .setOrigin(0.5);
                } else {
                    icon = this.add.text(posX, posY, tileInfo.icon, {
                        fontSize: '32px',
                        color: '#000000',
                        stroke: '#ffffff',
                        strokeThickness: 4
                    }).setOrigin(0.5);
                }

                this.tileSprites[y][x] = { rect, icon, x, y, type };
                this.boardContainer.add(rect);
                this.boardContainer.add(icon);

                // Hold to show tile info popup
                rect.on('pointerdown', () => {
                    if (this._tileHoldTimer) {
                        this._tileHoldTimer.remove(false);
                        this._tileHoldTimer = null;
                    }
                    this._tileHoldTimer = this.time.delayedCall(600, () => {
                        this._tileHoldTimer = null;
                        this.showTileInfoPopup(x, y);
                    });
                });
                rect.on('pointerup', () => this.hideTileInfoPopup());
                rect.on('pointerout', () => this.hideTileInfoPopup());

                // Special tile: glow halo + zap click-to-explode
                if (tileInfo.special) {
                    const glowColor = tileInfo.color;
                    const glowRadius = Math.floor((TILE_SIZE - 4) / 2) + 1;
                    const glowG = this.add.graphics().setDepth(4);
                    glowG.fillStyle(glowColor, 0.12);
                    glowG.fillCircle(posX, posY, glowRadius);
                    glowG.lineStyle(3, glowColor, 1);
                    glowG.strokeCircle(posX, posY, glowRadius);
                    this.boardContainer.add(glowG);
                    this.tweens.add({
                        targets: glowG,
                        alpha: { from: 0.45, to: 1 },
                        duration: 700,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut'
                    });
                    this.tileSprites[y][x].glowRect = glowG;

                    if (type === 6) { // zap: tap to explode
                        rect.on('pointerup', (pointer, localX, localY, event) => {
                            if (this.isSwapping) return;
                            if (this.dragStart) return;
                            event.stopPropagation();
                            this.handleZapTileClick(x, y);
                        });
                    }
                }
            }
        }
    }

    handleDragStart(x, y) {
        if (this.isSwapping || this.isShowingEquipment) return;
        // Cancel any tile hold-popup timer when a real drag begins
        if (this._tileHoldTimer) {
            this._tileHoldTimer.remove(false);
            this._tileHoldTimer = null;
        }
        this.hideTileInfoPopup();
        this.dragStart = { x, y };
        // Bring tile to front while dragging
        const tile = this.tileSprites[y][x];
        if (tile && tile.rect) {
            tile.rect.setDepth(1000);
            if (this.boardContainer) this.boardContainer.bringToTop(tile.rect);
            if (this.children) this.children.bringToTop(tile.rect);
        }
        if (tile && tile.icon) {
            tile.icon.setDepth(1000);
            if (this.boardContainer) this.boardContainer.bringToTop(tile.icon);
            if (this.children) this.children.bringToTop(tile.icon);
        }
    }

    handleDrag(pointer, x, y) {
        const tile = this.tileSprites[y][x];
        if (tile && tile.rect && tile.icon) {
            tile.rect.x = pointer.x;
            tile.rect.y = pointer.y;
            tile.icon.x = pointer.x;
            tile.icon.y = pointer.y;
        }
    }

    handleDragEnd(pointer, x, y) {
        const tile = this.tileSprites[y][x];
        if (!tile || !tile.rect || !tile.icon) return;

        // Snap back to original position and reset depth
        const posX = GRID_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2;
        const posY = GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
        tile.rect.x = posX;
        tile.rect.y = posY;
        tile.icon.x = posX;
        tile.icon.y = posY;
        tile.rect.setDepth(0);
        tile.icon.setDepth(0);

        if (!this.dragStart) return;

        // Calculate which grid cell the pointer is over
        const gridX = Math.floor((pointer.x - GRID_OFFSET_X) / TILE_SIZE);
        const gridY = Math.floor((pointer.y - GRID_OFFSET_Y) / TILE_SIZE);

        // Check if it's a valid grid position
        if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
            this.dragStart = null;
            return;
        }

        const dx = Math.abs(this.dragStart.x - gridX);
        const dy = Math.abs(this.dragStart.y - gridY);

        // Allow swap if the drag ends within a 1-tile radius (including diagonals and slightly off-adjacent drags)
        if ((dx <= 1 && dy <= 1) && (dx + dy > 0) && (dx + dy <= 2)) {
            this.swapTiles(this.dragStart.x, this.dragStart.y, gridX, gridY);
        }

        this.dragStart = null;
    }

    swapTiles(x1, y1, x2, y2) {
        this.isSwapping = true;

        // Swap in grid
        const temp = this.grid[y1][x1];
        this.grid[y1][x1] = this.grid[y2][x2];
        this.grid[y2][x2] = temp;

        this.renderGrid();

        const matchData = this.findMatchData();
        if (matchData.matched.length > 0) {
            this.time.delayedCall(300, () => {
                this.clearMatches(matchData.matched, matchData.runs, matchData.lShapes, matchData.tCrossShapes);
                this.applyGravity();
            });
        } else {
            this.time.delayedCall(350, () => {
                const temp = this.grid[y1][x1];
                this.grid[y1][x1] = this.grid[y2][x2];
                this.grid[y2][x2] = temp;
                this.renderGrid();
                this.isSwapping = false;
            });
        }
    }

    findMatchData() {
        const matched = new Set();
        const runs = [];

        // Horizontal runs
        for (let y = 0; y < GRID_HEIGHT; y++) {
            let x = 0;
            while (x < GRID_WIDTH) {
                const type = this.grid[y][x];
                if (type === -1) {
                    x++;
                    continue;
                }

                let count = 1;
                while (x + count < GRID_WIDTH && this.grid[y][x + count] === type) {
                    count++;
                }

                if (count >= 3) {
                    const tiles = [];
                    for (let i = 0; i < count; i++) {
                        matched.add(`${x + i},${y}`);
                        tiles.push({ x: x + i, y });
                    }

                    const tileType = TILE_TYPES[type];
                    runs.push({
                        length: count,
                        orientation: 'horizontal',
                        type,
                        effect: tileType ? tileType.effect : null,
                        color: tileType ? tileType.color : 0xffffff,
                        tiles
                    });
                }

                x += count;
            }
        }

        // Vertical runs
        for (let x = 0; x < GRID_WIDTH; x++) {
            let y = 0;
            while (y < GRID_HEIGHT) {
                const type = this.grid[y][x];
                if (type === -1) {
                    y++;
                    continue;
                }

                let count = 1;
                while (y + count < GRID_HEIGHT && this.grid[y + count][x] === type) {
                    count++;
                }

                if (count >= 3) {
                    const tiles = [];
                    for (let i = 0; i < count; i++) {
                        matched.add(`${x},${y + i}`);
                        tiles.push({ x, y: y + i });
                    }

                    const tileType = TILE_TYPES[type];
                    runs.push({
                        length: count,
                        orientation: 'vertical',
                        type,
                        effect: tileType ? tileType.effect : null,
                        color: tileType ? tileType.color : 0xffffff,
                        tiles
                    });
                }

                y += count;
            }
        }

        const lShapes = this.findLShapeMatches(runs);
        const tCrossShapes = this.findTCrossShapes(runs);

        return {
            matched: Array.from(matched),
            runs,
            lShapes,
            tCrossShapes
        };
    }

    isRunEndpoint(run, x, y) {
        if (!run || !run.tiles || run.tiles.length === 0) return false;
        const first = run.tiles[0];
        const last = run.tiles[run.tiles.length - 1];
        return (first.x === x && first.y === y) || (last.x === x && last.y === y);
    }

    findTCrossShapes(runs) {
        const horizontalRuns = runs.filter(run => run.orientation === 'horizontal' && run.length >= 3 && run.type >= 0);
        const verticalRuns = runs.filter(run => run.orientation === 'vertical' && run.length >= 3 && run.type >= 0);
        const shapes = [];
        const seen = new Set();

        horizontalRuns.forEach(hRun => {
            const hStartX = hRun.tiles[0].x;
            const hEndX = hRun.tiles[hRun.tiles.length - 1].x;
            const hY = hRun.tiles[0].y;

            verticalRuns.forEach(vRun => {
                if (vRun.type !== hRun.type) return;

                const vX = vRun.tiles[0].x;
                const vStartY = vRun.tiles[0].y;
                const vEndY = vRun.tiles[vRun.tiles.length - 1].y;

                const intersects = vX >= hStartX && vX <= hEndX && hY >= vStartY && hY <= vEndY;
                if (!intersects) return;

                // Only T and cross shapes — skip L-shapes (endpoint of both runs)
                if (this.isRunEndpoint(hRun, vX, hY) && this.isRunEndpoint(vRun, vX, hY)) return;

                const tileMap = new Map();
                hRun.tiles.forEach(tile => tileMap.set(`${tile.x},${tile.y}`, tile));
                vRun.tiles.forEach(tile => tileMap.set(`${tile.x},${tile.y}`, tile));
                const tiles = Array.from(tileMap.values());

                if (tiles.length < 5) return;

                const signature = tiles.map(t => `${t.x},${t.y}`).sort().join('|');
                if (seen.has(signature)) return;
                seen.add(signature);

                const hInterior = !this.isRunEndpoint(hRun, vX, hY);
                const vInterior = !this.isRunEndpoint(vRun, vX, hY);
                const shapeType = (hInterior && vInterior) ? 'cross' : 'T';

                shapes.push({
                    effect: hRun.effect,
                    color: hRun.color,
                    shapeType,
                    tiles,
                    length: tiles.length
                });
            });
        });

        return shapes;
    }

    findLShapeMatches(runs) {
        const horizontalRuns = runs.filter(run => run.orientation === 'horizontal' && run.length >= 3 && run.type >= 0);
        const verticalRuns = runs.filter(run => run.orientation === 'vertical' && run.length >= 3 && run.type >= 0);
        const lShapes = [];
        const seen = new Set();

        horizontalRuns.forEach(hRun => {
            const hStartX = hRun.tiles[0].x;
            const hEndX = hRun.tiles[hRun.tiles.length - 1].x;
            const hY = hRun.tiles[0].y;

            verticalRuns.forEach(vRun => {
                if (vRun.type !== hRun.type) return;

                const vX = vRun.tiles[0].x;
                const vStartY = vRun.tiles[0].y;
                const vEndY = vRun.tiles[vRun.tiles.length - 1].y;

                const intersects = vX >= hStartX && vX <= hEndX && hY >= vStartY && hY <= vEndY;
                if (!intersects) return;

                // L-shapes share a corner tile that is an endpoint on both runs.
                if (!this.isRunEndpoint(hRun, vX, hY) || !this.isRunEndpoint(vRun, vX, hY)) return;

                const tileMap = new Map();
                hRun.tiles.forEach(tile => tileMap.set(`${tile.x},${tile.y}`, tile));
                vRun.tiles.forEach(tile => tileMap.set(`${tile.x},${tile.y}`, tile));
                const tiles = Array.from(tileMap.values());

                const signature = tiles
                    .map(tile => `${tile.x},${tile.y}`)
                    .sort()
                    .join('|');

                if (seen.has(signature)) return;
                seen.add(signature);

                lShapes.push({
                    effect: hRun.effect,
                    color: hRun.color,
                    corner: { x: vX, y: hY },
                    tiles
                });
            });
        });

        return lShapes;
    }

    findMatches() {
        return this.findMatchData().matched;
    }

    clearMatches(matches, comboRuns = [], lShapeCombos = [], tCrossShapes = []) {
        const gear = this.getEquippedStatTotals();
        let totalEnemyDamage = 0;
        let totalPlayerHeal = 0;
        let physicalDamage = 0;
        let magicDamage = 0;
        let rangedDamage = 0;
        let healAmount = 0;
        let goldGain = 0;
        const matchCounts = {
            physical: 0,
            magic: 0,
            ranged: 0,
            health: 0,
            gold: 0
        };
        const matchedTilesForEffects = [];
        const comboChargeSources = [];

        // --- Build per-tile shatter intensity map ---
        // intensity 1 = 3-match, 2 = 4-match, 3 = 5/L/T-match
        const tileShatterIntensity = {};
        matches.forEach(m => { tileShatterIntensity[m] = 1; });
        comboRuns.forEach(run => {
            if (run.length >= 4) {
                const lvl = run.length >= 5 ? 3 : 2;
                run.tiles.forEach(t => {
                    const k = `${t.x},${t.y}`;
                    if ((tileShatterIntensity[k] || 0) < lvl) tileShatterIntensity[k] = lvl;
                });
            }
        });
        lShapeCombos.forEach(shape => {
            shape.tiles.forEach(t => { tileShatterIntensity[`${t.x},${t.y}`] = 3; });
        });
        tCrossShapes.forEach(shape => {
            shape.tiles.forEach(t => { tileShatterIntensity[`${t.x},${t.y}`] = 3; });
        });

        lShapeCombos.forEach((shape, index) => {
            this.spawnLShapeMatchEffect(shape, index * 90);
            this.addCombatLog('L-Shape Match!', this.toHexColor(shape.color || 0xffffff));
        });

        // Regular tile clears charge skills. Heart tiles now also heal directly.
        matches.forEach(match => {
            const [x, y] = match.split(',').map(Number);
            const tileType = this.grid[y][x];

            // Shatter animation for this tile
            const shatterWX = GRID_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2;
            const shatterWY = GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2;
            const shatterColor = (tileType >= 0 && TILE_TYPES[tileType]) ? TILE_TYPES[tileType].color : 0xffffff;
            this.spawnTileShatterEffect(shatterWX, shatterWY, shatterColor, tileShatterIntensity[match] || 1);

            if (tileType >= 0 && TILE_TYPES[tileType]) {
                const effect = TILE_TYPES[tileType].effect;
                matchedTilesForEffects.push({
                    x: GRID_OFFSET_X + x * TILE_SIZE + TILE_SIZE / 2,
                    y: GRID_OFFSET_Y + y * TILE_SIZE + TILE_SIZE / 2,
                    effect,
                    color: TILE_TYPES[tileType].color
                });
                if (matchCounts[effect] !== undefined) {
                    matchCounts[effect] += 1;
                }
                // Gold tiles give gold on any match (including 3s)
                if (effect === 'gold') {
                    goldGain += 3;
                }
                if (effect === 'physical') {
                    const tileDamage = Math.max(1, 1 + Math.floor(gear.physical * 0.35));
                    physicalDamage += tileDamage;
                    totalEnemyDamage += tileDamage;
                }
                if (effect === 'magic') {
                    const tileDamage = Math.max(1, 1 + Math.floor(gear.magic * 0.35));
                    magicDamage += tileDamage;
                    totalEnemyDamage += tileDamage;
                }
                if (effect === 'ranged') {
                    const tileDamage = Math.max(1, 1 + Math.floor(gear.ranged * 0.35));
                    rangedDamage += tileDamage;
                    totalEnemyDamage += tileDamage;
                }
                if (effect === 'health') {
                    const perTileHeal = 3 + Math.floor(gear.health / 80);
                    const tileHeal = Math.max(2, perTileHeal);
                    healAmount += tileHeal;
                    totalPlayerHeal += tileHeal;
                }
                if (effect === 'frost') {
                    const coldDmg = Math.max(3, 5 + Math.floor(gear.magic * 0.3));
                    totalEnemyDamage += coldDmg;
                    magicDamage += coldDmg;
                    this.spawnFrostTileMatchEffect(shatterWX, shatterWY);
                    this.addCombatLog(`❄️ Frost tile shattered: ${coldDmg} cold dmg`, '#88ddff');
                }
                if (effect === 'zap') {
                    const zapDmg = Math.max(3, 5 + Math.floor(gear.ranged * 0.3));
                    totalEnemyDamage += zapDmg;
                    rangedDamage += zapDmg;
                    this.spawnZapTileMatchEffect(shatterWX, shatterWY);
                    this.addCombatLog(`⚡ Zap tile matched: ${zapDmg} lightning dmg`, '#ffe566');
                }
                if (effect === 'flame') {
                    const fireDmg = Math.max(8, 15 + Math.floor(gear.physical * 0.5));
                    totalEnemyDamage += fireDmg;
                    physicalDamage += fireDmg;
                    this.spawnFlameTileMatchEffect(shatterWX, shatterWY);
                    this.addCombatLog(`🔥 Flame tile ignited: ${fireDmg} fire dmg`, '#ff6a00');
                }
            }
            this.grid[y][x] = -1;
            this.score += 10;
        });

        // --- 4 and 5-tile combos: bonus damage / heal / gold boost ---
        comboRuns.forEach(run => {
            if (!run || !run.effect || !run.tiles || run.tiles.length === 0) return;
            if (run.length < 4) return;

            const center = run.tiles.reduce((acc, tile) => {
                acc.x += GRID_OFFSET_X + tile.x * TILE_SIZE + TILE_SIZE / 2;
                acc.y += GRID_OFFSET_Y + tile.y * TILE_SIZE + TILE_SIZE / 2;
                return acc;
            }, { x: 0, y: 0 });
            center.x /= run.tiles.length;
            center.y /= run.tiles.length;

            const is5 = run.length >= 5;
            const comboMultiplier = is5 ? 3.0 : 1.5;
            const comboLabel = is5 ? '5x Combo' : '4x Combo';

            const charBonuses = this.getCharacterStatBonuses();

            switch (run.effect) {
                case 'physical': {
                    const baseDmg = 8 + gear.physical + charBonuses.physicalDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    physicalDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, run.color, run.length, comboDmg);
                    this.addCombatLog(`${comboLabel} ⚔️ Physical: ${comboDmg}`, '#ff4444');
                    break;
                }
                case 'magic': {
                    const baseDmg = 9 + gear.magic + charBonuses.magicDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    magicDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, run.color, run.length, comboDmg);
                    this.addCombatLog(`${comboLabel} 📖 Magic: ${comboDmg}`, '#5a7aff');
                    break;
                }
                case 'ranged': {
                    const baseDmg = 7 + gear.ranged + charBonuses.rangedDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    rangedDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, run.color, run.length, comboDmg);
                    this.addCombatLog(`${comboLabel} 🏹 Ranged: ${comboDmg}`, '#55ff55');
                    break;
                }
                case 'health': {
                    const baseHeal = 15 + Math.floor(gear.health / 5);
                    const comboHeal = Math.floor(baseHeal * comboMultiplier);
                    healAmount += comboHeal;
                    totalPlayerHeal += comboHeal;
                    this.spawnComboTierEffect(center.x, center.y, run.color, run.length, comboHeal);
                    this.addCombatLog(`${comboLabel} ♥ Heal: +${comboHeal}`, '#ff69b4');
                    break;
                }
                case 'gold': {
                    const baseGold = is5 ? 25 : 12;
                    goldGain += baseGold;
                    this.spawnComboTierEffect(center.x, center.y, run.color, run.length, baseGold);
                    this.addCombatLog(`${comboLabel} 🪙 Gold +${baseGold}`, '#ffd966');
                    break;
                }
            }

            // Bonus skill charge from combos
            const bonusCharge = is5 ? 3 : 1;
            if (matchCounts[run.effect] !== undefined) {
                matchCounts[run.effect] += bonusCharge;
            }

            comboChargeSources.push({
                x: center.x,
                y: center.y,
                effect: run.effect,
                color: run.color,
                bonusUnits: bonusCharge
            });
        });

        // --- T-shape and cross combos: 5-tile bonus damage ---
        tCrossShapes.forEach(shape => {
            if (!shape || !shape.effect || !shape.tiles || shape.tiles.length === 0) return;

            const center = shape.tiles.reduce((acc, tile) => {
                acc.x += GRID_OFFSET_X + tile.x * TILE_SIZE + TILE_SIZE / 2;
                acc.y += GRID_OFFSET_Y + tile.y * TILE_SIZE + TILE_SIZE / 2;
                return acc;
            }, { x: 0, y: 0 });
            center.x /= shape.tiles.length;
            center.y /= shape.tiles.length;

            const comboMultiplier = 3.0;
            const comboLabel = shape.shapeType === 'cross' ? '✚ Cross Combo' : 'T-Shape Combo';
            const charBonuses = this.getCharacterStatBonuses();

            switch (shape.effect) {
                case 'physical': {
                    const baseDmg = 8 + gear.physical + charBonuses.physicalDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    physicalDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, shape.color, 5, comboDmg);
                    this.addCombatLog(`${comboLabel} ⚔️ Physical: ${comboDmg}`, '#ff4444');
                    break;
                }
                case 'magic': {
                    const baseDmg = 9 + gear.magic + charBonuses.magicDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    magicDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, shape.color, 5, comboDmg);
                    this.addCombatLog(`${comboLabel} 📖 Magic: ${comboDmg}`, '#5a7aff');
                    break;
                }
                case 'ranged': {
                    const baseDmg = 7 + gear.ranged + charBonuses.rangedDamageBonus;
                    const comboDmg = Math.floor(baseDmg * comboMultiplier);
                    rangedDamage += comboDmg;
                    totalEnemyDamage += comboDmg;
                    this.spawnComboTierEffect(center.x, center.y, shape.color, 5, comboDmg);
                    this.addCombatLog(`${comboLabel} 🏹 Ranged: ${comboDmg}`, '#55ff55');
                    break;
                }
                case 'health': {
                    const baseHeal = 15 + Math.floor(gear.health / 5);
                    const comboHeal = Math.floor(baseHeal * comboMultiplier);
                    healAmount += comboHeal;
                    totalPlayerHeal += comboHeal;
                    this.spawnComboTierEffect(center.x, center.y, shape.color, 5, comboHeal);
                    this.addCombatLog(`${comboLabel} ♥ Heal: +${comboHeal}`, '#ff69b4');
                    break;
                }
                case 'gold': {
                    const baseGold = 25;
                    goldGain += baseGold;
                    this.spawnComboTierEffect(center.x, center.y, shape.color, 5, baseGold);
                    this.addCombatLog(`${comboLabel} 🪙 Gold +${baseGold}`, '#ffd966');
                    break;
                }
            }

            const bonusCharge = 3;
            if (matchCounts[shape.effect] !== undefined) matchCounts[shape.effect] += bonusCharge;
            comboChargeSources.push({ x: center.x, y: center.y, effect: shape.effect, color: shape.color, bonusUnits: bonusCharge });
        });

        // Apply talent damage % bonuses
        const talentBonuses = this.getTalentPercentBonuses();
        if (physicalDamage > 0) {
            // Gear legendary: 100% conversion takes priority over talent 50% conversion
            if (gear.physToFire >= 1) {
                const physMult = 1 + (talentBonuses.physicalDamage + talentBonuses.fireDamage) / 100;
                physicalDamage = Math.floor(physicalDamage * physMult * (talentBonuses.seeRed ? 2 : 1));
                this.addCombatLog(`🔥 Infernal conversion: physical→fire`, '#ff6a00');
            } else if (gear.physToLightning >= 1) {
                const physMult = 1 + (talentBonuses.physicalDamage + talentBonuses.lightningDamage) / 100;
                physicalDamage = Math.floor(physicalDamage * physMult * (talentBonuses.seeRed ? 2 : 1));
                this.addCombatLog(`⚡ Thunderfist conversion: physical→lightning`, '#ffe566');
            } else if (gear.physToCold >= 1) {
                const physMult = 1 + (talentBonuses.physicalDamage + talentBonuses.coldDamage) / 100;
                physicalDamage = Math.floor(physicalDamage * physMult * (talentBonuses.seeRed ? 2 : 1));
                this.addCombatLog(`❄️ Winter's Touch conversion: physical→cold`, '#8ecfff');
            } else {
                // Burning Man: 50% of physical converts to fire — applies fireDamage bonus on top
                const physMult = talentBonuses.burningMan
                    ? (0.5 * (1 + talentBonuses.physicalDamage / 100) + 0.5 * (1 + (talentBonuses.physicalDamage + talentBonuses.fireDamage) / 100))
                    : (1 + talentBonuses.physicalDamage / 100);
                physicalDamage = Math.floor(physicalDamage * physMult * (talentBonuses.seeRed ? 2 : 1));
            }
            // Iron Will: 50% of strength bonus applies to magic damage as a flat add
            if (gear.ironWill >= 1 && this.getCharacterStatBonuses().physicalDamageBonus > 0) {
                const ironWillBonus = Math.floor(this.getCharacterStatBonuses().physicalDamageBonus * 0.5);
                magicDamage += ironWillBonus;
            }
        }
        if (magicDamage > 0) {
            // Frost tile passive: +4% cold damage per frost tile on board
            const frostBonus = this.getFrostTileColdBonus();
            // Gear legendary: 100% conversion
            if (gear.magicToCold >= 1) {
                const magMult = 1 + (talentBonuses.magicDamage + talentBonuses.coldDamage + frostBonus) / 100;
                magicDamage = Math.floor(magicDamage * magMult * (talentBonuses.feelingBlue ? 2 : 1));
                this.addCombatLog(`❄️ Glacial Mind conversion: magic→cold`, '#8ecfff');
            } else {
                // Frost Mage: 50% of magic converts to cold — applies coldDamage bonus on top
                const magMult = talentBonuses.frostMage
                    ? (0.5 * (1 + talentBonuses.magicDamage / 100) + 0.5 * (1 + (talentBonuses.magicDamage + talentBonuses.coldDamage + frostBonus) / 100))
                    : (1 + (talentBonuses.magicDamage + frostBonus) / 100);
                magicDamage = Math.floor(magicDamage * magMult * (talentBonuses.feelingBlue ? 2 : 1));
            }
            if (frostBonus > 0) this.addCombatLog(`❄️ Frost tiles: +${frostBonus}% cold dmg`, '#88ddff');
        }
        if (rangedDamage > 0) {
            // Gear legendary: 100% conversion
            if (gear.rangedToLightning >= 1) {
                const rngMult = 1 + (talentBonuses.rangedDamage + talentBonuses.lightningDamage) / 100;
                rangedDamage = Math.floor(rangedDamage * rngMult * (talentBonuses.turningGreen ? 2 : 1));
                this.addCombatLog(`⚡ Tempest conversion: ranged→lightning`, '#ffe566');
            } else if (gear.rangedToFire >= 1) {
                const rngMult = 1 + (talentBonuses.rangedDamage + talentBonuses.fireDamage) / 100;
                rangedDamage = Math.floor(rangedDamage * rngMult * (talentBonuses.turningGreen ? 2 : 1));
                this.addCombatLog(`🔥 Flame Caller conversion: ranged→fire`, '#ff6a00');
            } else {
                // Conduit: 50% of ranged converts to lightning — applies lightningDamage bonus on top
                const rngMult = talentBonuses.conduit
                    ? (0.5 * (1 + talentBonuses.rangedDamage / 100) + 0.5 * (1 + (talentBonuses.rangedDamage + talentBonuses.lightningDamage) / 100))
                    : (1 + talentBonuses.rangedDamage / 100);
                rangedDamage = Math.floor(rangedDamage * rngMult * (talentBonuses.turningGreen ? 2 : 1));
            }
        }
        // Headhunter: apply stolen enemy affix bonuses
        const stolenBonuses = this.getStolenAffixBonuses();
        if (gear.headhunter >= 1 && stolenBonuses.damageMult > 1) {
            physicalDamage = Math.floor(physicalDamage * stolenBonuses.damageMult);
            magicDamage    = Math.floor(magicDamage    * stolenBonuses.damageMult);
            rangedDamage   = Math.floor(rangedDamage   * stolenBonuses.damageMult);
        }
        // Shield Damage: bonus % damage when a Shield is equipped in the offhand
        if (talentBonuses.shieldDamage > 0 && this.equippedItems.offhand && this.equippedItems.offhand.type === 'Shield') {
            const shieldMult = 1 + talentBonuses.shieldDamage / 100;
            physicalDamage = Math.floor(physicalDamage * shieldMult);
            magicDamage    = Math.floor(magicDamage    * shieldMult);
            rangedDamage   = Math.floor(rangedDamage   * shieldMult);
            this.addCombatLog(`🛡️ Shield Damage: +${talentBonuses.shieldDamage}%`, '#ff9944');
        }
        // Rupture affix bonus is factored into getCritMultiplier()
        totalEnemyDamage = physicalDamage + magicDamage + rangedDamage;

        // Voidheart: gold matches also deal magic damage
        if (gear.voidheart >= 1 && goldGain > 0) {
            const voidDmg = goldGain;
            totalEnemyDamage += voidDmg;
            magicDamage += voidDmg;
            this.addCombatLog(`🌑 Voidheart: gold→${voidDmg} magic`, '#cc88ff');
        }

        // Apply gold gains
        if (goldGain > 0) {
            this.player.gold += goldGain;
            this.addCombatLog(`Gold +${goldGain}`, '#ffd966');
            this.updateGoldDisplay();
        }

        if (physicalDamage > 0) {
            this.addCombatLog(`Physical Damage: ${physicalDamage}`, '#ff0000');
        }
        if (magicDamage > 0) {
            this.addCombatLog(`Magic Damage: ${magicDamage}`, '#0000ff');
        }
        if (rangedDamage > 0) {
            this.addCombatLog(`Ranged Damage: ${rangedDamage}`, '#00ff00');
        }
        if (healAmount > 0) {
            this.addCombatLog(`Heart Heal: +${healAmount}`, '#ff79bf');
        }

        this.addSkillChargeFromMatches(matchCounts);
        this.spawnSkillChargeParticles(matchedTilesForEffects);
        this.spawnComboBonusChargeParticles(comboChargeSources);

        if (totalEnemyDamage > 0) {
            // Crit roll for the match attack
            const matchCritChance = this.getCharacterStatBonuses().critChance;
            let matchAttackIsCrit = false;
            if (Math.random() * 100 < matchCritChance) {
                totalEnemyDamage = Math.floor(totalEnemyDamage * this.getCritMultiplier());
                matchAttackIsCrit = true;
                this.addCombatLog(`CRIT!`, '#ffff00');
            }

            const target = this.getTargetEnemy();
            if (target) {
                // Enemy evade logic
                let evadeChance = 0.01; // 1% default
                if (target.name === 'Red Squirrel') evadeChance = 0.10;
                if (Math.random() < evadeChance) {
                    // Enemy evades: show floating text on enemy side at same height
                    const enemyCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
                    this.showCombatMessage('EVADE!', '#00ffcc', enemyCenterX, FIGHT_PANEL_Y + 30);
                    // Player attack animation still plays
                    if (this.playerSprite) {
                        this.playPlayerAttackAnim();
                    }
                    // Evade skips damage but the turn still completes
                    totalEnemyDamage = 0;
                    matchAttackIsCrit = false;
                }
                this.damageEnemy(target, totalEnemyDamage);
                // Stolen vampiric affix: lifesteal 15% of damage dealt
                const stolenForVamp = this.getStolenAffixBonuses();
                if (gear.headhunter >= 1 && stolenForVamp.vampiric) {
                    const lifesteal = Math.max(1, Math.floor(totalEnemyDamage * 0.15));
                    this.player.health = Math.min(this.getMaxHealth(), this.player.health + lifesteal);
                    this.addCombatLog(`🩸 Vampiric lifesteal: +${lifesteal} HP`, '#ff4499');
                }
                // Center on enemy side
                const enemyCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
                if (matchAttackIsCrit && totalEnemyDamage > 0) {
                    this.showCombatMessage(`CRIT ${totalEnemyDamage}`, '#ffff00', enemyCenterX, FIGHT_PANEL_Y + 30);
                } else if (totalEnemyDamage > 0) {
                    this.showCombatMessage(`-${totalEnemyDamage}`, '#ff4444', enemyCenterX, FIGHT_PANEL_Y + 30);
                }

                // Player attack animation
                if (this.playerSprite) {
                    this.playPlayerAttackAnim();
                }
                // Enemy hit reaction
                if (target.health > 0) {
                    this.time.delayedCall(100, () => this.playEnemyHitAnim(target));
                }

                if (target.health <= 0) {
                    this.handleEnemyDeath(target);
                }
            }

            if (this.allEnemiesDead()) {
                if (!this.awaitingRewardChoice) {
                    this.awaitingRewardChoice = true;
                    this.stopAllParticleEffects();
                    this.time.delayedCall(1500, () => this.showRewardScreen());
                }
                this.isSwapping = true;
            }
        }

        if (totalPlayerHeal > 0) {
            const tb_heal = this.getTalentPercentBonuses();
            if (tb_heal.energyForm) {
                // Energy Form: heart heals restore Energy Shield instead of Health
                this.player.currentShield = Math.min(this.getMaxEnergyShield(), (this.player.currentShield || 0) + totalPlayerHeal);
            } else {
                this.player.health = Math.min(this.getMaxHealth(), this.player.health + totalPlayerHeal);
            }
            // No floating healing text; healing particle effects are already shown
        }

        this.player.health = Math.min(this.getMaxHealth(), this.player.health);

        // Life regen affix: heal a flat amount each turn
        if (gear.lifeRegen > 0) {
            this.player.health = Math.min(this.getMaxHealth(), this.player.health + gear.lifeRegen);
            this.addCombatLog(`💚 Life Regen: +${gear.lifeRegen} HP`, '#44ff99');
        }

        // Talent Health Regen: flat HP per turn
        const tb_regen = this.getTalentPercentBonuses();
        if (tb_regen.healthRegen > 0) {
            this.player.health = Math.min(this.getMaxHealth(), this.player.health + tb_regen.healthRegen);
            this.addCombatLog(`💚 Health Regen: +${tb_regen.healthRegen} HP`, '#44ff99');
        }

        // Stolen regenerating affix: heal 8% max HP after each turn
        const stolenForRegen = this.getStolenAffixBonuses();
        if (gear.headhunter >= 1 && stolenForRegen.regenerating) {
            const regenHeal = Math.max(1, Math.floor(this.getMaxHealth() * 0.08));
            this.player.health = Math.min(this.getMaxHealth(), this.player.health + regenHeal);
            this.addCombatLog(`💚 Regenerating: +${regenHeal} HP`, '#44ff99');
        }

        document.getElementById('score').textContent = `Score: ${this.score}`;
        this.updatePlayerUI();
        this.updateEnemyUI();
        this.renderGrid();
    }

    applyGravity() {
        // Calculate which tiles move where
        const newGrid = this.grid.map(row => [...row]);
        const animations = [];
        const newTiles = []; // Track newly spawned tiles {x, y, type}

        // Drop existing tiles down
        for (let x = 0; x < GRID_WIDTH; x++) {
            for (let y = GRID_HEIGHT - 1; y > 0; y--) {
                if (newGrid[y][x] === -1) {
                    let sourceY = y - 1;
                    while (sourceY >= 0 && newGrid[sourceY][x] === -1) {
                        sourceY--;
                    }
                    if (sourceY >= 0) {
                        newGrid[y][x] = newGrid[sourceY][x];
                        newGrid[sourceY][x] = -1;
                        animations.push({ x, fromY: sourceY, toY: y });
                    }
                }
            }
        }

        // Fill empty at top with new tiles
        for (let x = 0; x < GRID_WIDTH; x++) {
            for (let y = 0; y < GRID_HEIGHT; y++) {
                if (newGrid[y][x] === -1) {
                    const type = this.getRandomTileType();
                    newGrid[y][x] = type;
                    newTiles.push({ x, y, type });
                }
            }
        }

        this.grid = newGrid;

        // Animate falling tiles
        const allAnimations = [];
        
        animations.forEach(anim => {
            const sprite = this.tileSprites[anim.fromY][anim.x];
            if (sprite && sprite.rect) {
                const toWorldY = GRID_OFFSET_Y + anim.toY * TILE_SIZE + TILE_SIZE / 2;
                allAnimations.push(
                    this.tweens.add({
                        targets: sprite.rect,
                        y: toWorldY,
                        duration: 250,
                        ease: 'Power2'
                    })
                );
            }
        });

        // After existing tiles fall, re-render to add new tiles, then animate them
        this.time.delayedCall(50, () => {
            // Recreate all sprites (will place new tiles at top of screen temporarily)
            const savedAnimations = this.tweens.getAllTweens();
            this.renderGrid();
            
            // Now animate new tiles falling down
            newTiles.forEach(newTile => {
                const toWorldY = GRID_OFFSET_Y + newTile.y * TILE_SIZE + TILE_SIZE / 2;
                const sprite = this.tileSprites[newTile.y][newTile.x];
                if (sprite && sprite.rect) {
                    sprite.rect.y = GRID_OFFSET_Y - TILE_SIZE; // Start above screen
                }
                if (sprite && sprite.icon) {
                    sprite.icon.y = GRID_OFFSET_Y - TILE_SIZE;
                }

                if (sprite && sprite.rect) {
                    this.tweens.add({
                        targets: sprite.rect,
                        y: toWorldY,
                        duration: 200,
                        ease: 'Power2'
                    });
                }

                if (sprite && sprite.icon) {
                    this.tweens.add({
                        targets: sprite.icon,
                        y: toWorldY,
                        duration: 200,
                        ease: 'Power2'
                    });
                }
            });

            // Check for cascading matches after new tiles fall
            this.time.delayedCall(250, () => {
                // Skip cascades if the fight is already over
                if (this.awaitingRewardChoice) {
                    this.isSwapping = false;
                    return;
                }
                const matchData = this.findMatchData();
                if (matchData.matched.length > 0) {
                    this.time.delayedCall(300, () => {
                        this.clearMatches(matchData.matched, matchData.runs, matchData.lShapes, matchData.tCrossShapes);
                        this.applyGravity();
                    });
                } else {
                    this.isSwapping = false;
                        // Enemy attacks only after player's turn is fully complete.
                        // If a board-effect skill triggered this cascade, the player keeps their turn.
                        if (!this.allEnemiesDead()) {
                            if (this._boardEffectGrantedTurn) {
                                this._boardEffectGrantedTurn = false;
                                // No enemy attack — player gets to move next
                            } else {
                                // of Haste: chance to skip enemy turn and let player go again
                                const gearForTurn = this.getEquippedStatTotals();
                                if (gearForTurn.extraTurnChance > 0 && Math.random() * 100 < gearForTurn.extraTurnChance) {
                                    this.addCombatLog(`⚡ Haste! Extra turn granted.`, '#ffe566');
                                    this.showCombatMessage('EXTRA TURN!', '#ffe566',
                                        GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) / 2, FIGHT_PANEL_Y + 30);
                                    // Skip enemy attack — player gets another turn immediately
                                } else {
                                    this.time.delayedCall(700, () => {
                                        this.enemyAttack();
                                    });
                                }
                            }
                        }
                }
            });
        });
    }

    enemyAttack() {
        const alive = this.getAliveEnemies();
        if (alive.length === 0 || this.awaitingRewardChoice) return;

        // Flame tiles spread: each flame tile has 50% chance to convert an adjacent tile
        this.processFlameTileSpread();

        // If flame spread created any matches, resolve them before the enemy attacks
        {
            const matchData = this.findMatchData();
            if (matchData.matched.length > 0) {
                this.isSwapping = true;
                this.time.delayedCall(300, () => {
                    this.clearMatches(matchData.matched, matchData.runs, matchData.lShapes, matchData.tCrossShapes);
                    this.applyGravity();
                });
                return;
            }
        }

        // Cloak of Flames — burn all enemies before they attack
        if (this.cloakOfFlamesActive) {
            alive.forEach(enemy => {
                if (!enemy.alive) return;
                this.damageEnemy(enemy, this.cloakOfFlamesDamage);
                this.showCombatMessage(`🔥-${this.cloakOfFlamesDamage}`, '#ff6a00', enemy.pos.x, enemy.pos.y - 30);
                if (enemy.health <= 0) this.handleEnemyDeath(enemy);
            });
            this.addCombatLog(`Cloak of Flames burns for ${this.cloakOfFlamesDamage}!`, '#ff6a00');
            this.updateEnemyUI();
            if (this.allEnemiesDead()) {
                if (!this.awaitingRewardChoice) {
                    this.awaitingRewardChoice = true;
                    this.stopAllParticleEffects();
                    this.time.delayedCall(1500, () => this.showRewardScreen());
                }
                return;
            }
        }

        const gear = this.getEquippedStatTotals();
        const charBonuses = this.getCharacterStatBonuses();
        const tb = this.getTalentPercentBonuses();
        const baseArmor = gear.armor + charBonuses.armorBonus;
        const totalArmor = Math.floor(baseArmor * (1 + tb.armor / 100));
        const armorReduction = Math.floor(totalArmor / 4);
        const totalEvasionChance = Math.min(75, charBonuses.evasionChance + gear.evasion * 0.3 + tb.evasion);
        // Aegis Aurora (legendary affix): +25% block chance
        const aegisBonus = (gear.aegisAurora >= 1) ? 25 : 0;
        const totalBlockChance = Math.min(75, tb.blockChance + aegisBonus);

        alive.forEach((enemy, idx) => {
            this.time.delayedCall(idx * 600, () => {
                this._executeEnemySwing(enemy, armorReduction, totalEvasionChance, totalBlockChance, gear, tb);
            });
            // Pig Goblin double attack: schedule a second swing 350ms after the first
            const swingBodyCfg = MONSTER_BODIES[enemy.bodyIndex];
            if (swingBodyCfg && swingBodyCfg.innate && swingBodyCfg.innate.some(t => t.id === 'doubleAttack')) {
                this.time.delayedCall(idx * 600 + 350, () => {
                    this._executeEnemySwing(enemy, armorReduction, totalEvasionChance, totalBlockChance, gear, tb);
                });
            }
        });
    }

    _executeEnemySwing(enemy, armorReduction, totalEvasionChance, totalBlockChance, gear, tb) {
        if (this.player.health <= 0) return;
        if (!enemy.alive) return;

        const bodyCfg = MONSTER_BODIES[enemy.bodyIndex];

        // Troll Regeneration innate: Sloth Troll heals 10% max HP at the start of each swing
        if (bodyCfg && bodyCfg.innate && bodyCfg.innate.some(t => t.id === 'trollRegen')) {
            if (enemy.health < enemy.maxHealth) {
                const regen = Math.round(enemy.maxHealth * 0.10);
                enemy.health = Math.min(enemy.maxHealth, enemy.health + regen);
                this.showCombatMessage(`💪+${regen}`, '#66ffaa', enemy.pos.x, enemy.pos.y - 40);
                this.addCombatLog(`💪 ${enemy.name} regenerates ${regen} HP!`, '#66ffaa');
                this.updateEnemyUI();
            }
        }

        // Cursed Aura innate: deal dark energy damage bypassing armor/evasion each turn
        const cursedAura = bodyCfg && bodyCfg.innate && bodyCfg.innate.find(t => t.id === 'cursedAura');
        if (cursedAura) {
            const curseDmg = Math.max(1, Math.floor(enemy.attack * 0.4));
            this.player.health = Math.max(0, this.player.health - curseDmg);
            this.spawnCursedAuraTick(enemy);
            const playerCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
            this.showCombatMessage(`\u2620\ufe0f-${curseDmg}`, '#44ff66', playerCenterX, FIGHT_PANEL_Y + 30);
            this.addCombatLog(`\u2620\ufe0f ${enemy.name}'s Cursed Aura deals ${curseDmg} dark damage!`, '#44ff66');
            this.updatePlayerUI();
            if (this.player.health <= 0) {
                if (this.playerSprite) this.playerSprite.play('warrior_death');
                this.isSwapping = true;
                this.time.delayedCall(900, () => this.showDeathScreen(enemy.name + ' (Cursed Aura)'));
                return;
            }
        }

        if (totalBlockChance > 0 && Math.random() * 100 < totalBlockChance) {
            this.addCombatLog(`Blocked ${enemy.name}'s attack! (${totalBlockChance}%)`, '#ffd700');
            const blockX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
            this.showCombatMessage('BLOCK!', '#ffd700', blockX, FIGHT_PANEL_Y + 30);
            this.playEnemyAttackAnim(enemy);
            // Aegis Aurora: heal 2 HP on block
            if (gear.aegisAurora >= 1) {
                this.player.health = Math.min(this.getMaxHealth(), this.player.health + 2);
                this.addCombatLog(`🛡️ Aegis: healed 2 HP on block`, '#aaffff');
            }
            // Lord of Thorns: deal physical damage back when blocking
            if (tb.lordOfThorns) {
                const lotDmg = Math.max(1, Math.floor(enemy.attack * (1 + tb.physicalDamage / 100)));
                this.damageEnemy(enemy, lotDmg);
                const enemyCX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
                this.showCombatMessage(`THORNS -${lotDmg}`, '#ff4747', enemyCX, FIGHT_PANEL_Y + 30);
                this.addCombatLog(`🌵 Lord of Thorns: dealt ${lotDmg} physical on block`, '#ff9944');
                if (enemy.health <= 0) this.handleEnemyDeath(enemy);
            }
            this.updatePlayerUI();
            return;
        }

        // Evasion check per attack
        if (Math.random() * 100 < totalEvasionChance) {
            this.addCombatLog(`Evaded ${enemy.name}'s attack! (${totalEvasionChance.toFixed(0)}%)`, '#00ffcc');
            const playerCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
            this.showCombatMessage('EVADE!', '#00ffcc', playerCenterX, FIGHT_PANEL_Y + 30);
            this.playEnemyAttackAnim(enemy);
            // Parry keystone: deal ranged damage back on evade
            if (tb.parry) {
                const parryDmg = Math.max(1, Math.floor(enemy.attack * (1 + tb.rangedDamage / 100)));
                this.damageEnemy(enemy, parryDmg);
                const enemyCX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
                this.showCombatMessage(`PARRY -${parryDmg}`, '#00ffcc', enemyCX, FIGHT_PANEL_Y + 30);
                this.addCombatLog(`Parry! Dealt ${parryDmg} ranged damage back.`, '#00ffcc');
                if (enemy.health <= 0) this.handleEnemyDeath(enemy);
            }
            this.updatePlayerUI();
            return;
        }

        // Elemental Chaos innate: Bunny Warlock deals random elemental damage bypassing armor
        const hasElementalChaos = bodyCfg && bodyCfg.innate && bodyCfg.innate.some(t => t.id === 'elementalChaos');
        const ELEMENTS = [
            { name: 'Fire',      icon: '🔥', color: '#ff6a00' },
            { name: 'Ice',       icon: '❄️',  color: '#aaeeff' },
            { name: 'Lightning', icon: '⚡',  color: '#ffe566' },
            { name: 'Poison',    icon: '☠️',  color: '#88ff44' }
        ];
        const chosenElement = hasElementalChaos
            ? ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)] : null;

        const damage = enemy.attack;
        // Apply chill multiplier if enemy is frozen
        const chillMult = (enemy.chilledTurns && enemy.chilledTurns > 0)
            ? (enemy.chilledDamageMultiplier || 0.65) : 1;
        if (enemy.chilledTurns && enemy.chilledTurns > 0) {
            enemy.chilledTurns = Math.max(0, enemy.chilledTurns - 1);
        }
        // Elemental damage bypasses armor
        const effectiveArmor = hasElementalChaos ? 0 : armorReduction;
        let remainingDamage = Math.max(1, Math.round(damage * chillMult) - effectiveArmor);

        let shieldAbsorbed = 0;
        if (this.player.currentShield > 0 && remainingDamage > 0) {
            shieldAbsorbed = Math.min(remainingDamage, this.player.currentShield);
            this.player.currentShield -= shieldAbsorbed;
            remainingDamage -= shieldAbsorbed;
        }

        this.player.health -= remainingDamage;
        if (this.player.health < 0) this.player.health = 0;
        const shieldMsg = shieldAbsorbed > 0 ? `, ${shieldAbsorbed} shielded` : '';
        const totalTaken = remainingDamage + shieldAbsorbed;
        const playerCenterX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.25;
        if (hasElementalChaos && chosenElement) {
            this.addCombatLog(`${enemy.name}: ${chosenElement.icon} ${chosenElement.name} -${remainingDamage} HP (bypasses armor${shieldMsg})`, chosenElement.color);
            this.showCombatMessage(`${chosenElement.icon}-${totalTaken}`, chosenElement.color, playerCenterX, FIGHT_PANEL_Y + 30);
        } else {
            this.addCombatLog(`${enemy.name}: -${remainingDamage} HP (${armorReduction} blocked${shieldMsg})`, '#ff6666');
            this.showCombatMessage(`-${totalTaken}`, '#ff4444', playerCenterX, FIGHT_PANEL_Y + 30);
        }

        // Stolen thorns affix: reflect 15% of received damage back to attacker
        const stolenForThorns = this.getStolenAffixBonuses();
        if (gear.headhunter >= 1 && stolenForThorns.thorns && remainingDamage > 0) {
            const tReflect = Math.max(1, Math.round(remainingDamage * 0.15));
            this.damageEnemy(enemy, tReflect);
            const enemyThornsX = GRID_OFFSET_X + (GRID_WIDTH * TILE_SIZE) * 0.75;
            this.showCombatMessage(`🌵-${tReflect}`, '#88ff44', enemyThornsX, FIGHT_PANEL_Y + 30);
            this.addCombatLog(`🌵 Thorns reflect: ${tReflect} to ${enemy.name}`, '#88ff44');
            if (enemy.health <= 0) this.handleEnemyDeath(enemy);
        }

        // Enemy attack animation
        this.playEnemyAttackAnim(enemy);
        // Player hit reaction
        if (this.playerSprite) {
            this.time.delayedCall(100, () => this.playPlayerHitAnim());
        }

        // Innate: Pickpocket — steal 5% of hero's gold on each attack
        const pickpocketInnate = bodyCfg && bodyCfg.innate && bodyCfg.innate.find(t => t.id === 'goldTheft');
        if (pickpocketInnate && this.player.gold > 0) {
            const stolen = Math.max(1, Math.floor(this.player.gold * 0.05));
            this.player.gold = Math.max(0, this.player.gold - stolen);
            this.updateGoldDisplay();
            this.showCombatMessage(`🪙-${stolen}`, '#ffd966', enemy.pos.x, enemy.pos.y - 40);
            this.addCombatLog(`🪙 ${enemy.name} pickpockets ${stolen} gold!`, '#ffd966');
        }

        // Affixes that trigger on attack
        if (enemy.affixes && enemy.affixes.length > 0) {
            enemy.affixes.forEach(af => {
                if (af.id === 'regenerating') {
                    const heal = Math.round(enemy.maxHealth * 0.08);
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + heal);
                    this.showCombatMessage(`+${heal}`, '#44ff88', enemy.pos.x, enemy.pos.y - 40);
                }
                if (af.id === 'vampiric') {
                    const drain = Math.round(enemy.maxHealth * 0.12);
                    enemy.health = Math.min(enemy.maxHealth, enemy.health + drain);
                    this.showCombatMessage(`🩸+${drain}`, '#ff4488', enemy.pos.x, enemy.pos.y - 40);
                }
            });
            this.updateEnemyUI();
        }

        this.updatePlayerUI();
        if (this.player.health <= 0) {
            if (this.playerSprite) {
                this.playerSprite.play('warrior_death');
            }
            this.isSwapping = true;
            this.time.delayedCall(900, () => this.showDeathScreen(enemy.name));
        }
    }

    isValidPlacement(x, y, type) {
        // Check horizontal
        let count = 1;
        for (let checkX = x - 1; checkX >= 0 && this.grid[y] && this.grid[y][checkX] === type; checkX--) {
            count++;
        }
        for (let checkX = x + 1; checkX < GRID_WIDTH && this.grid[y] && this.grid[y][checkX] === type; checkX++) {
            count++;
        }
        if (count >= 3) return false;

        // Check vertical
        count = 1;
        for (let checkY = y - 1; checkY >= 0 && this.grid[checkY] && this.grid[checkY][x] === type; checkY--) {
            count++;
        }
        for (let checkY = y + 1; checkY < GRID_HEIGHT && this.grid[checkY] && this.grid[checkY][x] === type; checkY++) {
            count++;
        }
        if (count >= 3) return false;

        return true;
    }
}

class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.image('loadscreen', 'assets/Screens/Load Screen.jpg');
    }

    create() {
        this.scene.start('LoadScreen');
    }
}

class LoadScreen extends Phaser.Scene {
    constructor() {
        super('LoadScreen');
    }

    preload() {
        // Show the load screen image immediately (already cached by BootScene)
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;
        const img = this.add.image(width / 2, height / 2, 'loadscreen');
        const scaleX = width / img.width;
        const scaleY = height / img.height;
        img.setScale(Math.max(scaleX, scaleY));

        // Loading bar on top of the image
        const barW = 260;
        const barH = 18;
        const barX = (width - barW) / 2;
        const barY = height - 100;

        const barBg = this.add.rectangle(width / 2, barY, barW + 4, barH + 4, 0x000000, 0.7).setOrigin(0.5);
        const barFill = this.add.rectangle(barX, barY - barH / 2, 0, barH, 0x00ff88).setOrigin(0, 0);
        const loadText = this.add.text(width / 2, barY - 20, 'Loading...', {
            fontSize: '14px', color: '#ffffff', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        this.load.on('progress', (value) => {
            barFill.width = barW * value;
        });
        this.load.on('complete', () => {
            barBg.destroy();
            barFill.destroy();
            loadText.destroy();
        });

        // Load ALL game assets here
        TILE_TYPES.forEach(t => {
            this.load.image('tile_' + t.name, 'assets/' + t.name + '.png');
        });
        // Shopkeeper image
        this.load.image('Shoppkeeper', 'assets/Shoppkeeper.png');
        this.load.spritesheet('warrior', 'assets/sprites/warrior_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('redsquirrel', 'assets/sprites/redsquirrel_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('skinnypiggoblin', 'assets/sprites/skinnypiggoblin_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('orcpig', 'assets/sprites/orcpig_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('slothtroll', 'assets/sprites/slothtroll_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('bunnywarlock', 'assets/sprites/bunnywarlock_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('hamsterskeleton', 'assets/sprites/hamsterskeleton_anim.png', {
            frameWidth: 155,
            frameHeight: 130
        });
        this.load.spritesheet('guineapiglich', 'assets/sprites/guineapiglich.png', {
            frameWidth: 341,
            frameHeight: 279
        });
        this.load.spritesheet('raccoonbandit', 'assets/sprites/raccoonbandit.png', {
            frameWidth: 341,
            frameHeight: 279
        });

        // Skill icon assets
        this.load.image('skill_cleave', 'assets/Skills/CleaveSkill.png');
        this.load.image('skill_minutemissles', 'assets/Skills/MinuteMisslesSkill.png');
        this.load.image('skill_multishot', 'assets/Skills/MultishotSkill.png');
        this.load.image('skill_duckandroll', 'assets/Skills/Duckandrollskill.png');
        this.load.image('skill_energybeam', 'assets/Skills/EnergyBeamskill.png');
        this.load.image('skill_recklessattack', 'assets/Skills/RecklessAttackSkill.png');
        this.load.image('skill_cloakofflames', 'assets/Skills/CloakofFlamesskill.png');
        this.load.image('skill_shockandawe', 'assets/Skills/Shockandaweskill.png');
        this.load.image('skill_blizzard', 'assets/Skills/Blizzard.png');
        this.load.image('skill_heartofgold', 'assets/Skills/heartofgoldskill.png');
        this.load.image('skill_frostbite', 'assets/Skills/FrostbiteSkill.png');
        this.load.image('skill_burstlightning', 'assets/Skills/BurstLightningSkill.png');
        this.load.image('skill_kindling', 'assets/Skills/KindlingSkill.png');
        this.load.image('special_frost', 'assets/FrostTile.png');
        this.load.image('special_zap', 'assets/ZapTile.png');
        this.load.image('special_flame', 'assets/flametile.png');
        this.load.image('support_echo', 'assets/Skills/Echosupport.png');
        this.load.image('support_focus', 'assets/Skills/Focussupport.png');
        this.load.image('support_brutality', 'assets/Skills/brutalitysupport.png');
        this.load.image('support_addedlightning', 'assets/Skills/addedlightning.png');
        this.load.image('support_addedcold', 'assets/Skills/addedcold.png');
        this.load.image('support_addedfire', 'assets/Skills/addedfire.png');
        this.load.image('town', 'assets/Screens/Town.png');
        this.load.image('forest', 'assets/Screens/Forest.png');
        this.load.spritesheet('rescues', 'assets/sprites/Rescues.png', { frameWidth: 256, frameHeight: 186 });
    }

    create() {
        const width = this.sys.game.config.width;
        const height = this.sys.game.config.height;

        const prompt = this.add.text(width / 2, height - 60, 'Tap to Start', {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.tweens.add({
            targets: prompt,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.input.once('pointerup', () => {
            this.scene.start('TownScene');
        });
    }
}

class TownScene extends Phaser.Scene {
    constructor() {
        super('TownScene');
    }

    create() {
        const W = this.sys.game.config.width;
        const H = this.sys.game.config.height;

        // Background: town image scaled to fill
        const bg = this.add.image(W / 2, H / 2, 'town');
        const scaleX = W / bg.width;
        const scaleY = H / bg.height;
        bg.setScale(Math.max(scaleX, scaleY));

        // Title
        this.add.text(W / 2, 70, 'Town', {
            fontSize: '48px', color: '#ffe066', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 6
        }).setOrigin(0.5);

        // --- Rescue animal animations (6 animals, 8 frames each, 256x186 px per frame) ---
        // Per-animal origins derived from pixel bounding-box analysis so each animal
        // is visually centered and lateral frame-to-frame drift is minimised.
        const RESCUE_ORIGINS = [
            { ox: 127 / 256, oy: 100 / 186 }, // animal 0 — content center (127,100)
            { ox: 152 / 256, oy: 93  / 186 }, // animal 1 — shifted right in frame
            { ox: 150 / 256, oy: 93  / 186 }, // animal 2 — similar shift
            { ox: 0.5,       oy: 0.5        }, // animal 3 — full frame
            { ox: 0.5,       oy: 0.5        }, // animal 4 — full frame
            { ox: 0.5,       oy: 0.5        }, // animal 5 — full frame
        ];
        for (let i = 0; i < 6; i++) {
            const key = 'rescue_' + i + '_idle';
            if (!this.anims.exists(key)) {
                this.anims.create({
                    key,
                    frames: this.anims.generateFrameNumbers('rescues', { start: i * 8, end: i * 8 + 7 }),
                    frameRate: 5,
                    repeat: -1
                });
            }
        }

        // Two rows of 3 — evenly spaced, scale 0.42 gives display ≈107×78 px each
        const SCALE = 0.42;
        const animalLayout = [
            { x: 68,  y: 315 },
            { x: 195, y: 330 },
            { x: 322, y: 315 },
            { x: 68,  y: 490 },
            { x: 195, y: 505 },
            { x: 322, y: 490 }
        ];
        animalLayout.forEach((pos, i) => {
            const org = RESCUE_ORIGINS[i];
            const sprite = this.add.sprite(pos.x, pos.y, 'rescues')
                .setScale(SCALE)
                .setOrigin(org.ox, org.oy);
            // Stagger animation start so animals don't all bob in sync
            this.time.delayedCall(i * 160, () => {
                if (sprite && sprite.active) sprite.play('rescue_' + i + '_idle');
            });
        });

        // "Into the Forest" button
        const btnW = 220;
        const btnH = 54;
        const btnY = H - 100;

        const btnBg = this.add.rectangle(W / 2, btnY, btnW, btnH, 0x1a4d1a, 1)
            .setStrokeStyle(3, 0x66ff66)
            .setInteractive({ useHandCursor: true });

        this.add.text(W / 2, btnY, 'Into the Forest', {
            fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        btnBg.on('pointerover', () => btnBg.setFillStyle(0x2d6e2d));
        btnBg.on('pointerout',  () => btnBg.setFillStyle(0x1a4d1a));
        btnBg.on('pointerup',   () => this.scene.start('Match3Scene'));
    }
}

const config = {
    type: Phaser.AUTO,
    width: 390,
    height: 780,
    backgroundColor: '#2c3e50',
    render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        activePointers: 2
    },
    scene: [BootScene, LoadScreen, TownScene, Match3Scene]
};

const game = new Phaser.Game(config);
