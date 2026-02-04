import { readdirSync } from 'fs';

import { importManifestFile } from './utils/paths.js';
import { MODULES_DIR } from './utils/paths.js';

/// Define valid command line arguments Format:
// names: array of argument names (e.g., --help, -h)
// description: description of the argument
// parameters: string describing parameters (if any)
// runArg: boolean indicating if this argument is relevant for runtime
// execute: function to execute for this argument (if applicable)
export const CLI_args = [
    {
        names: ["--help", "-h"],
        description: "Display help information",
        runArg: false,
        execute: () => {
            let dump = 'node ./moddy.js [args]:\n';
            for (const arg of CLI_args) {
                let params = arg.parameters ? ` <${arg.parameters}>` : "";
                dump += `${arg.names.join(", ")}${params} : ${arg.description}\n`;
            }
            console.log(dump);
        }
    },
    {
        names: ["--list-modules", "-l"],
        description: "List all available modules",
        runArg: false,
        execute: async () => {
            const modules = await Promise.all(
                readdirSync(MODULES_DIR).map(async module => {
                    const { data } = await importManifestFile(module);

                    if (!data) {
                        return null;
                    }

                    return data.name && !data.hidden ? data.name : null;
                })
            );

            let dump = 'Available modules:\n';
            for (const module of modules) {
                if (!module) continue;
                dump += ` - ${module}\n`;
            }
            console.log(dump);
        }
    },
    {
        names: ["--modules", "-m"],
        parameters: "module_name",
        description: "Load specific modules. Default : all modules",
        runArg: true
    },
];
