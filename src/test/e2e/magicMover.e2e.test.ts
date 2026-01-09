import request from 'supertest';
import { testServer } from '../helpers/testServer';
import { magicMoverFixtures, magicItemFixtures } from '../helpers/testFixtures';
import { MagicMoverState } from '../../enums';

describe('Magic Mover E2E Tests', () => {
    const app = testServer.getServer();
    const moverBaseUrl = '/magic-movers';
    const itemBaseUrl = '/magic-items';

    /**
     * Helper function to create a magic item
     */
    const createMagicItem = async (itemData = magicItemFixtures.validItem1()) => {
        const response = await request(app).post(itemBaseUrl).send(itemData).expect(201);
        return response.body.data;
    };

    /**
     * Helper function to create a magic mover
     */
    const createMagicMover = async (moverData = magicMoverFixtures.validMover1()) => {
        const response = await request(app).post(moverBaseUrl).send(moverData).expect(201);
        return response.body.data;
    };

    describe(`POST ${moverBaseUrl}`, () => {
        describe('Success Cases', () => {
            it('should create a magic mover with valid data', async () => {
                const moverData = magicMoverFixtures.validMover1();

                const response = await request(app)
                    .post(moverBaseUrl)
                    .send(moverData)
                    .expect(201);

                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Magic Mover created successfully',
                });

                expect(response.body.data).toMatchObject({
                    name: moverData.name,
                    weightLimit: moverData.weightLimit,
                    currentWeight: 0,
                    state: MagicMoverState.RESTING,
                    items: [],
                    completedMissions: 0,
                });

                expect(response.body.data).toHaveProperty('_id');
            });

            it('should create multiple magic movers', async () => {
                const mover1 = await createMagicMover(magicMoverFixtures.validMover1());
                const mover2 = await createMagicMover(magicMoverFixtures.validMover2());

                expect(mover1._id).not.toBe(mover2._id);
                expect(mover1.name).not.toBe(mover2.name);
            });
        });

        describe('Validation Error Cases', () => {
            it('should return 400 when weightLimit is negative', async () => {
                const invalidMover = {
                    ...magicMoverFixtures.validMover1(),
                    weightLimit: -10,
                };

                const response = await request(app)
                    .post(moverBaseUrl)
                    .send(invalidMover)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when weightLimit is missing', async () => {
                const invalidMover = {
                    name: 'Test Mover',
                };

                const response = await request(app)
                    .post(moverBaseUrl)
                    .send(invalidMover)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });
        });
    });

    describe(`GET ${moverBaseUrl}`, () => {
        it('should return empty array when no movers exist', async () => {
            const response = await request(app)
                .get(moverBaseUrl)
                .expect(200);

            expect(response.body.data).toEqual([]);
        });

        it('should return all magic movers', async () => {
            await createMagicMover(magicMoverFixtures.validMover1());
            await createMagicMover(magicMoverFixtures.validMover2());

            const response = await request(app)
                .get(moverBaseUrl)
                .expect(200);

            expect(response.body.data).toHaveLength(2);
        });
    });

    describe(`POST ${moverBaseUrl}/:id/load`, () => {
        describe('Success Cases', () => {
            it('should load items onto a magic mover', async () => {
                const mover = await createMagicMover(magicMoverFixtures.validMover1());
                const item1 = await createMagicItem(magicItemFixtures.validItem1());
                const item2 = await createMagicItem(magicItemFixtures.validItem2());

                const response = await request(app)
                    .post(`${moverBaseUrl}/${mover._id}/load`)
                    .send({ itemIds: [item1._id, item2._id] })
                    .expect(200);

                expect(response.body.data.state).toBe(MagicMoverState.LOADING);
                expect(response.body.data.items).toHaveLength(2);
                expect(response.body.data.currentWeight).toBe(item1.weight + item2.weight);
            });

            it('should load a single item', async () => {
                const mover = await createMagicMover(magicMoverFixtures.validMover1());
                const item = await createMagicItem(magicItemFixtures.validItem1());

                const response = await request(app)
                    .post(`${moverBaseUrl}/${mover._id}/load`)
                    .send({ itemIds: [item._id] })
                    .expect(200);

                expect(response.body.data.items).toHaveLength(1);
                expect(response.body.data.currentWeight).toBe(item.weight);
            });
        });

        describe('Error Cases', () => {
            it('should return 404 when mover not found', async () => {
                const item = await createMagicItem();
                const fakeId = '507f1f77bcf86cd799439011';

                const response = await request(app)
                    .post(`${moverBaseUrl}/${fakeId}/load`)
                    .send({ itemIds: [item._id] })
                    .expect(404);

                expect(response.body.success).toBe(false);
            });

            it('should return 404 when items not found', async () => {
                const mover = await createMagicMover();
                const fakeItemId = '507f1f77bcf86cd799439011';

                const response = await request(app)
                    .post(`${moverBaseUrl}/${mover._id}/load`)
                    .send({ itemIds: [fakeItemId] })
                    .expect(404);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when weight limit exceeded', async () => {
                const mover = await createMagicMover(magicMoverFixtures.lowCapacityMover());
                const heavyItem = await createMagicItem(magicItemFixtures.heavyItem());

                const response = await request(app)
                    .post(`${moverBaseUrl}/${mover._id}/load`)
                    .send({ itemIds: [heavyItem._id] })
                    .expect(400);

                expect(response.body.message).toContain('Weight limit exceeded');
            });

            it('should return 400 when itemIds is empty array', async () => {
                const mover = await createMagicMover();

                const response = await request(app)
                    .post(`${moverBaseUrl}/${mover._id}/load`)
                    .send({ itemIds: [] })
                    .expect(400);

                expect(response.body.success).toBe(false);
            });
        });
    });

    describe(`POST ${moverBaseUrl}/:id/start-mission`, () => {
        it('should start mission when mover is in LOADING state', async () => {
            const mover = await createMagicMover();
            const item = await createMagicItem();

            // Load items first
            await request(app)
                .post(`${moverBaseUrl}/${mover._id}/load`)
                .send({ itemIds: [item._id] })
                .expect(200);

            // Start mission
            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/start-mission`)
                .expect(200);

            expect(response.body.data.state).toBe(MagicMoverState.ON_MISSION);
        });

        it('should return 400 when mover is not in LOADING state', async () => {
            const mover = await createMagicMover();

            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/start-mission`)
                .expect(400);

            expect(response.body.message).toContain('Invalid state transition');
        });

        it('should return 404 when mover not found', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const response = await request(app)
                .post(`${moverBaseUrl}/${fakeId}/start-mission`)
                .expect(404);

            expect(response.body.success).toBe(false);
        });
    });

    describe(`POST ${moverBaseUrl}/:id/end-mission`, () => {
        it('should end mission and increment completed missions', async () => {
            const mover = await createMagicMover();
            const item = await createMagicItem();

            // Load items
            await request(app)
                .post(`${moverBaseUrl}/${mover._id}/load`)
                .send({ itemIds: [item._id] });

            // Start mission
            await request(app)
                .post(`${moverBaseUrl}/${mover._id}/start-mission`);

            // End mission
            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/end-mission`)
                .expect(200);

            expect(response.body.data.state).toBe(MagicMoverState.RESTING);
            expect(response.body.data.items).toHaveLength(0);
            expect(response.body.data.currentWeight).toBe(0);
            expect(response.body.data.completedMissions).toBe(1);
        });

        it('should return 400 when mover is not ON_MISSION', async () => {
            const mover = await createMagicMover();

            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/end-mission`)
                .expect(400);

            expect(response.body.message).toContain('must be on mission');
        });
    });

    describe(`POST ${moverBaseUrl}/:id/unload`, () => {
        it('should unload items from LOADING state', async () => {
            const mover = await createMagicMover();
            const item = await createMagicItem();

            // Load items
            await request(app)
                .post(`${moverBaseUrl}/${mover._id}/load`)
                .send({ itemIds: [item._id] });

            // Unload
            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/unload`)
                .expect(200);

            expect(response.body.data.state).toBe(MagicMoverState.RESTING);
            expect(response.body.data.items).toHaveLength(0);
            expect(response.body.data.currentWeight).toBe(0);
        });

        it('should return 400 when mover is in RESTING state', async () => {
            const mover = await createMagicMover();

            const response = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/unload`)
                .expect(400);

            expect(response.body.message).toContain('Invalid state transition');
        });
    });

    describe(`GET ${moverBaseUrl}/most-missions-completed`, () => {
        it('should return movers ordered by completed missions', async () => {
            // Create movers and complete missions
            const mover1 = await createMagicMover(magicMoverFixtures.validMover1());
            const mover2 = await createMagicMover(magicMoverFixtures.validMover2());
            const item = await createMagicItem();

            // Complete 2 missions for mover2
            for (let i = 0; i < 2; i++) {
                await request(app).post(`${moverBaseUrl}/${mover2._id}/load`).send({ itemIds: [item._id] });
                await request(app).post(`${moverBaseUrl}/${mover2._id}/start-mission`);
                await request(app).post(`${moverBaseUrl}/${mover2._id}/end-mission`);
            }

            // Complete 1 mission for mover1
            await request(app).post(`${moverBaseUrl}/${mover1._id}/load`).send({ itemIds: [item._id] });
            await request(app).post(`${moverBaseUrl}/${mover1._id}/start-mission`);
            await request(app).post(`${moverBaseUrl}/${mover1._id}/end-mission`);

            const response = await request(app)
                .get(`${moverBaseUrl}/most-missions-completed`)
                .expect(200);

            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].completedMissions).toBeGreaterThanOrEqual(response.body.data[1].completedMissions);
        });

        it('should return empty array when no movers exist', async () => {
            const response = await request(app)
                .get(`${moverBaseUrl}/most-missions-completed`)
                .expect(200);

            expect(response.body.data).toEqual([]);
        });
    });

    describe('Complete Mission Flow', () => {
        it('should complete full mission lifecycle', async () => {
            const mover = await createMagicMover();
            const item1 = await createMagicItem(magicItemFixtures.validItem1());
            const item2 = await createMagicItem(magicItemFixtures.validItem2());

            // 1. Load items
            const loadResponse = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/load`)
                .send({ itemIds: [item1._id, item2._id] })
                .expect(200);

            expect(loadResponse.body.data.state).toBe(MagicMoverState.LOADING);
            expect(loadResponse.body.data.items).toHaveLength(2);

            // 2. Start mission
            const startResponse = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/start-mission`)
                .expect(200);

            expect(startResponse.body.data.state).toBe(MagicMoverState.ON_MISSION);

            // 3. End mission
            const endResponse = await request(app)
                .post(`${moverBaseUrl}/${mover._id}/end-mission`)
                .expect(200);

            expect(endResponse.body.data.state).toBe(MagicMoverState.RESTING);
            expect(endResponse.body.data.items).toHaveLength(0);
            expect(endResponse.body.data.currentWeight).toBe(0);
            expect(endResponse.body.data.completedMissions).toBe(1);
        });
    });
});

