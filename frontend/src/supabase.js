import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zjsbanqqylqzaswfcgah.supabase.co';
const supabaseKey = 'sb_publishable_2iFEMv1_Ty8HJNCI9F7Wxw_9osVHM9W';

export const supabase = createClient(supabaseUrl, supabaseKey);
