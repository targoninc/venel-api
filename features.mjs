import express from "express";
import session from "express-session";
import passport from "passport";
import {AuthenticationFeature} from "./features/authentication.mjs";
import {DatabaseFeature} from "./features/database.mjs";

export class Features {
    static enable(__dirname) {
        const db = DatabaseFeature.enable(__dirname);
        AuthenticationFeature.enable(__dirname, db);
    }
}