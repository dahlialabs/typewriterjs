type OnRemoveArgs = {
    node?: Node | null;
    character?: string;
};
type Speed = "natural" | number | ((eventArgs?: any) => number);
type OnTypeArgs = {
    typewriter: Typewriter;
    character: string;
    characterIndex: number;
    stringIndex: number;
    currentString: string;
    htmlTextInfo: HTMLTextInfo | null;
};
type OnDeleteArgs = {
    typewriter: Typewriter;
    character: string;
    characterIndex: number;
    stringIndex: number;
    currentString: string;
};
/**
 * Information related to the provided HTML text
 */
type HTMLTextInfo = {
    text: string;
    partIndex: number;
    parts: string[];
    originalString: string;
};
type TypewriterOptions = {
    /**
     * Strings to type out when using autoStart option
     *
     * @default null
     */
    strings?: string | string[];
    /**
     * String value to use as the cursor.
     *
     * @default Pipe character
     */
    cursor?: string;
    /**
     * The delay between each key when typing.
     *
     * @default "natural"
     */
    delay?: Speed;
    /**
     * The delay before deletion starts.
     */
    pauseFor?: number;
    /**
     * The delay between deleting each character.
     *
     * @default "natural"
     */
    deleteSpeed?: Speed;
    /**
     * Whether to keep looping or not.
     *
     * @default false
     */
    loop?: boolean;
    /**
     * Delay between loops
     *
     * @default 0
     */
    loopDelay?: number;
    /**
     * Whether to autostart typing strings or not. You are required to provide
     * strings option.
     *
     * @default false
     */
    autoStart?: boolean;
    /**
     * Whether or not to display console logs.
     *
     * @default false
     */
    devMode?: boolean;
    /**
     * Skip adding default typewriter css styles.
     *
     * @default false
     */
    skipAddStyles?: boolean;
    /**
     * Class name for the wrapper element.
     *
     * @default "Typewriter__wrapper"
     */
    wrapperClassName?: string;
    /**
     * Class name for the cursor element.
     *
     * @default "Typewriter__cursor"
     */
    cursorClassName?: string;
    /**
     * String splitter function, can be used to split emoji's
     *
     * @default null
     */
    stringSplitter?: (text: string) => string[];
    /**
     * Callback function to replace the internal method which
     * creates a text node for the character before adding
     * it to the DOM. If you return null, then it will
     * not add anything to the DOM and so it
     * is up to you to handle it
     *
     * @default null
     */
    onCreateTextNode?: (character: string, textNode: Text) => Text | null;
    /**
     * Callback function when a node is about to be removed
     *
     * @default null
     */
    onRemoveNode?: (param: OnRemoveArgs) => void;
    /**
     * Callback function when a character is typed
     */
    onType?: (param: OnTypeArgs) => void;
    /**
     * Callback function when a character is typed
     */
    onDelete?: (param: OnDeleteArgs) => void;
};
export type EventQueueItem = {
    eventName: "type_character";
    eventArgs: {
        character: string;
        node: HTMLElement | null;
        stringPart: string;
        characterIndex: number;
        stringIndex: number;
        htmlTextInfo: HTMLTextInfo | null;
    };
} | {
    eventName: "paste_string";
    eventArgs: {
        character: string;
        node: HTMLElement | null;
        htmlTextInfo: HTMLTextInfo | null;
    };
} | {
    eventName: "remove_character";
    eventArgs: {};
} | {
    eventName: "remove_last_visible_node";
    eventArgs: {
        removingCharacterNode: boolean;
    };
} | {
    eventName: "pause_for";
    eventArgs: {
        ms: number;
    };
} | {
    eventName: "call_function";
    eventArgs: {
        cb: (args: {
            elements: TypewriterState["elements"];
        }) => void;
        thisArg?: any;
    };
} | {
    eventName: "add_html_tag_element";
    eventArgs: {
        node: HTMLElement;
        parentNode: HTMLElement | null;
    };
} | {
    eventName: "remove_all";
    eventArgs: {
        speed: Speed | null;
    };
} | {
    eventName: "change_delete_speed";
    eventArgs: {
        speed: Speed | null;
        temp?: boolean;
    };
} | {
    eventName: "remove_last_visible_node";
    eventArgs: {
        removingCharacterNode?: boolean;
    };
} | {
    eventName: "change_delay";
    eventArgs: {
        delay: Speed;
    };
} | {
    eventName: "change_cursor";
    eventArgs: {
        cursor: string | null;
    };
};
type VisibleNode = {
    type: string;
    character?: string;
    characterIndex?: number;
    stringIndex?: number;
    currentString?: string;
    node?: Node | null;
    parentNode?: HTMLElement;
};
type TypewriterState = {
    cursorAnimation: null;
    lastFrameTime: number | null;
    pauseUntil: number | null;
    eventQueue: EventQueueItem[];
    eventLoop: number | null;
    eventLoopPaused: boolean;
    reverseCalledEvents: EventQueueItem[];
    calledEvents: EventQueueItem[];
    visibleNodes: VisibleNode[];
    initialOptions: TypewriterOptions;
    elements: {
        container: HTMLElement;
        wrapper: HTMLElement;
        cursor: HTMLElement;
    };
};
declare class Typewriter {
    state: TypewriterState;
    options: TypewriterOptions;
    /**
     *
     * @param container HTMLElement of the container or string selector
     * @param options
     */
    constructor(container: HTMLElement | string, options?: TypewriterOptions);
    init(): void;
    /**
     * Replace all child nodes of provided element with
     * state wrapper element used for typewriter effect
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    setupWrapperElement: () => void;
    /**
     * Start typewriter effect
     */
    start: () => this;
    /**
     * Pause the event loop
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    pause: () => this;
    /**
     * Destroy current running instance
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    stop: () => this;
    /**
     * Add pause event to queue for ms provided
     *
     * @param ms Time in ms to pause for
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    pauseFor: (ms?: number) => this;
    /**
     * Start typewriter effect by typing
     * out all strings provided
     *
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    typeOutAllStrings: () => this;
    /**
     * Adds string characters to event queue for typing
     *
     * @param string String to type
     * @param node Node to add character inside of
     * @param stringIndex Index of string in strings array
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    typeString: (string: string, { node, stringIndex, htmlTextInfo, }?: {
        node?: HTMLElement | null;
        stringIndex?: number;
        htmlTextInfo?: HTMLTextInfo | null;
    }) => this;
    /**
     * Adds entire strings to event queue for paste effect
     *
     * @param string String to paste
     * @param node Node to add string inside of
     * @return {Typewriter}
     *
     * @author Luiz Felicio <unifelicio@gmail.com>
     */
    pasteString: (string: string, stringIndex?: number, node?: HTMLElement | null, htmlTextInfo?: HTMLTextInfo | null) => this;
    /**
     * Type out a string which is wrapper around HTML tag
     *
     * @param string String to type
     * @param parentNode Node to add inner nodes to
     * @param pasteEffect
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    typeOutHTMLString: (string: string, stringIndex?: number, parentNode?: HTMLElement | null, pasteEffect?: boolean) => this;
    /**
     * Add delete all characters to event queue
     *
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    deleteAll: (speed?: TypewriterOptions["deleteSpeed"]) => this;
    /**
     * Change delete speed
     *
     * @param speed Speed to use for deleting characters
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    changeDeleteSpeed: (speed: Speed) => this;
    /**
     * Change delay when typing
     *
     * @param delay Delay when typing out characters
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    changeDelay: (delay: Speed) => this;
    /**
     * Change cursor
     *
     * @param character/string to represent as cursor
     * @return {Typewriter}
     *
     * @author Y.Paing <ye@y3p.io>
     */
    changeCursor: (cursor: string) => this;
    /**
     * Add delete character to event queue for amount of characters provided
     *
     * @param amount Number of characters to remove
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    deleteChars: (amount: number) => this;
    /**
     * Add an event item to call a callback function
     *
     * @param cb Callback function to call
     * @param thisArg thisArg to use when calling function
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    callFunction: (cb: () => void, thisArg?: any) => this;
    /**
     * Add type character event for each character
     *
     * @param characters Array of characters
     * @param stringPart Original string to be typed out, or potentially part of string if HTML was used
     * @param stringIndex index of all strings to be typed out
     * @param node Node to add character inside of
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    typeCharacters: (characters: string[], stringPart: string, stringIndex?: number, node?: HTMLElement | null, htmlTextInfo?: HTMLTextInfo | null) => this;
    /**
     * Add remove character event for each character
     *
     * @param characters Array of characters
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    removeCharacters: (characters: string[]) => this;
    /**
     * Add an event to the event queue
     *
     * @param eventItem Event queue item
     * @param eventArgs Arguments to pass to event callback
     * @param prepend   Prepend to begining of event queue
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    addEventToQueue: (eventItem: EventQueueItem, prepend?: boolean) => this;
    /**
     * Add an event to reverse called events used for looping
     *
     * @param eventItem Event queue item
     * @param prepend   Prepend to begining of event queue
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    addReverseCalledEvent: (eventItem: EventQueueItem, prepend?: boolean) => this;
    /**
     * Add an event to correct state property
     *
     * @param eventItem Event queue item
     * @param property  Property name of state object
     * @param prepend   Prepend to begining of event queue
     * @return {Typewriter}
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    addEventToStateProperty: (eventItem: EventQueueItem, property: keyof TypewriterState, prepend?: boolean) => this;
    /**
     * Run the event loop and do anything inside of the queue
     *
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    runEventLoop: () => void;
    /**
     * Log a message in development mode
     *
     * @param {Mixed} message Message or item to console.log
     * @author Tameem Safi <tamem@safi.me.uk>
     */
    logInDevMode(message: any): void;
    update(options: Partial<TypewriterOptions>): void;
}
declare const resetStylesAdded: () => void;
export default Typewriter;
export { resetStylesAdded };
export type { TypewriterOptions };
