// Add this to your existing server.js const express = require('express'); const bodyParser = require('body-parser'); const db = require('./firebase/firebase'); const axios = require('axios'); const fs = require('fs');

const app = express(); const PORT = process.env.PORT || 3000;

const TELEGRAM_TOKEN = '7430982435:AAEWnrZZlKM7QbR__YdjnCePJCSu0ASHprI'; const CHAT_ID = '6105596008'; const TELEGRAM_API = https://api.telegram.org/bot${TELEGRAM_TOKEN};

app.use(bodyParser.json()); app.use(express.static('public'));

// Send Package Request app.post('/buy-package', async (req, res) => { const { username, phone, amount, packageNumber } = req.body; const message = VIP Package Request\nName: ${username}\nPhone: ${phone}\nPackage ${packageNumber} - Price: ${amount} BDT;

await db.collection('vipPackages').doc(${phone}_${packageNumber}).set({ username, phone, amount, packageNumber, status: 'pending', createdAt: new Date() });

await axios.post(${TELEGRAM_API}/sendMessage, { chat_id: CHAT_ID, text: message, reply_markup: { inline_keyboard: [[ { text: 'Approve', callback_data: approve_${phone}_${packageNumber} }, { text: 'Reject', callback_data: reject_${phone}_${packageNumber} } ]] } });

res.send({ success: true }); });

// Webhook to handle callback from Telegram buttons app.post('/webhook', async (req, res) => { const callback = req.body.callback_query; if (!callback) return res.sendStatus(400);

const data = callback.data.split('_'); const action = data[0]; const phone = data[1]; const packageNumber = data[2]; const docId = ${phone}_${packageNumber};

if (action === 'approve') { await db.collection('vipPackages').doc(docId).update({ status: 'approved' }); await axios.post(${TELEGRAM_API}/sendMessage, { chat_id: CHAT_ID, text: ✅ Package ${packageNumber} for ${phone} has been approved. }); } else if (action === 'reject') { await db.collection('vipPackages').doc(docId).update({ status: 'rejected' }); await axios.post(${TELEGRAM_API}/sendMessage, { chat_id: CHAT_ID, text: ❌ Package ${packageNumber} for ${phone} has been rejected. }); }

// Write status to a local file for front-end fetch fs.writeFileSync(./public/status-${docId}.json, JSON.stringify({ status: action }));

await axios.post(${TELEGRAM_API}/answerCallbackQuery, { callback_query_id: callback.id, text: 'Action processed' });

res.sendStatus(200); });

// Status fetch endpoint for front-end polling app.get('/status/:phone/:packageNumber', (req, res) => { const file = ./public/status-${req.params.phone}_${req.params.packageNumber}.json; if (fs.existsSync(file)) { const data = fs.readFileSync(file); res.send(JSON.parse(data)); } else { res.send({ status: 'pending' }); } });

app.listen(PORT, () => { console.log(Server running at http://localhost:${PORT}); });


const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firebase/firebase');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

const TELEGRAM_TOKEN = '7430982435:AAEWnrZZlKM7QbR__YdjnCePJCSu0ASHprI';
const CHAT_ID = '6105596008';

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/buy-package', async (req, res) => {
  const { username, phone, amount, packageNumber } = req.body;

  const message = `VIP Package Request\nName: ${username}\nPhone: ${phone}\nPackage ${packageNumber} - Price: ${amount} BDT`;

  // Firestore ডাটাবেসে সংরক্ষণ
  await db.collection('vipPackages').add({
    username,
    phone,
    amount,
    packageNumber,
    status: 'pending',
    createdAt: new Date()
  });

  // টেলিগ্রামে মেসেজ পাঠানো
  await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message,
    reply_markup: {
      inline_keyboard: [[
        { text: 'Approve', callback_data: `approve_${phone}_${packageNumber}` },
        { text: 'Reject', callback_data: `reject_${phone}_${packageNumber}` }
      ]]
    }
  });

  res.send({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
