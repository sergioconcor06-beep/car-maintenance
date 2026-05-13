const Parse = require('parse/node');

const APP_ID = 'VNCETodfuWvUtF1L5O5kcCp3r8JpFpg0GugpBNWz';
const JS_KEY = '5wbDOn3d10TBhGPPfEoFgvZp7EDO5TiD2YyssAPv';
const MASTER_KEY = 'NRDHAXUrreuLS8fvPFScqs5f6fGDLqJKWFxx7ZTD';

Parse.initialize(APP_ID, JS_KEY, MASTER_KEY);
Parse.serverURL = 'https://parseapi.back4app.com/';

async function test() {
  try {
    const q = new Parse.Query(Parse.User);
    q.limit(1);
    const r = await q.find({ useMasterKey: true });
    console.log('OK users count:', r.length);
  } catch (e) {
    console.error('ERROR:', e.message);
  }
}

test();