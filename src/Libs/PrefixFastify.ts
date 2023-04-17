import {FastifyInstance} from "fastify";
import {server} from "../Modules/server";

const PrefixFastify = (fastify: FastifyInstance, prefix: string, register: (fastify: FastifyInstance) => void) => {
    server.register((fastify, options, done) => {
        register(fastify);

        done()
    }, { prefix });

}

export {PrefixFastify}