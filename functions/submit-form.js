const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { name, attack, medals, response } = JSON.parse(event.body);
    const date = new Date().toISOString();

    // Check if the name exists
    const { data: playerNames, error: fetchError } = await supabase
      .from('players')
      .select('name')
      .eq('name', name);

    if (fetchError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error fetching data', error: fetchError.message })
      };
    }

    // If the name doesn't exist in the database
    if (playerNames.length === 0) {
      if (response !== 'pizza') {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: 'Name not found. Respond with the code word to add the name.' })
        };
      }

      // Add the name to the players table
      const { error: insertPlayerError } = await supabase
        .from('players')
        .insert([{ name }]);

      if (insertPlayerError) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error inserting name into players', error: insertPlayerError.message })
        };
      }
    }

    // Insert data into player_stats
    const { error: insertStatsError } = await supabase
      .from('player_stats')
      .insert([{ name, attack, medals, created_at: date }]);

    if (insertStatsError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error inserting data', error: insertStatsError.message })
      };
    }

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
