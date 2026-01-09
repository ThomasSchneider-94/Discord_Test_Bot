import { Moddy } from '#moddy/Moddy.js';
import { join } from 'path';
import { importFile } from '#utils'
import { MODULES_DIR, __manifestFile } from '#paths';
import { readdirSync, existsSync, readFileSync } from 'fs';

/// Define valid command line arguments Format:
// names: array of argument names (e.g., --help, -h)
// description: description of the argument
// parameters: string describing parameters (if any)
// runArg: boolean indicating if this argument is relevant for runtime
// execute: function to execute for this argument (if applicable)
export const CLI_ARGS = [
    {
        names: ["--help", "-h"],
        description: "Display help information",
        runArg: false,
        execute: () => {
            let dump = 'node ./moddy.js [args]:\n';
            for (const arg of CLI_ARGS) {
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
            let dump = 'Available modules:\n';
            for (const moduleName of readdirSync(MODULES_DIR)) {
                const manifestFile = join(MODULES_DIR, moduleName, __manifestFile);
                if (!existsSync(manifestFile)) { continue; }
                
                const { manifest } = await importFile(manifestFile);
                if (!manifest || !manifest.name || manifest.name != moduleName) { continue; }
                dump += ` - ${manifest.name}\n`;
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
    {
        names: ["--log-level", "-ll"],
        parameters: "log_level",
        description: "Select the log level between FATAL(0), ERROR (1), INFO (2), WARNING (3), DEBUG (4). Default : WARNING (3)",
        runArg: true
    },
];
