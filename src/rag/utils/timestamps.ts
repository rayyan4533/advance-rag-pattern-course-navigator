/**
 * Converts a subtitle timestamp (WebVTT or SRT) string into seconds.
 *
 * Supports:
 * - "HH:MM:SS.mmm" (e.g. "01:02:03.250" -> 3723.25)
 * - "MM:SS.mmm" (e.g. "01:30.500" -> 90.5)
 * - SRT comma format "HH:MM:SS,mmm" (e.g. "00:01:30,500" -> 90.5)
 *
 * @example
 * timestampToSeconds("00:00:10.000"); // 10
 * timestampToSeconds("00:01:30.500"); // 90.5
 * timestampToSeconds("01:02:03.250"); // 3723.25
 */
export function timestampToSeconds(timestamp: string): number {
    if (!timestamp || typeof timestamp !== "string") {
        return 0;
    }

    // Replace comma with dot to support SRT format (e.g., "00:01:30,500")
    const normalized = timestamp.trim().replace(",", ".");
    const parts = normalized.split(":");

    let totalSeconds = 0;

    if (parts.length === 3) {
        const hours = parseFloat(parts[0]) || 0;
        const minutes = parseFloat(parts[1]) || 0;
        const seconds = parseFloat(parts[2]) || 0;
        totalSeconds = hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
        const minutes = parseFloat(parts[0]) || 0;
        const seconds = parseFloat(parts[1]) || 0;
        totalSeconds = minutes * 60 + seconds;
    } else if (parts.length === 1) {
        totalSeconds = parseFloat(parts[0]) || 0;
    }

    // Round to 3 decimal places to avoid floating point precision artifacts
    return Math.round(totalSeconds * 1000) / 1000;
}

/**
 * Formats seconds into a subtitle timestamp string (e.g., "01:02:03" or "01:02:03.250").
 *
 * @param seconds - Total number of seconds
 * @param includeMilliseconds - Whether to include milliseconds (default: false)
 */
export function secondsToTimestamp(seconds: number, includeMilliseconds: boolean = false): string {
    if (isNaN(seconds) || seconds < 0) {
        return includeMilliseconds ? "00:00:00.000" : "00:00:00";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number, width: number = 2) => String(n).padStart(width, "0");
    const base = `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;

    if (!includeMilliseconds) {
        return base;
    }

    const ms = Math.round((seconds - Math.floor(seconds)) * 1000);
    return `${base}.${pad(ms, 3)}`;
}