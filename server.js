
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
