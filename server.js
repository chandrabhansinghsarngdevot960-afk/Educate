const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas
const EventSchema = new mongoose.Schema({
  name: String,
  datetime: Date,
  createdAt: { type: Date, default: Date.now }
});
const GiveawaySchema = new mongoose.Schema({
  name: String,
  endTime: Date,
  participants: [String],
  winner: String,
  ended: { type: Boolean, default: false }
});
const WinnerSchema = new mongoose.Schema({
  giveawayId: String,
  winnerName: String,
  timestamp: Date
});

const Event = mongoose.model('Event', EventSchema);
const Giveaway = mongoose.model('Giveaway', GiveawaySchema);
const Winner = mongoose.model('Winner', WinnerSchema);

// API Routes
app.get('/api/events', async (req, res) => res.json(await Event.find()));
app.post('/api/events', async (req, res) => res.json(await Event.create(req.body)));
app.delete('/api/events/:id', async (req, res) => res.json(await Event.findByIdAndDelete(req.params.id)));

app.get('/api/giveaways', async (req, res) => res.json(await Giveaway.find()));
app.post('/api/giveaways', async (req, res) => res.json(await Giveaway.create(req.body)));
app.delete('/api/giveaways/:id', async (req, res) => res.json(await Giveaway.findByIdAndDelete(req.params.id)));
app.post('/api/giveaways/reroll/:id', async (req, res) => {
  const giveaway = await Giveaway.findById(req.params.id);
  if (giveaway && giveaway.participants.length) {
    const newWinner = giveaway.participants[Math.floor(Math.random() * giveaway.participants.length)];
    giveaway.winner = newWinner;
    await giveaway.save();
    await Winner.create({ giveawayId: giveaway.id, winnerName: newWinner, timestamp: new Date() });
    res.json(giveaway);
  } else res.status(400).json({ error: 'No participants' });
});

app.get('/api/winners', async (req, res) => res.json(await Winner.find()));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));