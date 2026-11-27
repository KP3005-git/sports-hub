const {test,before,after} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync,mkdirSync} = require('node:fs');
const {join} = require('node:path');
const {chromium} = require('playwright');
const {mockBetLog,headers,sheetId,eventId,recId,date,leg,rec} = require('./bet-log-fixture.cjs');

const html=readFileSync(join(__dirname,'../index.html'),'utf8');
const app='https://sports-hub.test/', endpoint=['https://script.google.com','macros/s','mock','exec'].join('/');
const event={id:eventId,date:date+'T23:30:00Z',competitions:[{
  date:date+'T23:30:00Z',status:{type:{state:'pre',shortDetail:'Scheduled'}},
  broadcasts:[{names:['League Pass']}],competitors:[
    {homeAway:'away',team:{id:'11',displayName:'Indiana Pacers',abbreviation:'IND'}},
    {homeAway:'home',team:{id:'5',displayName:'Cleveland Cavaliers',abbreviation:'CLE'}}
  ]}]};
let browser;
before(async()=>{browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH});});
after(async()=>{await browser?.close();});

async function fixture(t,{phone=false,unit=null,placed=[],mode='ok',pick=rec}={}){
  const log=mockBetLog(), writes=[], bad=[], errors=[];
  const context=await browser.newContext({viewport:phone?{width:390,height:844}:{width:1366,height:900},
    isMobile:phone,hasTouch:phone,timezoneId:'America/Indiana/Indianapolis',serviceWorkers:'block'});
  t.after(()=>context.close());
  const page=await context.newPage();
  page.setDefaultTimeout(6000);
  await page.clock.setFixedTime(new Date('2026-11-27T03:30:00Z'));
  page.on('pageerror',err=>errors.push(err.message));
  await page.addInitScript(({sheetId,unit,placed})=>{
    if(!localStorage.getItem('sportsHub.data.v1')) localStorage.setItem('sportsHub.data.v1',
      JSON.stringify({settings:{sheetId,unitSize:unit},placedBets:placed,recommendations:[]}));
  },{sheetId,unit,placed});
  const state={mode};
  await context.route('**/*',async route=>{
    const req=route.request(), url=new URL(req.url());
    if(req.method()==='POST' && url.href===endpoint){
      const body=req.postDataJSON();
      writes.push(body.row);
      await new Promise(r=>setTimeout(r,120));
      if(state.mode==='offline') return route.abort();
      const reply=log.post(body);
      if(state.mode==='opaque') return route.abort();
      return route.fulfill({json:reply});
    }
    if(req.method()!=='GET'){bad.push(req.method()+' '+url.host);return route.abort();}
    if(url.origin===new URL(app).origin && url.pathname==='/') return route.fulfill({contentType:'text/html',body:html});
    if(url.hostname==='docs.google.com'){
      assert.equal(url.pathname,'/spreadsheets/d/'+sheetId+'/gviz/tq');
      const table=url.searchParams.get('sheet'), cols=table==='Placed'?headers:Object.keys(pick);
      const data=table==='Placed'?log.rows:[pick];
      const cb=url.searchParams.get('tqx').split('responseHandler:')[1];
      const payload={status:'ok',table:{cols:cols.map(label=>({label,type:'string'})),
        rows:data.map(row=>({c:cols.map(c=>({v:row[c]??null}))}))}};
      return route.fulfill({contentType:'application/javascript',body:cb+'('+JSON.stringify(payload)+');'});
    }
    if(url.hostname.endsWith('espn.com')){
      const json=url.pathname.endsWith('/summary')?{header:event}:url.pathname.endsWith('/scoreboard')?{events:[event]}:{};
      return route.fulfill({json});
    }
    return route.abort(); // No live requests, including images or write credentials.
  });
  t.after(()=>{assert.deepEqual(bad,[]);assert.deepEqual(errors,[]);});
  await page.goto(app+'#settings');
  async function settings(url,secret){
    await page.locator('#setwriteurl').fill(url);
    await page.locator('#setwritesecret').fill(secret);
    await page.locator('#setwritesecret').blur();
  }
  async function openGame(){
    await page.goto(app+'#nba');
    await page.locator('.pickchip[data-gd="'+eventId+'"]').first().click();
    await page.locator('#gdpicks [data-pick="'+recId+'"]').waitFor();
  }
  const card=page.locator('#gdpicks [data-pick="'+recId+'"]');
  return {page,log,writes,settings,openGame,card,state};
}
async function shot(page,name){
  if(!process.env.BET_LOG_SHOTS) return;
  mkdirSync(process.env.BET_LOG_SHOTS,{recursive:true});
  await page.screenshot({path:join(process.env.BET_LOG_SHOTS,name+'.png'),animations:'disabled'});
}
for(const phone of [false,true]){
  const layout=phone?'phone':'desktop';
  test(layout+' logs the confirmed ticket once, refreshes Your bets and keeps Logged after reload',async t=>{
    const {page,log,writes,settings,openGame,card}=await fixture(t,{phone,unit:5,mode:phone?'opaque':'ok'});
    await settings(endpoint,log.secret);
    await openGame();
    const take=card.getByRole('button',{name:'Take this bet'});
    await take.waitFor();
    await shot(page,layout+'-take');
    await take.click();
    assert.equal(await card.getByLabel('Stake ($)',{exact:true}).inputValue(),'5');
    assert.equal(await card.getByLabel('American odds').inputValue(),'-110');
    await card.getByLabel('Stake ($)',{exact:true}).fill('7.50');
    await card.getByLabel('Sportsbook').fill('DraftKings');
    await card.getByLabel('American odds').fill('+120');
    // Exercise the same game-detail rebuild as the live refresh, while typing.
    await page.evaluate(id=>openGame('nba',id,{refresh:true}),eventId);
    assert.equal(await card.getByLabel('American odds').inputValue(),'+120');
    assert.equal(await page.evaluate(()=>document.activeElement.name),'odds');
    const submit=card.getByRole('button',{name:'Log',exact:true});
    await submit.dblclick({force:true});
    await card.getByRole('button',{name:'Logging…'}).waitFor();
    assert.ok(await card.getByRole('button',{name:'Logging…'}).isDisabled());
    await page.locator('#gdpicks .mybet').waitFor();
    assert.equal(writes.length,1);assert.equal(log.rows.length,1);
    assert.equal(writes[0].date,'2026-11-26');
    assert.equal(writes[0].odds_entered_at,'2026-11-27T03:30:00.000Z');
    assert.deepEqual([writes[0].stake,writes[0].odds,writes[0].sportsbook],[7.5,120,'DraftKings']);
    assert.equal(writes[0].notes,'Took Court rec '+recId+'. '+rec.notes.replace('\n',' '));
    assert.deepEqual(JSON.parse(writes[0].legs),[leg]);
    assert.ok(await card.getByRole('button',{name:'Logged'}).isDisabled());
    assert.equal(await page.locator('.mybet .pktake').count(),0);
    assert.match(await page.locator('.mybet .pkmeta').innerText(),/Ticket \+120/);
    assert.equal(await page.evaluate(()=>document.querySelector('#gdmodal').scrollWidth>innerWidth),false);
    await shot(page,layout+'-logged');
    assert.ok(await page.getByRole('button',{name:'Close',exact:true}).isVisible());
    assert.ok(!(await page.evaluate(()=>localStorage.getItem('sportsHub.data.v1'))).includes(log.secret));
    await page.reload();await openGame();
    assert.ok(await card.getByRole('button',{name:'Logged'}).isDisabled());
    assert.equal(writes.length,1);
  });
}
test('missing or invalid endpoint, stake validation, cancellation, rejection and retry',async t=>{
  const {page,card,settings,openGame,writes,log,state}=await fixture(t);
  const take=card.getByRole('button',{name:'Take this bet'});
  for(const url of ['', 'https://example.invalid/wrong']){
    await settings(url,'');
    await openGame();await take.click();
    assert.ok(await card.getByRole('link',{name:/Setup guide/}).isVisible());
    assert.match(await card.innerText(),/web-app URL in Settings/);
    await card.getByRole('button',{name:'Cancel'}).click();
    assert.equal(writes.length,0);
    await page.goto(app+'#settings');
  }
  await settings(endpoint,log.secret+'x');await openGame();await take.click();
  const submit=card.getByRole('button',{name:'Log',exact:true});
  assert.equal(await card.getByLabel('Stake ($)',{exact:true}).inputValue(),'');
  await submit.click();await card.getByText('Enter a stake greater than $0.').waitFor();
  await card.getByLabel('Stake ($)',{exact:true}).fill('4');
  await card.getByLabel('American odds').fill('50');
  await submit.click();await card.getByText(/Enter American odds/).waitFor();
  assert.equal(writes.length,0);
  await card.getByLabel('American odds').fill('-110');await submit.click();
  await card.getByText(/Request rejected/).waitFor();
  assert.equal(log.rows.length,0);
  await page.goto(app+'#settings');await settings(endpoint,log.secret);await openGame();
  state.mode='offline';await submit.click();
  await card.getByText(/Couldn’t confirm/).waitFor();
  assert.equal(log.rows.length,0);
  state.mode='ok';await submit.click();
  await page.locator('#gdpicks .mybet').waitFor();assert.equal(log.rows.length,1);
});
test('hub-only duplicates by source tag, deterministic ID or equal legs have no action',async t=>{
  for(const change of [{id:'took-'+recId},{notes:'Took Blitz rec '+recId+'. Existing ticket.'},{legs:[{...leg,odds:130}]}]){
    const placed={id:'old',source:'local',kind:'placed',book:'FanDuel',betType:'spread',stake:5,odds:130,
      notes:'',legs:[{...leg,line:8.5}],...change};
    const {openGame,card,writes}=await fixture(t,{placed:[placed]});
    await openGame();assert.ok(await card.getByRole('button',{name:'Logged'}).isDisabled());
    assert.equal(writes.length,0);
  }
});
test('boosted parlay preserves leg metadata, blank odds note and ungraded fields',async t=>{
  const prop={...leg,market:'player_points',selection:'over',selectionName:'Guard over 20.5 points',line:20.5,athleteId:'321'};
  const pick={...rec,sportsbook:'',bet_type:'parlay',boosted:'TRUE',odds:262,legs:JSON.stringify([prop,leg]),
    odds_verified_at:'previous check',closing_odds:210,result_override:'won',graded_at:'previous grade'};
  const {card,page,settings,openGame,log}=await fixture(t,{unit:3,pick});
  await settings(endpoint,log.secret);await openGame();
  await card.getByRole('button',{name:'Take this bet'}).click();
  assert.equal(await card.getByLabel('Sportsbook').inputValue(),'FanDuel');
  assert.equal(await card.getByLabel('American odds').inputValue(),'+262');
  await card.getByRole('button',{name:'Log',exact:true}).click();
  await page.locator('.mybet').waitFor();
  const [row]=log.rows;
  assert.equal(row.odds_note,'');assert.equal(row.boosted,'TRUE');
  const [saved]=JSON.parse(row.legs);
  assert.deepEqual(saved,{...prop,market:'prop',propType:'player_points'});
  for(const col of ['odds_verified_at','closing_odds','result_override','graded_at']) assert.equal(row[col],'');
});
