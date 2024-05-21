import {AuthenticationFeature} from "./features/authentication.mjs";
import {DatabaseFeature} from "./features/database.mjs";
import {CLI} from "./tooling/CLI.mjs";
import {MessagingFeature} from "./features/messaging.mjs";

export class Features {
    static async enable(__dirname) {
        const db = await DatabaseFeature.enable(__dirname);
        const app = AuthenticationFeature.enable(__dirname, db);
        MessagingFeature.enable(app);

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }
}