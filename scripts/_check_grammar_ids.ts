import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
import { createClient } from '@supabase/supabase-js'
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } })

// grammar-particles IDs from expressions-config.ts
const GRAMMAR_IDS = [
  // existing (20)
  896, 1333, 1334, 1340, 1344, 1347, 1355, 1361, 1362, 1366, 1367, 1368, 1372, 1374, 1377, 1379, 1380, 1383, 1384, 1386,
  // conversational grammar (27)
  775, 885, 888, 891, 892, 893, 894, 895, 897, 898, 899, 903, 904, 918, 919, 920, 924, 931, 957, 958, 1007, 1008, 1009, 1010, 1011, 1014, 1036,
  // new grammar patterns 1301-1387 range (67)
  1301, 1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320,
  1321, 1322, 1323, 1324, 1325, 1326, 1327, 1328, 1329, 1330, 1331, 1332, 1335, 1336, 1337, 1338, 1339, 1341, 1342, 1343,
  1345, 1346, 1348, 1349, 1350, 1351, 1352, 1353, 1354, 1356, 1357, 1358, 1359, 1360, 1363, 1364, 1365, 1369, 1370, 1371,
  1373, 1376, 1378, 1381, 1382, 1385, 1387,
]

async function main() {
  const { data, error } = await sb.from('kp_expressions').select('id, korean').in('id', GRAMMAR_IDS)
  if (error) { console.error(error.message); process.exit(1) }
  const found = new Set((data ?? []).map((r: any) => r.id))
  const missing = GRAMMAR_IDS.filter(id => !found.has(id))
  console.log(`grammar-particles 대상: ${GRAMMAR_IDS.length}건`)
  console.log(`DB 존재: ${found.size}건`)
  console.log(`DB 누락: ${missing.length}건`)
  if (missing.length > 0 && missing.length <= 30) console.log('누락 IDs:', missing)
  if (missing.length > 30) console.log('누락 IDs (첫 20):', missing.slice(0, 20), '...')

  // total expressions in DB
  const { count } = await sb.from('kp_expressions').select('id', { count: 'exact', head: true })
  console.log(`\nkp_expressions 전체: ${count}건`)
}
main().catch(e => { console.error(e); process.exit(1) })
