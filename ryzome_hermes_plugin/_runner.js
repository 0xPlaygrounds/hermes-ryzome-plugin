import { pathToFileURL } from "node:url";
import { parseConfig, RyzomeApiError, toolRegistry, } from "@ryzome-ai/ryzome-core";
import { z } from "zod";
// Validates the stdin payload before any tool runs so malformed input produces a
// clear RunnerFailure instead of failing deep inside a tool.execute call.
const runnerInputSchema = z.object({
    toolName: z.string(),
    params: z.unknown(),
    config: z.record(z.string(), z.unknown()).optional(),
});
function notConfiguredError() {
    return {
        ok: false,
        error: {
            name: "ConfigError",
            message: "Ryzome API key not configured. Run `hermes ryzome setup --key <api-key>` or set `RYZOME_API_KEY`.",
        },
    };
}
function serializeError(error, toolName) {
    if (error instanceof RyzomeApiError) {
        return {
            ok: false,
            toolName,
            error: {
                name: error.name,
                message: error.message,
                stage: error.stage,
                status: error.status,
                retryable: error.retryable,
                body: error.body,
                canvasId: error.canvasId,
                documentId: error.documentId,
            },
        };
    }
    if (error instanceof Error) {
        return {
            ok: false,
            toolName,
            error: {
                name: error.name,
                message: error.message,
            },
        };
    }
    return {
        ok: false,
        toolName,
        error: {
            name: "Error",
            message: String(error),
        },
    };
}
function resolveClientConfig(rawConfig) {
    const resolved = parseConfig(rawConfig ?? {});
    if (!resolved.apiKey) {
        return null;
    }
    return {
        apiKey: resolved.apiKey,
        apiUrl: resolved.apiUrl,
        appUrl: resolved.appUrl,
    };
}
export async function runTool(input) {
    const tool = toolRegistry.find((candidate) => candidate.name === input.toolName);
    if (!tool) {
        return {
            ok: false,
            toolName: input.toolName,
            error: {
                name: "UnknownToolError",
                message: `Unknown Ryzome tool: ${input.toolName}`,
            },
        };
    }
    const clientConfig = resolveClientConfig(input.config);
    if (!clientConfig) {
        return notConfiguredError();
    }
    try {
        const result = await tool.execute(input.params, clientConfig);
        return {
            ok: true,
            toolName: tool.name,
            content: result.content,
        };
    }
    catch (error) {
        return serializeError(error, tool.name);
    }
}
async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf8");
}
async function main() {
    try {
        const rawInput = (await readStdin()).trim();
        if (!rawInput) {
            console.log(JSON.stringify({
                ok: false,
                error: {
                    name: "InputError",
                    message: "Expected a JSON payload on stdin.",
                },
            }));
            return;
        }
        const parsed = runnerInputSchema.safeParse(JSON.parse(rawInput));
        if (!parsed.success) {
            console.log(JSON.stringify({
                ok: false,
                error: {
                    name: "InputError",
                    message: `Invalid runner payload: ${parsed.error.message}`,
                },
            }));
            return;
        }
        const result = await runTool(parsed.data);
        console.log(JSON.stringify(result));
    }
    catch (error) {
        console.log(JSON.stringify(serializeError(error)));
    }
}
const isEntrypoint = typeof process.argv[1] === "string" &&
    pathToFileURL(process.argv[1]).href === import.meta.url;
if (isEntrypoint) {
    void main();
}
