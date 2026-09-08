import { SupabaseModel } from "./supabaseModel.js";

export class ProjectModel extends SupabaseModel {
    static table = "projects";
}

export const Project = ProjectModel;
