// auth.ts
import { getServerSession } from "next-auth"
import AuthOptions  from "../[...nextauth]/options"
import { IncomingMessage, ServerResponse } from "http"

export function auth(req: IncomingMessage & { cookies: Partial<{ [key: string]: string }> }, res: ServerResponse<IncomingMessage>, options: typeof AuthOptions) {
    return getServerSession(req, res, AuthOptions);
  }