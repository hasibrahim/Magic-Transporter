import request from 'supertest';
import { testServer } from '../helpers/testServer';
import { magicItemFixtures } from '../helpers/testFixtures';

describe('Magic Item E2E Tests', () => {
    const app = testServer.getServer();
    const baseUrl = '/magic-items';

    describe(`POST ${baseUrl}`, () => {
        describe('Success Cases', () => {
            it('should create a magic item with valid data', async () => {
                const itemData = magicItemFixtures.validItem1();

                const response = await request(app)
                    .post(baseUrl)
                    .send(itemData)
                    .expect(201);

                expect(response.body).toMatchObject({
                    success: true,
                    message: 'Magic Item created successfully',
                    data: {
                        name: itemData.name,
                        weight: itemData.weight,
                    },
                });

                expect(response.body.data).toHaveProperty('_id');
                expect(response.body.data).toHaveProperty('createdAt');
            });

            it('should create multiple magic items', async () => {
                const item1 = magicItemFixtures.validItem1();
                const item2 = magicItemFixtures.validItem2();
                const item3 = magicItemFixtures.validItem3();

                const response1 = await request(app).post(baseUrl).send(item1).expect(201);
                const response2 = await request(app).post(baseUrl).send(item2).expect(201);
                const response3 = await request(app).post(baseUrl).send(item3).expect(201);

                expect(response1.body.data._id).not.toBe(response2.body.data._id);
                expect(response2.body.data._id).not.toBe(response3.body.data._id);
            });

            it('should create a heavy magic item', async () => {
                const heavyItem = magicItemFixtures.heavyItem();

                const response = await request(app)
                    .post(baseUrl)
                    .send(heavyItem)
                    .expect(201);

                expect(response.body.data.weight).toBe(heavyItem.weight);
            });

            it('should create a light magic item', async () => {
                const lightItem = magicItemFixtures.lightItem();

                const response = await request(app)
                    .post(baseUrl)
                    .send(lightItem)
                    .expect(201);

                expect(response.body.data.weight).toBe(lightItem.weight);
            });
        });

        describe('Validation Error Cases', () => {
            it('should return 400 when name is empty', async () => {
                const invalidItem = {
                    name: '',
                    weight: 5,
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('name');
            });

            it('should return 400 when name is missing', async () => {
                const invalidItem = {
                    weight: 5,
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when weight is missing', async () => {
                const invalidItem = {
                    name: 'Test Item',
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when weight is negative', async () => {
                const invalidItem = {
                    name: 'Test Item',
                    weight: -5,
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('weight');
            });

            it('should return 400 when weight is zero', async () => {
                const invalidItem = {
                    name: 'Test Item',
                    weight: 0,
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when weight is not a number', async () => {
                const invalidItem = {
                    name: 'Test Item',
                    weight: 'invalid',
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when request body is empty', async () => {
                const response = await request(app)
                    .post(baseUrl)
                    .send({})
                    .expect(400);

                expect(response.body.success).toBe(false);
            });

            it('should return 400 when name contains only whitespace', async () => {
                const invalidItem = {
                    name: '   ',
                    weight: 5,
                };

                const response = await request(app)
                    .post(baseUrl)
                    .send(invalidItem)
                    .expect(400);

                expect(response.body.success).toBe(false);
            });
        });

        describe('Content-Type Error Cases', () => {
            it('should return 400 when content-type is not JSON', async () => {
                const response = await request(app)
                    .post(baseUrl)
                    .send('invalid data')
                    .expect(400);

                expect(response.body.success).toBe(false);
            });
        });
    });
});

