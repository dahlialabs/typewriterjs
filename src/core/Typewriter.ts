import {
  doesStringContainHTMLTag,
  getDOMElementFromString,
  getRandomInteger,
  addStyles,
} from "../utils";
import { VISIBLE_NODE_TYPES, STYLES } from "./constants";

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

export type EventQueueItem =
  | {
      eventName: "type_character";
      eventArgs: {
        character: string;
        node: HTMLElement | null;
        stringPart: string;
        characterIndex: number;
        stringIndex: number;
        htmlTextInfo: HTMLTextInfo | null;
      };
    }
  | {
      eventName: "paste_string";
      eventArgs: {
        character: string;
        node: HTMLElement | null;
        htmlTextInfo: HTMLTextInfo | null;
      };
    }
  | {
      eventName: "remove_character";
      eventArgs: {};
    }
  | {
      eventName: "remove_last_visible_node";
      eventArgs: {
        removingCharacterNode: boolean;
      };
    }
  | {
      eventName: "pause_for";
      eventArgs: {
        ms: number;
      };
    }
  | {
      eventName: "call_function";
      eventArgs: {
        cb: (args: { elements: TypewriterState["elements"] }) => void;
        thisArg?: any;
      };
    }
  | {
      eventName: "add_html_tag_element";
      eventArgs: {
        node: HTMLElement;
        parentNode: HTMLElement | null;
      };
    }
  | {
      eventName: "remove_all";
      eventArgs: {
        speed: Speed | null;
      };
    }
  | {
      eventName: "change_delete_speed";
      eventArgs: {
        speed: Speed | null;
        temp?: boolean;
      };
    }
  | {
      eventName: "remove_last_visible_node";
      eventArgs: {
        removingCharacterNode?: boolean;
      };
    }
  | {
      eventName: "change_delay";
      eventArgs: {
        delay: Speed;
      };
    }
  | {
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

const DEFAULT_OPTIONS: TypewriterOptions = {
  strings: [],
  cursor: "|",
  delay: "natural",
  pauseFor: 1500,
  deleteSpeed: "natural",
  loop: false,
  autoStart: false,
  devMode: false,
  skipAddStyles: false,
  wrapperClassName: "Typewriter__wrapper",
  cursorClassName: "Typewriter__cursor",
  stringSplitter: undefined,
  onCreateTextNode: undefined,
  onRemoveNode: undefined,
};

let ___TYPEWRITER_JS_STYLES_ADDED___ = false;

class Typewriter {
  state: TypewriterState = {
    cursorAnimation: null,
    lastFrameTime: null,
    pauseUntil: null,
    eventQueue: [],
    eventLoop: null,
    eventLoopPaused: false,
    reverseCalledEvents: [],
    calledEvents: [],
    visibleNodes: [],
    initialOptions: DEFAULT_OPTIONS,
    elements: {
      container: document.createElement("span"),
      wrapper: document.createElement("span"),
      cursor: document.createElement("span"),
    },
  };

  options: TypewriterOptions;

  /**
   *
   * @param container HTMLElement of the container or string selector
   * @param options
   */
  constructor(container: HTMLElement | string, options?: TypewriterOptions) {
    if (container) {
      if (typeof container === "string") {
        const containerElement = document.querySelector(container);

        if (!containerElement || !(containerElement instanceof HTMLElement)) {
          throw new Error("Could not find container element");
        }

        this.state.elements.container = containerElement;
      } else {
        this.state.elements.container = container;
      }
    }

    const mergedOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    this.options = mergedOptions;

    // Make a copy of the options used to reset options when looping
    this.state.initialOptions = { ...mergedOptions };

    this.init();
  }

  init() {
    this.setupWrapperElement();
    this.addEventToQueue(
      {
        eventName: "change_cursor",
        eventArgs: { cursor: this.options.cursor || null },
      },
      true
    );
    this.addEventToQueue(
      {
        eventName: "remove_all",
        eventArgs: {
          speed: null,
        },
      },
      true
    );

    if (!___TYPEWRITER_JS_STYLES_ADDED___ && !this.options.skipAddStyles) {
      addStyles(STYLES);
      ___TYPEWRITER_JS_STYLES_ADDED___ = true;
    }

    if (this.options.autoStart === true && this.options.strings) {
      this.typeOutAllStrings().start();
    }
  }

  /**
   * Replace all child nodes of provided element with
   * state wrapper element used for typewriter effect
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  setupWrapperElement = () => {
    if (!this.state.elements.container) {
      return;
    }

    this.state.elements.wrapper.className = this.options.wrapperClassName || "";
    this.state.elements.cursor.className = this.options.cursorClassName || "";

    this.state.elements.cursor.innerHTML = this.options.cursor || "";
    this.state.elements.container.innerHTML = "";

    this.state.elements.container.appendChild(this.state.elements.wrapper);
    this.state.elements.container.appendChild(this.state.elements.cursor);
  };

  /**
   * Start typewriter effect
   */
  start = () => {
    this.state.eventLoopPaused = false;
    this.runEventLoop();

    return this;
  };

  /**
   * Pause the event loop
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  pause = () => {
    this.state.eventLoopPaused = true;

    return this;
  };

  /**
   * Destroy current running instance
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  stop = () => {
    if (this.state.eventLoop) {
      window.cancelAnimationFrame(this.state.eventLoop);
      this.state.eventLoop = null;
    }

    return this;
  };

  /**
   * Add pause event to queue for ms provided
   *
   * @param ms Time in ms to pause for
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  pauseFor = (ms: number = 0) => {
    this.addEventToQueue({ eventName: "pause_for", eventArgs: { ms } });

    return this;
  };

  /**
   * Start typewriter effect by typing
   * out all strings provided
   *
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  typeOutAllStrings = () => {
    if (typeof this.options.strings === "string") {
      this.typeString(this.options.strings).pauseFor(
        this.options.pauseFor || 0
      );
      return this;
    }

    (this.options.strings || []).forEach((string, i) => {
      this.typeString(string, {
        stringIndex: i,
      })
        .pauseFor(this.options.pauseFor || 0)
        .deleteAll(this.options.deleteSpeed);
    });

    return this;
  };

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
  typeString = (
    string: string,
    {
      node = null,
      stringIndex = 0,
      htmlTextInfo = null,
    }: {
      node?: HTMLElement | null;
      stringIndex?: number;
      htmlTextInfo?: HTMLTextInfo | null;
    } = {}
  ) => {
    if (doesStringContainHTMLTag(string)) {
      return this.typeOutHTMLString(string, stringIndex, node);
    }

    if (string) {
      const { stringSplitter } = this.options || {};
      const characters =
        typeof stringSplitter === "function"
          ? stringSplitter(string)
          : string.split("");
      this.typeCharacters(characters, string, stringIndex, node, htmlTextInfo);
    }

    return this;
  };

  /**
   * Adds entire strings to event queue for paste effect
   *
   * @param string String to paste
   * @param node Node to add string inside of
   * @return {Typewriter}
   *
   * @author Luiz Felicio <unifelicio@gmail.com>
   */
  pasteString = (
    string: string,
    stringIndex: number = 0,
    node: HTMLElement | null = null,
    htmlTextInfo: HTMLTextInfo | null = null
  ) => {
    if (doesStringContainHTMLTag(string)) {
      return this.typeOutHTMLString(string, stringIndex, node, true);
    }

    if (string) {
      this.addEventToQueue({
        eventName: "paste_string",
        eventArgs: {
          character: string,
          node,
          htmlTextInfo,
        },
      });
    }

    return this;
  };

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
  typeOutHTMLString = (
    string: string,
    stringIndex: number = 0,
    parentNode: HTMLElement | null = null,
    pasteEffect?: boolean
  ) => {
    const childNodes = getDOMElementFromString(string);

    if (childNodes.length > 0) {
      const allTextParts = Array.from(childNodes).map(
        (node) => node.textContent || ""
      );
      for (let i = 0; i < childNodes.length; i++) {
        const node = childNodes[i];
        if (!node) {
          continue;
        }
        const nodeText = node.textContent || "";
        const htmlTextInfo: HTMLTextInfo = {
          text: nodeText,
          partIndex: i,
          parts: allTextParts,
          originalString: string,
        };

        if (node && node instanceof HTMLElement) {
          // Reset innerText of HTML element
          node.innerHTML = "";

          // Add event queue item to insert HTML tag before typing characters
          this.addEventToQueue({
            eventName: "add_html_tag_element",
            eventArgs: {
              node,
              parentNode,
            },
          });

          pasteEffect
            ? this.pasteString(nodeText, stringIndex, node)
            : this.typeString(nodeText, {
                node,
                stringIndex,
                htmlTextInfo,
              });
        } else {
          if (node.textContent) {
            pasteEffect
              ? this.pasteString(node.textContent, stringIndex, parentNode)
              : this.typeString(node.textContent, {
                  node: parentNode,
                  stringIndex,
                  htmlTextInfo,
                });
          }
        }
      }
    }

    return this;
  };

  /**
   * Add delete all characters to event queue
   *
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteAll = (speed: TypewriterOptions["deleteSpeed"] = "natural") => {
    this.addEventToQueue({
      eventName: "remove_all",
      eventArgs: { speed },
    });
    return this;
  };

  /**
   * Change delete speed
   *
   * @param speed Speed to use for deleting characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  changeDeleteSpeed = (speed: Speed) => {
    if (!speed) {
      throw new Error("Must provide new delete speed");
    }

    this.addEventToQueue({
      eventName: "change_delete_speed",
      // @todo check if temp should be required here
      eventArgs: { speed },
    });

    return this;
  };

  /**
   * Change delay when typing
   *
   * @param delay Delay when typing out characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  changeDelay = (delay: Speed) => {
    if (!delay) {
      throw new Error("Must provide new delay");
    }

    this.addEventToQueue({
      eventName: "change_delay",
      eventArgs: { delay },
    });

    return this;
  };

  /**
   * Change cursor
   *
   * @param character/string to represent as cursor
   * @return {Typewriter}
   *
   * @author Y.Paing <ye@y3p.io>
   */
  changeCursor = (cursor: string) => {
    if (!cursor) {
      throw new Error("Must provide new cursor");
    }

    this.addEventToQueue({
      eventName: "change_cursor",
      eventArgs: { cursor },
    });

    return this;
  };

  /**
   * Add delete character to event queue for amount of characters provided
   *
   * @param amount Number of characters to remove
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  deleteChars = (amount: number) => {
    if (!amount) {
      throw new Error("Must provide amount of characters to delete");
    }

    for (let i = 0; i < amount; i++) {
      this.addEventToQueue({
        eventName: "remove_character",
        eventArgs: {},
      });
    }

    return this;
  };

  /**
   * Add an event item to call a callback function
   *
   * @param cb Callback function to call
   * @param thisArg thisArg to use when calling function
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  callFunction = (cb: () => void, thisArg?: any) => {
    if (!cb || typeof cb !== "function") {
      throw new Error("Callback must be a function");
    }

    this.addEventToQueue({
      eventName: "call_function",
      eventArgs: { cb, thisArg },
    });

    return this;
  };

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
  typeCharacters = (
    characters: string[],
    stringPart: string,
    stringIndex: number = 0,
    node: HTMLElement | null = null,
    htmlTextInfo: HTMLTextInfo | null = null
  ) => {
    if (!characters || !Array.isArray(characters)) {
      throw new Error("Characters must be an array");
    }

    characters.forEach((character, i) => {
      this.addEventToQueue({
        eventName: "type_character",
        eventArgs: {
          character,
          characterIndex: i,
          node,
          stringPart,
          stringIndex,
          htmlTextInfo,
        },
      });
    });

    return this;
  };

  /**
   * Add remove character event for each character
   *
   * @param characters Array of characters
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  removeCharacters = (characters: string[]) => {
    if (!characters || !Array.isArray(characters)) {
      throw new Error("Characters must be an array");
    }

    characters.forEach(() => {
      this.addEventToQueue({
        eventName: "remove_character",
        eventArgs: {},
      });
    });

    return this;
  };

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
  addEventToQueue = (eventItem: EventQueueItem, prepend = false) => {
    return this.addEventToStateProperty(eventItem, "eventQueue", prepend);
  };

  /**
   * Add an event to reverse called events used for looping
   *
   * @param eventItem Event queue item
   * @param prepend   Prepend to begining of event queue
   * @return {Typewriter}
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  addReverseCalledEvent = (eventItem: EventQueueItem, prepend = false) => {
    const { loop } = this.options;

    if (!loop) {
      return this;
    }

    return this.addEventToStateProperty(
      eventItem,
      "reverseCalledEvents",
      prepend
    );
  };

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
  addEventToStateProperty = (
    eventItem: EventQueueItem,
    property: keyof TypewriterState,
    prepend = false
  ) => {
    if (prepend) {
      // @ts-ignore - fix the typing here
      this.state[property] = [eventItem, ...this.state[property]];
    } else {
      // @ts-ignore - fix the typing here
      this.state[property] = [...this.state[property], eventItem];
    }

    return this;
  };

  /**
   * Run the event loop and do anything inside of the queue
   *
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  runEventLoop = () => {
    const hasntRunYet = !this.state.lastFrameTime;
    if (!this.state.lastFrameTime) {
      this.state.lastFrameTime = Date.now();
    }

    // Setup variables to calculate if this frame should run
    const nowTime = Date.now();
    const delta = nowTime - this.state.lastFrameTime;

    if (!this.state.eventQueue.length) {
      if (!this.options.loop) {
        return;
      }

      // Reset event queue if we are looping
      this.state.eventQueue = [...this.state.calledEvents];

      if (this.options.loopDelay && hasntRunYet) {
        this.state.eventQueue.unshift({
          eventName: "pause_for",
          eventArgs: { ms: this.options.loopDelay },
        });
      }

      this.state.calledEvents = [];
      this.options = { ...this.state.initialOptions };
    }

    // Request next frame
    this.state.eventLoop = window.requestAnimationFrame(this.runEventLoop);

    // Check if event loop is paused
    if (this.state.eventLoopPaused) {
      return;
    }

    // Check if state has pause until time
    if (this.state.pauseUntil) {
      // Check if event loop should be paused
      if (nowTime < this.state.pauseUntil) {
        return;
      }

      // Reset pause time
      this.state.pauseUntil = null;
    }

    // Make a clone of event queue
    const eventQueue = [...this.state.eventQueue];

    // Get first event from queue
    const currentEvent = eventQueue.shift();

    // Setup delay variable
    let delay = 0;

    if (!currentEvent) {
      return;
    }

    // Check if frame should run or be
    // skipped based on fps interval
    if (
      currentEvent.eventName === "remove_last_visible_node" ||
      currentEvent.eventName === "remove_character"
    ) {
      delay = getDeleteDelay(this.options, currentEvent.eventArgs);
    } else {
      delay = getDelay(this.options, currentEvent.eventArgs);
    }

    if (delta <= delay) {
      return;
    }

    // Get current event args
    const { eventName, eventArgs } = currentEvent;

    this.logInDevMode({ currentEvent, state: this.state, delay });

    // Run item from event loop
    switch (eventName) {
      case "paste_string":
      case "type_character": {
        const { character, node, htmlTextInfo } = eventArgs;

        let stringPart = "";
        let characterIndex = 0;
        let stringIndex = 0;

        if (eventName === "type_character") {
          stringPart = eventArgs.stringPart;
          characterIndex = eventArgs.characterIndex;
          stringIndex = eventArgs.stringIndex;
        }

        const textNode = document.createTextNode(character);

        let textNodeToUse: Text | null = textNode;

        if (
          this.options.onCreateTextNode &&
          typeof this.options.onCreateTextNode === "function"
        ) {
          textNodeToUse = this.options.onCreateTextNode(character, textNode);
        }

        if (textNodeToUse) {
          if (node) {
            node.appendChild(textNodeToUse);
          } else {
            this.state.elements.wrapper.appendChild(textNodeToUse);
          }
        }

        this.state.visibleNodes = [
          ...this.state.visibleNodes,
          {
            type: VISIBLE_NODE_TYPES.TEXT_NODE,
            character,
            characterIndex,
            currentString: stringPart,
            stringIndex,
            node: textNodeToUse,
          },
        ];

        this.options.onType?.({
          typewriter: this,
          character,
          characterIndex,
          stringIndex,
          currentString: stringPart,
          htmlTextInfo,
        });

        break;
      }

      case "remove_character": {
        eventQueue.unshift({
          eventName: "remove_last_visible_node",
          eventArgs: { removingCharacterNode: true },
        });
        break;
      }

      case "pause_for": {
        const { ms } = currentEvent.eventArgs;
        this.state.pauseUntil = Date.now() + ms;
        break;
      }

      case "call_function": {
        const { cb, thisArg } = currentEvent.eventArgs;

        cb.call(thisArg, {
          elements: this.state.elements,
        });

        break;
      }

      case "add_html_tag_element": {
        const { node, parentNode } = currentEvent.eventArgs;

        if (!parentNode) {
          this.state.elements.wrapper.appendChild(node);
        } else {
          parentNode.appendChild(node);
        }

        this.state.visibleNodes = [
          ...this.state.visibleNodes,
          {
            type: VISIBLE_NODE_TYPES.HTML_TAG,
            node,
            parentNode: parentNode || this.state.elements.wrapper,
          },
        ];
        break;
      }

      case "remove_all": {
        const { visibleNodes } = this.state;
        const { speed } = eventArgs;
        const removeAllEventItems: EventQueueItem[] = [];

        // Change speed before deleting
        if (speed) {
          removeAllEventItems.push({
            eventName: "change_delete_speed",
            eventArgs: { speed, temp: true },
          });
        }

        for (let i = 0, length = visibleNodes.length; i < length; i++) {
          removeAllEventItems.push({
            eventName: "remove_last_visible_node",
            eventArgs: { removingCharacterNode: false },
          });
        }

        // Change speed back to normal after deleteing
        if (speed) {
          removeAllEventItems.push({
            eventName: "change_delete_speed",
            // @todo check this in case we need to update the speed param
            // for this event to be non-nullable
            eventArgs: { speed: this.options.deleteSpeed || null, temp: true },
          });
        }

        eventQueue.unshift(...removeAllEventItems);

        break;
      }

      case "remove_last_visible_node": {
        const { removingCharacterNode } = currentEvent.eventArgs;
        const lastVisibleNode = this.state.visibleNodes.pop();

        if (lastVisibleNode) {
          const {
            type,
            node,
            character,
            characterIndex,
            currentString,
            stringIndex,
          } = lastVisibleNode;

          this.options.onRemoveNode?.({
            node,
            character,
          });

          if (node) {
            node.parentNode?.removeChild(node);
          }

          // Remove extra node as current deleted one is just an empty wrapper node
          if (type === VISIBLE_NODE_TYPES.HTML_TAG && removingCharacterNode) {
            eventQueue.unshift({
              eventName: "remove_last_visible_node",
              // @todo check if this should set removingCharacterNode to false
              eventArgs: {},
            });
          }

          this.options.onDelete?.({
            typewriter: this,
            character: character ?? "",
            characterIndex: characterIndex ?? -1,
            currentString: currentString ?? "",
            stringIndex: stringIndex ?? -1,
          });
        }
        break;
      }

      case "change_delete_speed": {
        this.options.deleteSpeed = currentEvent.eventArgs.speed || undefined;
        break;
      }

      case "change_delay": {
        this.options.delay = currentEvent.eventArgs.delay;
        break;
      }

      case "change_cursor": {
        this.options.cursor = currentEvent.eventArgs.cursor || undefined;
        this.state.elements.cursor.innerHTML =
          currentEvent.eventArgs.cursor || "";
        break;
      }

      default: {
        break;
      }
    }

    // Add que item to called queue if we are looping
    if (this.options.loop) {
      if (
        currentEvent.eventName !== "remove_last_visible_node" &&
        !(currentEvent.eventArgs && "temp" in currentEvent.eventArgs)
      ) {
        this.state.calledEvents = [...this.state.calledEvents, currentEvent];
      }
    }

    // Replace state event queue with cloned queue
    this.state.eventQueue = eventQueue;

    // Set last frame time so it can be used to calculate next frame
    this.state.lastFrameTime = nowTime;
  };

  /**
   * Log a message in development mode
   *
   * @param {Mixed} message Message or item to console.log
   * @author Tameem Safi <tamem@safi.me.uk>
   */
  logInDevMode(message: any) {
    if (this.options.devMode) {
      console.log(message);
    }
  }

  update(options: Partial<TypewriterOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };
  }
}

function getDelay(options: TypewriterOptions, eventArgs?: any) {
  if (typeof options.delay === "number") {
    return options.delay;
  }

  if (typeof options.delay === "function") {
    return options.delay(eventArgs);
  }

  return getRandomInteger(120, 160);
}

function getDeleteDelay(options: TypewriterOptions, eventArgs?: any) {
  if (typeof options.deleteSpeed === "number") {
    return options.deleteSpeed;
  }

  if (typeof options.deleteSpeed === "function") {
    return options.deleteSpeed(eventArgs);
  }

  return getRandomInteger(40, 80);
}

const resetStylesAdded = () => {
  ___TYPEWRITER_JS_STYLES_ADDED___ = false;
};

export default Typewriter;
export { resetStylesAdded };
export type { TypewriterOptions };
