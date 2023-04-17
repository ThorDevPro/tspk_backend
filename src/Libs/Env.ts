import dotenv from 'dotenv';
import path from 'path';
import * as fs from "fs";

const output = dotenv.config();

if(output.error instanceof Error) {
    throw output.error;
}

const env = output.parsed as any;

env.SRC_ROOT = path.join(__dirname, '../');
env.PHOTOS_ROOT = path.join(env.SRC_ROOT, '../photos');
if(fs.existsSync(env.PHOTOS_ROOT) === false)
    fs.mkdirSync(env.PHOTOS_ROOT);
if(typeof env.ENV !== 'string')
    env.ENV = 'dev';

if(typeof env.PORT !== 'number')
    env.PORT = 3000;

if(typeof env.SECRET !== 'string')
    throw new Error('SECRET is not defined');

type Env = {
    SRC_ROOT: string;
    PHOTOS_ROOT: string;
    ENV: "dev" | "production";
    PORT: number;
    SECRET: string;
}

export const Env = env as Env;
