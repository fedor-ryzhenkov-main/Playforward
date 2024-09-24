import { EventEmitter } from 'events';

class DatabaseEventEmitter extends EventEmitter {}

const dbEventEmitter = new DatabaseEventEmitter();

export default dbEventEmitter;