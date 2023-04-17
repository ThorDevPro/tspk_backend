import * as crypto from "crypto";

class PasswordTools {
    static hashPassword(password: string, salt: string): string {
        return crypto.createHash('sha256')
            .update(password + salt)
            .digest('hex');
    }

    static generateSalt(): string {
        return crypto.randomBytes(16).toString('hex');
    }

    static comparePassword(password: string, salt: string, hash: string): boolean {
        return this.hashPassword(password, salt) === hash;
    }
}

export default PasswordTools;