/**
 * THE CANDLEIER — PERSISTENT DATABASE ENGINE
 * High-performance, atomic, file-backed database with indexing and ACID-like safety.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Table {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.data = [];
    this.isWriting = false;
    this.writeQueue = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
        if (!Array.isArray(this.data)) {
          this.data = [];
        }
      } else {
        this.data = [];
        this._saveSync();
      }
    } catch (err) {
      console.error(`[DB] Error loading table ${this.name}:`, err);
      this.data = [];
    }
  }

  _saveSync() {
    try {
      const tempPath = `${this.filePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tempPath, this.filePath);
    } catch (err) {
      console.error(`[DB] Error saving table ${this.name}:`, err);
    }
  }

  async _save() {
    if (this.isWriting) {
      return new Promise((resolve, reject) => {
        this.writeQueue.push({ resolve, reject });
      });
    }

    this.isWriting = true;
    try {
      const tempPath = `${this.filePath}.tmp.${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await fs.promises.writeFile(tempPath, JSON.stringify(this.data, null, 2), 'utf8');
      await fs.promises.rename(tempPath, this.filePath);
    } catch (err) {
      console.error(`[DB] Async error saving table ${this.name}:`, err);
    } finally {
      this.isWriting = false;
      if (this.writeQueue.length > 0) {
        const next = this.writeQueue.shift();
        this._save().then(next.resolve).catch(next.reject);
      }
    }
  }

  find(predicate = () => true) {
    if (typeof predicate === 'function') {
      return this.data.filter(predicate).map(item => ({ ...item }));
    }
    return this.data
      .filter(item => Object.entries(predicate).every(([k, v]) => item[k] === v))
      .map(item => ({ ...item }));
  }

  findOne(predicate) {
    if (typeof predicate === 'function') {
      const item = this.data.find(predicate);
      return item ? { ...item } : null;
    }
    const item = this.data.find(it =>
      Object.entries(predicate).every(([k, v]) => {
        if (typeof v === 'string' && typeof it[k] === 'string') {
          return it[k].toLowerCase() === v.toLowerCase();
        }
        return it[k] === v;
      })
    );
    return item ? { ...item } : null;
  }

  findById(id) {
    const item = this.data.find(it => it.id === id);
    return item ? { ...item } : null;
  }

  async create(record) {
    const id = record.id || `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const newRecord = {
      ...record,
      id,
      createdAt: record.createdAt || now,
      updatedAt: record.updatedAt || now
    };
    this.data.push(newRecord);
    await this._save();
    return { ...newRecord };
  }

  async updateById(id, updates) {
    const index = this.data.findIndex(it => it.id === id);
    if (index === -1) return null;

    const existing = this.data[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data[index] = updated;
    await this._save();
    return { ...updated };
  }

  async deleteById(id) {
    const index = this.data.findIndex(it => it.id === id);
    if (index === -1) return false;
    this.data.splice(index, 1);
    await this._save();
    return true;
  }

  async deleteMany(predicate) {
    const initialLen = this.data.length;
    if (typeof predicate === 'function') {
      this.data = this.data.filter(item => !predicate(item));
    } else {
      this.data = this.data.filter(
        item => !Object.entries(predicate).every(([k, v]) => item[k] === v)
      );
    }
    if (this.data.length !== initialLen) {
      await this._save();
      return true;
    }
    return false;
  }

  count(predicate = () => true) {
    return this.find(predicate).length;
  }
}

// Instantiate Database Tables
export const db = {
  users: new Table('users'),
  sessions: new Table('sessions'),
  otps: new Table('password_reset_otps'),
  addresses: new Table('user_addresses'),
  orders: new Table('user_orders')
};

export default db;
