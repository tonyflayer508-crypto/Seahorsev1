import bcrypt from "bcrypt";
import { SupabaseModel } from "./supabaseModel.js";

export class UserModel extends SupabaseModel {
    static table = "users";

    static async create(values) {
        const user = { ...values };
        user.password = await bcrypt.hash(user.password, 10);
        return super.create(user);
    }

    async comparePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

export const User = UserModel;
