type EventListener<TArgs extends any[]> = (...args: TArgs) => void;
type ArrayKeys<T> = {
	[K in keyof T]: T[K] extends any[] ? K : never;
}[keyof T];

class Listenable<T extends { [K in keyof T]: any[] }> {
	private listeners: Map<ArrayKeys<T>, Map<number, EventListener<T[keyof T]>>> = new Map();
	private listenerIdCounter: number = 0;

	/**
	 * Adds an event listener for a specific event name.
	 * @param eventName - The name of the event to listen for.
	 * @param listener - The callback to be invoked when the event is triggered.
	 * @returns The id of the added listener.
	 */
	public addEventListener(eventName: ArrayKeys<T>, listener: EventListener<any>): number {
		if (!this.listeners.has(eventName)) {
			this.listeners.set(eventName, new Map());
		}

		const id = this.listenerIdCounter++;
		this.listeners.get(eventName)!.set(id, listener);
		return id;
	}

	/**
	 * Removes a specific listener from an event using its id.
	 * @param eventName - The name of the event.
	 * @param id - The id of the listener to be removed.
	 */
	public removeEventListener(eventName: ArrayKeys<T>, id: number): void {
		const eventListeners = this.listeners.get(eventName);
		if (!eventListeners) return;

		eventListeners.delete(id);

		if (eventListeners.size === 0) {
			this.listeners.delete(eventName);
		}
	}

	/**
	 * Clears all event listeners.
	 */
	protected clearListeners(): void {
		this.listeners.clear();
		this.listenerIdCounter = 0;
	}

	/**
	 * Triggers an event, invoking all associated listeners with the provided arguments.
	 * @param eventName - The name of the event to trigger.
	 * @param args - Arguments to pass to the listeners.
	 */
	protected dispatchEvent(eventName: ArrayKeys<T>, ...args: T[ArrayKeys<T>]): void {
		const eventListeners = this.listeners.get(eventName);
		if (eventListeners) {
			eventListeners.forEach(listener => listener(...args));
		}
	}
}

export default Listenable;
