const {test} = require('node:test');
const assert = require('node:assert/strict');
const {mockBetLog,headers,sheetId,recId,leg,rec} = require('./bet-log-fixture.cjs');

const row = {...rec,id:'took-'+recId,notes:'Took Court rec '+recId+'. Fixture',stake:4.5,sportsbook:'=literal book'};
test('GET and rejected POSTs leave Placed untouched',()=>{
  const log=mockBetLog();
  assert.equal(log.get().status,'error');
  for(const secret of [undefined,'',log.secret+'x']) assert.equal(log.post({secret,sheetId,row}).reason,'rejected');
  for(const change of [{stake:0},{stake:'4'},{odds:-5},{legs:'[]'},{id:recId}]){
    assert.equal(log.post({secret:log.secret,sheetId,row:{...row,...change}}).status,'error');
  }
  assert.equal(log.post({secret:log.secret,sheetId:'other',row}).status,'error');
  assert.equal(log.rows.length,0);
});
test('one typed append by header name, blank optional and unknown columns, idempotent retry',()=>{
  const log=mockBetLog(['custom',...headers].reverse());
  const request={sheetId,secret:log.secret,row:{...row,graded_at:'ignore',result_override:'ignore'}};
  assert.equal(log.post(request).status,'ok');
  assert.equal(log.post(request).status,'duplicate');
  assert.equal(log.rows.length,1);
  const [placed]=log.rows;
  for(const key of ['id','stake','odds','sportsbook','notes','boosted','legs']) assert.equal(placed[key],row[key]);
  assert.equal(placed.date,new Date(placed.odds_entered_at).toLocaleDateString('sv-SE',{timeZone:'America/Indiana/Indianapolis'}));
  for(const col of ['custom','odds_verified_at','closing_odds','closing_entered_at','cashout_amount','result_override',...headers.slice(16)]) assert.equal(placed[col],'');
  const broken=mockBetLog(headers.filter(c=>c!=='stake'));
  assert.equal(broken.post({...request,secret:broken.secret}).status,'error');
  assert.equal(broken.rows.length,0);
});
test('server recognizes tagged rows, legacy shorthand and reordered parlays, but distinguishes lines',()=>{
  const other={...leg,market:'moneyline',line:null};
  for(const existing of [{notes:row.notes,legs:'[]'},{legs:'nba|'+leg.eventId+'|spread|11|3.5|-130'},
    {legs:JSON.stringify([other,leg])}]){
    const log=mockBetLog();
    log.rows.push({id:'old',...existing});
    const legs=existing.legs.startsWith('[{')?[leg,other]:[leg];
    const request={sheetId,secret:log.secret,row:{...row,legs:JSON.stringify(legs)}};
    assert.equal(log.post(request).status,'duplicate');
    assert.equal(log.rows.length,1);
  }
  const log=mockBetLog();
  log.rows.push({id:'other',notes:'Took Court rec '+recId+'-other.',legs:JSON.stringify([{...leg,line:4.5}])});
  assert.equal(log.post({secret:log.secret,sheetId,row}).status,'ok');
});
