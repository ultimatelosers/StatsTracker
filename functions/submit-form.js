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
    const { name, attack, medals, promptResponse } = JSON.parse(event.body);
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

    if (playerNames.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Name not found, type "pizza" to add the player.' })
      };
    }

    if (promptResponse && promptResponse.toLowerCase() === 'pizza') {
      // Insert the new player
      const { error: insertError } = await supabase
        .from('players')
        .insert([{ name, created_at: date }]);
      
      if (insertError) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Error inserting new player data', error: insertError.message })
        };
      }
    }

    // Insert player stats
    const { error: insertStatsError } = await supabase
      .from('player_stats')
      .insert([{ name, attack, medals, created_at: date }]);

    if (insertStatsError) {
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error inserting player stats', error: insertStatsError.message })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Success', createdAt: date })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
    };
  }
};
