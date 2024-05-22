import {AuthenticationFeature} from "./features/authenticationFeature";
import {DatabaseFeature} from "./features/databaseFeature";
import {CLI} from "./tooling/CLI";
import {MessagingFeature} from "./features/messagingFeature";

export class FeatureManager {
    static async enable(__dirname: string) {
        const db = await DatabaseFeature.enable(__dirname);
        const app = AuthenticationFeature.enable(__dirname, db);
        MessagingFeature.enable(app);

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }
}