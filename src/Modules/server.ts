import Fastify, {FastifyInstance} from 'fastify'
import {registerAuth} from "./registerAuth";
import {registerSwagger} from "./registerSwagger";
import {PrefixFastify} from "../Libs/PrefixFastify";
import {serializerCompiler, validatorCompiler, ZodTypeProvider} from "../Libs/FastifyTypeCore";
import {ServerError} from "../Libs/ServerError";
import {Env} from "../Libs/Env";
import {registerMultipartParser} from "./registerMultipartParser";
import {registerPhotos} from "./registerPhotos";


const server = Fastify()

registerMultipartParser(server);
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler( (error, request, reply) => {
    if(error instanceof ServerError) {
        return reply.status(error.code).send({
            message: error.message
        });
    } else {
        return reply.status(500).send({
            message: Env.ENV !== 'production' ? error.message : "server error"
        });
    }
});

registerSwagger(server);



PrefixFastify(server, 'api', (fastify) => {
    registerAuth(fastify);
    registerPhotos(fastify);
});

const startServer = async (server: FastifyInstance, port: number) => {
    await server.listen({
        port: port,
    });
}

export {
    server,
    startServer,
}
