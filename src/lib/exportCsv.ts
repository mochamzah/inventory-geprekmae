/**
 * CSV Export Utility
 * Generates and downloads a CSV file with BOM for Excel UTF-8 compatibility.
 */

export function exportToCsv(
    filename: string,
    headers: string[],
    rows: (string | number)[][]
) {
    const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
            row
                .map((cell) => {
                    const cellStr = String(cell ?? '');
                    // Escape double quotes and wrap in quotes if contains comma, newline, or quote
                    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                })
                .join(',')
        ),
    ].join('\n');

    // BOM for Excel UTF-8 compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Format a date for CSV export in Indonesian locale
 */
export function formatDateForCsv(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }) + ' ' + d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format currency for CSV export
 */
export function formatCurrencyForCsv(value: number | null | undefined): string {
    if (!value) return '0';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

/**
 * Get a descriptive period label for filename
 */
export function getPeriodLabel(filter: string): string {
    const now = new Date();
    switch (filter) {
        case 'today':
            return now.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
        case 'week':
            return 'Minggu-Ini';
        case 'month':
            return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }).replace(/\s/g, '-');
        default:
            return 'Semua';
    }
}
