const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    const { data, error } = await supabase.from('datos_limpios').select('*').limit(1);
    if (error) {
        console.error('Error fetching data:', error);
    } else {
        console.log('Sample data from datos_limpios:', data);
    }
}

testConnection();
