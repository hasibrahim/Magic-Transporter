import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';

class IndexRoute implements Routes {
    public path = '/';
    public router = Router();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.get(this.path, (req, res) => {
            res.json({
                success: true,
                message: 'API is running',
                timestamp: new Date().toISOString(),
            });
        });
    }
}

export default IndexRoute;

