import { NextRequest } from "next/server";
import { verifyAccessToken } from "./token/token";
import User from "@/app/models/user.model";
import { UnauthorizedError } from "../errors/UnauthorizedError";

export default async function requireAuth(request: NextRequest) {
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        throw new UnauthorizedError();
    }

    const payload = verifyAccessToken(accessToken);

    if (!payload || !payload.id) {
        throw new UnauthorizedError();
    }

    const userId = payload.id;

    const user = await User.findById(userId);

    if (!user) {
        throw new UnauthorizedError();
    }

    return { user, userId };
}