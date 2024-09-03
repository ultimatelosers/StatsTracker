const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Fetch data from Supabase
    const { data: playerData, error } = await supabase
      .from('player_stats')
      .select('*')
      .order('created_at', { ascending: false }); // Optional: Order by date

    if (error) {
      console.error('Error fetching data from Supabase:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Error fetching data from Supabase' }),
      };
    }

    // Return data in JSON format
    return {
      statusCode: 200,
      body: JSON.stringify(playerData),
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
