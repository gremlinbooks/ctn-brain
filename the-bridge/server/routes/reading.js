import { Router } from 'express';
import { addReadingBook, getReadingList, updateReadingBook } from '../store.js';

const router = Router();

router.get('/list', (req, res) => {
  try {
    res.json(getReadingList());
  } catch (err) {
    console.error('Reading list error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/list', (req, res) => {
  try {
    const { book, author, days, active, totalPages, pagesToday } = req.body || {};

    if (!book || !String(book).trim()) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'book is required' }
      });
    }

    const entry = addReadingBook({
      book: String(book).trim(),
      author: author ? String(author).trim() : '',
      days: days ? String(days).trim() : '',
      active: Boolean(active),
      totalPages: Number.isFinite(Number(totalPages)) ? Number(totalPages) : null,
      pagesToday: Number.isFinite(Number(pagesToday)) ? Number(pagesToday) : 0,
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error('Add reading book error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.patch('/list/:id', (req, res) => {
  try {
    const update = req.body || {};
    const entry = updateReadingBook(req.params.id, update);
    res.json(entry);
  } catch (err) {
    if (err.message === 'NOT_FOUND') {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Book not found' } });
    }

    console.error('Update reading book error:', err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
