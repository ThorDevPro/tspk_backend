import {Env} from "./Libs/Env";
import {prisma} from "./Libs/Prisma";
import {emailClient} from "./Libs/EmailClient";
import {server, startServer} from "./Modules/server";

const importThis = (toImport: any) => {
    return typeof toImport;
}

async function main() {
    importThis(Env);
    importThis(prisma);
    importThis(emailClient);

    await startServer(server, Env.PORT);
}

main()
    .then(() => {
        console.log(`initiated with env ${Env.ENV} and port ${Env.PORT}`);
        if(Env.ENV === "dev") {
            console.log("documentation available at http://localhost:3000/documentation");
        }
    })
    .catch(async (err) => {
        console.error(err);
        process.exit(1);
    });