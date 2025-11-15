const supabaseJs = require('./node_modules/@supabase/supabase-js');
const supabaseUrl = 'https://xstqqsaepujmqysstrbi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdHFxc2FlcHVqbXF5c3N0cmJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MDY3MDcsImV4cCI6MjA2NzM4MjcwN30.r6Dq4RLEgri4koFFEUuY0cHPiOkNYRb2J6zZnTbYGkw';
const supabase = supabaseJs.createClient(supabaseUrl, supabaseKey);
(async () => {
  const sessionId = process.argv[2];
  const { data: session, error: sesErr } = await supabase
    .from('assessment_session')
    .select('id, machine_scan:machine_scan(id)')
    .eq('id', sessionId)
    .single();
  console.log('sessionErr', sesErr);
  console.log('session', session);
  const scanId = Array.isArray(session.machine_scan) ? session.machine_scan[0]?.id : session.machine_scan?.id;
  console.log('scanId', scanId);
  const { data: ma, error: maErr } = await supabase
    .from('machine_analysis')
    .select('*')
    .eq('scan_id', scanId)
    .maybeSingle();
  console.log('maErr', maErr);
  console.log('metrics', ma);
})();
