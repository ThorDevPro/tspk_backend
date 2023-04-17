import jwt from 'jsonwebtoken';
import {Env} from "./Env";
import {ServerError} from "./ServerError";

class TokenTools {
    private readonly secret: string;

    constructor(secret: string) {
        this.secret = secret;
    }

    createSessionToken(sessionId: number): string {
        return this.createToken({sessionId});
    }

    createToken(payload: any): string {
        return jwt.sign(payload, this.secret, { expiresIn: '1d' });
    }

    decodeToken(token: string): any {
        return jwt.verify(token, this.secret);
    }

    getSessionId(token: string): number {
        try {
            return this.decodeToken(token).sessionId;
        } catch (e) {
            throw new ServerError(400, "invalid token");
        }
    }
}

const JWToken = new TokenTools(Env.SECRET);

export {
    JWToken
}