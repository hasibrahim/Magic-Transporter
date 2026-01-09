import { CreateMagicItemDto } from '../../dtos/magicItem.dto';
import { CreateMagicMoverDto } from '../../dtos/magicMover.dto';
import { MagicMoverState } from '../../enums';

/**
 * Test Fixtures
 * Provides sample test data for E2E tests
 */

/**
 * Magic Item Fixtures
 */
export const magicItemFixtures = {
    validItem1: (): CreateMagicItemDto => ({
        name: 'Phoenix Feather',
        weight: 0.5,
    }),

    validItem2: (): CreateMagicItemDto => ({
        name: 'Dragon Scale',
        weight: 2.5,
    }),

    validItem3: (): CreateMagicItemDto => ({
        name: 'Unicorn Horn',
        weight: 1.0,
    }),

    heavyItem: (): CreateMagicItemDto => ({
        name: 'Stone Golem Fragment',
        weight: 15.0,
    }),

    lightItem: (): CreateMagicItemDto => ({
        name: 'Fairy Dust',
        weight: 0.1,
    }),

    invalidItem: () => ({
        name: '', // Invalid: empty name
        weight: -1, // Invalid: negative weight
    }),
};

/**
 * Magic Mover Fixtures
 */
export const magicMoverFixtures = {
    validMover1: (): CreateMagicMoverDto => ({
        name: 'Gandalf the Grey',
        weightLimit: 100,
    }),

    validMover2: (): CreateMagicMoverDto => ({
        name: 'Merlin',
        weightLimit: 150,
    }),

    validMover3: (): CreateMagicMoverDto => ({
        name: 'Dumbledore',
        weightLimit: 200,
    }),

    lowCapacityMover: (): CreateMagicMoverDto => ({
        name: 'Apprentice Wizard',
        weightLimit: 10,
    }),

    highCapacityMover: (): CreateMagicMoverDto => ({
        name: 'Arch Mage',
        weightLimit: 500,
    }),

    invalidMover: () => ({
        name: '', // Invalid: empty name
        weightLimit: -10, // Invalid: negative weight limit
    }),
};

/**
 * Helper to create multiple items at once
 */
export const createMultipleItems = (count: number): CreateMagicItemDto[] => {
    const items: CreateMagicItemDto[] = [];
    for (let i = 1; i <= count; i++) {
        items.push({
            name: `Test Item ${i}`,
            weight: Math.random() * 5 + 0.5, // Random weight between 0.5 and 5.5
        });
    }
    return items;
};

/**
 * Helper to create multiple movers at once
 */
export const createMultipleMovers = (count: number): CreateMagicMoverDto[] => {
    const movers: CreateMagicMoverDto[] = [];
    for (let i = 1; i <= count; i++) {
        movers.push({
            name: `Test Mover ${i}`,
            weightLimit: 50 + i * 10,
        });
    }
    return movers;
};

