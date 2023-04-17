import {FastifyInstance} from "fastify";
import FastifyMultipart from "@fastify/multipart";
import {z} from "zod";
import {pipeline, Readable} from "stream";


const UploadFileZod = z.object({
    filename: z.string(),
    mimetype: z.string(),
    // FileStream
    file: z.instanceof(Buffer),
});

const registerMultipartParser = (fastify: FastifyInstance) => {
    async function onFile(part: any) {
        // const buff = await part.toBuffer()
        // const decoded = Buffer.from(buff.toString(), 'base64').toString()
        // console.log(part)
        // part.value = decoded // set `part.value` to specify the request body value

        const uploadFile: z.infer<typeof UploadFileZod> = {
            filename: part.filename,
            mimetype: part.mimetype,
            file: await part.toBuffer(),
        };

        part.value = uploadFile;
    }

    fastify.register(FastifyMultipart, {
        attachFieldsToBody: 'keyValues',
        onFile,
        limits: {
            fileSize: 100000000000000000
        }
    })

}


export {registerMultipartParser, UploadFileZod}
