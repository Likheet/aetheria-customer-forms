const supabaseJs = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://xstqqsaepujmqysstrbi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdHFxc2FlcHVqbXF5c3N0cmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDY3MDcsImV4cCI6MjA2NzM4MjcwN30.r6Dq4RLEgri4koFFEUuY0cHPiOkNYRb2J6zZnTbYGkw';
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
(async () => {
  const { data, error } = await supabase
    .from('machine_analysis')
    .select('scan_id, moisture_band')
    .limit(1);
  if (error) console.error(error);
  else console.log(data);
})();
