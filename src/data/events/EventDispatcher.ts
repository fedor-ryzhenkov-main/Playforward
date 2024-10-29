type EventCallback<T = any> = (data: T) => void;

/**
 * EventDispatcher class for managing database-related events.
 * This class allows components to subscribe to and be notified of database changes.
 */
class EventDispatcher {
  private static instance: EventDispatcher;
  private listeners: Map<string, Set<EventCallback>>;

  private constructor() {
    this.listeners = new Map();
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
   * Subscribe to a database change event.
   * @param {string} event - The name of the event to subscribe to.
   * @param {Function} callback - The function to be called when the event is emitted.
   */
  public subscribe<T>(event: string, callback: EventCallback<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from a database change event.
   * @param {string} event - The name of the event to unsubscribe from.
   * @param {Function} callback - The function to be removed from the event listeners.
   */
  public unsubscribe<T>(event: string, callback: EventCallback<T>): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit an event to notify subscribers of a database change.
   * @param {string} event - The name of the event to emit.
   * @param {any} data - Optional data to be passed with the event.
   */
  public emit<T>(event: string, data: T): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }
}

export default EventDispatcher;
