const fs = require('fs');
const path = require('path');

// Helper function to parse CSV
function parseCSV(csvText) {
    const rows = csvText.split('\n').filter(Boolean);
    const headers = rows[0].split(',');

    return rows.slice(1).map(row => {
        const values = row.split(',');
        const player = {};
        headers.forEach((header, index) => {
            player[header.trim()] = values[index].trim();
        });
        return player;
    });
}

exports.handler = async function(event, context) {
    try {
        // Path to the CSV file (adjust path based on your project structure)
        const filePath = path.resolve(__dirname, '../public/data/playerstats.csv');
        const csvData = fs.readFileSync(filePath, 'utf8');
        const playerData = parseCSV(csvData);

        return {
            statusCode: 200,
            body: JSON.stringify(playerData),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    } catch (error) {
        console.error('Error reading CSV file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error reading CSV file' }),
        };
    }
};
