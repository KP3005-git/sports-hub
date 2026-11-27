// Paste into the Bet Log's bound Apps Script project. See README for Script Properties.
const REQUIRED_HEADERS = [
  'id','date','sportsbook','bet_type','stake','odds','boosted','odds_note','odds_entered_at',
  'odds_verified_at','closing_odds','closing_entered_at','result_override','cashout_amount','notes','legs'
];

function statusJSON(status, fields) {
  return ContentService.createTextOutput(JSON.stringify(Object.assign({status}, fields)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return statusJSON('error');
}

function doPost(event) {
  let lock;
  try {
    const request = JSON.parse(event.postData.contents);
    const properties = PropertiesService.getScriptProperties();
    const secret = properties.getProperty('BET_LOG_SECRET');
    if (!secret || request.secret !== secret) return statusJSON('error', {reason:'rejected'});
    const sheetId = properties.getProperty('BET_LOG_SHEET_ID');
    if (!sheetId || request.sheetId !== sheetId) return statusJSON('error');
    const row = request.row;
    if (!row || typeof row.id !== 'string' || !/^took-.+$/u.test(row.id) ||
        !Number.isFinite(row.stake) || row.stake <= 0 || !Number.isSafeInteger(row.odds) || Math.abs(row.odds) < 100 ||
        !['moneyline','spread','total','parlay','prop'].includes(row.bet_type) ||
        !['TRUE','FALSE'].includes(row.boosted) || typeof row.sportsbook !== 'string' || !row.sportsbook.trim() ||
        typeof row.notes !== 'string' || typeof row.odds_note !== 'string') return statusJSON('error');
    const legs = JSON.parse(row.legs);
    if (!Array.isArray(legs) || !legs.length || !legs.every(l => l && l.league && l.market)) return statusJSON('error');
    const recId = row.id.slice(5);
    if (!row.notes.startsWith('Took ') || !hasRecTag(row.notes, recId)) return statusJSON('error');

    // Resolve the destination from owner configuration. Web-app requests have no active spreadsheet.
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Placed');
    lock = LockService.getScriptLock();
    lock.waitLock(15000);
    const [headers, ...placed] = sheet.getDataRange().getValues();
    if (!REQUIRED_HEADERS.every(h => headers.filter(name => name === h).length === 1)) return statusJSON('error');
    const idCol = headers.indexOf('id'), notesCol = headers.indexOf('notes'), legsCol = headers.indexOf('legs');
    const key = placedTicketKey(legs);
    if (placed.some(p => p[idCol] === row.id || hasRecTag(p[notesCol], recId) || storedTicketKey(p[legsCol]) === key)) {
      return statusJSON('duplicate', {id:row.id});
    }

    const now = new Date();
    const fields = {id:row.id, date:Utilities.formatDate(now, 'America/Indiana/Indianapolis', 'yyyy-MM-dd'),
      sportsbook:row.sportsbook.trim(), bet_type:row.bet_type, stake:row.stake, odds:row.odds,
      boosted:row.boosted, odds_note:row.odds_note, odds_entered_at:now.toISOString(),
      notes:row.notes.replace(/[\t\r\n]+/g,' '), legs:JSON.stringify(legs)};
    // appendRow parses user-entered strings. The Sheets text prefix preserves literal text,
    // including dates, TRUE/FALSE, numeric-looking book names and leading equals signs.
    sheet.appendRow(headers.map(h => {
      const value = Object.prototype.hasOwnProperty.call(fields, h) ? fields[h] : '';
      return typeof value === 'string' && value !== '' ? "'" + value : value;
    }));
    SpreadsheetApp.flush();
    return statusJSON('ok', {id:row.id});
  } catch (_) {
    return statusJSON('error');
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function hasRecTag(notes, recId) {
  return (String(notes || '').replace(/\s+/g, ' ') + ' ').includes(' rec ' + recId + '. ');
}

// Match the complete ticket even if the parlay was entered in a different order or at different odds.
function placedTicketKey(legs) {
  const norm = v => String(v == null ? '' : v).trim().toLowerCase();
  return JSON.stringify(legs.map(l => {
    const raw = norm(l.market || 'moneyline').replace(/[\s-]+/g, '_');
    const isProp = /^(prop|player_.*|anytime_td|first_td|yards|receptions|passing_yards|rushing_yards|receiving_yards)$/.test(raw);
    const line = norm(l.line) === '' ? '' : Number(l.line);
    return JSON.stringify([l.league || 'cfb', l.eventId || l.game, isProp ? 'prop' : raw, l.selection || l.selectionName, line,
      isProp ? l.propType || (raw === 'prop' ? '' : raw) : '', isProp ? l.athleteId || l.selectionName : ''].map(norm));
  }).sort());
}

function storedTicketKey(value) {
  if (!value) return null;
  try {
    const text = String(value).trim();
    if (/^[\[{]/.test(text)) {
      const parsed = JSON.parse(text);
      return placedTicketKey(Array.isArray(parsed) ? parsed : [parsed]);
    }
    return placedTicketKey(text.split(';').filter(Boolean).map(part => {
      const [league,eventId,market,selection,line] = part.split('|');
      return {league,eventId,market,selection,line};
    }));
  } catch (_) {
    return null; // A malformed legacy row still participates in the id and source-tag checks.
  }
}
