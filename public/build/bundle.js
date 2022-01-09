
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.3' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const initTablets = [
        { sDirection: true, threads: [{ color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }] },
        { sDirection: true, threads: [{ color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, { color: "#ffffff" }] },
        { sDirection: true, threads: [{ color: "#ffffff" }, { color: "#d3d7cf" }, { color: "#ffffff" }, { color: "#ffffff" }] },
        { sDirection: true, threads: [{ color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }, { color: "#204a87" }] }
    ];
    const storedWeaveRows = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
    const storedTablets = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
    const storedRotationDirections = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : [];
    const weaveRows = writable(storedWeaveRows);
    const tablets = writable(storedTablets);
    const rotationDirections = writable(storedRotationDirections);
    weaveRows.subscribe((value) => localStorage.weaveRows = value);
    tablets.subscribe((value) => localStorage.tablets = JSON.stringify(value));
    rotationDirections.subscribe((value) => localStorage.rotationDirections = JSON.stringify(value));
    const instructions = derived([weaveRows, rotationDirections], ([$weaveRows, $rotationDirections]) => {
        let rotationDirection = true;
        return [...Array($weaveRows).keys()].map(i => {
            if ($rotationDirections.includes(i)) {
                rotationDirection = !rotationDirection;
            }
            return rotationDirection;
        });
    });
    const weaves = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
        return $tablets.map(tablet => {
            const threads = tablet.threads;
            const numberOfHoles = threads.length;
            let tabletDirection = tablet.sDirection;
            let index = -1;
            return {
                weaves: [...Array($weaveRows).keys()].map(i => {
                    if ($rotationDirections.includes(i)) {
                        tabletDirection = !tabletDirection;
                    }
                    index = index + (tabletDirection ? -1 : 1);
                    const weaveColor = threads[Math.abs(index) % numberOfHoles].color;
                    return {
                        color: weaveColor,
                        sDirection: tabletDirection
                    };
                })
            };
        });
    });

    /* src/components/Thread.svelte generated by Svelte v3.44.3 */

    const file$4 = "src/components/Thread.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let input;
    	let div_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-h11bn9");
    			add_location(input, file$4, 4, 1, 114);
    			attr_dev(div, "class", "thread svelte-h11bn9");
    			attr_dev(div, "style", div_style_value = `background-color: ${/*config*/ ctx[0].color}`);
    			add_location(div, file$4, 3, 0, 48);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*config*/ ctx[0].color);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(input, "click", /*click_handler*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config*/ 1) {
    				set_input_value(input, /*config*/ ctx[0].color);
    			}

    			if (dirty & /*config*/ 1 && div_style_value !== (div_style_value = `background-color: ${/*config*/ ctx[0].color}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Thread', slots, []);
    	let { config } = $$props;
    	const writable_props = ['config'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Thread> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_input_handler() {
    		config.color = this.value;
    		$$invalidate(0, config);
    	}

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({ config });

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [config, click_handler, input_input_handler];
    }

    class Thread extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thread",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*config*/ ctx[0] === undefined && !('config' in props)) {
    			console.warn("<Thread> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		throw new Error("<Thread>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Thread>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Tablet.svelte generated by Svelte v3.44.3 */
    const file$3 = "src/components/Tablet.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[1] = i;
    	return child_ctx;
    }

    // (14:1) {#each config.threads as thread, index (index)}
    function create_each_block$2(key_1, ctx) {
    	let first;
    	let thread;
    	let updating_config;
    	let current;

    	function thread_config_binding(value) {
    		/*thread_config_binding*/ ctx[3](value, /*thread*/ ctx[4], /*each_value*/ ctx[5], /*index*/ ctx[1]);
    	}

    	let thread_props = {};

    	if (/*thread*/ ctx[4] !== void 0) {
    		thread_props.config = /*thread*/ ctx[4];
    	}

    	thread = new Thread({ props: thread_props, $$inline: true });
    	binding_callbacks.push(() => bind(thread, 'config', thread_config_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(thread.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(thread, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const thread_changes = {};

    			if (!updating_config && dirty & /*config*/ 1) {
    				updating_config = true;
    				thread_changes.config = /*thread*/ ctx[4];
    				add_flush_callback(() => updating_config = false);
    			}

    			thread.$set(thread_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thread.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thread.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(thread, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(14:1) {#each config.threads as thread, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (22:3) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Z");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(22:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (20:3) {#if config.sDirection}
    function create_if_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("S");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(20:3) {#if config.sDirection}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[1] + 1 + "";
    	let t0;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let div1;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*config*/ ctx[0].threads;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*config*/ ctx[0].sDirection) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			if_block.c();
    			attr_dev(div0, "class", "tabletIndex uk-text-center svelte-1bwpjk1");
    			add_location(div0, file$3, 9, 1, 201);
    			attr_dev(button, "class", "uk-button uk-button-default svelte-1bwpjk1");
    			add_location(button, file$3, 18, 2, 392);
    			attr_dev(div1, "class", "threadDirection svelte-1bwpjk1");
    			add_location(div1, file$3, 17, 1, 360);
    			attr_dev(div2, "class", "tablet svelte-1bwpjk1");
    			add_location(div2, file$3, 8, 0, 179);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div2, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			if_block.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleDirection*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*index*/ 2) && t0_value !== (t0_value = /*index*/ ctx[1] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*config*/ 1) {
    				each_value = /*config*/ ctx[0].threads;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div2, outro_and_destroy_block, create_each_block$2, t2, get_each_context$2);
    				check_outros();
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(button, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tablet', slots, []);
    	let { index } = $$props;
    	let { config } = $$props;

    	function toggleDirection() {
    		$$invalidate(0, config.sDirection = !config.sDirection, config);
    	}

    	const writable_props = ['index', 'config'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tablet> was created with unknown prop '${key}'`);
    	});

    	function thread_config_binding(value, thread, each_value, index) {
    		each_value[index] = value;
    		$$invalidate(0, config);
    	}

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({ Thread, index, config, toggleDirection });

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [config, index, toggleDirection, thread_config_binding];
    }

    class Tablet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { index: 1, config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tablet",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[1] === undefined && !('index' in props)) {
    			console.warn("<Tablet> was created without expected prop 'index'");
    		}

    		if (/*config*/ ctx[0] === undefined && !('config' in props)) {
    			console.warn("<Tablet> was created without expected prop 'config'");
    		}
    	}

    	get index() {
    		throw new Error("<Tablet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<Tablet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get config() {
    		throw new Error("<Tablet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<Tablet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ThreadWeave.svelte generated by Svelte v3.44.3 */

    const file$2 = "src/components/ThreadWeave.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "weave svelte-1269drx");
    			attr_dev(div, "style", div_style_value = `background-color: ${/*weave*/ ctx[0].color}`);
    			toggle_class(div, "sDirection", /*weave*/ ctx[0].sDirection);
    			add_location(div, file$2, 3, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*weave*/ 1 && div_style_value !== (div_style_value = `background-color: ${/*weave*/ ctx[0].color}`)) {
    				attr_dev(div, "style", div_style_value);
    			}

    			if (dirty & /*weave*/ 1) {
    				toggle_class(div, "sDirection", /*weave*/ ctx[0].sDirection);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ThreadWeave', slots, []);
    	let { weave } = $$props;
    	const writable_props = ['weave'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ThreadWeave> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('weave' in $$props) $$invalidate(0, weave = $$props.weave);
    	};

    	$$self.$capture_state = () => ({ weave });

    	$$self.$inject_state = $$props => {
    		if ('weave' in $$props) $$invalidate(0, weave = $$props.weave);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [weave];
    }

    class ThreadWeave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { weave: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ThreadWeave",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*weave*/ ctx[0] === undefined && !('weave' in props)) {
    			console.warn("<ThreadWeave> was created without expected prop 'weave'");
    		}
    	}

    	get weave() {
    		throw new Error("<ThreadWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weave(value) {
    		throw new Error("<ThreadWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TabletWeave.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/components/TabletWeave.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	child_ctx[3] = i;
    	return child_ctx;
    }

    // (6:1) {#each config.weaves as weave, index (index)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let threadweave;
    	let current;

    	threadweave = new ThreadWeave({
    			props: { weave: /*weave*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(threadweave.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(threadweave, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const threadweave_changes = {};
    			if (dirty & /*config*/ 1) threadweave_changes.weave = /*weave*/ ctx[1];
    			threadweave.$set(threadweave_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(threadweave.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(threadweave.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(threadweave, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(6:1) {#each config.weaves as weave, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*config*/ ctx[0].weaves;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[3];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "tablet svelte-a4lk3j");
    			add_location(div, file$1, 4, 0, 96);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*config*/ 1) {
    				each_value = /*config*/ ctx[0].weaves;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabletWeave', slots, []);
    	let { config } = $$props;
    	const writable_props = ['config'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabletWeave> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	$$self.$capture_state = () => ({ ThreadWeave, config });

    	$$self.$inject_state = $$props => {
    		if ('config' in $$props) $$invalidate(0, config = $$props.config);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [config];
    }

    class TabletWeave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { config: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabletWeave",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*config*/ ctx[0] === undefined && !('config' in props)) {
    			console.warn("<TabletWeave> was created without expected prop 'config'");
    		}
    	}

    	get config() {
    		throw new Error("<TabletWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set config(value) {
    		throw new Error("<TabletWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[20] = list;
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[21] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (54:12) {#each $tablets[0].threads as holes, index (index)}
    function create_each_block_4(key_1, ctx) {
    	let div;
    	let t0_value = String.fromCharCode(65 + /*index*/ ctx[15]) + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "holeIndex svelte-33okvt");
    			add_location(div, file, 54, 13, 1706);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$tablets*/ 2 && t0_value !== (t0_value = String.fromCharCode(65 + /*index*/ ctx[15]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(54:12) {#each $tablets[0].threads as holes, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (61:5) {#each $tablets as tablet, index (index)}
    function create_each_block_3(key_1, ctx) {
    	let first;
    	let tablet;
    	let updating_config;
    	let current;

    	function tablet_config_binding(value) {
    		/*tablet_config_binding*/ ctx[9](value, /*tablet*/ ctx[13], /*each_value_3*/ ctx[20], /*index*/ ctx[15]);
    	}

    	let tablet_props = { index: /*index*/ ctx[15] };

    	if (/*tablet*/ ctx[13] !== void 0) {
    		tablet_props.config = /*tablet*/ ctx[13];
    	}

    	tablet = new Tablet({ props: tablet_props, $$inline: true });
    	binding_callbacks.push(() => bind(tablet, 'config', tablet_config_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tablet.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tablet, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tablet_changes = {};
    			if (dirty & /*$tablets*/ 2) tablet_changes.index = /*index*/ ctx[15];

    			if (!updating_config && dirty & /*$tablets*/ 2) {
    				updating_config = true;
    				tablet_changes.config = /*tablet*/ ctx[13];
    				add_flush_callback(() => updating_config = false);
    			}

    			tablet.$set(tablet_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tablet, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(61:5) {#each $tablets as tablet, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (91:9) {#each $instructions as instruction, index (index)}
    function create_each_block_2(key_1, ctx) {
    	let li;
    	let t0;
    	let t1_value = /*$tablets*/ ctx[1].length + "";
    	let t1;
    	let t2;
    	let a;
    	let t3_value = (/*instruction*/ ctx[18] ? 'vorwärts' : 'rückwärts') + "";
    	let t3;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[10](/*index*/ ctx[15]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			t0 = text("Brettchen 1 bis ");
    			t1 = text(t1_value);
    			t2 = text(": ");
    			a = element("a");
    			t3 = text(t3_value);
    			add_location(a, file, 91, 49, 3052);
    			add_location(li, file, 91, 10, 3013);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    			append_dev(li, a);
    			append_dev(a, t3);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$tablets*/ 2 && t1_value !== (t1_value = /*$tablets*/ ctx[1].length + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$instructions*/ 4 && t3_value !== (t3_value = (/*instruction*/ ctx[18] ? 'vorwärts' : 'rückwärts') + "")) set_data_dev(t3, t3_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(91:9) {#each $instructions as instruction, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (99:12) {#each [...Array($weaveRows).keys()] as key, index (index)}
    function create_each_block_1(key_1, ctx) {
    	let a;
    	let t_value = /*index*/ ctx[15] + 1 + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[11](/*index*/ ctx[15]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "b");
    			set_style(a, "height", "17px");
    			set_style(a, "padding-top", "3.6px");
    			set_style(a, "display", "block");
    			add_location(a, file, 99, 13, 3467);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$weaveRows*/ 1 && t_value !== (t_value = /*index*/ ctx[15] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(99:12) {#each [...Array($weaveRows).keys()] as key, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (104:5) {#each $weaves as tablet, index (index)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let tabletweave;
    	let current;

    	tabletweave = new TabletWeave({
    			props: { config: /*tablet*/ ctx[13] },
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(tabletweave.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(tabletweave, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tabletweave_changes = {};
    			if (dirty & /*$weaves*/ 8) tabletweave_changes.config = /*tablet*/ ctx[13];
    			tabletweave.$set(tabletweave_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabletweave.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabletweave.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(tabletweave, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(104:5) {#each $weaves as tablet, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div7;
    	let div6;
    	let h20;
    	let t1;
    	let div5;
    	let div0;
    	let t2;
    	let div3;
    	let div2;
    	let div1;
    	let t3;
    	let each_blocks_4 = [];
    	let each0_lookup = new Map();
    	let t4;
    	let each_blocks_3 = [];
    	let each1_lookup = new Map();
    	let t5;
    	let div4;
    	let button0;
    	let br;
    	let t6;
    	let button1;
    	let t7;
    	let div20;
    	let div19;
    	let h21;
    	let t9;
    	let div18;
    	let div8;
    	let h30;
    	let t11;
    	let div9;
    	let h31;
    	let t13;
    	let div10;
    	let h32;
    	let t15;
    	let div11;
    	let ol;
    	let each_blocks_2 = [];
    	let each2_lookup = new Map();
    	let t16;
    	let div13;
    	let div12;
    	let each_blocks_1 = [];
    	let each3_lookup = new Map();
    	let t17;
    	let each_blocks = [];
    	let each4_lookup = new Map();
    	let t18;
    	let div14;
    	let t19;
    	let div15;
    	let t20;
    	let div16;
    	let button2;
    	let t21;
    	let button3;
    	let t22;
    	let div17;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_4 = /*$tablets*/ ctx[1][0].threads;
    	validate_each_argument(each_value_4);
    	const get_key = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value_4, get_each_context_4, get_key);

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		let child_ctx = get_each_context_4(ctx, each_value_4, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_4[i] = create_each_block_4(key, child_ctx));
    	}

    	let each_value_3 = /*$tablets*/ ctx[1];
    	validate_each_argument(each_value_3);
    	const get_key_1 = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_1);

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		let child_ctx = get_each_context_3(ctx, each_value_3, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks_3[i] = create_each_block_3(key, child_ctx));
    	}

    	let each_value_2 = /*$instructions*/ ctx[2];
    	validate_each_argument(each_value_2);
    	const get_key_2 = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_2);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key_2(child_ctx);
    		each2_lookup.set(key, each_blocks_2[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value_1 = [...Array(/*$weaveRows*/ ctx[0]).keys()];
    	validate_each_argument(each_value_1);
    	const get_key_3 = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_3);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_3(child_ctx);
    		each3_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*$weaves*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key_4 = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value, get_each_context, get_key_4);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_4(child_ctx);
    		each4_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			div7 = element("div");
    			div6 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Webbrief";
    			t1 = space();
    			div5 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			t3 = space();

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].c();
    			}

    			t4 = space();

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].c();
    			}

    			t5 = space();
    			div4 = element("div");
    			button0 = element("button");
    			br = element("br");
    			t6 = space();
    			button1 = element("button");
    			t7 = space();
    			div20 = element("div");
    			div19 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Vorschau";
    			t9 = space();
    			div18 = element("div");
    			div8 = element("div");
    			h30 = element("h3");
    			h30.textContent = "Anleitung";
    			t11 = space();
    			div9 = element("div");
    			h31 = element("h3");
    			h31.textContent = "Vorderseite";
    			t13 = space();
    			div10 = element("div");
    			h32 = element("h3");
    			h32.textContent = "Rückseite";
    			t15 = space();
    			div11 = element("div");
    			ol = element("ol");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t16 = space();
    			div13 = element("div");
    			div12 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t17 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t18 = space();
    			div14 = element("div");
    			t19 = space();
    			div15 = element("div");
    			t20 = space();
    			div16 = element("div");
    			button2 = element("button");
    			t21 = space();
    			button3 = element("button");
    			t22 = space();
    			div17 = element("div");
    			add_location(h20, file, 46, 3, 1349);
    			add_location(div0, file, 48, 4, 1498);
    			attr_dev(div1, "class", "holeIndex svelte-33okvt");
    			add_location(div1, file, 52, 12, 1599);
    			attr_dev(div2, "class", "holes svelte-33okvt");
    			add_location(div2, file, 51, 11, 1567);
    			attr_dev(div3, "class", "uk-width-auto");
    			add_location(div3, file, 49, 7, 1517);
    			attr_dev(button0, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom ");
    			attr_dev(button0, "uk-icon", "plus");
    			add_location(button0, file, 66, 8, 2001);
    			add_location(br, file, 66, 174, 2167);
    			attr_dev(button1, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small");
    			attr_dev(button1, "uk-icon", "minus");
    			add_location(button1, file, 67, 8, 2180);
    			add_location(div4, file, 65, 7, 1987);
    			attr_dev(div5, "class", "uk-grid-column-small uk-grid-row-large uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-middle");
    			attr_dev(div5, "uk-grid", "");
    			add_location(div5, file, 47, 3, 1370);
    			attr_dev(div6, "class", "uk-container uk-container-small uk-container-expand");
    			add_location(div6, file, 45, 2, 1280);
    			attr_dev(div7, "class", "uk-section uk-section-xsmall uk-section-muted");
    			add_location(div7, file, 44, 1, 1218);
    			add_location(h21, file, 75, 3, 2484);
    			add_location(h30, file, 79, 8, 2674);
    			attr_dev(div8, "class", "uk-text-center");
    			add_location(div8, file, 78, 7, 2637);
    			add_location(h31, file, 82, 8, 2774);
    			attr_dev(div9, "class", "uk-width-auto uk-margin-medium-bottom");
    			add_location(div9, file, 81, 7, 2714);
    			add_location(h32, file, 85, 8, 2853);
    			attr_dev(div10, "class", "uk-text-center");
    			add_location(div10, file, 84, 7, 2816);
    			add_location(ol, file, 89, 8, 2937);
    			attr_dev(div11, "class", "uk-text-small");
    			add_location(div11, file, 88, 7, 2901);
    			attr_dev(div12, "class", "uk-text-small");
    			set_style(div12, "width", "25px");
    			set_style(div12, "float", "left");
    			set_style(div12, "text-align", "right");
    			set_style(div12, "padding-right", "5px");
    			set_style(div12, "margin-top", "-25px");
    			add_location(div12, file, 97, 11, 3262);
    			attr_dev(div13, "class", "uk-width-auto uk-margin-medium-top");
    			add_location(div13, file, 95, 7, 3191);
    			add_location(div14, file, 108, 7, 3761);
    			add_location(div15, file, 111, 7, 3796);
    			attr_dev(button2, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom ");
    			attr_dev(button2, "uk-icon", "plus");
    			add_location(button2, file, 113, 8, 3872);
    			attr_dev(button3, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small");
    			attr_dev(button3, "uk-icon", "minus");
    			add_location(button3, file, 114, 8, 4049);
    			attr_dev(div16, "class", "uk-width-auto uk-margin-medium-top");
    			add_location(div16, file, 112, 7, 3815);
    			add_location(div17, file, 116, 7, 4219);
    			attr_dev(div18, "class", "uk-grid-column-small uk-grid-row-small uk-child-width-1-3 uk-grid-match uk-flex-center uk-flex-top");
    			attr_dev(div18, "uk-grid", "");
    			add_location(div18, file, 77, 3, 2509);
    			attr_dev(div19, "class", "uk-container uk-container-small uk-container-expand");
    			add_location(div19, file, 74, 2, 2415);
    			attr_dev(div20, "class", "uk-section uk-section-xsmall");
    			add_location(div20, file, 73, 1, 2370);
    			add_location(main, file, 42, 0, 1209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div7);
    			append_dev(div7, div6);
    			append_dev(div6, h20);
    			append_dev(div6, t1);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div5, t2);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].m(div2, null);
    			}

    			append_dev(div3, t4);

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].m(div3, null);
    			}

    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, button0);
    			append_dev(div4, br);
    			append_dev(div4, t6);
    			append_dev(div4, button1);
    			append_dev(main, t7);
    			append_dev(main, div20);
    			append_dev(div20, div19);
    			append_dev(div19, h21);
    			append_dev(div19, t9);
    			append_dev(div19, div18);
    			append_dev(div18, div8);
    			append_dev(div8, h30);
    			append_dev(div18, t11);
    			append_dev(div18, div9);
    			append_dev(div9, h31);
    			append_dev(div18, t13);
    			append_dev(div18, div10);
    			append_dev(div10, h32);
    			append_dev(div18, t15);
    			append_dev(div18, div11);
    			append_dev(div11, ol);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(ol, null);
    			}

    			append_dev(div18, t16);
    			append_dev(div18, div13);
    			append_dev(div13, div12);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div12, null);
    			}

    			append_dev(div13, t17);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div13, null);
    			}

    			append_dev(div18, t18);
    			append_dev(div18, div14);
    			append_dev(div18, t19);
    			append_dev(div18, div15);
    			append_dev(div18, t20);
    			append_dev(div18, div16);
    			append_dev(div16, button2);
    			append_dev(div16, t21);
    			append_dev(div16, button3);
    			append_dev(div18, t22);
    			append_dev(div18, div17);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*addTablet*/ ctx[4]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*removeTablet*/ ctx[5]), false, true, false),
    					listen_dev(button2, "click", prevent_default(/*addWeaveRow*/ ctx[6]), false, true, false),
    					listen_dev(button3, "click", prevent_default(/*removeWeaveRow*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*String, $tablets*/ 2) {
    				each_value_4 = /*$tablets*/ ctx[1][0].threads;
    				validate_each_argument(each_value_4);
    				validate_each_keys(ctx, each_value_4, get_each_context_4, get_key);
    				each_blocks_4 = update_keyed_each(each_blocks_4, dirty, get_key, 1, ctx, each_value_4, each0_lookup, div2, destroy_block, create_each_block_4, null, get_each_context_4);
    			}

    			if (dirty & /*$tablets*/ 2) {
    				each_value_3 = /*$tablets*/ ctx[1];
    				validate_each_argument(each_value_3);
    				group_outros();
    				validate_each_keys(ctx, each_value_3, get_each_context_3, get_key_1);
    				each_blocks_3 = update_keyed_each(each_blocks_3, dirty, get_key_1, 1, ctx, each_value_3, each1_lookup, div3, outro_and_destroy_block, create_each_block_3, null, get_each_context_3);
    				check_outros();
    			}

    			if (dirty & /*changeDirection, $instructions, $tablets*/ 262) {
    				each_value_2 = /*$instructions*/ ctx[2];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key_2);
    				each_blocks_2 = update_keyed_each(each_blocks_2, dirty, get_key_2, 1, ctx, each_value_2, each2_lookup, ol, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty & /*changeDirection, Array, $weaveRows*/ 257) {
    				each_value_1 = [...Array(/*$weaveRows*/ ctx[0]).keys()];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_3);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key_3, 1, ctx, each_value_1, each3_lookup, div12, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*$weaves*/ 8) {
    				each_value = /*$weaves*/ ctx[3];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key_4);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_4, 1, ctx, each_value, each4_lookup, div13, outro_and_destroy_block, create_each_block, null, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_3.length; i += 1) {
    				transition_in(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				transition_out(each_blocks_3[i]);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			for (let i = 0; i < each_blocks_4.length; i += 1) {
    				each_blocks_4[i].d();
    			}

    			for (let i = 0; i < each_blocks_3.length; i += 1) {
    				each_blocks_3[i].d();
    			}

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].d();
    			}

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $rotationDirections;
    	let $weaveRows;
    	let $tablets;
    	let $instructions;
    	let $weaves;
    	validate_store(rotationDirections, 'rotationDirections');
    	component_subscribe($$self, rotationDirections, $$value => $$invalidate(12, $rotationDirections = $$value));
    	validate_store(weaveRows, 'weaveRows');
    	component_subscribe($$self, weaveRows, $$value => $$invalidate(0, $weaveRows = $$value));
    	validate_store(tablets, 'tablets');
    	component_subscribe($$self, tablets, $$value => $$invalidate(1, $tablets = $$value));
    	validate_store(instructions, 'instructions');
    	component_subscribe($$self, instructions, $$value => $$invalidate(2, $instructions = $$value));
    	validate_store(weaves, 'weaves');
    	component_subscribe($$self, weaves, $$value => $$invalidate(3, $weaves = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	function addTablet(event) {
    		tablets.update(t => {
    			const lastTablet = t[t.length - 1];

    			const newTablet = {
    				sDirection: lastTablet.sDirection,
    				threads: lastTablet.threads.map(hole => {
    					return { color: hole.color };
    				})
    			};

    			t.push(newTablet);
    			return t;
    		});
    	}

    	function removeTablet(event) {
    		if ($tablets.length > 1 && $tablets.length < 26) {
    			tablets.update(t => {
    				t.pop();
    				return t;
    			});
    		}
    	}

    	function addWeaveRow(event) {
    		set_store_value(weaveRows, $weaveRows = $weaveRows + 1, $weaveRows);
    	}

    	function removeWeaveRow(event) {
    		set_store_value(weaveRows, $weaveRows = $weaveRows - 1, $weaveRows);
    	}

    	function changeDirection(index) {
    		if ($rotationDirections.includes(index)) {
    			set_store_value(rotationDirections, $rotationDirections = $rotationDirections.filter(it => it !== index), $rotationDirections);
    		} else {
    			$rotationDirections.push(index);
    			rotationDirections.set($rotationDirections);
    		}

    		console.log($rotationDirections);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function tablet_config_binding(value, tablet, each_value_3, index) {
    		each_value_3[index] = value;
    		tablets.set($tablets);
    	}

    	const click_handler = index => changeDirection(index);
    	const click_handler_1 = index => changeDirection(index);

    	$$self.$capture_state = () => ({
    		tablets,
    		weaves,
    		weaveRows,
    		rotationDirections,
    		instructions,
    		Tablet,
    		TabletWeave,
    		addTablet,
    		removeTablet,
    		addWeaveRow,
    		removeWeaveRow,
    		changeDirection,
    		$rotationDirections,
    		$weaveRows,
    		$tablets,
    		$instructions,
    		$weaves
    	});

    	return [
    		$weaveRows,
    		$tablets,
    		$instructions,
    		$weaves,
    		addTablet,
    		removeTablet,
    		addWeaveRow,
    		removeWeaveRow,
    		changeDirection,
    		tablet_config_binding,
    		click_handler,
    		click_handler_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
