"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Typewriter_1 = __importStar(require("./Typewriter"));
const constants_1 = require("./constants");
const raf = jest.fn((fn) => {
    fn();
    return 1;
});
const cancelRaf = jest.fn();
const mockAppendChild = ((jest.mocked) =
    jest.fn());
describe("Typewriter", () => {
    let wrapperElement;
    let styleNode;
    beforeEach(() => {
        (0, Typewriter_1.resetStylesAdded)();
        wrapperElement = document.createElement("div");
        wrapperElement.id = "test";
        document.body.appendChild(wrapperElement);
        mockAppendChild.mockImplementation((node) => (styleNode = node));
        document.head.appendChild = mockAppendChild;
        window.requestAnimationFrame = raf;
        window.cancelAnimationFrame = cancelRaf;
        jest.useFakeTimers();
    });
    afterEach(() => {
        styleNode = undefined;
        jest.clearAllTimers();
        jest.resetAllMocks();
    });
    it("should have added styles correctly", () => {
        new Typewriter_1.default(wrapperElement);
        expect(document.head.appendChild).toHaveBeenCalledTimes(1);
        expect(styleNode.innerHTML).toEqual(constants_1.STYLES);
    });
    it("should have added styles only once", () => {
        new Typewriter_1.default(wrapperElement);
        new Typewriter_1.default(wrapperElement);
        new Typewriter_1.default(wrapperElement);
        expect(document.head.appendChild).toHaveBeenCalledTimes(1);
        expect(styleNode.innerHTML).toEqual(constants_1.STYLES);
    });
    it("should not add styles when skip option is passed", () => {
        new Typewriter_1.default(wrapperElement, { skipAddStyles: true });
        expect(document.head.appendChild).toHaveBeenCalledTimes(0);
        expect(styleNode).toEqual(undefined);
    });
    it("shoud setup correctly with default settings", () => {
        const instance = new Typewriter_1.default("#test");
        expect(instance.state).toMatchSnapshot();
        expect(instance.options).toMatchSnapshot();
    });
    it("shoud setup correctly with custom options", () => {
        const options = {
            strings: ["hello", "world"],
            cursor: "+",
            delay: 100,
            deleteSpeed: 500,
            loop: true,
            autoStart: true,
            devMode: true,
            skipAddStyles: true,
            wrapperClassName: "wrapper-class",
            cursorClassName: "cursor-class",
            // stringSplitter: null,
            pauseFor: 1500,
            onCreateTextNode: jest.fn(),
            onRemoveNode: jest.fn(),
        };
        const instance = new Typewriter_1.default("#test", options);
        expect(instance.options).toEqual(options);
    });
    it("should throw error if container wih selector is not found", () => {
        expect(() => {
            new Typewriter_1.default(".hello");
        }).toThrow("Could not find container element");
    });
    it("should correctly setup container element with selector", () => {
        const instance = new Typewriter_1.default("#test");
        expect(instance.state.elements.container).toMatchSnapshot();
    });
    it("should correctly setup container element with element", () => {
        const instance = new Typewriter_1.default(wrapperElement);
        expect(instance.state.elements.container).toMatchSnapshot();
    });
    it("should correctly setup queue if autostart is set to true", () => {
        const instance = new Typewriter_1.default(wrapperElement, {
            strings: ["Hello", "world!"],
            autoStart: true,
        });
        expect(instance.state.eventQueue).toMatchSnapshot();
    });
    describe("methods", () => {
        let instance;
        let instanceInitialOptions;
        beforeEach(() => {
            window.cancelAnimationFrame = cancelRaf;
            instance = new Typewriter_1.default(wrapperElement);
            instanceInitialOptions = { ...instance.options };
        });
        it("start should correctly run event loop", () => {
            instance.runEventLoop = jest.fn();
            instance.start();
            expect(instance.state.eventLoopPaused).toEqual(false);
            expect(instance.runEventLoop).toHaveBeenCalledTimes(1);
        });
        it("pause should correctly set event loop paused state", () => {
            instance.pause();
            expect(instance.state.eventLoopPaused).toEqual(true);
        });
        it("stop should correctly cancel event loop animation frame", () => {
            instance.state.eventLoop = 1;
            instance.stop();
            expect(instance.state.eventLoop).toEqual(null);
            expect(cancelRaf).toHaveBeenCalledTimes(1);
        });
        it("pauseFor should correctly add event item to queue", () => {
            instance.pauseFor(5000);
            const event = instance.state.eventQueue[2];
            if (event.eventName !== "pause_for") {
                throw new Error("Event name is not correct");
            }
            expect(event.eventArgs.ms).toEqual(5000);
        });
        describe("typeOutAllStrings", () => {
            it("should correctly add event item to queue when options.strings is a string", () => {
                instance.options.strings = "Hello world!";
                instance.typeOutAllStrings();
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should correctly add multiple event items to queue when options.strings is an array", () => {
                instance.options.strings = ["Hello", "world!, ", "How", "are", "you?"];
                instance.typeOutAllStrings();
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
        });
        describe("typeString", () => {
            it("should correctly call `typeOutHTMLString` if string contains html", () => {
                instance.typeOutHTMLString = jest.fn();
                instance.typeString("Hello <strong>world</strong>!");
                expect(instance.typeOutHTMLString).toHaveBeenCalledTimes(1);
                expect(instance.state.eventQueue.length).toEqual(2);
                expect(instance.state.eventQueue[0].eventName).toEqual("remove_all");
                expect(instance.state.eventQueue[1].eventName).toEqual("change_cursor");
            });
            it("should correctly add event items to queue if string does not contain html", () => {
                instance.typeString("Hello world!");
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
        });
        describe("pasteString", () => {
            it("should correctly call `typeOutHTMLString` passing `pasteString` true if string contains html", () => {
                instance.typeOutHTMLString = jest.fn();
                instance.pasteString("Hello <strong>world</strong>!");
                expect(instance.state.eventQueue.length).toEqual(3);
                expect(instance.state.eventQueue[0].eventName).toEqual("remove_all");
                expect(instance.state.eventQueue[1].eventName).toEqual("change_cursor");
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "paste_string") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventName).toEqual("paste_string");
                expect(event.eventArgs.htmlTextInfo).not.toBeNull();
            });
            it("should correctly add event items to queue if string does not contain html", () => {
                instance.pasteString("Hello world!");
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
        });
        describe("typeOutHTMLString", () => {
            it("should not add anything to event queue if string is empty", () => {
                instance.typeOutHTMLString("");
                expect(instance.state.eventQueue.length).toEqual(2);
                expect(instance.state.eventQueue[0].eventName).toEqual("remove_all");
                expect(instance.state.eventQueue[1].eventName).toEqual("change_cursor");
            });
            it("should correctly add event item when string contains only string", () => {
                instance.typeOutHTMLString("test");
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should correctly add event items for html wrapper and all string characters", () => {
                instance.typeOutHTMLString("<strong>hello world</strong> <div>how are you?</div> <p>Google</p>!!!!");
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should correctly add event items for nested html and parent node", () => {
                const parentNode = document.createElement("div");
                parentNode.className = "parent-node";
                instance.typeOutHTMLString('<div class="wrapper"><p><strong>test</strong></p>!</div>', 0, parentNode);
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
        });
        describe("deleteAll", () => {
            it("should add remove all event item with natural speed by default", () => {
                instance.deleteAll();
                const event = instance.state.eventQueue[2];
                if (event?.eventName !== "remove_all") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.speed).toEqual("natural");
            });
            it("should add remove all event item with 500ms speed by default", () => {
                instance.deleteAll(500);
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "remove_all") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.speed).toEqual(500);
            });
        });
        describe("changeDeleteSpeed", () => {
            it("should add event item with new speed", () => {
                instance.changeDeleteSpeed(500);
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "change_delete_speed") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.speed).toEqual(500);
            });
            it("should throw error if no new speed is provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.changeDeleteSpeed();
                }).toThrow("Must provide new delete speed");
            });
        });
        describe("changeDelay", () => {
            it("should add event item with new delay", () => {
                instance.changeDelay(500);
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "change_delay") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.delay).toEqual(500);
            });
            it("should throw error if no new speed is provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.changeDelay();
                }).toThrow("Must provide new delay");
            });
        });
        describe("changeCursor", () => {
            it("should add event item with new cursor", () => {
                instance.changeCursor("$");
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "change_cursor") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.cursor).toEqual("$");
            });
            it("should throw error if no new cursor is provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.changeCursor();
                }).toThrow("Must provide new cursor");
            });
        });
        describe("deleteChars", () => {
            it("should add event items for amount of characters", () => {
                instance.deleteChars(10);
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should throw error if amount is not provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.deleteChars();
                }).toThrow("Must provide amount of characters to delete");
            });
        });
        describe("callFunction", () => {
            it("should add event items to call callback function", () => {
                const cb = () => { };
                instance.callFunction(cb);
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "call_function") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.cb).toEqual(cb);
                expect(event.eventArgs.thisArg).toEqual(undefined);
            });
            it("should add event items to call callback function with thisArg", () => {
                const cb = () => { };
                const thisArg = { hello: 1 };
                instance.callFunction(cb, thisArg);
                const event = instance.state.eventQueue[2];
                if (event.eventName !== "call_function") {
                    throw new Error("Event name is not correct");
                }
                expect(event.eventArgs.cb).toEqual(cb);
                expect(event.eventArgs.thisArg).toEqual(thisArg);
            });
            it("should throw error if callback function is not provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.callFunction();
                }).toThrow("Callback must be a function");
            });
            it("should throw error if callback is not a function", () => {
                expect(() => {
                    // @ts-expect-error - checking for bad argument
                    instance.callFunction(false);
                }).toThrow("Callback must be a function");
            });
        });
        describe("typeCharacters", () => {
            it("should add event items for amount of characters", () => {
                instance.typeCharacters(["h", "e", "l", "l", "0"], "hello", 0);
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should throw error if characters param is not provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.typeCharacters();
                }).toThrow("Characters must be an array");
            });
            it("should throw error if characters param is not array", () => {
                expect(() => {
                    // @ts-expect-error - checking for bad argument
                    instance.typeCharacters("test");
                }).toThrow("Characters must be an array");
            });
        });
        describe("removeCharacters", () => {
            it("should add event items for amount of characters", () => {
                instance.removeCharacters(["h", "e", "l", "l", "0"]);
                expect(instance.state.eventQueue).toMatchSnapshot();
            });
            it("should throw error if characters param is not provided", () => {
                expect(() => {
                    // @ts-expect-error - checking for undefined argument
                    instance.removeCharacters();
                }).toThrow("Characters must be an array");
            });
            it("should throw error if characters param is not array", () => {
                expect(() => {
                    // @ts-expect-error - checking for bad argument
                    instance.removeCharacters("test");
                }).toThrow("Characters must be an array");
            });
        });
        describe("addEventToQueue", () => {
            it("should call addEventToStateProperty correctly", () => {
                instance.addEventToStateProperty = jest.fn();
                const eventItem = {
                    eventName: "change_delete_speed",
                    eventArgs: { speed: "natural" },
                };
                instance.addEventToQueue(eventItem, false);
                expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(1);
                expect(instance.addEventToStateProperty).toHaveBeenCalledWith(eventItem, "eventQueue", false);
            });
        });
        describe("addReverseCalledEvent", () => {
            it("should call addEventToStateProperty correctly when loop options is true", () => {
                instance.options.loop = true;
                instance.addEventToStateProperty = jest.fn();
                const eventItem = {
                    eventName: "change_delete_speed",
                    eventArgs: { speed: "natural" },
                };
                instance.addReverseCalledEvent(eventItem, false);
                expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(1);
                expect(instance.addEventToStateProperty).toHaveBeenCalledWith(eventItem, "reverseCalledEvents", false);
            });
            it("should not call addEventToStateProperty correctly when loop options is false", () => {
                instance.options.loop = false;
                instance.addEventToStateProperty = jest.fn();
                const eventItem = {
                    eventName: "change_delete_speed",
                    eventArgs: { speed: "natural" },
                };
                instance.addReverseCalledEvent(eventItem, false);
                expect(instance.addEventToStateProperty).toHaveBeenCalledTimes(0);
            });
        });
        describe("addEventToStateProperty", () => {
            it("should append event item correctly", () => {
                const eventItem = {
                    eventName: "change_delete_speed",
                    eventArgs: { speed: "natural" },
                };
                instance.state.eventQueue = [
                    { eventName: "remove_character", eventArgs: {} },
                ];
                instance.addEventToStateProperty(eventItem, "eventQueue", false);
                expect(instance.state.eventQueue[1]).toEqual(eventItem);
            });
            it("should prepend event item correctly", () => {
                const eventItem = {
                    eventName: "change_delete_speed",
                    eventArgs: { speed: "natural" },
                };
                instance.state.eventQueue = [
                    { eventName: "remove_character", eventArgs: {} },
                ];
                instance.addEventToStateProperty(eventItem, "eventQueue", true);
                expect(instance.state.eventQueue[0]).toEqual(eventItem);
            });
        });
        describe("runEventLoop", () => {
            const events = [
                { eventName: "change_delay", eventArgs: { delay: 5000 } },
            ];
            beforeEach(() => {
                window.requestAnimationFrame = raf;
            });
            it("should call raf method correctly", () => {
                instance.typeString("test").runEventLoop();
                expect(raf).toHaveBeenCalledTimes(1);
            });
            it("should not run if event queue is empty and loop option is false", () => {
                instance.options.loop = false;
                instance.state.eventQueue = [];
                instance.runEventLoop();
                expect(raf).toHaveBeenCalledTimes(0);
            });
            it("should reset queue correctly if event queue is empty and loop option is true", () => {
                instance.options.loop = true;
                instance.state.eventQueue = [];
                instance.state.calledEvents = events;
                instance.runEventLoop();
                expect(instance.state.eventQueue).toMatchSnapshot();
                expect(instance.state.calledEvents).toEqual([]);
                expect(instance.options).toEqual(instanceInitialOptions);
            });
            it("should not run if event loop is paused", () => {
                instance.state.eventQueue = [...events];
                instance.state.eventLoopPaused = true;
                instance.runEventLoop();
                expect(instance.state.eventQueue).toEqual(events);
            });
            it("should not run until pause is finished if there is a pause time set", () => {
                instance.state.eventQueue = [...events];
                instance.state.pauseUntil = Date.now() + 5000;
                jest.advanceTimersByTime(1000);
                instance.runEventLoop();
                expect(instance.state.eventQueue).toEqual(events);
            });
            it("should run and clear pause if there is a pause time set and current time exceeds pause", () => {
                instance.options.delay = 0;
                instance.state.lastFrameTime = Date.now() + 100;
                instance.state.eventQueue = [...events];
                instance.state.eventLoopPaused = false;
                instance.state.pauseUntil = Date.now() + 5000;
                jest.advanceTimersByTime(10000);
                instance.runEventLoop();
                expect(instance.state.pauseUntil).toEqual(null);
                expect(instance.state.eventQueue).toEqual([]);
            });
            it("should not run loop if time between last frame is less than the delay", () => {
                instance.options.delay = 0;
                instance.state.lastFrameTime = 0;
                instance.state.eventQueue = [...events];
                instance.state.eventLoopPaused = false;
                instance.runEventLoop();
                expect(instance.state.eventQueue).toEqual(events);
            });
            describe("valid delta", () => {
                let logInDevMode = jest.fn();
                beforeEach(() => {
                    logInDevMode = jest.fn();
                    instance.options.delay = 0;
                    instance.state.eventQueue = [...events];
                    instance.logInDevMode = logInDevMode;
                    instance.state.lastFrameTime = Date.now() + 100;
                    jest.advanceTimersByTime(10000);
                });
                it("should use correct natural delay speed", () => {
                    instance.options.delay = "natural";
                    instance.runEventLoop();
                    expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
                    expect(logInDevMode.mock.calls[0][0].delay).toBeGreaterThanOrEqual(120);
                    expect(logInDevMode.mock.calls[0][0].delay).toBeLessThanOrEqual(160);
                });
                it("should use correct delay speed", () => {
                    instance.options.delay = 50;
                    instance.runEventLoop();
                    expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
                    expect(logInDevMode.mock.calls[0][0].delay).toEqual(50);
                });
                it("should use correct natural delay speed when removing character", () => {
                    instance.state.eventQueue = [
                        { eventName: "remove_character", eventArgs: {} },
                    ];
                    instance.options.deleteSpeed = "natural";
                    instance.runEventLoop();
                    expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
                    expect(logInDevMode.mock.calls[0][0].delay).toBeGreaterThanOrEqual(40);
                    expect(logInDevMode.mock.calls[0][0].delay).toBeLessThanOrEqual(80);
                });
                it("should use correct delay speed when removing character", () => {
                    instance.state.eventQueue = [
                        { eventName: "remove_character", eventArgs: {} },
                    ];
                    instance.options.deleteSpeed = 25;
                    instance.runEventLoop();
                    expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
                    expect(logInDevMode.mock.calls[0][0].delay).toEqual(25);
                });
                it("should call log in dev mode function with current event and state", () => {
                    instance.runEventLoop();
                    expect(instance.logInDevMode).toHaveBeenCalledTimes(1);
                    expect(instance.logInDevMode).toHaveBeenCalledWith({
                        currentEvent: { ...events[0] },
                        state: { ...instance.state },
                        delay: 0,
                    });
                });
                it(`should add called event to state if event is not ${"remove_all"} or ${"remove_character"} when loop option is true`, () => {
                    const event = {
                        eventName: "type_character",
                        eventArgs: {
                            character: "t",
                            node: null,
                            stringPart: "t",
                            characterIndex: 0,
                            stringIndex: 0,
                            htmlTextInfo: null,
                        },
                    };
                    instance.options.loop = true;
                    instance.state.eventQueue = [event];
                    instance.runEventLoop();
                    expect(instance.state.calledEvents[0]).toEqual(event);
                });
                it(`should not add called event to state if event is ${"remove_last_visible_node"} when loop option is true`, () => {
                    const event = {
                        eventName: "remove_last_visible_node",
                        eventArgs: {
                            removingCharacterNode: true,
                        },
                    };
                    instance.options.loop = true;
                    instance.state.eventQueue = [event];
                    instance.runEventLoop();
                    expect(instance.state.calledEvents).toEqual([]);
                });
                it(`should not add called event to state if eventArgs has temp value when loop option is true`, () => {
                    const event = {
                        eventName: "change_delete_speed",
                        eventArgs: { speed: null, temp: true },
                    };
                    instance.options.loop = true;
                    instance.state.eventQueue = [event];
                    instance.runEventLoop();
                    expect(instance.state.calledEvents).toEqual([]);
                });
                it("should set last fame time correcly", () => {
                    const currentTime = Date.now();
                    instance.state.lastFrameTime = currentTime;
                    jest.advanceTimersByTime(2000);
                    instance.runEventLoop();
                    expect(instance.state.lastFrameTime).toEqual(currentTime + 2000);
                });
                describe(`${"type_character"}`, () => {
                    beforeEach(() => {
                        instance.state.eventQueue = [
                            {
                                eventName: "type_character",
                                eventArgs: {
                                    character: "t",
                                    node: null,
                                    stringPart: "t",
                                    characterIndex: 0,
                                    stringIndex: 0,
                                    htmlTextInfo: null,
                                },
                            },
                        ];
                    });
                    it("should append child to wrapper if node element is not provided", () => {
                        const mock = jest.fn();
                        instance.state.elements.wrapper.appendChild = mock;
                        instance.runEventLoop();
                        expect(mock).toHaveBeenCalledTimes(1);
                        expect(mock.mock.calls[0][0].textContent).toEqual("t");
                        expect(instance.state.visibleNodes).toEqual([
                            expect.objectContaining({
                                type: "text_node",
                                node: mock.mock.calls[0][0],
                                character: "t",
                            }),
                        ]);
                    });
                    it("should append child to node if provided", () => {
                        const node = { appendChild: jest.fn() };
                        // @ts-expect-error - ignoring this for now
                        instance.state.eventQueue[0].eventArgs.node = node;
                        instance.runEventLoop();
                        expect(node.appendChild).toHaveBeenCalledTimes(1);
                        expect(node.appendChild.mock.calls[0][0].textContent).toEqual("t");
                        expect(instance.state.visibleNodes).toEqual([
                            expect.objectContaining({
                                type: "text_node",
                                node: node.appendChild.mock.calls[0][0],
                                character: "t",
                            }),
                        ]);
                    });
                });
                describe(`${"remove_character"}`, () => {
                    it(`should prepend ${"remove_last_visible_node"} to event queue`, () => {
                        instance.state.eventQueue = [
                            {
                                eventName: "remove_character",
                                eventArgs: {},
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.state.eventQueue).toEqual([
                            {
                                eventName: "remove_last_visible_node",
                                eventArgs: { removingCharacterNode: true },
                            },
                        ]);
                    });
                });
                describe(`${"pause_for"}`, () => {
                    it("should change pauseUntil state based on event args", () => {
                        instance.state.eventQueue = [
                            {
                                eventName: "pause_for",
                                eventArgs: { ms: 1000 },
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.state.pauseUntil).toEqual(Date.now() + 1000);
                    });
                });
                describe(`${"call_function"}`, () => {
                    it("should call callback function with object containing elements in state", () => {
                        const cb = jest.fn();
                        instance.state.eventQueue = [
                            {
                                eventName: "call_function",
                                eventArgs: {
                                    cb,
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(cb).toHaveBeenCalledTimes(1);
                        expect(cb).toHaveBeenCalledWith({
                            elements: { ...instance.state.elements },
                        });
                    });
                });
                describe(`${"add_html_tag_element"}`, () => {
                    it("should append node to the wrapepr element", () => {
                        const node = document.createElement("div");
                        instance.state.elements.wrapper.appendChild = jest.fn();
                        instance.state.eventQueue = [
                            {
                                eventName: "add_html_tag_element",
                                eventArgs: {
                                    node,
                                    parentNode: null,
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledTimes(1);
                        expect(instance.state.elements.wrapper.appendChild).toHaveBeenCalledWith(node);
                        expect(instance.state.visibleNodes).toEqual([
                            {
                                type: "html_tag",
                                node,
                                parentNode: instance.state.elements.wrapper,
                            },
                        ]);
                    });
                    it("should append node to parent node if passed as eventArgs", () => {
                        const node = document.createElement("div");
                        const parentNode = document.createElement("div");
                        parentNode.className = "parent-node";
                        parentNode.appendChild = jest.fn();
                        instance.state.eventQueue = [
                            {
                                eventName: "add_html_tag_element",
                                eventArgs: {
                                    node,
                                    parentNode,
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(parentNode.appendChild).toHaveBeenCalledTimes(1);
                        expect(parentNode.appendChild).toHaveBeenCalledWith(node);
                        expect(instance.state.visibleNodes).toEqual([
                            {
                                type: "html_tag",
                                node,
                                parentNode,
                            },
                        ]);
                    });
                });
                describe(`${"remove_all"}`, () => {
                    beforeEach(() => {
                        instance.state.visibleNodes = [
                            {
                                type: "html_tag",
                                node: null,
                                parentNode: document.createElement("div"),
                            },
                        ];
                        instance.state.eventQueue = [
                            {
                                eventName: "remove_all",
                                eventArgs: {
                                    speed: null,
                                },
                            },
                        ];
                    });
                    it("should correctly push remove last node events without speed change", () => {
                        instance.runEventLoop();
                        expect(instance.state.eventQueue).toMatchSnapshot();
                    });
                    it("should correctly push remove last node events with speed change when provided", () => {
                        instance.options.deleteSpeed = 10;
                        // @ts-expect-error -- ignoring this type error for now
                        instance.state.eventQueue[0].eventArgs.speed = 100;
                        instance.runEventLoop();
                        expect(instance.state.eventQueue).toMatchSnapshot();
                    });
                });
                describe(`${"remove_last_visible_node"}`, () => {
                    let node;
                    beforeEach(() => {
                        node = {
                            parentNode: { removeChild: jest.fn() },
                        };
                        instance.state.eventQueue = [
                            {
                                eventName: "remove_last_visible_node",
                                eventArgs: {
                                    removingCharacterNode: true,
                                },
                            },
                        ];
                    });
                    it("should remove visible node correctly", () => {
                        instance.state.visibleNodes = [
                            {
                                type: "text_node",
                                node,
                                character: "a",
                                characterIndex: 0,
                                stringIndex: 0,
                                currentString: "a string",
                            },
                        ];
                        instance.runEventLoop();
                        expect(node.parentNode.removeChild).toHaveBeenCalledTimes(1);
                        expect(node.parentNode.removeChild).toHaveBeenCalledWith(node);
                        expect(instance.state.visibleNodes).toEqual([]);
                    });
                    it("should remove visible node correctly and add an extra remove event if type was html tag", () => {
                        instance.state.visibleNodes = [
                            {
                                type: "html_tag",
                                node,
                                parentNode: document.createElement("div"),
                            },
                        ];
                        instance.runEventLoop();
                        expect(node.parentNode.removeChild).toHaveBeenCalledTimes(1);
                        expect(node.parentNode.removeChild).toHaveBeenCalledWith(node);
                        expect(instance.state.visibleNodes).toEqual([]);
                        expect(instance.state.eventQueue[0]?.eventName).toEqual("remove_last_visible_node");
                    });
                });
                describe(`${"change_delete_speed"}`, () => {
                    it("should set options delete speed correctly", () => {
                        instance.state.eventQueue = [
                            {
                                eventName: "change_delete_speed",
                                eventArgs: {
                                    speed: 6000,
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.options.deleteSpeed).toEqual(6000);
                    });
                });
                describe(`${"change_delay"}`, () => {
                    it("should set options delay correctly", () => {
                        instance.state.eventQueue = [
                            {
                                eventName: "change_delay",
                                eventArgs: {
                                    delay: 6000,
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.options.delay).toEqual(6000);
                    });
                });
                describe(`${"change_cursor"}`, () => {
                    it("should set options and inner html of cursor element correctly", () => {
                        instance.state.elements.cursor = document.createElement("div");
                        instance.state.eventQueue = [
                            {
                                eventName: "change_cursor",
                                eventArgs: {
                                    cursor: "$$$$",
                                },
                            },
                        ];
                        instance.runEventLoop();
                        expect(instance.options.cursor).toEqual("$$$$");
                        expect(instance.state.elements.cursor.innerHTML).toEqual("$$$$");
                    });
                });
            });
        });
        describe("logInDevMode", () => {
            it("should log message to console when option devMode is true", () => {
                const spy = jest
                    .spyOn(global.console, "log")
                    .mockImplementation(() => { });
                instance.options.devMode = true;
                instance.logInDevMode("test");
                expect(spy).toHaveBeenCalledTimes(1);
                expect(spy).toHaveBeenCalledWith("test");
            });
            it("should not log message to console when option devMode is false", () => {
                const spy = jest
                    .spyOn(global.console, "log")
                    .mockImplementation(() => { });
                instance.options.devMode = false;
                instance.logInDevMode("test");
                expect(spy).toHaveBeenCalledTimes(0);
            });
        });
    });
});
//# sourceMappingURL=Typewriter.spec.js.map