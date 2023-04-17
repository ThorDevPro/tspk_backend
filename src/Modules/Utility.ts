import {User} from "@prisma/client";
import {prisma} from "../Libs/Prisma";
import {JWToken} from "../Libs/JWToken";
import {ServerError} from "../Libs/ServerError";

export const authUser = async (token: string): Promise<User | null> => {
    const sessionId = JWToken.getSessionId(token);

    const user = await prisma.user.findFirst({
        include: {
            userSessions: true,
        },
        where: {
            userSessions: {
                some: {
                    id: sessionId,
                }
            }
        }
    });

    // if (user === null)
    //     throw new ServerError(401, "user not found");

    return user;
}
