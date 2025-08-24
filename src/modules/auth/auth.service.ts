import type { iLogin, iUser } from "./auth.validation";
import prisma from '../../config/prisma.config';
import Hash from "../../lib/lib.hash";
import Jwt from "../../lib/lib.jwt";
import env from "../../config/env.config";

export default class AuthService {
    
    static salt =  Hash.generateSalt()


    static generateToken(userData: iUser) {
        return Jwt.sign({ ...userData }, env.JWT_SECRET, { expiresIn: 86400 });
    }

    static async login(data : iLogin) {

        const user = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user && Hash.verifyPassword(user.password, data.password, this.salt)) {
            return {
              data : user,
              message : "Login successful",
              token : this.generateToken(user),
              success : true
            };

        } else {

            return {
                data : null,
                message : "Password atau emailmu salah, silahkan coba lagi",
                success : false
            };

        }

    }

    static register(req: Request, res: Response) {
    }
}