/*
Migration script: migrate existing `cities` documents to add `lat` and `lng` where missing.

Usage:
  1. Create a Firebase service account JSON and set env var: GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
  2. npm init -y && npm install firebase-admin node-fetch
  3. node migrate_cities.js

This script will:
 - find documents in the `cities` collection where `lat` or `lng` is missing
 - attempt to geocode the city using Nominatim (OpenStreetMap)
 - update the Firestore document with `lat` and `lng` if found

Notes:
 - Nominatim has usage limits; run carefully and don't hammer the service.
 - Review results before trusting them in production.
*/

const admin = require('firebase-admin');
const fetch = require('node-fetch');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Please set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });
const db = admin.firestore();

async function geocodeCity(name, country){
  const params = new URLSearchParams({ city: name, country: country || '', format: 'json', limit: '1' });
  const url = 'https://nominatim.openstreetmap.org/search?' + params.toString();
  const res = await fetch(url, { headers: { 'User-Agent': 'scenty-migration-script/1.0 (+https://yourdomain.example)' } });
  if (!res.ok) throw new Error('Geocode failed: ' + res.status);
  const j = await res.json();
  if (!j || !j.length) return null;
  return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
}

async function run(){
  const snap = await db.collection('cities').get();
  for(const d of snap.docs){
    const c = d.data();
    if (typeof c.lat !== 'undefined' && typeof c.lng !== 'undefined') continue;
    const name = c.nameEn || c.nameAr || d.id;
    const country = c.countryName || '';
    console.log('Geocoding', d.id, name, country);
    try{
      const coords = await geocodeCity(name, country);
      if(coords){
        await db.collection('cities').doc(d.id).update({ lat: coords.lat, lng: coords.lng, migratedAt: admin.firestore.FieldValue.serverTimestamp() });
        console.log('Updated', d.id, coords);
      } else {
        console.log('No geocode for', d.id);
      }
      // be gentle with the service
      await new Promise(r=>setTimeout(r, 1200));
    }catch(e){
      console.error('Error for', d.id, e.message);
      await new Promise(r=>setTimeout(r, 2000));
    }
  }
  console.log('Done');
}

run().catch(err=>{ console.error(err); process.exit(1); });
