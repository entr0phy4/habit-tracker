import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import indexedDB from 'fake-indexeddb';

Dexie.dependencies.indexedDB = indexedDB;
