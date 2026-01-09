import { Router } from 'express';
import { container } from 'tsyringe';
import { Routes } from '../interfaces/routes.interface';
import { MagicItemController } from '../controllers/magicItem.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateMagicItemDto } from '../dtos/magicItem.dto';

class MagicItemRoute implements Routes {
    public path = '/magic-items';
    public router = Router();
    private magicItemController: MagicItemController;

    constructor() {
        this.magicItemController = container.resolve(MagicItemController);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', validationMiddleware(CreateMagicItemDto), this.magicItemController.create);
    }
}

export default MagicItemRoute;

