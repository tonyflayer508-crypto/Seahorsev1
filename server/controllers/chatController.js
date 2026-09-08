import { Project } from "../models/Project.js";
import { reviseProject } from "../services/ai.js";
import { applyOperations } from "../services/diff.js";

export function buildManifest(files) {
    return Object.entries(files || {}).map(([path, entry]) => ({
        path,
        hash: entry.hash,
        size: entry.content.length,
    }));
}

// POST /api/projects/:id/chat
// Send a revision prompt and return the updated project.
export async function chat(req, res) {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return res.status(400).json({ error: "prompt is required" });
    }

    const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user.userId,
    });

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    project.status = "generating";
    project.messages.push({
        role: "user",
        content: prompt.trim(),
        timestamp: new Date(),
    });
    await project.save();

    try {
        const manifest = buildManifest(project.files);
        const relevantFiles = {};
        for (const [path, entry] of Object.entries(project.files || {})) {
            relevantFiles[path] = entry.content;
        }

        const recentMessages = project.messages.slice(-4).map((message) => ({
            role: message.role,
            content: message.content,
        }));

        console.log(
            `[AI] Revising project ${project._id}: "${prompt.slice(0, 80)}..." ` +
            `(${manifest.length} files, manifest ~${JSON.stringify(manifest).length} chars)`,
        );

        const result = await reviseProject(prompt.trim(), manifest, relevantFiles, recentMessages);
        const operations = Array.isArray(result.operations) ? result.operations : [];
        console.log(`[AI] Got ${operations.length} operations: ${result.description}`);

        const { files: updatedFiles, applied, errors } = applyOperations(project.files, operations);
        if (errors.length > 0) {
            console.warn("[Diff] Errors applying operations:", errors);
        }

        project.files = updatedFiles;
        project.markModified("files");
        project.version = String(Number(project.version || 0) + 1);
        project.status = "completed";
        project.error = null;
        project.messages.push({
            role: "assistant",
            content: result.description + (errors.length > 0
                ? `\n\nSome operations failed: ${errors.join(", ")}`
                : ""),
        });
        await project.save();

        const files = {};
        for (const [path, entry] of Object.entries(project.files || {})) {
            files[path] = entry.content;
        }

        return res.json({
            _id: project._id,
            name: project.name,
            description: project.description,
            files,
            messages: project.messages,
            version: project.version,
            status: project.status,
            applied,
            errors,
            aiDescription: result.description,
        });
    } catch (err) {
        console.error(`[AI Revision Error] ${err.message}`, err);
        project.status = "failed";
        project.error = err.message;
        await project.save();
        return res.status(500).json({
            error: err.message || "Failed to process revision request",
        });
    }
}
