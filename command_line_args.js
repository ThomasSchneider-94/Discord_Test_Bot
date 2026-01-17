import { readdirSync } from 'fs';
import { join } from 'path';

import { importFromModuleFile, __dirname } from './utils.js';
import { baseLogger } from './utils/Logger.js';

/// Define valid command line options Format:
// names: array of option names (e.g., --help, -h)
// description: description of the option
// parameters: string describing parameters (if any)
// runOption: boolean indicating if this option is relevant for runtime
// execute: function to execute for this option (if applicable)
const valid_options = [
    {
        names: ["--help", "-h"],
        description: "Display help information",
        runOption: false,
        execute: () => {
            console.log("Usage: node ./index.js [options]");
            for (const option of valid_options) {
                let names = option.names.join(", ");
                let params = option.parameters ? ` ${option.parameters}` : "";
                console.log(`${names} <${params}> : ${option.description}`);
            }
        }
    },
    {
        names: ["--list-modules", "-l"],
        description: "List all available modules",
        runOption: false,
        execute: async () => {
            const modules = readdirSync(join(__dirname, 'modules'));
            console.log("Available modules:");

            for (const module of modules) {
                const { moduleName } = await importFromModuleFile(module, '__init__.js');

                if (moduleName) {
                    console.log(` - ${module}`);
                }
            }
        }
    },
    {
        names: ["--modules", "-m"],
        parameters: "module_name",
        description: "Load specific modules. Default : all modules",
        runOption: true
    },    
];

export async function validateCommandLineArgs(argv) {
    const options = argv.filter(arg => arg.startsWith('-'));

    const runOption = [];

    for (const option of options) {
        if (!valid_options.some(opt => opt.names.includes(option.split('=')[0]))) {
            baseLogger.error(`Invalid option: ${option}. Use --help or -h to see the list of valid options.`);
            process.exit(1);
        }
    }

    for (const option of options) {
        const optionObj = valid_options.find(opt => opt.names.includes(option.split('=')[0]));
        if (optionObj) {
            if (optionObj.runOption) {
                runOption.push(option);
            }
            else {            
                await optionObj.execute();
                process.exit(0);
            }
        }
    }

    return runOption;
}
