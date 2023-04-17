import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import {FastifyInstance} from "fastify";
import {jsonSchemaTransform} from "../Libs/FastifyTypeCore";


const registerSwagger = (fastify: FastifyInstance) => {
    fastify.register(fastifySwagger, {
        openapi: {
            info: {
                title: 'SampleApi',
                description: 'Sample backend service',
                version: '1.0.0',
            },
            servers: [],
        },
        transform: jsonSchemaTransform,
    });

    fastify.register(fastifySwaggerUI, {
        routePrefix: '/documentation',
    });
}


export {registerSwagger}