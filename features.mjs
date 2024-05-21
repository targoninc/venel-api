import {AuthenticationFeature} from "./features/authentication.mjs";
import {DatabaseFeature} from "./features/database.mjs";
import {CLI} from "./tooling/CLI.mjs";

export class Features {
    static enable(__dirname) {
        const db = DatabaseFeature.enable(__dirname);
        const app = AuthenticationFeature.enable(__dirname, db);

        app.listen(3000, () => {
            CLI.success(`Listening on ${process.env.DEPLOYMENT_URL || 'http://localhost:3000'}`);
        });
    }
}