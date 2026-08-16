import mongoose from 'mongoose';
import { isDatabaseConnected } from '../config/database.js';
import { getStore } from '../config/memoryStore.js';

const searchHistorySchema = new mongoose.Schema({
  profileType: { type: String, required: true },
  filters: { type: mongoose.Schema.Types.Mixed, default: {} },
  resultCount: { type: Number, default: 0 },
  topMatchCount: { type: Number, default: 0 },
  searchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const MongooseModel = mongoose.model('SearchHistory', searchHistorySchema);

export function getSearchHistoryModel() {
  if (isDatabaseConnected()) {
    return MongooseModel;
  }
  return getStore('searchHistory');
}

export default MongooseModel;
