// Toggle between form and stats view
const formLink = document.getElementById('formLink');
const statsLink = document.getElementById('statsLink');
const mainContent = document.getElementById('mainContent');
const statsSection = document.getElementById('statsSection');
let currentSortColumn = ''; // Track the current sort column
let sortDirection = 'asc';  // Track the current sort direction

formLink.addEventListener('click', function () {
    console.log("HomePage");
    mainContent.style.display = 'block';
    statsSection.style.display = 'none';
});

statsLink.addEventListener('click', function () {
    console.log("fetchPlayerStats()");
    mainContent.style.display = 'none';
    statsSection.style.display = 'block';
    fetchPlayerStats();
});

// Fetch and render player stats
function fetchPlayerStats() {
    fetch('/.netlify/functions/get-player-stats')
        .then(response => response.json())
        .then(playerData => {
            console.log(playerData);
            const recentPlayerStats = getMostRecentPlayerStats(playerData);
            renderStatsTable(recentPlayerStats);
            initializeSorting(); // Initialize sorting after rendering the table
        })
        .catch(error => {
            console.error('Error fetching player stats:', error);
        });
}

// Render the stats table with sortable columns
function renderStatsTable(playerData) {
    const tableBody = document.querySelector('#statsTable tbody');
    tableBody.innerHTML = ''; // Clear any existing data

    // Sort the playerData based on current column and direction
    playerData.sort((a, b) => {
        const aValue = parseValue(a[currentSortColumn]);
        const bValue = parseValue(b[currentSortColumn]);

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    playerData.forEach(player => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = player.name || 'N/A';
        row.appendChild(nameCell);

        const attackCell = document.createElement('td');
        attackCell.textContent = player.attack || 'N/A';
        row.appendChild(attackCell);

        const medalsCell = document.createElement('td');
        medalsCell.textContent = player.medals || 'N/A';
        row.appendChild(medalsCell);

        const dateCell = document.createElement('td');
        const parsedDate = new Date(player.created_at); // Using created_at instead of Date
        dateCell.textContent = !isNaN(parsedDate) ? parsedDate.toLocaleString() : 'Invalid Date';
        row.appendChild(dateCell);

        const ratioCell = document.createElement('td');
        const attackValue = parseInt(player.attack, 10);
        const medalsValue = parseInt(player.medals, 10);

        if (!isNaN(attackValue) && !isNaN(medalsValue) && medalsValue !== 0) {
          const ratio = Math.floor(attackValue / medalsValue);
          ratioCell.textContent = ratio;
        } else {
          ratioCell.textContent = 'N/A';
        }
        row.appendChild(ratioCell);

        tableBody.appendChild(row);
    });

    updateHeaderStyles(); // Update header styles after rendering the table
}

// Parse value for sorting, handle numeric and date values
function parseValue(value) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) return numValue;
    const dateValue = new Date(value);
    if (!isNaN(dateValue)) return dateValue.getTime();
    return value;
}

// Initialize column sorting functionality
function initializeSorting() {
    const headers = document.querySelectorAll('#statsTable th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            if (currentSortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'; // Toggle direction
            } else {
                currentSortColumn = column;
                sortDirection = 'asc'; // Default to ascending
            }
            fetchPlayerStats(); // Fetch and render sorted data
        });
    });
}

// Update header styles to reflect sorting direction
function updateHeaderStyles() {
    const headers = document.querySelectorAll('#statsTable th');
    headers.forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        if (header.dataset.column === currentSortColumn) {
            header.classList.add(sortDirection === 'asc' ? 'sorted-asc' : 'sorted-desc');
        }
    });
}

// Get the most recent stats for each player by Name (case-sensitive)
function getMostRecentPlayerStats(playerData) {
    const playerMap = {};

    playerData.forEach(player => {
        const playerName = player.name;
        const playerDate = new Date(player.created_at);

        // If the player is not in the map or if this record is more recent, update it
        if (!playerMap[playerName] || new Date(playerMap[playerName].Date) < playerDate) {
            playerMap[playerName] = player;
        }
    });

    return Object.values(playerMap);
}

// Fetch player stats initially
fetchPlayerStats();

document.getElementById('playerForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const name = document.getElementById('name').value;
    const attack = document.getElementById('attack').value;
    const medals = document.getElementById('medals').value;
  
    try {
      // Initial submit request
      const response = await fetch('/.netlify/functions/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, attack, medals }),
      });
  
      const result = await response.json();
  
      if (result.message === 'Name not found, type the password to add the player.') {
        // Prompt the user for input
        const userResponse = prompt(result.message);
  
        if (userResponse.toLowerCase() === 'pizza') {
          // Resubmit with the user's response
          const response = await fetch('/.netlify/functions/submit-form', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, attack, medals, promptResponse: 'pizza' }),
          });
  
          const finalResult = await response.json();
          alert(finalResult.message);
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form');
    }
  });
  