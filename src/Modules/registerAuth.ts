import {FastifyInstance, FastifyTypeProvider} from "fastify";
import {z, ZodTypeAny} from "zod";
import {JWToken} from "../Libs/JWToken";
import {PrefixFastify} from "../Libs/PrefixFastify";
import {prisma} from "../Libs/Prisma";
import PasswordTools from "../Libs/PasswordTools";
import { User } from '@prisma/client'
import {UserSchema} from "../../prisma/zod";
import {ZodTypeProvider} from "../Libs/FastifyTypeCore";
import {server} from "./server";
import {authUser} from "./Utility";



const registerAuth = (fastify: FastifyInstance) => {
    PrefixFastify(fastify, 'auth', (fastify) => {
        const ser = fastify.withTypeProvider<ZodTypeProvider>();
        ser.route({
            method: "GET",
            url: "/",
            schema: {
                querystring: z.object({
                    phone: z.string(),
                    password: z.string().min(6),
                }),
                response: {
                    200: z.object({
                        token: z.string(),
                    }),
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await prisma.user.findUnique({
                    where: {
                        phone: req.query.phone
                    }
                });

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                if (!PasswordTools.comparePassword(req.query.password, user.saltPassword, user.hashedPassword)) {
                    res.status(401).send({error: "Invalid password"});
                    return;
                }

                const session = await prisma.userSession.create({
                    data: {
                        userId: user.id,
                        clientName: "Web",
                    }
                });

                return {
                    token: JWToken.createSessionToken(session.id),
                };
            },
        });

        ser.route({
            method: "POST",
            url: "/",
            schema: {
                body: z.object({
                    password: z.string().min(6),
                    name: z.string(),
                    phone: z.string(),
                    surname: z.string(),
                }),
                response: {
                    200: z.string(),
                    409: z.object({
                        message: z.string(),
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [
                            {
                                phone: req.body.phone
                            }
                        ]
                    }
                });

                if(user !== null) {
                    res.status(409).send({
                        message: "User already exists"
                    });
                    return;
                }

                const salt = PasswordTools.generateSalt();
                const hashedPassword = PasswordTools.hashPassword(req.body.password, salt);

                await prisma.user.create({
                    data: {
                        name: req.body.name,
                        phone: req.body.phone,
                        surname: req.body.surname,
                        hashedPassword,
                        saltPassword: salt,
                    }
                });

                return "OK";
            },
        });

        fastify.withTypeProvider<ZodTypeProvider>().route({
            method: "GET",
            url: "/user",
            schema: {
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: UserSchema,
                },
            },
            handler: async (req, _res) => {
                return await authUser(req.headers.token);
            },
        });
    });
}

export { registerAuth };
