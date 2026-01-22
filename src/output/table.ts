/**
 * Render a simple CLI table
 * @param rows Array of objects; keys become headers
 */
export function renderTable(rows: Record<string, any>[]): void {
    if (!rows.length) {
        console.log("No data available.");
        return;
    }

    const headers = Object.keys(rows[0]);
    const colWidths: Record<string, number> = {};

    // Determine column widths
    for (const header of headers) {
        colWidths[header] = Math.max(
            header.length,
            ...rows.map(r => [...String(r[header] ?? "")].length)
        );
    }

    const pad = (text: string, width: number) => {
        const len = [...text].length;
        return text + " ".repeat(width - len);
    };

    // Header
    console.log(headers.map(h => pad(h, colWidths[h])).join("  "));
    console.log(headers.map(h => "-".repeat(colWidths[h])).join("  "));

    // Rows
    for (const row of rows) {
        const line = headers.map(h => pad(String(row[h] ?? ""), colWidths[h])).join("  ");
        console.log(line);
    }
}
