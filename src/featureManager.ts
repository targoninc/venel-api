import {AuthenticationFeature} from "./features/authenticationFeature";
import {DatabaseFeature} from "./features/databaseFeature";
import {CLI} from "./tooling/CLI";
import {MessagingFeature} from "./features/messagingFeature";
import {Application} from "express";
import path from "path";
import swaggerJsDoc from "swagger-jsdoc";
import {swaggerOptions} from "./swagger";
import swaggerUI from "swagger-ui-express";

export class FeatureManager {
    static async enable(__dirname: string) {
        const db = await DatabaseFeature.enable(__dirname);
        const app = AuthenticationFeature.enable(__dirname, db);
        MessagingFeature.enable(app);

        FeatureManager.addSwagger(__dirname, app);

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }

    static addSwagger(__dirname: string, app: Application) {
        const swaggerSpecs = swaggerJsDoc(swaggerOptions);
        app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpecs));
    }
}