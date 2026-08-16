/**
 * In-memory store — used when MongoDB is not configured.
 * Provides the same interface as Mongoose models for basic CRUD.
 * Data is lost on server restart.
 */

import { v4 as uuidv4 } from 'uuid';

class InMemoryCollection {
  constructor(name) {
    this.name = name;
    this.data = new Map();
  }

  async create(doc) {
    const id = doc._id || uuidv4();
    const record = { _id: id, ...doc, createdAt: new Date(), updatedAt: new Date() };
    this.data.set(id, record);
    return record;
  }

  async find(filter = {}) {
    let results = Array.from(this.data.values());
    results = this._applyFilter(results, filter);
    return {
      sort: (sortObj) => {
        const key = Object.keys(sortObj)[0];
        const dir = sortObj[key];
        results.sort((a, b) => dir === -1 ? (b[key] > a[key] ? 1 : -1) : (a[key] > b[key] ? 1 : -1));
        return {
          limit: (n) => { results = results.slice(0, n); return { lean: () => Promise.resolve(results), exec: () => Promise.resolve(results), then: (fn) => fn(results) }; },
          lean: () => Promise.resolve(results),
          exec: () => Promise.resolve(results),
          then: (fn) => fn(results),
        };
      },
      limit: (n) => { results = results.slice(0, n); return { lean: () => Promise.resolve(results), exec: () => Promise.resolve(results), then: (fn) => fn(results) }; },
      lean: () => Promise.resolve(results),
      exec: () => Promise.resolve(results),
      then: (fn) => fn(results),
    };
  }

  async findOne(filter = {}) {
    const results = this._applyFilter(Array.from(this.data.values()), filter);
    return results[0] || null;
  }

  async findById(id) {
    return this.data.get(id) || null;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const record = this.data.get(id);
    if (!record) return null;
    const updateData = update.$set || update;
    const updated = { ...record, ...updateData, updatedAt: new Date() };
    this.data.set(id, updated);
    return options.new !== false ? updated : record;
  }

  async findOneAndUpdate(filter, update, options = {}) {
    const record = await this.findOne(filter);
    if (!record) {
      if (options.upsert) {
        const newDoc = { ...filter, ...(update.$set || update) };
        return this.create(newDoc);
      }
      return null;
    }
    return this.findByIdAndUpdate(record._id, update, options);
  }

  async findByIdAndDelete(id) {
    const record = this.data.get(id);
    if (record) this.data.delete(id);
    return record;
  }

  async deleteMany(filter = {}) {
    const toDelete = this._applyFilter(Array.from(this.data.values()), filter);
    toDelete.forEach(r => this.data.delete(r._id));
    return { deletedCount: toDelete.length };
  }

  async countDocuments(filter = {}) {
    return this._applyFilter(Array.from(this.data.values()), filter).length;
  }

  async insertMany(docs) {
    const results = [];
    for (const doc of docs) {
      results.push(await this.create(doc));
    }
    return results;
  }

  _applyFilter(items, filter) {
    if (!filter || Object.keys(filter).length === 0) return items;
    return items.filter(item => {
      return Object.entries(filter).every(([key, value]) => {
        if (key === '$or') {
          return value.some(orFilter => this._applyFilter([item], orFilter).length > 0);
        }
        if (key === '$and') {
          return value.every(andFilter => this._applyFilter([item], andFilter).length > 0);
        }
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          if ('$in' in value) return value.$in.includes(item[key]);
          if ('$gte' in value) return item[key] >= value.$gte;
          if ('$lte' in value) return item[key] <= value.$lte;
          if ('$gt' in value) return item[key] > value.$gt;
          if ('$lt' in value) return item[key] < value.$lt;
          if ('$ne' in value) return item[key] !== value.$ne;
          if ('$regex' in value) {
            const flags = value.$options || '';
            return new RegExp(value.$regex, flags).test(item[key]);
          }
        }
        return item[key] === value;
      });
    });
  }
}

// Singleton stores
const stores = {};

export function getStore(name) {
  if (!stores[name]) {
    stores[name] = new InMemoryCollection(name);
  }
  return stores[name];
}

export function clearAllStores() {
  Object.values(stores).forEach(s => s.data.clear());
}
