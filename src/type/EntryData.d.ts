export type EntryData = {
    /**
     * Unique identifier for this data entry (within the tool).
     */
    id: string;

    /**
     * The tool and its corresponding card that hosts this data.
     */
    source: {
        tool: string;
        card: string;
        icon?: string;
    };

    /**
     * Optional human-readable title or label.
     */
    title?: string;

    /**
     * The primary content or body of the data.
     * Used as the main value in Radarite.
     */
    content?: string;

    /**
     * Tags used for categorization or filtering across tools.
     */
    tags?: string[];

    /**
     * Timestamp for sorting or display purposes.
     */
    createdAt?: string; // ISO 8601 format

    /**
     * Last modified timestamp.
     */
    modifiedAt?: string; // ISO 8601 format

    /**
     * Optional metadata specific to the tool or context.
     */
    meta?: Record<string, any>;

    /**
     * Optional type descriptor for this entry (e.g., 'note', 'task', 'event').
     */
    type?: string;

    /**
     * Whether this entry is archived or inactive.
     */
    archived?: boolean;

    /**
     * Whether this entry is specially marked/pinned.
     */
    pinned?: boolean;

    /**
     * Optional normalized importance value (0 to 1).
     */
    importance?: number;

    /**
     * Optional usage or interaction frequency value.
     */
    frequency?: number;

    /**
     * Scoreboard of standardized numeric values (tool-defined).
     * Useful for Radarite or analytics tools.
     */
    scoreboard?: Record<string, number>;

    /**
     * Optional key to group this under a specific radar group.
     * Radarite can use this to auto-suggest metric groups.
     */
    customRadarKey?: string;
};
