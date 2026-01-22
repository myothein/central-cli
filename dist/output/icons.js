import chalk from "chalk";
/**
 * Convert online status boolean to colored icon
 * @param online true = online, false = offline, null = unknown
 */
export function onlineIcon(online) {
    if (online === true)
        return chalk.green("🟢");
    if (online === false)
        return chalk.red("🔴");
    return chalk.gray("⚪");
}
/**
 * Convert online status boolean to label
 */
export function onlineLabel(online) {
    if (online === true)
        return "YES";
    if (online === false)
        return "NO";
    return "N/A";
}
