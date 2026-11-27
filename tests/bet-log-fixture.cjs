const {randomUUID} = require('node:crypto');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

const script = readFileSync(join(__dirname, '../apps-script/BetLog.gs'), 'utf8');
const headers = ('id date sportsbook bet_type stake odds boosted odds_note odds_entered_at odds_verified_at ' +
  'closing_odds closing_entered_at result_override cashout_amount notes legs graded_at ladder ladder_run ' +
  'ladder_rung ladder_stake ladder_bankroll').split(' ');
const sheetId = 'fixture-sheet', eventId = '9000554', recId = 'court-fixture-ind-cle';
const date = '2026-11-27';
const leg = {league:'nba',eventId,market:'spread',selection:'11',selectionName:'Indiana Pacers',
  line:3.5,odds:-110,game:'Indiana Pacers at Cleveland Cavaliers',date};
const rec = {id:recId,date,sportsbook:'FanDuel',bet_type:'spread',odds:-110,boosted:'FALSE',odds_note:'',
  verdict:'Consider',notes:'Indiana gets 3.5 points on the road.\nThe ticket covers through a three-point loss.',legs:JSON.stringify([leg])};

// The only writable sheet method in this test double is appendRow. Model Sheets' text-entry prefix.
function mockBetLog(columns=headers) {
  const rows=[], secret=randomUUID();
  let locked=false;
  const sheet={
    getDataRange(){ assert.ok(locked); return {getValues:()=>[columns,...rows.map(r=>columns.map(c=>r[c]??''))]}; },
    appendRow(values){
      assert.ok(locked);
      rows.push(Object.fromEntries(columns.map((c,i)=>{
        const v=values[i];
        if (typeof v==='string' && v) assert.equal(v[0],"'");
        return [c,typeof v==='string'?v.slice(1):v];
      })));
    }
  };
  const env={
    Date:class extends Date {constructor(){super('2026-11-27T03:30:00Z');}},
    PropertiesService:{getScriptProperties:()=>({getProperty:k=>({BET_LOG_SECRET:secret,BET_LOG_SHEET_ID:sheetId})[k]})},
    SpreadsheetApp:{openById:id=>{assert.equal(id,sheetId);return {getSheetByName:name=>{assert.equal(name,'Placed');return sheet;}};},
      flush(){assert.ok(locked);}},
    LockService:{getScriptLock:()=>({waitLock(){assert.equal(locked,false);locked=true;},hasLock:()=>locked,releaseLock(){locked=false;}})},
    ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},
    Utilities:{formatDate:(d,zone)=>new Intl.DateTimeFormat('sv-SE',{timeZone:zone}).format(d)}
  };
  vm.runInNewContext(script,env);
  return {rows,secret,get:env.doGet,post:request=>env.doPost({postData:{contents:JSON.stringify(request)}})};
}
module.exports={mockBetLog,headers,sheetId,eventId,recId,date,leg,rec};
