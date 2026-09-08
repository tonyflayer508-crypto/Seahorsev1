// Post-generation code validator and auto-fixer
// Repairs common AI code generation errors before saving to DB using regex checks

// Void HTML elements that must be self-closed in JSX
const VOID_ELEMENTS = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

// Validate and auto-fix common AI-generated code issues
export function validateAndFixCode(code, filePath, context) {
    const warnings = [];
    const isCSS = filePath.endsWith(".css");
    const isJS = filePath.endsWith(".js") || filePath.endsWith(".jsx");

    // 1. Strip markdown code fences that some models wrap around code
    const fencePattern = /^```(?:jsx?|javascript|css|html|tsx?|react)?\s*\n([\s\S]*?)\n```\s*$/;
    const fenceMatch = code.match(fencePattern);
    if (fenceMatch) {
        code = fenceMatch[1];
        warnings.push(`${filePath}: Stripped markdown code fences`);
    }

    // Also handle cases where fences appear at the very start/end with other content
    code = code.replace(/^```(?:jsx?|javascript|css|html|tsx?|react)?\s*\n/, "");
    code = code.replace(/\n```\s*$/, "");

    if (isCSS) {
        // CSS-specific fixes — minimal, just trim and return
        return { code: code.trim() + "\n", warnings };
    }

    if (!isJS) {
        return { code, warnings };
    }

    // --- JS/JSX-specific fixes ---

    // 2. Fix `class=` → `className=` in JSX (but not inside strings or comments)
    // Match class= that appears inside JSX tags (after < and before >)
    const classFixRegex = /(<[a-zA-Z][^>]*?)\bclass=/g;
    if (classFixRegex.test(code)) {
        code = code.replace(/(<[a-zA-Z][^>]*?)\bclass=/g, "$1className=");
        warnings.push(`${filePath}: Fixed 'class=' → 'className='`);
    }

    // 3. Fix `for=` → `htmlFor=` in JSX labels
    const forFixRegex = /(<label[^>]*?)\bfor=/gi;
    if (forFixRegex.test(code)) {
        code = code.replace(/(<label[^>]*?)\bfor=/gi, "$1htmlFor=");
        warnings.push(`${filePath}: Fixed 'for=' → 'htmlFor='`);
    }

    // 4. Self-close void elements that aren't self-closed
    for (const tag of VOID_ELEMENTS) {
        // Match <tag ... > that is NOT already self-closed (no / before >)
        const voidRegex = new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi");
        if (voidRegex.test(code)) {
            code = code.replace(new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi"), (match, attrs) => `<${tag}${attrs || ""} />`);
            warnings.push(`${filePath}: Self-closed <${tag}> elements`);
        }
    }

    // 5. Remove stray quotes before the closing backtick in JSX className templates.
    // Some model responses produce: className={`... ${condition ? 'a' : 'b'}"`}
    // The quote makes the following JSX attribute look like an unterminated expression.
    const malformedClassNameTemplate = /(className=\{`[^`\n]*?)"(`\})/g;
    if (malformedClassNameTemplate.test(code)) {
        code = code.replace(malformedClassNameTemplate, "$1$2");
        warnings.push(`${filePath}: Removed stray quote from JSX className template`);
    }

    // Close className template literals where the model omitted the final backtick.
    // Example: className={`...'}" role="menuitem"`
    const unclosedClassNameTemplate = /(className=\{`[^`\r\n]*)"(?=\s+[A-Za-z][\w-]*\s*=)/g;
    if (unclosedClassNameTemplate.test(code)) {
        code = code.replace(unclosedClassNameTemplate, "$1`");
        warnings.push(`${filePath}: Closed unclosed JSX className template`);
    }

    const classNameQuoteBeforeExpressionEnd = /(className=\{`[^`\r\n]*)"(?=\s*\})/g;
    if (classNameQuoteBeforeExpressionEnd.test(code)) {
        code = code.replace(classNameQuoteBeforeExpressionEnd, "$1`");
        warnings.push(`${filePath}: Replaced quote before JSX className expression end`);
    }

    // Repair an extra closing parenthesis in generated gradient expressions.
    const malformedGradientExpression = ".replace(' to-', ', '))}";
    if (code.includes(malformedGradientExpression)) {
        code = code.replaceAll(malformedGradientExpression, ".replace(' to-', ', ')}");
        warnings.push(`${filePath}: Removed extra parenthesis from gradient expression`);
    }

    const malformedDoubleQuotedGradientExpression = '.replace(" to-", ", "))}';
    if (code.includes(malformedDoubleQuotedGradientExpression)) {
        code = code.replaceAll(malformedDoubleQuotedGradientExpression, '.replace(" to-", ", ")}');
        warnings.push(`${filePath}: Removed extra parenthesis from gradient expression`);
    }

    // Repair malformed JSX event handlers such as onChange={(event) = /> callback}.
    const malformedEventHandler = /(\bon[A-Za-z]+\s*=\{\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*))\s*=\s*\/>/g;
    if (malformedEventHandler.test(code)) {
        code = code.replace(malformedEventHandler, "$1 =>");
        warnings.push(`${filePath}: Repaired malformed JSX event handler`);
    }

    // Repair an extra brace in arrow expressions such as `items.map((item) => (}`.
    const malformedArrowExpression = /(=>\s*\()\}/g;
    if (malformedArrowExpression.test(code)) {
        code = code.replace(malformedArrowExpression, "$1");
        warnings.push(`${filePath}: Removed extra brace from arrow expression`);
    }

    // Remove a redundant default import when the component is also defined locally.
    const localComponentDeclarations = [...code.matchAll(/(?:^|\n)\s*(?:export\s+default\s+)?function\s+([A-Z]\w*)\s*\(/g)]
        .map((match) => match[1]);
    for (const componentName of localComponentDeclarations) {
        const duplicateImport = new RegExp(`^import\\s+${componentName}\\s+from\\s+['"][^'"]+['"];?\\s*$`, "gm");
        if (duplicateImport.test(code)) {
            code = code.replace(duplicateImport, "");
            warnings.push(`${filePath}: Removed redundant import for locally defined '${componentName}'`);
        }
    }

    // Restore a missing closing marker on standalone JSX tags, such as `span>`.
    const bareClosingTag = /(^|\n)([ \t]*)span>/g;
    if (bareClosingTag.test(code) && code.includes("<span")) {
        code = code.replace(bareClosingTag, "$1$2</span>");
        warnings.push(`${filePath}: Restored missing '</' on </span>`);
    }

    // Restore a missing opening angle bracket on standalone JSX tags.
    const bareOpeningTags = ["div", "p", "section", "header", "footer", "main", "nav", "button"];
    for (const tag of bareOpeningTags) {
        const bareOpeningTag = new RegExp(`(^|\\n)([ \\t]*)${tag}(\\s[^>\\n]*)?>`, "g");
        if (bareOpeningTag.test(code)) {
            code = code.replace(bareOpeningTag, `$1$2<${tag}$3>`);
            warnings.push(`${filePath}: Restored missing '<' on <${tag}>`);
        }
    }

    // Close an inline span accidentally left open before its heading closes.
    const openSpanBeforeHeadingEnd = /(<span\b[^>]*>\s*\n[ \t]*[^<\n][^\n]*)(\n[ \t]*<\/h1>)/g;
    code = code.replace(openSpanBeforeHeadingEnd, (match, spanContent, headingEnd) => {
        if (spanContent.includes("</span>")) return match;
        warnings.push(`${filePath}: Added missing </span> before </h1>`);
        return `${spanContent}\n</span>${headingEnd}`;
    });

    // 6. Ensure exactly one default export exists
    const defaultExportCount = (code.match(/export\s+default\s+/g) || []).length;
    if (defaultExportCount === 0 && !filePath.endsWith(".css")) {
        // Try to find the main function/component and add default export
        const funcMatch = code.match(/^function\s+([A-Z]\w*)\s*\(/m);
        const constMatch = code.match(/^const\s+([A-Z]\w*)\s*=\s*(?:\(|function)/m);
        const componentName = funcMatch?.[1] || constMatch?.[1];

        if (componentName) {
            // Check if there's already a named export
            const namedExportRegex = new RegExp(`export\\s+(function|const)\\s+${componentName}`);
            if (namedExportRegex.test(code)) {
                // Convert `export function X` → `export default function X`
                code = code.replace(new RegExp(`export\\s+(function|const)\\s+${componentName}`), `export default $1 ${componentName}`);
            } else {
                // Add default export at the end
                code = code.trimEnd() + `\n\nexport default ${componentName};\n`;
            }
            warnings.push(`${filePath}: Added missing default export for '${componentName}'`);
        }
    }

    // 7. Remove stray HTML comments inside JSX return blocks
    // Pattern: <!-- comment --> which is invalid in JSX
    const htmlCommentRegex = /<!--[\s\S]*?-->/g;
    if (htmlCommentRegex.test(code)) {
        code = code.replace(htmlCommentRegex, "");
        warnings.push(`${filePath}: Removed HTML comments (invalid in JSX)`);
    }

    // 8. Fix common TypeScript syntax that slips in
    // Remove `: React.FC` or `: FC` type annotations from function declarations
    code = code.replace(/:\s*React\.FC(?:<[^>]*>)?\s*=/g, (match) => {
        warnings.push(`${filePath}: Removed TypeScript React.FC annotation`);
        return " =";
    });

    // Remove simple type annotations from function parameters like (props: any)
    // But be careful not to break destructured defaults like { name = 'default' }
    code = code.replace(/(\([^)]*?)\s*:\s*(?:string|number|boolean|any|object|void)\s*([,)])/g, (match, before, after) => {
        warnings.push(`${filePath}: Removed TypeScript type annotation`);
        return `${before}${after}`;
    });

    // 9. Ensure React import exists if JSX is used
    const hasJSX = /<[A-Za-z]/.test(code);
    const hasReactImport = /import\s+React/.test(code);
    if (hasJSX && !hasReactImport) {
        code = `import React from 'react';\n${code}`;
        warnings.push(`${filePath}: Added missing React import`);
    }

    // 10. Fix import paths that point to incorrect folders/paths compared to what was planned
    if (context?.allPlannedFiles) {
        const fixResult = fixImportPaths(code, filePath, context.allPlannedFiles);
        code = fixResult.code;
        warnings.push(...fixResult.warnings);
    }

    return { code: code.trim() + "\n", warnings };
}

// Validate and fix code specifically for revision operations
export function validateRevisionContent(content, filePath, op) {
    if (op === "delete") return { content, warnings: [] };

    if (op === "create") {
        const result = validateAndFixCode(content, filePath);
        return { content: result.code, warnings: result.warnings };
    }

    // For update ops (search/replace content), only apply safe fixes
    // that won't break the partial context
    const warnings = [];

    // Fix class → className
    const classFixRegex = /(<[a-zA-Z][^>]*?)\bclass=/g;
    if (classFixRegex.test(content)) {
        content = content.replace(/(<[a-zA-Z][^>]*?)\bclass=/g, "$1className=");
        warnings.push(`${filePath}: Fixed 'class=' → 'className=' in replacement`);
    }

    // Fix for → htmlFor
    const forFixRegex = /(<label[^>]*?)\bfor=/gi;
    if (forFixRegex.test(content)) {
        content = content.replace(/(<label[^>]*?)\bfor=/gi, "$1htmlFor=");
        warnings.push(`${filePath}: Fixed 'for=' → 'htmlFor=' in replacement`);
    }

    // Self-close void elements
    for (const tag of VOID_ELEMENTS) {
        const voidRegex = new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi");
        if (voidRegex.test(content)) {
            content = content.replace(new RegExp(`<${tag}(\\s[^>]*?)?(?<!/)>`, "gi"), (match, attrs) => `<${tag}${attrs || ""} />`);
            warnings.push(`${filePath}: Self-closed <${tag}> in replacement`);
        }
    }

    return { content, warnings };
}

// --- Import Path Resolution Helpers ---

function getDir(p) {
    const parts = p.split("/");
    parts.pop();
    return parts.join("/") || "/";
}

function resolvePath(baseDir, relativePath) {
    const baseParts = baseDir.split("/").filter(Boolean);
    const relParts = relativePath.split("/").filter(Boolean);

    for (const part of relParts) {
        if (part === ".") {
            continue;
        } else if (part === "..") {
            baseParts.pop();
        } else {
            baseParts.push(part);
        }
    }
    return "/" + baseParts.join("/");
}

function getRelativePath(fromDir, toPath) {
    const fromParts = fromDir.split("/").filter(Boolean);
    const toParts = toPath.split("/").filter(Boolean);

    let commonLength = 0;
    while (commonLength < fromParts.length && commonLength < toParts.length && fromParts[commonLength] === toParts[commonLength]) {
        commonLength++;
    }

    const upCount = fromParts.length - commonLength;
    const remainingTo = toParts.slice(commonLength);

    const relParts = [];
    for (let i = 0; i < upCount; i++) {
        relParts.push("..");
    }
    if (relParts.length === 0) {
        relParts.push(".");
    }
    relParts.push(...remainingTo);
    return relParts.join("/");
}

function cleanExtension(p) {
    return p.replace(/\.(js|jsx|css|ts|tsx)$/, "");
}

function fixImportPaths(code, filePath, allPlannedFiles) {
    const warnings = [];
    if (!allPlannedFiles || allPlannedFiles.length === 0) {
        return { code, warnings };
    }

    const currentDir = getDir(filePath);
    const plannedPaths = allPlannedFiles.map((f) => (f.path.startsWith("/") ? f.path : "/" + f.path));

    // Matches lines like: import Header from './components/Header';
    // or import '../styles.css'; or require('./components/Header')
    const importRegex = /(from\s+['"]|import\s+['"])([^'"]+)(['"])/g;

    const newCode = code.replace(importRegex, (match, prefix, importTarget, suffix) => {
        // Skip absolute imports (non-relative packages like 'react')
        if (!importTarget.startsWith(".")) {
            return match;
        }

        // 1. Resolve relative import target path
        const resolvedTarget = resolvePath(currentDir, importTarget);
        const resolvedClean = cleanExtension(resolvedTarget);

        // Check if it already matches a planned file path exactly (with or without extension)
        const hasImportExtension = /\.(js|jsx|css|ts|tsx)$/.test(resolvedTarget);
        const exactExists = plannedPaths.some((p) =>
            p === resolvedTarget || (!hasImportExtension && cleanExtension(p) === resolvedClean)
        );
        if (exactExists) {
            return match;
        }

        // Do not redirect a missing CSS import to a same-named JavaScript component.
        if (/\.css$/.test(importTarget) && prefix === "import '") {
            warnings.push(`${filePath}: Removed missing stylesheet import '${importTarget}'`);
            return "";
        }

        // 2. Mismatch! Try to find a planned file with the same filename
            const importFilename = resolvedClean.split("/").pop();
        if (!importFilename) {
            return match;
        }

        const foundPlannedPath = plannedPaths.find((p) => {
            const plannedClean = cleanExtension(p);
            const plannedFilename = plannedClean.split("/").pop();
            return plannedFilename === importFilename;
        });

        if (foundPlannedPath) {
            // Calculate relative path from current directory to actual planned file path
            const newRelative = getRelativePath(currentDir, foundPlannedPath);
            // Prefix relative prefix if missing
            const finalRelative = newRelative.startsWith(".") ? newRelative : "./" + newRelative;

            // Retain file extension if the original import target had it
            const hasExt = /\.(js|jsx|css|ts|tsx)$/.test(importTarget);
            const ext = hasExt ? "." + importTarget.split(".").pop() : "";

            const rewrittenTarget = cleanExtension(finalRelative) + ext;
            if (rewrittenTarget !== importTarget) {
                warnings.push(
                    `${filePath}: Corrected import '${importTarget}' to '${rewrittenTarget}' (file planned at '${foundPlannedPath}')`,
                );
                return `${prefix}${rewrittenTarget}${suffix}`;
            }
        }

        return match;
    });

    return { code: newCode, warnings };
}
