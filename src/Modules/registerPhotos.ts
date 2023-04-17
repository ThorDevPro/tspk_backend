import {FastifyInstance, FastifyTypeProvider} from "fastify";
import {z, ZodTypeAny} from "zod";
import {JWToken} from "../Libs/JWToken";
import {PrefixFastify} from "../Libs/PrefixFastify";
import {prisma} from "../Libs/Prisma";
import PasswordTools from "../Libs/PasswordTools";
import { User } from '@prisma/client'
import {PhotoSchema, SharePhotoSchema, UserSchema} from "../../prisma/zod";
import {ZodTypeProvider} from "../Libs/FastifyTypeCore";
import {server} from "./server";
import {authUser} from "./Utility";
import {UploadFileZod} from "./registerMultipartParser";
import * as fs from "fs";
import path from "path";
import {Env} from "../Libs/Env";



export const registerPhotos = (fastify: FastifyInstance) => {
    PrefixFastify(fastify, 'photos', (fastify) => {

        const ser = fastify.withTypeProvider<ZodTypeProvider>();

        ser.route({
            method: "POST",
            url: "/upload",
            schema: {
                body: z.object({
                    photo: UploadFileZod,
                    photoName: z.string().optional(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: PhotoSchema,
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                // random 16 letters
                const fileName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const filePath = path.join(Env.PHOTOS_ROOT, fileName);

                fs.writeFileSync(filePath, req.body.photo.file);

                const instance = await prisma.photo.create({
                    data: {
                        photoname: req.body.photoName || "Untitled",
                        filename: fileName,
                        userId: user.id,
                    }
                });

                return instance;
            },
        });


        ser.route({
            method: "POST",
            url: "/rename",
            schema: {
                body: z.object({
                    photoId: z.number(),
                    photoName: z.string(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: PhotoSchema,
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                const instance = await prisma.photo.findFirst({
                    where: {
                        id: req.body.photoId,
                        userId: user.id
                    }
                });

                if(instance === null) {
                    res.status(401).send({error: "Photo not found"});
                    return;
                }

                prisma.photo.update({
                    where: {
                        id: req.body.photoId,
                    },
                    data: {
                        photoname: req.body.photoName,
                    }
                });

                return instance;
            },
        });

        ser.route({
            method: "DELETE",
            url: "/photo",
            schema: {
                body: z.object({
                    photoIds: z.number().array(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: z.string(),
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                prisma.photo.deleteMany({
                    where: {
                        AND: req.body.photoIds.map((id) => {
                            return {
                                id: id,
                                userId: user.id,
                            }
                        }),
                    },
                });

                return "OK";
            },
        });


        ser.route({
            method: "POST",
            url: "/share",
            schema: {
                body: z.object({
                    photoId: z.number(),
                    userIds: z.number().array(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: z.string(),
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                const instance = await prisma.photo.findFirst({
                    where: {
                        id: req.body.photoId,
                        userId: user.id
                    }
                });

                if(instance === null) {
                    res.status(401).send({error: "Photo not found"});
                    return;
                }

                await prisma.sharePhoto.createMany({
                    data: req.body.userIds.map((id) => {
                        return {
                            photoId: req.body.photoId,
                            userId: id,
                        }
                    }),
                    skipDuplicates: true,
                });

                return "OK";
            },
        });

        ser.route({
            method: "GET",
            url: "/shared",
            schema: {
                querystring: z.object({
                    page: z.coerce.number(),
                    limit: z.coerce.number(),
                    toUserId: z.coerce.number().optional(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: SharePhotoSchema.array(),
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }


                return await prisma.sharePhoto.findMany({
                    where: {
                        userId: req.query.toUserId,
                        photo: {
                            userId: user.id,
                        },
                    },
                    include: {
                        photo: true,
                    },
                    skip: req.query.page * req.query.limit,
                    take: req.query.limit,
                });
            },
        });

        ser.route({
            method: "GET",
            url: "/users",
            schema: {
                querystring: z.object({
                    name: z.string().optional(),
                    surname: z.string().optional(),
                    phone: z.string().optional(),
                }),
                headers: z.object({
                    token: z.string(),
                }),
                response: {
                    200: UserSchema.array(),
                    401: z.object({
                        error: z.string()
                    }),
                },
            },
            handler: async (req, res) => {
                const user = await authUser(req.headers.token);

                if (user === null) {
                    res.status(401).send({error: "User not found"});
                    return;
                }

                const where = [];

                if(req.query.name) {
                    where.push({
                        name: {
                            contains: req.query.name,
                        }
                    });
                }

                if(req.query.surname) {
                    where.push({
                        surname: {
                            contains: req.query.surname,
                        }
                    });
                }

                if(req.query.phone) {
                    where.push({
                        phone: {
                            contains: req.query.phone,
                        }
                    });
                }

                if(where.length === 0) {
                    return await prisma.user.findMany();
                }

                return await prisma.user.findMany({
                    where: {
                        OR: where
                    }
                });
            },
        });



    });
}
