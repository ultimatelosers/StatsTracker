const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const { name, attack, medals } = JSON.parse(event.body);
    const date = new Date().toISOString();
    const playersFilePath = path.resolve(__dirname, '../public/data/players.txt');
    const statsFilePath = path.resolve(__dirname, '../public/data/playerstats.csv');
  
    const playersData = fs.readFileSync(playersFilePath, 'utf-8');
    const playerNames = playersData.split('\n').map(line => line.trim());
    
    // Check if the name exists
    if (!playerNames.includes(name)) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Name not found' })
      };
    }

    // Append to CSV
    fs.appendFileSync(statsFilePath, `${name},${attack},${medals},${date}\n`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
    };
  }
};
