import express from "express";
import session from "express-session";
import passport from "passport";
import {AuthenticationFeature} from "./features/authentication.mjs";

export class Features {
    static enable(__dirname) {
        const db = DatabaseFeature.enable();
        AuthenticationFeature.enable(__dirname, db);
    }
}