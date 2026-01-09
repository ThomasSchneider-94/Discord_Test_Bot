import { LogLevel } from "../models/LogLevel.js";

export const logLevelConfigs = {
    [LogLevel.FATAL]: { label: "FATAL", color: "35" },
    [LogLevel.ERROR]: { label: "ERROR", color: "31" },
    [LogLevel.WARNING]: { label: "WARNING", color: "33" },
    [LogLevel.INFO]: { label: "INFO", color: "32" },
    [LogLevel.DEBUG]: { label: "DEBUG", color: "34" },
};

export const defaultLogLevel = LogLevel.WARNING;
