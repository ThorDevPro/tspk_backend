import nodemailer from 'nodemailer';
import {Env} from "./Env";

class EmailClient {
    private _transporter: nodemailer.Transporter;
    private readonly _from: string;

    constructor(transporter: nodemailer.Transporter, from: string) {
        this._transporter = transporter;
        this._from = from;
    }

    public sendEmail(to: string, subject: string, body: string): Promise<any> {
        if(Env.ENV !== 'production') {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            this._transporter.sendMail({
                from: this._from,
                to: to,
                subject: subject,
                html: body
            }, (error, info) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(info);
                }
            });
        });
    }
}

const emailClient = null as unknown as EmailClient;

export {
    emailClient
};