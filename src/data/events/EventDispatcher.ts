import { EventEmitter } from 'events';

/**
 * EventDispatcher class for managing database-related events.
 * This class allows components to subscribe to and be notified of database changes.
 */
class EventDispatcher {
  private static instance: EventDispatcher;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
  }

  /**
   * Get the singleton instance of EventDispatcher.
   * @returns {EventDispatcher} The EventDispatcher instance.
   */
  public static getInstance(): EventDispatcher {
    if (!EventDispatcher.instance) {
      EventDispatcher.instance = new EventDispatcher();
    }
    return EventDispatcher.instance;
  }

  /**
   * Emit an event to notify subscribers of a database change.
   * @param {string} eventName - The name of the event.
   * @param {any} data - Optional data to be passed with the event.
   */
  public emit(eventName: string, data?: any): void {
    this.emitter.emit(eventName, data);
  }

  /**
   * Subscribe to a database change event.
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {Function} callback - The function to be called when the event is emitted.
   */
  public subscribe(eventName: string, callback: (data?: any) => void): void {
    this.emitter.on(eventName, callback);
  }

  /**
   * Unsubscribe from a database change event.
   * @param {string} eventName - The name of the event to unsubscribe from.
   * @param {Function} callback - The function to be removed from the event listeners.
   */
  public unsubscribe(eventName: string, callback: (data?: any) => void): void {
    this.emitter.off(eventName, callback);
  }
}

export default EventDispatcher;
