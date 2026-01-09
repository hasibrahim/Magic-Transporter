import { Router } from 'express';
import { container } from 'tsyringe';
import { Routes } from '../interfaces/routes.interface';
import { MagicMoverController } from '../controllers/magicMover.controller';
import { validationMiddleware } from '../middlewares/validation.middleware';
import { CreateMagicMoverDto, LoadItemsDto } from '../dtos/magicMover.dto';

class MagicMoverRoute implements Routes {
    public path = '/magic-movers';
    public router = Router();
    private magicMoverController: MagicMoverController;

    constructor() {
        this.magicMoverController = container.resolve(MagicMoverController);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', validationMiddleware(CreateMagicMoverDto), this.magicMoverController.create);
        this.router.get('/', this.magicMoverController.findAll);
        this.router.get('/most-missions-completed', this.magicMoverController.getTopPerformers);
        this.router.post('/:id/load', validationMiddleware(LoadItemsDto), this.magicMoverController.load);
        this.router.post('/:id/unload', this.magicMoverController.unload);
        this.router.post('/:id/start-mission', this.magicMoverController.startMission);
        this.router.post('/:id/end-mission', this.magicMoverController.endMission);
    }
}

export default MagicMoverRoute;

