
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
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
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
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
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
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function to_number(value) {
        return value === '' ? null : +value;
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
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

    var isMergeableObject = function isMergeableObject(value) {
    	return isNonNullObject(value)
    		&& !isSpecial(value)
    };

    function isNonNullObject(value) {
    	return !!value && typeof value === 'object'
    }

    function isSpecial(value) {
    	var stringValue = Object.prototype.toString.call(value);

    	return stringValue === '[object RegExp]'
    		|| stringValue === '[object Date]'
    		|| isReactElement(value)
    }

    // see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
    var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
    var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

    function isReactElement(value) {
    	return value.$$typeof === REACT_ELEMENT_TYPE
    }

    function emptyTarget(val) {
    	return Array.isArray(val) ? [] : {}
    }

    function cloneUnlessOtherwiseSpecified(value, options) {
    	return (options.clone !== false && options.isMergeableObject(value))
    		? deepmerge(emptyTarget(value), value, options)
    		: value
    }

    function defaultArrayMerge(target, source, options) {
    	return target.concat(source).map(function(element) {
    		return cloneUnlessOtherwiseSpecified(element, options)
    	})
    }

    function getMergeFunction(key, options) {
    	if (!options.customMerge) {
    		return deepmerge
    	}
    	var customMerge = options.customMerge(key);
    	return typeof customMerge === 'function' ? customMerge : deepmerge
    }

    function getEnumerableOwnPropertySymbols(target) {
    	return Object.getOwnPropertySymbols
    		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
    			return target.propertyIsEnumerable(symbol)
    		})
    		: []
    }

    function getKeys(target) {
    	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
    }

    function propertyIsOnObject(object, property) {
    	try {
    		return property in object
    	} catch(_) {
    		return false
    	}
    }

    // Protects from prototype poisoning and unexpected merging up the prototype chain.
    function propertyIsUnsafe(target, key) {
    	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
    		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
    			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
    }

    function mergeObject(target, source, options) {
    	var destination = {};
    	if (options.isMergeableObject(target)) {
    		getKeys(target).forEach(function(key) {
    			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
    		});
    	}
    	getKeys(source).forEach(function(key) {
    		if (propertyIsUnsafe(target, key)) {
    			return
    		}

    		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
    			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
    		} else {
    			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
    		}
    	});
    	return destination
    }

    function deepmerge(target, source, options) {
    	options = options || {};
    	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
    	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
    	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
    	// implementations can use it. The caller may not replace it.
    	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

    	var sourceIsArray = Array.isArray(source);
    	var targetIsArray = Array.isArray(target);
    	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    	if (!sourceAndTargetTypesMatch) {
    		return cloneUnlessOtherwiseSpecified(source, options)
    	} else if (sourceIsArray) {
    		return options.arrayMerge(target, source, options)
    	} else {
    		return mergeObject(target, source, options)
    	}
    }

    deepmerge.all = function deepmergeAll(array, options) {
    	if (!Array.isArray(array)) {
    		throw new Error('first argument should be an array')
    	}

    	return array.reduce(function(prev, next) {
    		return deepmerge(prev, next, options)
    	}, {})
    };

    var deepmerge_1 = deepmerge;

    var cjs = deepmerge_1;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var ErrorKind;
    (function (ErrorKind) {
        /** Argument is unclosed (e.g. `{0`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_CLOSING_BRACE"] = 1] = "EXPECT_ARGUMENT_CLOSING_BRACE";
        /** Argument is empty (e.g. `{}`). */
        ErrorKind[ErrorKind["EMPTY_ARGUMENT"] = 2] = "EMPTY_ARGUMENT";
        /** Argument is malformed (e.g. `{foo!}``) */
        ErrorKind[ErrorKind["MALFORMED_ARGUMENT"] = 3] = "MALFORMED_ARGUMENT";
        /** Expect an argument type (e.g. `{foo,}`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_TYPE"] = 4] = "EXPECT_ARGUMENT_TYPE";
        /** Unsupported argument type (e.g. `{foo,foo}`) */
        ErrorKind[ErrorKind["INVALID_ARGUMENT_TYPE"] = 5] = "INVALID_ARGUMENT_TYPE";
        /** Expect an argument style (e.g. `{foo, number, }`) */
        ErrorKind[ErrorKind["EXPECT_ARGUMENT_STYLE"] = 6] = "EXPECT_ARGUMENT_STYLE";
        /** The number skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_NUMBER_SKELETON"] = 7] = "INVALID_NUMBER_SKELETON";
        /** The date time skeleton is invalid. */
        ErrorKind[ErrorKind["INVALID_DATE_TIME_SKELETON"] = 8] = "INVALID_DATE_TIME_SKELETON";
        /** Exepct a number skeleton following the `::` (e.g. `{foo, number, ::}`) */
        ErrorKind[ErrorKind["EXPECT_NUMBER_SKELETON"] = 9] = "EXPECT_NUMBER_SKELETON";
        /** Exepct a date time skeleton following the `::` (e.g. `{foo, date, ::}`) */
        ErrorKind[ErrorKind["EXPECT_DATE_TIME_SKELETON"] = 10] = "EXPECT_DATE_TIME_SKELETON";
        /** Unmatched apostrophes in the argument style (e.g. `{foo, number, 'test`) */
        ErrorKind[ErrorKind["UNCLOSED_QUOTE_IN_ARGUMENT_STYLE"] = 11] = "UNCLOSED_QUOTE_IN_ARGUMENT_STYLE";
        /** Missing select argument options (e.g. `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_OPTIONS"] = 12] = "EXPECT_SELECT_ARGUMENT_OPTIONS";
        /** Expecting an offset value in `plural` or `selectordinal` argument (e.g `{foo, plural, offset}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE"] = 13] = "EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Offset value in `plural` or `selectordinal` is invalid (e.g. `{foo, plural, offset: x}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_OFFSET_VALUE"] = 14] = "INVALID_PLURAL_ARGUMENT_OFFSET_VALUE";
        /** Expecting a selector in `select` argument (e.g `{foo, select}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR"] = 15] = "EXPECT_SELECT_ARGUMENT_SELECTOR";
        /** Expecting a selector in `plural` or `selectordinal` argument (e.g `{foo, plural}`) */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR"] = 16] = "EXPECT_PLURAL_ARGUMENT_SELECTOR";
        /** Expecting a message fragment after the `select` selector (e.g. `{foo, select, apple}`) */
        ErrorKind[ErrorKind["EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT"] = 17] = "EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT";
        /**
         * Expecting a message fragment after the `plural` or `selectordinal` selector
         * (e.g. `{foo, plural, one}`)
         */
        ErrorKind[ErrorKind["EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT"] = 18] = "EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT";
        /** Selector in `plural` or `selectordinal` is malformed (e.g. `{foo, plural, =x {#}}`) */
        ErrorKind[ErrorKind["INVALID_PLURAL_ARGUMENT_SELECTOR"] = 19] = "INVALID_PLURAL_ARGUMENT_SELECTOR";
        /**
         * Duplicate selectors in `plural` or `selectordinal` argument.
         * (e.g. {foo, plural, one {#} one {#}})
         */
        ErrorKind[ErrorKind["DUPLICATE_PLURAL_ARGUMENT_SELECTOR"] = 20] = "DUPLICATE_PLURAL_ARGUMENT_SELECTOR";
        /** Duplicate selectors in `select` argument.
         * (e.g. {foo, select, apple {apple} apple {apple}})
         */
        ErrorKind[ErrorKind["DUPLICATE_SELECT_ARGUMENT_SELECTOR"] = 21] = "DUPLICATE_SELECT_ARGUMENT_SELECTOR";
        /** Plural or select argument option must have `other` clause. */
        ErrorKind[ErrorKind["MISSING_OTHER_CLAUSE"] = 22] = "MISSING_OTHER_CLAUSE";
        /** The tag is malformed. (e.g. `<bold!>foo</bold!>) */
        ErrorKind[ErrorKind["INVALID_TAG"] = 23] = "INVALID_TAG";
        /** The tag name is invalid. (e.g. `<123>foo</123>`) */
        ErrorKind[ErrorKind["INVALID_TAG_NAME"] = 25] = "INVALID_TAG_NAME";
        /** The closing tag does not match the opening tag. (e.g. `<bold>foo</italic>`) */
        ErrorKind[ErrorKind["UNMATCHED_CLOSING_TAG"] = 26] = "UNMATCHED_CLOSING_TAG";
        /** The opening tag has unmatched closing tag. (e.g. `<bold>foo`) */
        ErrorKind[ErrorKind["UNCLOSED_TAG"] = 27] = "UNCLOSED_TAG";
    })(ErrorKind || (ErrorKind = {}));

    var TYPE;
    (function (TYPE) {
        /**
         * Raw text
         */
        TYPE[TYPE["literal"] = 0] = "literal";
        /**
         * Variable w/o any format, e.g `var` in `this is a {var}`
         */
        TYPE[TYPE["argument"] = 1] = "argument";
        /**
         * Variable w/ number format
         */
        TYPE[TYPE["number"] = 2] = "number";
        /**
         * Variable w/ date format
         */
        TYPE[TYPE["date"] = 3] = "date";
        /**
         * Variable w/ time format
         */
        TYPE[TYPE["time"] = 4] = "time";
        /**
         * Variable w/ select format
         */
        TYPE[TYPE["select"] = 5] = "select";
        /**
         * Variable w/ plural format
         */
        TYPE[TYPE["plural"] = 6] = "plural";
        /**
         * Only possible within plural argument.
         * This is the `#` symbol that will be substituted with the count.
         */
        TYPE[TYPE["pound"] = 7] = "pound";
        /**
         * XML-like tag
         */
        TYPE[TYPE["tag"] = 8] = "tag";
    })(TYPE || (TYPE = {}));
    var SKELETON_TYPE;
    (function (SKELETON_TYPE) {
        SKELETON_TYPE[SKELETON_TYPE["number"] = 0] = "number";
        SKELETON_TYPE[SKELETON_TYPE["dateTime"] = 1] = "dateTime";
    })(SKELETON_TYPE || (SKELETON_TYPE = {}));
    /**
     * Type Guards
     */
    function isLiteralElement(el) {
        return el.type === TYPE.literal;
    }
    function isArgumentElement(el) {
        return el.type === TYPE.argument;
    }
    function isNumberElement(el) {
        return el.type === TYPE.number;
    }
    function isDateElement(el) {
        return el.type === TYPE.date;
    }
    function isTimeElement(el) {
        return el.type === TYPE.time;
    }
    function isSelectElement(el) {
        return el.type === TYPE.select;
    }
    function isPluralElement(el) {
        return el.type === TYPE.plural;
    }
    function isPoundElement(el) {
        return el.type === TYPE.pound;
    }
    function isTagElement(el) {
        return el.type === TYPE.tag;
    }
    function isNumberSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.number);
    }
    function isDateTimeSkeleton(el) {
        return !!(el && typeof el === 'object' && el.type === SKELETON_TYPE.dateTime);
    }

    // @generated from regex-gen.ts
    var SPACE_SEPARATOR_REGEX = /[ \xA0\u1680\u2000-\u200A\u202F\u205F\u3000]/;

    /**
     * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
     * with some tweaks
     */
    var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
    /**
     * Parse Date time skeleton into Intl.DateTimeFormatOptions
     * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * @public
     * @param skeleton skeleton string
     */
    function parseDateTimeSkeleton(skeleton) {
        var result = {};
        skeleton.replace(DATE_TIME_REGEX, function (match) {
            var len = match.length;
            switch (match[0]) {
                // Era
                case 'G':
                    result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
                    break;
                // Year
                case 'y':
                    result.year = len === 2 ? '2-digit' : 'numeric';
                    break;
                case 'Y':
                case 'u':
                case 'U':
                case 'r':
                    throw new RangeError('`Y/u/U/r` (year) patterns are not supported, use `y` instead');
                // Quarter
                case 'q':
                case 'Q':
                    throw new RangeError('`q/Q` (quarter) patterns are not supported');
                // Month
                case 'M':
                case 'L':
                    result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
                    break;
                // Week
                case 'w':
                case 'W':
                    throw new RangeError('`w/W` (week) patterns are not supported');
                case 'd':
                    result.day = ['numeric', '2-digit'][len - 1];
                    break;
                case 'D':
                case 'F':
                case 'g':
                    throw new RangeError('`D/F/g` (day) patterns are not supported, use `d` instead');
                // Weekday
                case 'E':
                    result.weekday = len === 4 ? 'short' : len === 5 ? 'narrow' : 'short';
                    break;
                case 'e':
                    if (len < 4) {
                        throw new RangeError('`e..eee` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                case 'c':
                    if (len < 4) {
                        throw new RangeError('`c..ccc` (weekday) patterns are not supported');
                    }
                    result.weekday = ['short', 'long', 'narrow', 'short'][len - 4];
                    break;
                // Period
                case 'a': // AM, PM
                    result.hour12 = true;
                    break;
                case 'b': // am, pm, noon, midnight
                case 'B': // flexible day periods
                    throw new RangeError('`b/B` (period) patterns are not supported, use `a` instead');
                // Hour
                case 'h':
                    result.hourCycle = 'h12';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'H':
                    result.hourCycle = 'h23';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'K':
                    result.hourCycle = 'h11';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'k':
                    result.hourCycle = 'h24';
                    result.hour = ['numeric', '2-digit'][len - 1];
                    break;
                case 'j':
                case 'J':
                case 'C':
                    throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
                // Minute
                case 'm':
                    result.minute = ['numeric', '2-digit'][len - 1];
                    break;
                // Second
                case 's':
                    result.second = ['numeric', '2-digit'][len - 1];
                    break;
                case 'S':
                case 'A':
                    throw new RangeError('`S/A` (second) patterns are not supported, use `s` instead');
                // Zone
                case 'z': // 1..3, 4: specific non-location format
                    result.timeZoneName = len < 4 ? 'short' : 'long';
                    break;
                case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
                case 'O': // 1, 4: miliseconds in day short, long
                case 'v': // 1, 4: generic non-location format
                case 'V': // 1, 2, 3, 4: time zone ID or city
                case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
                case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
                    throw new RangeError('`Z/O/v/V/X/x` (timeZone) patterns are not supported, use `z` instead');
            }
            return '';
        });
        return result;
    }

    // @generated from regex-gen.ts
    var WHITE_SPACE_REGEX = /[\t-\r \x85\u200E\u200F\u2028\u2029]/i;

    function parseNumberSkeletonFromString(skeleton) {
        if (skeleton.length === 0) {
            throw new Error('Number skeleton cannot be empty');
        }
        // Parse the skeleton
        var stringTokens = skeleton
            .split(WHITE_SPACE_REGEX)
            .filter(function (x) { return x.length > 0; });
        var tokens = [];
        for (var _i = 0, stringTokens_1 = stringTokens; _i < stringTokens_1.length; _i++) {
            var stringToken = stringTokens_1[_i];
            var stemAndOptions = stringToken.split('/');
            if (stemAndOptions.length === 0) {
                throw new Error('Invalid number skeleton');
            }
            var stem = stemAndOptions[0], options = stemAndOptions.slice(1);
            for (var _a = 0, options_1 = options; _a < options_1.length; _a++) {
                var option = options_1[_a];
                if (option.length === 0) {
                    throw new Error('Invalid number skeleton');
                }
            }
            tokens.push({ stem: stem, options: options });
        }
        return tokens;
    }
    function icuUnitToEcma(unit) {
        return unit.replace(/^(.*?)-/, '');
    }
    var FRACTION_PRECISION_REGEX = /^\.(?:(0+)(\*)?|(#+)|(0+)(#+))$/g;
    var SIGNIFICANT_PRECISION_REGEX = /^(@+)?(\+|#+)?[rs]?$/g;
    var INTEGER_WIDTH_REGEX = /(\*)(0+)|(#+)(0+)|(0+)/g;
    var CONCISE_INTEGER_WIDTH_REGEX = /^(0+)$/;
    function parseSignificantPrecision(str) {
        var result = {};
        if (str[str.length - 1] === 'r') {
            result.roundingPriority = 'morePrecision';
        }
        else if (str[str.length - 1] === 's') {
            result.roundingPriority = 'lessPrecision';
        }
        str.replace(SIGNIFICANT_PRECISION_REGEX, function (_, g1, g2) {
            // @@@ case
            if (typeof g2 !== 'string') {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits = g1.length;
            }
            // @@@+ case
            else if (g2 === '+') {
                result.minimumSignificantDigits = g1.length;
            }
            // .### case
            else if (g1[0] === '#') {
                result.maximumSignificantDigits = g1.length;
            }
            // .@@## or .@@@ case
            else {
                result.minimumSignificantDigits = g1.length;
                result.maximumSignificantDigits =
                    g1.length + (typeof g2 === 'string' ? g2.length : 0);
            }
            return '';
        });
        return result;
    }
    function parseSign(str) {
        switch (str) {
            case 'sign-auto':
                return {
                    signDisplay: 'auto',
                };
            case 'sign-accounting':
            case '()':
                return {
                    currencySign: 'accounting',
                };
            case 'sign-always':
            case '+!':
                return {
                    signDisplay: 'always',
                };
            case 'sign-accounting-always':
            case '()!':
                return {
                    signDisplay: 'always',
                    currencySign: 'accounting',
                };
            case 'sign-except-zero':
            case '+?':
                return {
                    signDisplay: 'exceptZero',
                };
            case 'sign-accounting-except-zero':
            case '()?':
                return {
                    signDisplay: 'exceptZero',
                    currencySign: 'accounting',
                };
            case 'sign-never':
            case '+_':
                return {
                    signDisplay: 'never',
                };
        }
    }
    function parseConciseScientificAndEngineeringStem(stem) {
        // Engineering
        var result;
        if (stem[0] === 'E' && stem[1] === 'E') {
            result = {
                notation: 'engineering',
            };
            stem = stem.slice(2);
        }
        else if (stem[0] === 'E') {
            result = {
                notation: 'scientific',
            };
            stem = stem.slice(1);
        }
        if (result) {
            var signDisplay = stem.slice(0, 2);
            if (signDisplay === '+!') {
                result.signDisplay = 'always';
                stem = stem.slice(2);
            }
            else if (signDisplay === '+?') {
                result.signDisplay = 'exceptZero';
                stem = stem.slice(2);
            }
            if (!CONCISE_INTEGER_WIDTH_REGEX.test(stem)) {
                throw new Error('Malformed concise eng/scientific notation');
            }
            result.minimumIntegerDigits = stem.length;
        }
        return result;
    }
    function parseNotationOptions(opt) {
        var result = {};
        var signOpts = parseSign(opt);
        if (signOpts) {
            return signOpts;
        }
        return result;
    }
    /**
     * https://github.com/unicode-org/icu/blob/master/docs/userguide/format_parse/numbers/skeletons.md#skeleton-stems-and-options
     */
    function parseNumberSkeleton(tokens) {
        var result = {};
        for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
            var token = tokens_1[_i];
            switch (token.stem) {
                case 'percent':
                case '%':
                    result.style = 'percent';
                    continue;
                case '%x100':
                    result.style = 'percent';
                    result.scale = 100;
                    continue;
                case 'currency':
                    result.style = 'currency';
                    result.currency = token.options[0];
                    continue;
                case 'group-off':
                case ',_':
                    result.useGrouping = false;
                    continue;
                case 'precision-integer':
                case '.':
                    result.maximumFractionDigits = 0;
                    continue;
                case 'measure-unit':
                case 'unit':
                    result.style = 'unit';
                    result.unit = icuUnitToEcma(token.options[0]);
                    continue;
                case 'compact-short':
                case 'K':
                    result.notation = 'compact';
                    result.compactDisplay = 'short';
                    continue;
                case 'compact-long':
                case 'KK':
                    result.notation = 'compact';
                    result.compactDisplay = 'long';
                    continue;
                case 'scientific':
                    result = __assign(__assign(__assign({}, result), { notation: 'scientific' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'engineering':
                    result = __assign(__assign(__assign({}, result), { notation: 'engineering' }), token.options.reduce(function (all, opt) { return (__assign(__assign({}, all), parseNotationOptions(opt))); }, {}));
                    continue;
                case 'notation-simple':
                    result.notation = 'standard';
                    continue;
                // https://github.com/unicode-org/icu/blob/master/icu4c/source/i18n/unicode/unumberformatter.h
                case 'unit-width-narrow':
                    result.currencyDisplay = 'narrowSymbol';
                    result.unitDisplay = 'narrow';
                    continue;
                case 'unit-width-short':
                    result.currencyDisplay = 'code';
                    result.unitDisplay = 'short';
                    continue;
                case 'unit-width-full-name':
                    result.currencyDisplay = 'name';
                    result.unitDisplay = 'long';
                    continue;
                case 'unit-width-iso-code':
                    result.currencyDisplay = 'symbol';
                    continue;
                case 'scale':
                    result.scale = parseFloat(token.options[0]);
                    continue;
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
                case 'integer-width':
                    if (token.options.length > 1) {
                        throw new RangeError('integer-width stems only accept a single optional option');
                    }
                    token.options[0].replace(INTEGER_WIDTH_REGEX, function (_, g1, g2, g3, g4, g5) {
                        if (g1) {
                            result.minimumIntegerDigits = g2.length;
                        }
                        else if (g3 && g4) {
                            throw new Error('We currently do not support maximum integer digits');
                        }
                        else if (g5) {
                            throw new Error('We currently do not support exact integer digits');
                        }
                        return '';
                    });
                    continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#integer-width
            if (CONCISE_INTEGER_WIDTH_REGEX.test(token.stem)) {
                result.minimumIntegerDigits = token.stem.length;
                continue;
            }
            if (FRACTION_PRECISION_REGEX.test(token.stem)) {
                // Precision
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#fraction-precision
                // precision-integer case
                if (token.options.length > 1) {
                    throw new RangeError('Fraction-precision stems only accept a single optional option');
                }
                token.stem.replace(FRACTION_PRECISION_REGEX, function (_, g1, g2, g3, g4, g5) {
                    // .000* case (before ICU67 it was .000+)
                    if (g2 === '*') {
                        result.minimumFractionDigits = g1.length;
                    }
                    // .### case
                    else if (g3 && g3[0] === '#') {
                        result.maximumFractionDigits = g3.length;
                    }
                    // .00## case
                    else if (g4 && g5) {
                        result.minimumFractionDigits = g4.length;
                        result.maximumFractionDigits = g4.length + g5.length;
                    }
                    else {
                        result.minimumFractionDigits = g1.length;
                        result.maximumFractionDigits = g1.length;
                    }
                    return '';
                });
                var opt = token.options[0];
                // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#trailing-zero-display
                if (opt === 'w') {
                    result = __assign(__assign({}, result), { trailingZeroDisplay: 'stripIfInteger' });
                }
                else if (opt) {
                    result = __assign(__assign({}, result), parseSignificantPrecision(opt));
                }
                continue;
            }
            // https://unicode-org.github.io/icu/userguide/format_parse/numbers/skeletons.html#significant-digits-precision
            if (SIGNIFICANT_PRECISION_REGEX.test(token.stem)) {
                result = __assign(__assign({}, result), parseSignificantPrecision(token.stem));
                continue;
            }
            var signOpts = parseSign(token.stem);
            if (signOpts) {
                result = __assign(__assign({}, result), signOpts);
            }
            var conciseScientificAndEngineeringOpts = parseConciseScientificAndEngineeringStem(token.stem);
            if (conciseScientificAndEngineeringOpts) {
                result = __assign(__assign({}, result), conciseScientificAndEngineeringOpts);
            }
        }
        return result;
    }

    var _a;
    var SPACE_SEPARATOR_START_REGEX = new RegExp("^".concat(SPACE_SEPARATOR_REGEX.source, "*"));
    var SPACE_SEPARATOR_END_REGEX = new RegExp("".concat(SPACE_SEPARATOR_REGEX.source, "*$"));
    function createLocation(start, end) {
        return { start: start, end: end };
    }
    // #region Ponyfills
    // Consolidate these variables up top for easier toggling during debugging
    var hasNativeStartsWith = !!String.prototype.startsWith;
    var hasNativeFromCodePoint = !!String.fromCodePoint;
    var hasNativeFromEntries = !!Object.fromEntries;
    var hasNativeCodePointAt = !!String.prototype.codePointAt;
    var hasTrimStart = !!String.prototype.trimStart;
    var hasTrimEnd = !!String.prototype.trimEnd;
    var hasNativeIsSafeInteger = !!Number.isSafeInteger;
    var isSafeInteger = hasNativeIsSafeInteger
        ? Number.isSafeInteger
        : function (n) {
            return (typeof n === 'number' &&
                isFinite(n) &&
                Math.floor(n) === n &&
                Math.abs(n) <= 0x1fffffffffffff);
        };
    // IE11 does not support y and u.
    var REGEX_SUPPORTS_U_AND_Y = true;
    try {
        var re = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        /**
         * legacy Edge or Xbox One browser
         * Unicode flag support: supported
         * Pattern_Syntax support: not supported
         * See https://github.com/formatjs/formatjs/issues/2822
         */
        REGEX_SUPPORTS_U_AND_Y = ((_a = re.exec('a')) === null || _a === void 0 ? void 0 : _a[0]) === 'a';
    }
    catch (_) {
        REGEX_SUPPORTS_U_AND_Y = false;
    }
    var startsWith = hasNativeStartsWith
        ? // Native
            function startsWith(s, search, position) {
                return s.startsWith(search, position);
            }
        : // For IE11
            function startsWith(s, search, position) {
                return s.slice(position, position + search.length) === search;
            };
    var fromCodePoint = hasNativeFromCodePoint
        ? String.fromCodePoint
        : // IE11
            function fromCodePoint() {
                var codePoints = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    codePoints[_i] = arguments[_i];
                }
                var elements = '';
                var length = codePoints.length;
                var i = 0;
                var code;
                while (length > i) {
                    code = codePoints[i++];
                    if (code > 0x10ffff)
                        throw RangeError(code + ' is not a valid code point');
                    elements +=
                        code < 0x10000
                            ? String.fromCharCode(code)
                            : String.fromCharCode(((code -= 0x10000) >> 10) + 0xd800, (code % 0x400) + 0xdc00);
                }
                return elements;
            };
    var fromEntries = 
    // native
    hasNativeFromEntries
        ? Object.fromEntries
        : // Ponyfill
            function fromEntries(entries) {
                var obj = {};
                for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
                    var _a = entries_1[_i], k = _a[0], v = _a[1];
                    obj[k] = v;
                }
                return obj;
            };
    var codePointAt = hasNativeCodePointAt
        ? // Native
            function codePointAt(s, index) {
                return s.codePointAt(index);
            }
        : // IE 11
            function codePointAt(s, index) {
                var size = s.length;
                if (index < 0 || index >= size) {
                    return undefined;
                }
                var first = s.charCodeAt(index);
                var second;
                return first < 0xd800 ||
                    first > 0xdbff ||
                    index + 1 === size ||
                    (second = s.charCodeAt(index + 1)) < 0xdc00 ||
                    second > 0xdfff
                    ? first
                    : ((first - 0xd800) << 10) + (second - 0xdc00) + 0x10000;
            };
    var trimStart = hasTrimStart
        ? // Native
            function trimStart(s) {
                return s.trimStart();
            }
        : // Ponyfill
            function trimStart(s) {
                return s.replace(SPACE_SEPARATOR_START_REGEX, '');
            };
    var trimEnd = hasTrimEnd
        ? // Native
            function trimEnd(s) {
                return s.trimEnd();
            }
        : // Ponyfill
            function trimEnd(s) {
                return s.replace(SPACE_SEPARATOR_END_REGEX, '');
            };
    // Prevent minifier to translate new RegExp to literal form that might cause syntax error on IE11.
    function RE(s, flag) {
        return new RegExp(s, flag);
    }
    // #endregion
    var matchIdentifierAtIndex;
    if (REGEX_SUPPORTS_U_AND_Y) {
        // Native
        var IDENTIFIER_PREFIX_RE_1 = RE('([^\\p{White_Space}\\p{Pattern_Syntax}]*)', 'yu');
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var _a;
            IDENTIFIER_PREFIX_RE_1.lastIndex = index;
            var match = IDENTIFIER_PREFIX_RE_1.exec(s);
            return (_a = match[1]) !== null && _a !== void 0 ? _a : '';
        };
    }
    else {
        // IE11
        matchIdentifierAtIndex = function matchIdentifierAtIndex(s, index) {
            var match = [];
            while (true) {
                var c = codePointAt(s, index);
                if (c === undefined || _isWhiteSpace(c) || _isPatternSyntax(c)) {
                    break;
                }
                match.push(c);
                index += c >= 0x10000 ? 2 : 1;
            }
            return fromCodePoint.apply(void 0, match);
        };
    }
    var Parser = /** @class */ (function () {
        function Parser(message, options) {
            if (options === void 0) { options = {}; }
            this.message = message;
            this.position = { offset: 0, line: 1, column: 1 };
            this.ignoreTag = !!options.ignoreTag;
            this.requiresOtherClause = !!options.requiresOtherClause;
            this.shouldParseSkeletons = !!options.shouldParseSkeletons;
        }
        Parser.prototype.parse = function () {
            if (this.offset() !== 0) {
                throw Error('parser can only be used once');
            }
            return this.parseMessage(0, '', false);
        };
        Parser.prototype.parseMessage = function (nestingLevel, parentArgType, expectingCloseTag) {
            var elements = [];
            while (!this.isEOF()) {
                var char = this.char();
                if (char === 123 /* `{` */) {
                    var result = this.parseArgument(nestingLevel, expectingCloseTag);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else if (char === 125 /* `}` */ && nestingLevel > 0) {
                    break;
                }
                else if (char === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) {
                    var position = this.clonePosition();
                    this.bump();
                    elements.push({
                        type: TYPE.pound,
                        location: createLocation(position, this.clonePosition()),
                    });
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    this.peek() === 47 // char code for '/'
                ) {
                    if (expectingCloseTag) {
                        break;
                    }
                    else {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(this.clonePosition(), this.clonePosition()));
                    }
                }
                else if (char === 60 /* `<` */ &&
                    !this.ignoreTag &&
                    _isAlpha(this.peek() || 0)) {
                    var result = this.parseTag(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
                else {
                    var result = this.parseLiteral(nestingLevel, parentArgType);
                    if (result.err) {
                        return result;
                    }
                    elements.push(result.val);
                }
            }
            return { val: elements, err: null };
        };
        /**
         * A tag name must start with an ASCII lower/upper case letter. The grammar is based on the
         * [custom element name][] except that a dash is NOT always mandatory and uppercase letters
         * are accepted:
         *
         * ```
         * tag ::= "<" tagName (whitespace)* "/>" | "<" tagName (whitespace)* ">" message "</" tagName (whitespace)* ">"
         * tagName ::= [a-z] (PENChar)*
         * PENChar ::=
         *     "-" | "." | [0-9] | "_" | [a-z] | [A-Z] | #xB7 | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x37D] |
         *     [#x37F-#x1FFF] | [#x200C-#x200D] | [#x203F-#x2040] | [#x2070-#x218F] | [#x2C00-#x2FEF] |
         *     [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
         * ```
         *
         * [custom element name]: https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
         * NOTE: We're a bit more lax here since HTML technically does not allow uppercase HTML element but we do
         * since other tag-based engines like React allow it
         */
        Parser.prototype.parseTag = function (nestingLevel, parentArgType) {
            var startPosition = this.clonePosition();
            this.bump(); // `<`
            var tagName = this.parseTagName();
            this.bumpSpace();
            if (this.bumpIf('/>')) {
                // Self closing tag
                return {
                    val: {
                        type: TYPE.literal,
                        value: "<".concat(tagName, "/>"),
                        location: createLocation(startPosition, this.clonePosition()),
                    },
                    err: null,
                };
            }
            else if (this.bumpIf('>')) {
                var childrenResult = this.parseMessage(nestingLevel + 1, parentArgType, true);
                if (childrenResult.err) {
                    return childrenResult;
                }
                var children = childrenResult.val;
                // Expecting a close tag
                var endTagStartPosition = this.clonePosition();
                if (this.bumpIf('</')) {
                    if (this.isEOF() || !_isAlpha(this.char())) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    var closingTagNameStartPosition = this.clonePosition();
                    var closingTagName = this.parseTagName();
                    if (tagName !== closingTagName) {
                        return this.error(ErrorKind.UNMATCHED_CLOSING_TAG, createLocation(closingTagNameStartPosition, this.clonePosition()));
                    }
                    this.bumpSpace();
                    if (!this.bumpIf('>')) {
                        return this.error(ErrorKind.INVALID_TAG, createLocation(endTagStartPosition, this.clonePosition()));
                    }
                    return {
                        val: {
                            type: TYPE.tag,
                            value: tagName,
                            children: children,
                            location: createLocation(startPosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                else {
                    return this.error(ErrorKind.UNCLOSED_TAG, createLocation(startPosition, this.clonePosition()));
                }
            }
            else {
                return this.error(ErrorKind.INVALID_TAG, createLocation(startPosition, this.clonePosition()));
            }
        };
        /**
         * This method assumes that the caller has peeked ahead for the first tag character.
         */
        Parser.prototype.parseTagName = function () {
            var startOffset = this.offset();
            this.bump(); // the first tag name character
            while (!this.isEOF() && _isPotentialElementNameChar(this.char())) {
                this.bump();
            }
            return this.message.slice(startOffset, this.offset());
        };
        Parser.prototype.parseLiteral = function (nestingLevel, parentArgType) {
            var start = this.clonePosition();
            var value = '';
            while (true) {
                var parseQuoteResult = this.tryParseQuote(parentArgType);
                if (parseQuoteResult) {
                    value += parseQuoteResult;
                    continue;
                }
                var parseUnquotedResult = this.tryParseUnquoted(nestingLevel, parentArgType);
                if (parseUnquotedResult) {
                    value += parseUnquotedResult;
                    continue;
                }
                var parseLeftAngleResult = this.tryParseLeftAngleBracket();
                if (parseLeftAngleResult) {
                    value += parseLeftAngleResult;
                    continue;
                }
                break;
            }
            var location = createLocation(start, this.clonePosition());
            return {
                val: { type: TYPE.literal, value: value, location: location },
                err: null,
            };
        };
        Parser.prototype.tryParseLeftAngleBracket = function () {
            if (!this.isEOF() &&
                this.char() === 60 /* `<` */ &&
                (this.ignoreTag ||
                    // If at the opening tag or closing tag position, bail.
                    !_isAlphaOrSlash(this.peek() || 0))) {
                this.bump(); // `<`
                return '<';
            }
            return null;
        };
        /**
         * Starting with ICU 4.8, an ASCII apostrophe only starts quoted text if it immediately precedes
         * a character that requires quoting (that is, "only where needed"), and works the same in
         * nested messages as on the top level of the pattern. The new behavior is otherwise compatible.
         */
        Parser.prototype.tryParseQuote = function (parentArgType) {
            if (this.isEOF() || this.char() !== 39 /* `'` */) {
                return null;
            }
            // Parse escaped char following the apostrophe, or early return if there is no escaped char.
            // Check if is valid escaped character
            switch (this.peek()) {
                case 39 /* `'` */:
                    // double quote, should return as a single quote.
                    this.bump();
                    this.bump();
                    return "'";
                // '{', '<', '>', '}'
                case 123:
                case 60:
                case 62:
                case 125:
                    break;
                case 35: // '#'
                    if (parentArgType === 'plural' || parentArgType === 'selectordinal') {
                        break;
                    }
                    return null;
                default:
                    return null;
            }
            this.bump(); // apostrophe
            var codePoints = [this.char()]; // escaped char
            this.bump();
            // read chars until the optional closing apostrophe is found
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch === 39 /* `'` */) {
                    if (this.peek() === 39 /* `'` */) {
                        codePoints.push(39);
                        // Bump one more time because we need to skip 2 characters.
                        this.bump();
                    }
                    else {
                        // Optional closing apostrophe.
                        this.bump();
                        break;
                    }
                }
                else {
                    codePoints.push(ch);
                }
                this.bump();
            }
            return fromCodePoint.apply(void 0, codePoints);
        };
        Parser.prototype.tryParseUnquoted = function (nestingLevel, parentArgType) {
            if (this.isEOF()) {
                return null;
            }
            var ch = this.char();
            if (ch === 60 /* `<` */ ||
                ch === 123 /* `{` */ ||
                (ch === 35 /* `#` */ &&
                    (parentArgType === 'plural' || parentArgType === 'selectordinal')) ||
                (ch === 125 /* `}` */ && nestingLevel > 0)) {
                return null;
            }
            else {
                this.bump();
                return fromCodePoint(ch);
            }
        };
        Parser.prototype.parseArgument = function (nestingLevel, expectingCloseTag) {
            var openingBracePosition = this.clonePosition();
            this.bump(); // `{`
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            if (this.char() === 125 /* `}` */) {
                this.bump();
                return this.error(ErrorKind.EMPTY_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            // argument name
            var value = this.parseIdentifierIfPossible().value;
            if (!value) {
                return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bumpSpace();
            if (this.isEOF()) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            switch (this.char()) {
                // Simple argument: `{name}`
                case 125 /* `}` */: {
                    this.bump(); // `}`
                    return {
                        val: {
                            type: TYPE.argument,
                            // value does not include the opening and closing braces.
                            value: value,
                            location: createLocation(openingBracePosition, this.clonePosition()),
                        },
                        err: null,
                    };
                }
                // Argument with options: `{name, format, ...}`
                case 44 /* `,` */: {
                    this.bump(); // `,`
                    this.bumpSpace();
                    if (this.isEOF()) {
                        return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
                    }
                    return this.parseArgumentOptions(nestingLevel, expectingCloseTag, value, openingBracePosition);
                }
                default:
                    return this.error(ErrorKind.MALFORMED_ARGUMENT, createLocation(openingBracePosition, this.clonePosition()));
            }
        };
        /**
         * Advance the parser until the end of the identifier, if it is currently on
         * an identifier character. Return an empty string otherwise.
         */
        Parser.prototype.parseIdentifierIfPossible = function () {
            var startingPosition = this.clonePosition();
            var startOffset = this.offset();
            var value = matchIdentifierAtIndex(this.message, startOffset);
            var endOffset = startOffset + value.length;
            this.bumpTo(endOffset);
            var endPosition = this.clonePosition();
            var location = createLocation(startingPosition, endPosition);
            return { value: value, location: location };
        };
        Parser.prototype.parseArgumentOptions = function (nestingLevel, expectingCloseTag, value, openingBracePosition) {
            var _a;
            // Parse this range:
            // {name, type, style}
            //        ^---^
            var typeStartPosition = this.clonePosition();
            var argType = this.parseIdentifierIfPossible().value;
            var typeEndPosition = this.clonePosition();
            switch (argType) {
                case '':
                    // Expecting a style string number, date, time, plural, selectordinal, or select.
                    return this.error(ErrorKind.EXPECT_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
                case 'number':
                case 'date':
                case 'time': {
                    // Parse this range:
                    // {name, number, style}
                    //              ^-------^
                    this.bumpSpace();
                    var styleAndLocation = null;
                    if (this.bumpIf(',')) {
                        this.bumpSpace();
                        var styleStartPosition = this.clonePosition();
                        var result = this.parseSimpleArgStyleIfPossible();
                        if (result.err) {
                            return result;
                        }
                        var style = trimEnd(result.val);
                        if (style.length === 0) {
                            return this.error(ErrorKind.EXPECT_ARGUMENT_STYLE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        var styleLocation = createLocation(styleStartPosition, this.clonePosition());
                        styleAndLocation = { style: style, styleLocation: styleLocation };
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_1 = createLocation(openingBracePosition, this.clonePosition());
                    // Extract style or skeleton
                    if (styleAndLocation && startsWith(styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style, '::', 0)) {
                        // Skeleton starts with `::`.
                        var skeleton = trimStart(styleAndLocation.style.slice(2));
                        if (argType === 'number') {
                            var result = this.parseNumberSkeletonFromString(skeleton, styleAndLocation.styleLocation);
                            if (result.err) {
                                return result;
                            }
                            return {
                                val: { type: TYPE.number, value: value, location: location_1, style: result.val },
                                err: null,
                            };
                        }
                        else {
                            if (skeleton.length === 0) {
                                return this.error(ErrorKind.EXPECT_DATE_TIME_SKELETON, location_1);
                            }
                            var style = {
                                type: SKELETON_TYPE.dateTime,
                                pattern: skeleton,
                                location: styleAndLocation.styleLocation,
                                parsedOptions: this.shouldParseSkeletons
                                    ? parseDateTimeSkeleton(skeleton)
                                    : {},
                            };
                            var type = argType === 'date' ? TYPE.date : TYPE.time;
                            return {
                                val: { type: type, value: value, location: location_1, style: style },
                                err: null,
                            };
                        }
                    }
                    // Regular style or no style.
                    return {
                        val: {
                            type: argType === 'number'
                                ? TYPE.number
                                : argType === 'date'
                                    ? TYPE.date
                                    : TYPE.time,
                            value: value,
                            location: location_1,
                            style: (_a = styleAndLocation === null || styleAndLocation === void 0 ? void 0 : styleAndLocation.style) !== null && _a !== void 0 ? _a : null,
                        },
                        err: null,
                    };
                }
                case 'plural':
                case 'selectordinal':
                case 'select': {
                    // Parse this range:
                    // {name, plural, options}
                    //              ^---------^
                    var typeEndPosition_1 = this.clonePosition();
                    this.bumpSpace();
                    if (!this.bumpIf(',')) {
                        return this.error(ErrorKind.EXPECT_SELECT_ARGUMENT_OPTIONS, createLocation(typeEndPosition_1, __assign({}, typeEndPosition_1)));
                    }
                    this.bumpSpace();
                    // Parse offset:
                    // {name, plural, offset:1, options}
                    //                ^-----^
                    //
                    // or the first option:
                    //
                    // {name, plural, one {...} other {...}}
                    //                ^--^
                    var identifierAndLocation = this.parseIdentifierIfPossible();
                    var pluralOffset = 0;
                    if (argType !== 'select' && identifierAndLocation.value === 'offset') {
                        if (!this.bumpIf(':')) {
                            return this.error(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, createLocation(this.clonePosition(), this.clonePosition()));
                        }
                        this.bumpSpace();
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_OFFSET_VALUE, ErrorKind.INVALID_PLURAL_ARGUMENT_OFFSET_VALUE);
                        if (result.err) {
                            return result;
                        }
                        // Parse another identifier for option parsing
                        this.bumpSpace();
                        identifierAndLocation = this.parseIdentifierIfPossible();
                        pluralOffset = result.val;
                    }
                    var optionsResult = this.tryParsePluralOrSelectOptions(nestingLevel, argType, expectingCloseTag, identifierAndLocation);
                    if (optionsResult.err) {
                        return optionsResult;
                    }
                    var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                    if (argCloseResult.err) {
                        return argCloseResult;
                    }
                    var location_2 = createLocation(openingBracePosition, this.clonePosition());
                    if (argType === 'select') {
                        return {
                            val: {
                                type: TYPE.select,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                    else {
                        return {
                            val: {
                                type: TYPE.plural,
                                value: value,
                                options: fromEntries(optionsResult.val),
                                offset: pluralOffset,
                                pluralType: argType === 'plural' ? 'cardinal' : 'ordinal',
                                location: location_2,
                            },
                            err: null,
                        };
                    }
                }
                default:
                    return this.error(ErrorKind.INVALID_ARGUMENT_TYPE, createLocation(typeStartPosition, typeEndPosition));
            }
        };
        Parser.prototype.tryParseArgumentClose = function (openingBracePosition) {
            // Parse: {value, number, ::currency/GBP }
            //
            if (this.isEOF() || this.char() !== 125 /* `}` */) {
                return this.error(ErrorKind.EXPECT_ARGUMENT_CLOSING_BRACE, createLocation(openingBracePosition, this.clonePosition()));
            }
            this.bump(); // `}`
            return { val: true, err: null };
        };
        /**
         * See: https://github.com/unicode-org/icu/blob/af7ed1f6d2298013dc303628438ec4abe1f16479/icu4c/source/common/messagepattern.cpp#L659
         */
        Parser.prototype.parseSimpleArgStyleIfPossible = function () {
            var nestedBraces = 0;
            var startPosition = this.clonePosition();
            while (!this.isEOF()) {
                var ch = this.char();
                switch (ch) {
                    case 39 /* `'` */: {
                        // Treat apostrophe as quoting but include it in the style part.
                        // Find the end of the quoted literal text.
                        this.bump();
                        var apostrophePosition = this.clonePosition();
                        if (!this.bumpUntil("'")) {
                            return this.error(ErrorKind.UNCLOSED_QUOTE_IN_ARGUMENT_STYLE, createLocation(apostrophePosition, this.clonePosition()));
                        }
                        this.bump();
                        break;
                    }
                    case 123 /* `{` */: {
                        nestedBraces += 1;
                        this.bump();
                        break;
                    }
                    case 125 /* `}` */: {
                        if (nestedBraces > 0) {
                            nestedBraces -= 1;
                        }
                        else {
                            return {
                                val: this.message.slice(startPosition.offset, this.offset()),
                                err: null,
                            };
                        }
                        break;
                    }
                    default:
                        this.bump();
                        break;
                }
            }
            return {
                val: this.message.slice(startPosition.offset, this.offset()),
                err: null,
            };
        };
        Parser.prototype.parseNumberSkeletonFromString = function (skeleton, location) {
            var tokens = [];
            try {
                tokens = parseNumberSkeletonFromString(skeleton);
            }
            catch (e) {
                return this.error(ErrorKind.INVALID_NUMBER_SKELETON, location);
            }
            return {
                val: {
                    type: SKELETON_TYPE.number,
                    tokens: tokens,
                    location: location,
                    parsedOptions: this.shouldParseSkeletons
                        ? parseNumberSkeleton(tokens)
                        : {},
                },
                err: null,
            };
        };
        /**
         * @param nesting_level The current nesting level of messages.
         *     This can be positive when parsing message fragment in select or plural argument options.
         * @param parent_arg_type The parent argument's type.
         * @param parsed_first_identifier If provided, this is the first identifier-like selector of
         *     the argument. It is a by-product of a previous parsing attempt.
         * @param expecting_close_tag If true, this message is directly or indirectly nested inside
         *     between a pair of opening and closing tags. The nested message will not parse beyond
         *     the closing tag boundary.
         */
        Parser.prototype.tryParsePluralOrSelectOptions = function (nestingLevel, parentArgType, expectCloseTag, parsedFirstIdentifier) {
            var _a;
            var hasOtherClause = false;
            var options = [];
            var parsedSelectors = new Set();
            var selector = parsedFirstIdentifier.value, selectorLocation = parsedFirstIdentifier.location;
            // Parse:
            // one {one apple}
            // ^--^
            while (true) {
                if (selector.length === 0) {
                    var startPosition = this.clonePosition();
                    if (parentArgType !== 'select' && this.bumpIf('=')) {
                        // Try parse `={number}` selector
                        var result = this.tryParseDecimalInteger(ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, ErrorKind.INVALID_PLURAL_ARGUMENT_SELECTOR);
                        if (result.err) {
                            return result;
                        }
                        selectorLocation = createLocation(startPosition, this.clonePosition());
                        selector = this.message.slice(startPosition.offset, this.offset());
                    }
                    else {
                        break;
                    }
                }
                // Duplicate selector clauses
                if (parsedSelectors.has(selector)) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.DUPLICATE_SELECT_ARGUMENT_SELECTOR
                        : ErrorKind.DUPLICATE_PLURAL_ARGUMENT_SELECTOR, selectorLocation);
                }
                if (selector === 'other') {
                    hasOtherClause = true;
                }
                // Parse:
                // one {one apple}
                //     ^----------^
                this.bumpSpace();
                var openingBracePosition = this.clonePosition();
                if (!this.bumpIf('{')) {
                    return this.error(parentArgType === 'select'
                        ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR_FRAGMENT
                        : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR_FRAGMENT, createLocation(this.clonePosition(), this.clonePosition()));
                }
                var fragmentResult = this.parseMessage(nestingLevel + 1, parentArgType, expectCloseTag);
                if (fragmentResult.err) {
                    return fragmentResult;
                }
                var argCloseResult = this.tryParseArgumentClose(openingBracePosition);
                if (argCloseResult.err) {
                    return argCloseResult;
                }
                options.push([
                    selector,
                    {
                        value: fragmentResult.val,
                        location: createLocation(openingBracePosition, this.clonePosition()),
                    },
                ]);
                // Keep track of the existing selectors
                parsedSelectors.add(selector);
                // Prep next selector clause.
                this.bumpSpace();
                (_a = this.parseIdentifierIfPossible(), selector = _a.value, selectorLocation = _a.location);
            }
            if (options.length === 0) {
                return this.error(parentArgType === 'select'
                    ? ErrorKind.EXPECT_SELECT_ARGUMENT_SELECTOR
                    : ErrorKind.EXPECT_PLURAL_ARGUMENT_SELECTOR, createLocation(this.clonePosition(), this.clonePosition()));
            }
            if (this.requiresOtherClause && !hasOtherClause) {
                return this.error(ErrorKind.MISSING_OTHER_CLAUSE, createLocation(this.clonePosition(), this.clonePosition()));
            }
            return { val: options, err: null };
        };
        Parser.prototype.tryParseDecimalInteger = function (expectNumberError, invalidNumberError) {
            var sign = 1;
            var startingPosition = this.clonePosition();
            if (this.bumpIf('+')) ;
            else if (this.bumpIf('-')) {
                sign = -1;
            }
            var hasDigits = false;
            var decimal = 0;
            while (!this.isEOF()) {
                var ch = this.char();
                if (ch >= 48 /* `0` */ && ch <= 57 /* `9` */) {
                    hasDigits = true;
                    decimal = decimal * 10 + (ch - 48);
                    this.bump();
                }
                else {
                    break;
                }
            }
            var location = createLocation(startingPosition, this.clonePosition());
            if (!hasDigits) {
                return this.error(expectNumberError, location);
            }
            decimal *= sign;
            if (!isSafeInteger(decimal)) {
                return this.error(invalidNumberError, location);
            }
            return { val: decimal, err: null };
        };
        Parser.prototype.offset = function () {
            return this.position.offset;
        };
        Parser.prototype.isEOF = function () {
            return this.offset() === this.message.length;
        };
        Parser.prototype.clonePosition = function () {
            // This is much faster than `Object.assign` or spread.
            return {
                offset: this.position.offset,
                line: this.position.line,
                column: this.position.column,
            };
        };
        /**
         * Return the code point at the current position of the parser.
         * Throws if the index is out of bound.
         */
        Parser.prototype.char = function () {
            var offset = this.position.offset;
            if (offset >= this.message.length) {
                throw Error('out of bound');
            }
            var code = codePointAt(this.message, offset);
            if (code === undefined) {
                throw Error("Offset ".concat(offset, " is at invalid UTF-16 code unit boundary"));
            }
            return code;
        };
        Parser.prototype.error = function (kind, location) {
            return {
                val: null,
                err: {
                    kind: kind,
                    message: this.message,
                    location: location,
                },
            };
        };
        /** Bump the parser to the next UTF-16 code unit. */
        Parser.prototype.bump = function () {
            if (this.isEOF()) {
                return;
            }
            var code = this.char();
            if (code === 10 /* '\n' */) {
                this.position.line += 1;
                this.position.column = 1;
                this.position.offset += 1;
            }
            else {
                this.position.column += 1;
                // 0 ~ 0x10000 -> unicode BMP, otherwise skip the surrogate pair.
                this.position.offset += code < 0x10000 ? 1 : 2;
            }
        };
        /**
         * If the substring starting at the current position of the parser has
         * the given prefix, then bump the parser to the character immediately
         * following the prefix and return true. Otherwise, don't bump the parser
         * and return false.
         */
        Parser.prototype.bumpIf = function (prefix) {
            if (startsWith(this.message, prefix, this.offset())) {
                for (var i = 0; i < prefix.length; i++) {
                    this.bump();
                }
                return true;
            }
            return false;
        };
        /**
         * Bump the parser until the pattern character is found and return `true`.
         * Otherwise bump to the end of the file and return `false`.
         */
        Parser.prototype.bumpUntil = function (pattern) {
            var currentOffset = this.offset();
            var index = this.message.indexOf(pattern, currentOffset);
            if (index >= 0) {
                this.bumpTo(index);
                return true;
            }
            else {
                this.bumpTo(this.message.length);
                return false;
            }
        };
        /**
         * Bump the parser to the target offset.
         * If target offset is beyond the end of the input, bump the parser to the end of the input.
         */
        Parser.prototype.bumpTo = function (targetOffset) {
            if (this.offset() > targetOffset) {
                throw Error("targetOffset ".concat(targetOffset, " must be greater than or equal to the current offset ").concat(this.offset()));
            }
            targetOffset = Math.min(targetOffset, this.message.length);
            while (true) {
                var offset = this.offset();
                if (offset === targetOffset) {
                    break;
                }
                if (offset > targetOffset) {
                    throw Error("targetOffset ".concat(targetOffset, " is at invalid UTF-16 code unit boundary"));
                }
                this.bump();
                if (this.isEOF()) {
                    break;
                }
            }
        };
        /** advance the parser through all whitespace to the next non-whitespace code unit. */
        Parser.prototype.bumpSpace = function () {
            while (!this.isEOF() && _isWhiteSpace(this.char())) {
                this.bump();
            }
        };
        /**
         * Peek at the *next* Unicode codepoint in the input without advancing the parser.
         * If the input has been exhausted, then this returns null.
         */
        Parser.prototype.peek = function () {
            if (this.isEOF()) {
                return null;
            }
            var code = this.char();
            var offset = this.offset();
            var nextCode = this.message.charCodeAt(offset + (code >= 0x10000 ? 2 : 1));
            return nextCode !== null && nextCode !== void 0 ? nextCode : null;
        };
        return Parser;
    }());
    /**
     * This check if codepoint is alphabet (lower & uppercase)
     * @param codepoint
     * @returns
     */
    function _isAlpha(codepoint) {
        return ((codepoint >= 97 && codepoint <= 122) ||
            (codepoint >= 65 && codepoint <= 90));
    }
    function _isAlphaOrSlash(codepoint) {
        return _isAlpha(codepoint) || codepoint === 47; /* '/' */
    }
    /** See `parseTag` function docs. */
    function _isPotentialElementNameChar(c) {
        return (c === 45 /* '-' */ ||
            c === 46 /* '.' */ ||
            (c >= 48 && c <= 57) /* 0..9 */ ||
            c === 95 /* '_' */ ||
            (c >= 97 && c <= 122) /** a..z */ ||
            (c >= 65 && c <= 90) /* A..Z */ ||
            c == 0xb7 ||
            (c >= 0xc0 && c <= 0xd6) ||
            (c >= 0xd8 && c <= 0xf6) ||
            (c >= 0xf8 && c <= 0x37d) ||
            (c >= 0x37f && c <= 0x1fff) ||
            (c >= 0x200c && c <= 0x200d) ||
            (c >= 0x203f && c <= 0x2040) ||
            (c >= 0x2070 && c <= 0x218f) ||
            (c >= 0x2c00 && c <= 0x2fef) ||
            (c >= 0x3001 && c <= 0xd7ff) ||
            (c >= 0xf900 && c <= 0xfdcf) ||
            (c >= 0xfdf0 && c <= 0xfffd) ||
            (c >= 0x10000 && c <= 0xeffff));
    }
    /**
     * Code point equivalent of regex `\p{White_Space}`.
     * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isWhiteSpace(c) {
        return ((c >= 0x0009 && c <= 0x000d) ||
            c === 0x0020 ||
            c === 0x0085 ||
            (c >= 0x200e && c <= 0x200f) ||
            c === 0x2028 ||
            c === 0x2029);
    }
    /**
     * Code point equivalent of regex `\p{Pattern_Syntax}`.
     * See https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
     */
    function _isPatternSyntax(c) {
        return ((c >= 0x0021 && c <= 0x0023) ||
            c === 0x0024 ||
            (c >= 0x0025 && c <= 0x0027) ||
            c === 0x0028 ||
            c === 0x0029 ||
            c === 0x002a ||
            c === 0x002b ||
            c === 0x002c ||
            c === 0x002d ||
            (c >= 0x002e && c <= 0x002f) ||
            (c >= 0x003a && c <= 0x003b) ||
            (c >= 0x003c && c <= 0x003e) ||
            (c >= 0x003f && c <= 0x0040) ||
            c === 0x005b ||
            c === 0x005c ||
            c === 0x005d ||
            c === 0x005e ||
            c === 0x0060 ||
            c === 0x007b ||
            c === 0x007c ||
            c === 0x007d ||
            c === 0x007e ||
            c === 0x00a1 ||
            (c >= 0x00a2 && c <= 0x00a5) ||
            c === 0x00a6 ||
            c === 0x00a7 ||
            c === 0x00a9 ||
            c === 0x00ab ||
            c === 0x00ac ||
            c === 0x00ae ||
            c === 0x00b0 ||
            c === 0x00b1 ||
            c === 0x00b6 ||
            c === 0x00bb ||
            c === 0x00bf ||
            c === 0x00d7 ||
            c === 0x00f7 ||
            (c >= 0x2010 && c <= 0x2015) ||
            (c >= 0x2016 && c <= 0x2017) ||
            c === 0x2018 ||
            c === 0x2019 ||
            c === 0x201a ||
            (c >= 0x201b && c <= 0x201c) ||
            c === 0x201d ||
            c === 0x201e ||
            c === 0x201f ||
            (c >= 0x2020 && c <= 0x2027) ||
            (c >= 0x2030 && c <= 0x2038) ||
            c === 0x2039 ||
            c === 0x203a ||
            (c >= 0x203b && c <= 0x203e) ||
            (c >= 0x2041 && c <= 0x2043) ||
            c === 0x2044 ||
            c === 0x2045 ||
            c === 0x2046 ||
            (c >= 0x2047 && c <= 0x2051) ||
            c === 0x2052 ||
            c === 0x2053 ||
            (c >= 0x2055 && c <= 0x205e) ||
            (c >= 0x2190 && c <= 0x2194) ||
            (c >= 0x2195 && c <= 0x2199) ||
            (c >= 0x219a && c <= 0x219b) ||
            (c >= 0x219c && c <= 0x219f) ||
            c === 0x21a0 ||
            (c >= 0x21a1 && c <= 0x21a2) ||
            c === 0x21a3 ||
            (c >= 0x21a4 && c <= 0x21a5) ||
            c === 0x21a6 ||
            (c >= 0x21a7 && c <= 0x21ad) ||
            c === 0x21ae ||
            (c >= 0x21af && c <= 0x21cd) ||
            (c >= 0x21ce && c <= 0x21cf) ||
            (c >= 0x21d0 && c <= 0x21d1) ||
            c === 0x21d2 ||
            c === 0x21d3 ||
            c === 0x21d4 ||
            (c >= 0x21d5 && c <= 0x21f3) ||
            (c >= 0x21f4 && c <= 0x22ff) ||
            (c >= 0x2300 && c <= 0x2307) ||
            c === 0x2308 ||
            c === 0x2309 ||
            c === 0x230a ||
            c === 0x230b ||
            (c >= 0x230c && c <= 0x231f) ||
            (c >= 0x2320 && c <= 0x2321) ||
            (c >= 0x2322 && c <= 0x2328) ||
            c === 0x2329 ||
            c === 0x232a ||
            (c >= 0x232b && c <= 0x237b) ||
            c === 0x237c ||
            (c >= 0x237d && c <= 0x239a) ||
            (c >= 0x239b && c <= 0x23b3) ||
            (c >= 0x23b4 && c <= 0x23db) ||
            (c >= 0x23dc && c <= 0x23e1) ||
            (c >= 0x23e2 && c <= 0x2426) ||
            (c >= 0x2427 && c <= 0x243f) ||
            (c >= 0x2440 && c <= 0x244a) ||
            (c >= 0x244b && c <= 0x245f) ||
            (c >= 0x2500 && c <= 0x25b6) ||
            c === 0x25b7 ||
            (c >= 0x25b8 && c <= 0x25c0) ||
            c === 0x25c1 ||
            (c >= 0x25c2 && c <= 0x25f7) ||
            (c >= 0x25f8 && c <= 0x25ff) ||
            (c >= 0x2600 && c <= 0x266e) ||
            c === 0x266f ||
            (c >= 0x2670 && c <= 0x2767) ||
            c === 0x2768 ||
            c === 0x2769 ||
            c === 0x276a ||
            c === 0x276b ||
            c === 0x276c ||
            c === 0x276d ||
            c === 0x276e ||
            c === 0x276f ||
            c === 0x2770 ||
            c === 0x2771 ||
            c === 0x2772 ||
            c === 0x2773 ||
            c === 0x2774 ||
            c === 0x2775 ||
            (c >= 0x2794 && c <= 0x27bf) ||
            (c >= 0x27c0 && c <= 0x27c4) ||
            c === 0x27c5 ||
            c === 0x27c6 ||
            (c >= 0x27c7 && c <= 0x27e5) ||
            c === 0x27e6 ||
            c === 0x27e7 ||
            c === 0x27e8 ||
            c === 0x27e9 ||
            c === 0x27ea ||
            c === 0x27eb ||
            c === 0x27ec ||
            c === 0x27ed ||
            c === 0x27ee ||
            c === 0x27ef ||
            (c >= 0x27f0 && c <= 0x27ff) ||
            (c >= 0x2800 && c <= 0x28ff) ||
            (c >= 0x2900 && c <= 0x2982) ||
            c === 0x2983 ||
            c === 0x2984 ||
            c === 0x2985 ||
            c === 0x2986 ||
            c === 0x2987 ||
            c === 0x2988 ||
            c === 0x2989 ||
            c === 0x298a ||
            c === 0x298b ||
            c === 0x298c ||
            c === 0x298d ||
            c === 0x298e ||
            c === 0x298f ||
            c === 0x2990 ||
            c === 0x2991 ||
            c === 0x2992 ||
            c === 0x2993 ||
            c === 0x2994 ||
            c === 0x2995 ||
            c === 0x2996 ||
            c === 0x2997 ||
            c === 0x2998 ||
            (c >= 0x2999 && c <= 0x29d7) ||
            c === 0x29d8 ||
            c === 0x29d9 ||
            c === 0x29da ||
            c === 0x29db ||
            (c >= 0x29dc && c <= 0x29fb) ||
            c === 0x29fc ||
            c === 0x29fd ||
            (c >= 0x29fe && c <= 0x2aff) ||
            (c >= 0x2b00 && c <= 0x2b2f) ||
            (c >= 0x2b30 && c <= 0x2b44) ||
            (c >= 0x2b45 && c <= 0x2b46) ||
            (c >= 0x2b47 && c <= 0x2b4c) ||
            (c >= 0x2b4d && c <= 0x2b73) ||
            (c >= 0x2b74 && c <= 0x2b75) ||
            (c >= 0x2b76 && c <= 0x2b95) ||
            c === 0x2b96 ||
            (c >= 0x2b97 && c <= 0x2bff) ||
            (c >= 0x2e00 && c <= 0x2e01) ||
            c === 0x2e02 ||
            c === 0x2e03 ||
            c === 0x2e04 ||
            c === 0x2e05 ||
            (c >= 0x2e06 && c <= 0x2e08) ||
            c === 0x2e09 ||
            c === 0x2e0a ||
            c === 0x2e0b ||
            c === 0x2e0c ||
            c === 0x2e0d ||
            (c >= 0x2e0e && c <= 0x2e16) ||
            c === 0x2e17 ||
            (c >= 0x2e18 && c <= 0x2e19) ||
            c === 0x2e1a ||
            c === 0x2e1b ||
            c === 0x2e1c ||
            c === 0x2e1d ||
            (c >= 0x2e1e && c <= 0x2e1f) ||
            c === 0x2e20 ||
            c === 0x2e21 ||
            c === 0x2e22 ||
            c === 0x2e23 ||
            c === 0x2e24 ||
            c === 0x2e25 ||
            c === 0x2e26 ||
            c === 0x2e27 ||
            c === 0x2e28 ||
            c === 0x2e29 ||
            (c >= 0x2e2a && c <= 0x2e2e) ||
            c === 0x2e2f ||
            (c >= 0x2e30 && c <= 0x2e39) ||
            (c >= 0x2e3a && c <= 0x2e3b) ||
            (c >= 0x2e3c && c <= 0x2e3f) ||
            c === 0x2e40 ||
            c === 0x2e41 ||
            c === 0x2e42 ||
            (c >= 0x2e43 && c <= 0x2e4f) ||
            (c >= 0x2e50 && c <= 0x2e51) ||
            c === 0x2e52 ||
            (c >= 0x2e53 && c <= 0x2e7f) ||
            (c >= 0x3001 && c <= 0x3003) ||
            c === 0x3008 ||
            c === 0x3009 ||
            c === 0x300a ||
            c === 0x300b ||
            c === 0x300c ||
            c === 0x300d ||
            c === 0x300e ||
            c === 0x300f ||
            c === 0x3010 ||
            c === 0x3011 ||
            (c >= 0x3012 && c <= 0x3013) ||
            c === 0x3014 ||
            c === 0x3015 ||
            c === 0x3016 ||
            c === 0x3017 ||
            c === 0x3018 ||
            c === 0x3019 ||
            c === 0x301a ||
            c === 0x301b ||
            c === 0x301c ||
            c === 0x301d ||
            (c >= 0x301e && c <= 0x301f) ||
            c === 0x3020 ||
            c === 0x3030 ||
            c === 0xfd3e ||
            c === 0xfd3f ||
            (c >= 0xfe45 && c <= 0xfe46));
    }

    function pruneLocation(els) {
        els.forEach(function (el) {
            delete el.location;
            if (isSelectElement(el) || isPluralElement(el)) {
                for (var k in el.options) {
                    delete el.options[k].location;
                    pruneLocation(el.options[k].value);
                }
            }
            else if (isNumberElement(el) && isNumberSkeleton(el.style)) {
                delete el.style.location;
            }
            else if ((isDateElement(el) || isTimeElement(el)) &&
                isDateTimeSkeleton(el.style)) {
                delete el.style.location;
            }
            else if (isTagElement(el)) {
                pruneLocation(el.children);
            }
        });
    }
    function parse(message, opts) {
        if (opts === void 0) { opts = {}; }
        opts = __assign({ shouldParseSkeletons: true, requiresOtherClause: true }, opts);
        var result = new Parser(message, opts).parse();
        if (result.err) {
            var error = SyntaxError(ErrorKind[result.err.kind]);
            // @ts-expect-error Assign to error object
            error.location = result.err.location;
            // @ts-expect-error Assign to error object
            error.originalMessage = result.err.message;
            throw error;
        }
        if (!(opts === null || opts === void 0 ? void 0 : opts.captureLocation)) {
            pruneLocation(result.val);
        }
        return result.val;
    }

    //
    // Main
    //
    function memoize(fn, options) {
        var cache = options && options.cache ? options.cache : cacheDefault;
        var serializer = options && options.serializer ? options.serializer : serializerDefault;
        var strategy = options && options.strategy ? options.strategy : strategyDefault;
        return strategy(fn, {
            cache: cache,
            serializer: serializer,
        });
    }
    //
    // Strategy
    //
    function isPrimitive(value) {
        return (value == null || typeof value === 'number' || typeof value === 'boolean'); // || typeof value === "string" 'unsafe' primitive for our needs
    }
    function monadic(fn, cache, serializer, arg) {
        var cacheKey = isPrimitive(arg) ? arg : serializer(arg);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.call(this, arg);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function variadic(fn, cache, serializer) {
        var args = Array.prototype.slice.call(arguments, 3);
        var cacheKey = serializer(args);
        var computedValue = cache.get(cacheKey);
        if (typeof computedValue === 'undefined') {
            computedValue = fn.apply(this, args);
            cache.set(cacheKey, computedValue);
        }
        return computedValue;
    }
    function assemble(fn, context, strategy, cache, serialize) {
        return strategy.bind(context, fn, cache, serialize);
    }
    function strategyDefault(fn, options) {
        var strategy = fn.length === 1 ? monadic : variadic;
        return assemble(fn, this, strategy, options.cache.create(), options.serializer);
    }
    function strategyVariadic(fn, options) {
        return assemble(fn, this, variadic, options.cache.create(), options.serializer);
    }
    function strategyMonadic(fn, options) {
        return assemble(fn, this, monadic, options.cache.create(), options.serializer);
    }
    //
    // Serializer
    //
    var serializerDefault = function () {
        return JSON.stringify(arguments);
    };
    //
    // Cache
    //
    function ObjectWithoutPrototypeCache() {
        this.cache = Object.create(null);
    }
    ObjectWithoutPrototypeCache.prototype.get = function (key) {
        return this.cache[key];
    };
    ObjectWithoutPrototypeCache.prototype.set = function (key, value) {
        this.cache[key] = value;
    };
    var cacheDefault = {
        create: function create() {
            // @ts-ignore
            return new ObjectWithoutPrototypeCache();
        },
    };
    var strategies = {
        variadic: strategyVariadic,
        monadic: strategyMonadic,
    };

    var ErrorCode;
    (function (ErrorCode) {
        // When we have a placeholder but no value to format
        ErrorCode["MISSING_VALUE"] = "MISSING_VALUE";
        // When value supplied is invalid
        ErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
        // When we need specific Intl API but it's not available
        ErrorCode["MISSING_INTL_API"] = "MISSING_INTL_API";
    })(ErrorCode || (ErrorCode = {}));
    var FormatError = /** @class */ (function (_super) {
        __extends(FormatError, _super);
        function FormatError(msg, code, originalMessage) {
            var _this = _super.call(this, msg) || this;
            _this.code = code;
            _this.originalMessage = originalMessage;
            return _this;
        }
        FormatError.prototype.toString = function () {
            return "[formatjs Error: ".concat(this.code, "] ").concat(this.message);
        };
        return FormatError;
    }(Error));
    var InvalidValueError = /** @class */ (function (_super) {
        __extends(InvalidValueError, _super);
        function InvalidValueError(variableId, value, options, originalMessage) {
            return _super.call(this, "Invalid values for \"".concat(variableId, "\": \"").concat(value, "\". Options are \"").concat(Object.keys(options).join('", "'), "\""), ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueError;
    }(FormatError));
    var InvalidValueTypeError = /** @class */ (function (_super) {
        __extends(InvalidValueTypeError, _super);
        function InvalidValueTypeError(value, type, originalMessage) {
            return _super.call(this, "Value for \"".concat(value, "\" must be of type ").concat(type), ErrorCode.INVALID_VALUE, originalMessage) || this;
        }
        return InvalidValueTypeError;
    }(FormatError));
    var MissingValueError = /** @class */ (function (_super) {
        __extends(MissingValueError, _super);
        function MissingValueError(variableId, originalMessage) {
            return _super.call(this, "The intl string context variable \"".concat(variableId, "\" was not provided to the string \"").concat(originalMessage, "\""), ErrorCode.MISSING_VALUE, originalMessage) || this;
        }
        return MissingValueError;
    }(FormatError));

    var PART_TYPE;
    (function (PART_TYPE) {
        PART_TYPE[PART_TYPE["literal"] = 0] = "literal";
        PART_TYPE[PART_TYPE["object"] = 1] = "object";
    })(PART_TYPE || (PART_TYPE = {}));
    function mergeLiteral(parts) {
        if (parts.length < 2) {
            return parts;
        }
        return parts.reduce(function (all, part) {
            var lastPart = all[all.length - 1];
            if (!lastPart ||
                lastPart.type !== PART_TYPE.literal ||
                part.type !== PART_TYPE.literal) {
                all.push(part);
            }
            else {
                lastPart.value += part.value;
            }
            return all;
        }, []);
    }
    function isFormatXMLElementFn(el) {
        return typeof el === 'function';
    }
    // TODO(skeleton): add skeleton support
    function formatToParts(els, locales, formatters, formats, values, currentPluralValue, 
    // For debugging
    originalMessage) {
        // Hot path for straight simple msg translations
        if (els.length === 1 && isLiteralElement(els[0])) {
            return [
                {
                    type: PART_TYPE.literal,
                    value: els[0].value,
                },
            ];
        }
        var result = [];
        for (var _i = 0, els_1 = els; _i < els_1.length; _i++) {
            var el = els_1[_i];
            // Exit early for string parts.
            if (isLiteralElement(el)) {
                result.push({
                    type: PART_TYPE.literal,
                    value: el.value,
                });
                continue;
            }
            // TODO: should this part be literal type?
            // Replace `#` in plural rules with the actual numeric value.
            if (isPoundElement(el)) {
                if (typeof currentPluralValue === 'number') {
                    result.push({
                        type: PART_TYPE.literal,
                        value: formatters.getNumberFormat(locales).format(currentPluralValue),
                    });
                }
                continue;
            }
            var varName = el.value;
            // Enforce that all required values are provided by the caller.
            if (!(values && varName in values)) {
                throw new MissingValueError(varName, originalMessage);
            }
            var value = values[varName];
            if (isArgumentElement(el)) {
                if (!value || typeof value === 'string' || typeof value === 'number') {
                    value =
                        typeof value === 'string' || typeof value === 'number'
                            ? String(value)
                            : '';
                }
                result.push({
                    type: typeof value === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                    value: value,
                });
                continue;
            }
            // Recursively format plural and select parts' option — which can be a
            // nested pattern structure. The choosing of the option to use is
            // abstracted-by and delegated-to the part helper object.
            if (isDateElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.date[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTimeElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.time[el.style]
                    : isDateTimeSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getDateTimeFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isNumberElement(el)) {
                var style = typeof el.style === 'string'
                    ? formats.number[el.style]
                    : isNumberSkeleton(el.style)
                        ? el.style.parsedOptions
                        : undefined;
                if (style && style.scale) {
                    value =
                        value *
                            (style.scale || 1);
                }
                result.push({
                    type: PART_TYPE.literal,
                    value: formatters
                        .getNumberFormat(locales, style)
                        .format(value),
                });
                continue;
            }
            if (isTagElement(el)) {
                var children = el.children, value_1 = el.value;
                var formatFn = values[value_1];
                if (!isFormatXMLElementFn(formatFn)) {
                    throw new InvalidValueTypeError(value_1, 'function', originalMessage);
                }
                var parts = formatToParts(children, locales, formatters, formats, values, currentPluralValue);
                var chunks = formatFn(parts.map(function (p) { return p.value; }));
                if (!Array.isArray(chunks)) {
                    chunks = [chunks];
                }
                result.push.apply(result, chunks.map(function (c) {
                    return {
                        type: typeof c === 'string' ? PART_TYPE.literal : PART_TYPE.object,
                        value: c,
                    };
                }));
            }
            if (isSelectElement(el)) {
                var opt = el.options[value] || el.options.other;
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values));
                continue;
            }
            if (isPluralElement(el)) {
                var opt = el.options["=".concat(value)];
                if (!opt) {
                    if (!Intl.PluralRules) {
                        throw new FormatError("Intl.PluralRules is not available in this environment.\nTry polyfilling it using \"@formatjs/intl-pluralrules\"\n", ErrorCode.MISSING_INTL_API, originalMessage);
                    }
                    var rule = formatters
                        .getPluralRules(locales, { type: el.pluralType })
                        .select(value - (el.offset || 0));
                    opt = el.options[rule] || el.options.other;
                }
                if (!opt) {
                    throw new InvalidValueError(el.value, value, Object.keys(el.options), originalMessage);
                }
                result.push.apply(result, formatToParts(opt.value, locales, formatters, formats, values, value - (el.offset || 0)));
                continue;
            }
        }
        return mergeLiteral(result);
    }

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    // -- MessageFormat --------------------------------------------------------
    function mergeConfig(c1, c2) {
        if (!c2) {
            return c1;
        }
        return __assign(__assign(__assign({}, (c1 || {})), (c2 || {})), Object.keys(c1).reduce(function (all, k) {
            all[k] = __assign(__assign({}, c1[k]), (c2[k] || {}));
            return all;
        }, {}));
    }
    function mergeConfigs(defaultConfig, configs) {
        if (!configs) {
            return defaultConfig;
        }
        return Object.keys(defaultConfig).reduce(function (all, k) {
            all[k] = mergeConfig(defaultConfig[k], configs[k]);
            return all;
        }, __assign({}, defaultConfig));
    }
    function createFastMemoizeCache(store) {
        return {
            create: function () {
                return {
                    get: function (key) {
                        return store[key];
                    },
                    set: function (key, value) {
                        store[key] = value;
                    },
                };
            },
        };
    }
    function createDefaultFormatters(cache) {
        if (cache === void 0) { cache = {
            number: {},
            dateTime: {},
            pluralRules: {},
        }; }
        return {
            getNumberFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.NumberFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.number),
                strategy: strategies.variadic,
            }),
            getDateTimeFormat: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.DateTimeFormat).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.dateTime),
                strategy: strategies.variadic,
            }),
            getPluralRules: memoize(function () {
                var _a;
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return new ((_a = Intl.PluralRules).bind.apply(_a, __spreadArray([void 0], args, false)))();
            }, {
                cache: createFastMemoizeCache(cache.pluralRules),
                strategy: strategies.variadic,
            }),
        };
    }
    var IntlMessageFormat = /** @class */ (function () {
        function IntlMessageFormat(message, locales, overrideFormats, opts) {
            var _this = this;
            if (locales === void 0) { locales = IntlMessageFormat.defaultLocale; }
            this.formatterCache = {
                number: {},
                dateTime: {},
                pluralRules: {},
            };
            this.format = function (values) {
                var parts = _this.formatToParts(values);
                // Hot path for straight simple msg translations
                if (parts.length === 1) {
                    return parts[0].value;
                }
                var result = parts.reduce(function (all, part) {
                    if (!all.length ||
                        part.type !== PART_TYPE.literal ||
                        typeof all[all.length - 1] !== 'string') {
                        all.push(part.value);
                    }
                    else {
                        all[all.length - 1] += part.value;
                    }
                    return all;
                }, []);
                if (result.length <= 1) {
                    return result[0] || '';
                }
                return result;
            };
            this.formatToParts = function (values) {
                return formatToParts(_this.ast, _this.locales, _this.formatters, _this.formats, values, undefined, _this.message);
            };
            this.resolvedOptions = function () { return ({
                locale: Intl.NumberFormat.supportedLocalesOf(_this.locales)[0],
            }); };
            this.getAst = function () { return _this.ast; };
            if (typeof message === 'string') {
                this.message = message;
                if (!IntlMessageFormat.__parse) {
                    throw new TypeError('IntlMessageFormat.__parse must be set to process `message` of type `string`');
                }
                // Parse string messages into an AST.
                this.ast = IntlMessageFormat.__parse(message, {
                    ignoreTag: opts === null || opts === void 0 ? void 0 : opts.ignoreTag,
                });
            }
            else {
                this.ast = message;
            }
            if (!Array.isArray(this.ast)) {
                throw new TypeError('A message must be provided as a String or AST.');
            }
            // Creates a new object with the specified `formats` merged with the default
            // formats.
            this.formats = mergeConfigs(IntlMessageFormat.formats, overrideFormats);
            // Defined first because it's used to build the format pattern.
            this.locales = locales;
            this.formatters =
                (opts && opts.formatters) || createDefaultFormatters(this.formatterCache);
        }
        Object.defineProperty(IntlMessageFormat, "defaultLocale", {
            get: function () {
                if (!IntlMessageFormat.memoizedDefaultLocale) {
                    IntlMessageFormat.memoizedDefaultLocale =
                        new Intl.NumberFormat().resolvedOptions().locale;
                }
                return IntlMessageFormat.memoizedDefaultLocale;
            },
            enumerable: false,
            configurable: true
        });
        IntlMessageFormat.memoizedDefaultLocale = null;
        IntlMessageFormat.__parse = parse;
        // Default format options used as the prototype of the `formats` provided to the
        // constructor. These are used when constructing the internal Intl.NumberFormat
        // and Intl.DateTimeFormat instances.
        IntlMessageFormat.formats = {
            number: {
                integer: {
                    maximumFractionDigits: 0,
                },
                currency: {
                    style: 'currency',
                },
                percent: {
                    style: 'percent',
                },
            },
            date: {
                short: {
                    month: 'numeric',
                    day: 'numeric',
                    year: '2-digit',
                },
                medium: {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                },
                long: {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
                full: {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                },
            },
            time: {
                short: {
                    hour: 'numeric',
                    minute: 'numeric',
                },
                medium: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                },
                long: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
                full: {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    timeZoneName: 'short',
                },
            },
        };
        return IntlMessageFormat;
    }());

    /*
    Copyright (c) 2014, Yahoo! Inc. All rights reserved.
    Copyrights licensed under the New BSD License.
    See the accompanying LICENSE file for terms.
    */
    var o = IntlMessageFormat;

    const r={},i=(e,n,t)=>t?(n in r||(r[n]={}),e in r[n]||(r[n][e]=t),t):t,l=(e,n)=>{if(null==n)return;if(n in r&&e in r[n])return r[n][e];const t=E(n);for(let o=0;o<t.length;o++){const r=c(t[o],e);if(r)return i(e,n,r)}};let a;const s=writable({});function u(e){return e in a}function c(e,n){if(!u(e))return null;return function(e,n){if(null==n)return;if(n in e)return e[n];const t=n.split(".");let o=e;for(let e=0;e<t.length;e++)if("object"==typeof o){if(e>0){const n=t.slice(e,t.length).join(".");if(n in o){o=o[n];break}}o=o[t[e]];}else o=void 0;return o}(function(e){return a[e]||null}(e),n)}function m(e,...n){delete r[e],s.update((o=>(o[e]=cjs.all([o[e]||{},...n]),o)));}const f=derived([s],(([e])=>Object.keys(e)));s.subscribe((e=>a=e));const d={};function g(e){return d[e]}function w(e){return null!=e&&E(e).some((e=>{var n;return null===(n=g(e))||void 0===n?void 0:n.size}))}function h(e,n){return Promise.all(n.map((n=>(function(e,n){d[e].delete(n),0===d[e].size&&delete d[e];}(e,n),n().then((e=>e.default||e)))))).then((n=>m(e,...n)))}const p={};function b(e){if(!w(e))return e in p?p[e]:Promise.resolve();const n=function(e){return E(e).map((e=>{const n=g(e);return [e,n?[...n]:[]]})).filter((([,e])=>e.length>0))}(e);return p[e]=Promise.all(n.map((([e,n])=>h(e,n)))).then((()=>{if(w(e))return b(e);delete p[e];})),p[e]}/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */function v(e,n){var t={};for(var o in e)Object.prototype.hasOwnProperty.call(e,o)&&n.indexOf(o)<0&&(t[o]=e[o]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols){var r=0;for(o=Object.getOwnPropertySymbols(e);r<o.length;r++)n.indexOf(o[r])<0&&Object.prototype.propertyIsEnumerable.call(e,o[r])&&(t[o[r]]=e[o[r]]);}return t}const O={fallbackLocale:null,loadingDelay:200,formats:{number:{scientific:{notation:"scientific"},engineering:{notation:"engineering"},compactLong:{notation:"compact",compactDisplay:"long"},compactShort:{notation:"compact",compactDisplay:"short"}},date:{short:{month:"numeric",day:"numeric",year:"2-digit"},medium:{month:"short",day:"numeric",year:"numeric"},long:{month:"long",day:"numeric",year:"numeric"},full:{weekday:"long",month:"long",day:"numeric",year:"numeric"}},time:{short:{hour:"numeric",minute:"numeric"},medium:{hour:"numeric",minute:"numeric",second:"numeric"},long:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"},full:{hour:"numeric",minute:"numeric",second:"numeric",timeZoneName:"short"}}},warnOnMissingMessages:!0,ignoreTag:!0};function j(){return O}function $(e){const{formats:n}=e,t=v(e,["formats"]),o=e.initialLocale||e.fallbackLocale;return Object.assign(O,t,{initialLocale:o}),n&&("number"in n&&Object.assign(O.formats.number,n.number),"date"in n&&Object.assign(O.formats.date,n.date),"time"in n&&Object.assign(O.formats.time,n.time)),M.set(o)}const k=writable(!1);let L;const T=writable(null);function x(e){return e.split("-").map(((e,n,t)=>t.slice(0,n+1).join("-"))).reverse()}function E(e,n=j().fallbackLocale){const t=x(e);return n?[...new Set([...t,...x(n)])]:t}function D(){return null!=L?L:void 0}T.subscribe((e=>{L=null!=e?e:void 0,"undefined"!=typeof window&&null!=e&&document.documentElement.setAttribute("lang",e);}));const M=Object.assign(Object.assign({},T),{set:e=>{if(e&&function(e){if(null==e)return;const n=E(e);for(let e=0;e<n.length;e++){const t=n[e];if(u(t))return t}}(e)&&w(e)){const{loadingDelay:n}=j();let t;return "undefined"!=typeof window&&null!=D()&&n?t=window.setTimeout((()=>k.set(!0)),n):k.set(!0),b(e).then((()=>{T.set(e);})).finally((()=>{clearTimeout(t),k.set(!1);}))}return T.set(e)}}),P=(e,n)=>{const t=e.split("&").find((e=>0===e.indexOf(`${n}=`)));return t?t.split("=").pop():null},F=e=>"undefined"==typeof window?null:P(window.location.search.substr(1),e),Z=e=>{const n=Object.create(null);return t=>{const o=JSON.stringify(t);return o in n?n[o]:n[o]=e(t)}},C=(e,n)=>{const{formats:t}=j();if(e in t&&n in t[e])return t[e][n];throw new Error(`[svelte-i18n] Unknown "${n}" ${e} format.`)},G=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format numbers');return t&&(o=C("number",t)),new Intl.NumberFormat(n,o)})),J=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format dates');return t?o=C("date",t):0===Object.keys(o).length&&(o=C("date","short")),new Intl.DateTimeFormat(n,o)})),U=Z((e=>{var{locale:n,format:t}=e,o=v(e,["locale","format"]);if(null==n)throw new Error('[svelte-i18n] A "locale" must be set to format time values');return t?o=C("time",t):0===Object.keys(o).length&&(o=C("time","short")),new Intl.DateTimeFormat(n,o)})),_$1=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return G(Object.assign({locale:n},t))},q=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return J(Object.assign({locale:n},t))},B=(e={})=>{var{locale:n=D()}=e,t=v(e,["locale"]);return U(Object.assign({locale:n},t))},H=Z(((e,n=D())=>new o(e,n,j().formats,{ignoreTag:j().ignoreTag}))),K=(e,n={})=>{let t=n;"object"==typeof e&&(t=e,e=t.id);const{values:o,locale:r=D(),default:i}=t;if(null==r)throw new Error("[svelte-i18n] Cannot format a message without first setting the initial locale.");let a=l(e,r);if(a){if("string"!=typeof a)return console.warn(`[svelte-i18n] Message with id "${e}" must be of type "string", found: "${typeof a}". Gettin its value through the "$format" method is deprecated; use the "json" method instead.`),a}else j().warnOnMissingMessages&&console.warn(`[svelte-i18n] The message "${e}" was not found in "${E(r).join('", "')}".${w(D())?"\n\nNote: there are at least one loader still registered to this locale that wasn't executed.":""}`),a=null!=i?i:e;if(!o)return a;let s=a;try{s=H(a,r).format(o);}catch(n){console.warn(`[svelte-i18n] Message "${e}" has syntax error:`,n.message);}return s},Q=(e,n)=>B(n).format(e),R=(e,n)=>q(n).format(e),V=(e,n)=>_$1(n).format(e),W=(e,n=D())=>l(e,n),X=derived([M,s],(()=>K));derived([M],(()=>Q));derived([M],(()=>R));derived([M],(()=>V));derived([M,s],(()=>W));

    var lang$1 = "English";
    var navbar$1 = {
    	title: "Tablet Weaving",
    	templates: "Templates",
    	display: "Display",
    	preview: {
    		weave: "Preview weave",
    		size: "Size",
    		outline: "Thread outline",
    		weft: "Weft"
    	}
    };
    var chart$1 = {
    	title: "Threading Chart",
    	tablet: {
    		holes: "Tablet hole index description: A = top front; B - bottom front; C - bottom back; D - top back",
    		add: "Add tablet",
    		remove: "Remove tablet",
    		index: "Tablet #{index}",
    		"switch": "Invert tablet slant",
    		color: "Choose colour"
    	},
    	summary: {
    		title: "Threading overview",
    		weft: "Weft thread",
    		length: "Length",
    		weaveAllowance: "Weave allowance",
    		tabletAllowance: "Tablet allowance",
    		perThread: "/ thread"
    	}
    };
    var preview$1 = {
    	patternDevelopment: {
    		title: "Pattern Development",
    		show: "Show pattern development",
    		hide: "Hide pattern development",
    		reset: "Reset all tablet rotation directions",
    		switchAll: "Invert tablet rotation directions for this row",
    		index: "{column}, {row}"
    	},
    	front: {
    		title: "Front Weave"
    	},
    	back: {
    		title: "Back Weave",
    		show: "Show back",
    		hide: "Hide back"
    	},
    	rows: {
    		add: "Add weave row",
    		remove: "Remove weave row"
    	}
    };
    var en = {
    	lang: lang$1,
    	navbar: navbar$1,
    	chart: chart$1,
    	preview: preview$1
    };

    var lang = "Deutsch";
    var navbar = {
    	title: "Brettchenweben",
    	templates: "Vorlagen",
    	display: "Anzeige",
    	preview: {
    		weave: "Vorschau Gewebe",
    		size: "Größe",
    		outline: "Fadenumrisse",
    		weft: "Schussfaden"
    	}
    };
    var chart = {
    	title: "Schärbrief",
    	tablet: {
    		holes: "Brettchen-Löcher: A = oben vorne; B - unten vorne; C - unten hinten; D - oben hinten",
    		add: "Brettchen hinzufügen",
    		remove: "Brettchen entfernen",
    		index: "Brettchen #{index}",
    		"switch": "Schärung umkehren",
    		color: "Farbe wählen"
    	},
    	summary: {
    		title: "Fadenübersicht",
    		weft: "Schussfaden",
    		length: "Länge",
    		weaveAllowance: "Webzugabe",
    		tabletAllowance: "Zugabe Brettchen",
    		perThread: "/ Faden"
    	}
    };
    var preview = {
    	patternDevelopment: {
    		title: "Webbrief",
    		show: "Webbrief anzeigen",
    		hide: "Webbrief ausblenden",
    		reset: "Alle Drehrichtungen zurücksetzen",
    		switchAll: "Drehrichtung für diese Reihe umkehren",
    		index: "{column}, {row}"
    	},
    	front: {
    		title: "Vorderseite"
    	},
    	back: {
    		title: "Rückseite",
    		show: "Rückseite des Webbandes anzeigen",
    		hide: "Rückseite ausblenden"
    	},
    	rows: {
    		add: "Webreihe hinzufügen",
    		remove: "Webreihe entfernen"
    	}
    };
    var de = {
    	lang: lang,
    	navbar: navbar,
    	chart: chart,
    	preview: preview
    };

    class AppConfig {
        constructor() {
            this.weaveSize = 3;
            this.weaveBorderColor = '#AAAAAA';
            this.weftColor = '#000000';
            this.weaveLength = 100;
        }
    }

    const storedAppConfig = localStorage.appConfig ? JSON.parse(localStorage.appConfig) : new AppConfig();
    const appConfig = writable(storedAppConfig);
    appConfig.subscribe((value) => localStorage.appConfig = JSON.stringify(value));

    class ColorIndex {
        constructor(color, count) {
            this.color = color;
            this.count = count;
        }
    }

    class Tablet {
        constructor(sDirection, holes, threads) {
            this.sDirection = sDirection;
            this.holes = holes;
            this.threads = threads;
        }
    }

    class Thread {
        constructor(color) {
            this.color = color;
        }
    }

    ///////////////////////////////////////////////////////////
    // Writable stores
    ///////////////////////////////////////////////////////////
    const initTablets = [
        new Tablet(true, 4, [new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87")]),
        new Tablet(true, 4, [new Thread("#ffffff"), new Thread("#d3d7cf"), new Thread("#ffffff"), new Thread("#ffffff")]),
        new Tablet(true, 4, [new Thread("#ffffff"), new Thread("#d3d7cf"), new Thread("#ffffff"), new Thread("#ffffff")]),
        new Tablet(true, 4, [new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87"), new Thread("#204a87")])
    ];
    const storedWeaveRows = localStorage.weaveRows ? parseInt(localStorage.weaveRows) : 19;
    const storedTablets = localStorage.tablets ? JSON.parse(localStorage.tablets) : initTablets;
    const storedRotationDirections = localStorage.rotationDirections ? JSON.parse(localStorage.rotationDirections) : {};
    const initialized = writable(false);
    const weaveRows = writable(storedWeaveRows);
    const tablets = writable(storedTablets);
    const rotationDirections = writable(storedRotationDirections);
    weaveRows.subscribe((value) => localStorage.weaveRows = value);
    tablets.subscribe((value) => localStorage.tablets = JSON.stringify(value));
    rotationDirections.subscribe((value) => localStorage.rotationDirections = JSON.stringify(value));
    function initStores() {
        const parts = window.atob(window.location.hash.substring(1)).split(':');
        if (parts.length !== 4) {
            initialized.set(true);
            return;
        }
        const numberOfTablets = parseInt(parts[0]);
        const numberOfWeaves = parseInt(parts[1]);
        const initRotationDirections = {};
        [...Array(numberOfWeaves).keys()].forEach((row) => {
            [...Array(numberOfTablets).keys()].forEach((col) => {
                if (typeof initRotationDirections[row] === 'undefined') {
                    initRotationDirections[row] = {};
                }
                initRotationDirections[row][col] = parts[2][(row * numberOfTablets + col)] === '1';
            });
        });
        const initTablets = parts[3].substring(1).split('|').map(tablet => {
            return {
                sDirection: tablet[0] === '1',
                holes: 4,
                threads: tablet.substring(2).split('#').map(colorCode => {
                    return { color: `#${colorCode}` };
                })
            };
        });
        weaveRows.set(numberOfWeaves);
        rotationDirections.set(initRotationDirections);
        tablets.set(initTablets);
        initialized.set(true);
    }
    ///////////////////////////////////////////////////////////
    // Derived stores
    ///////////////////////////////////////////////////////////
    // Update URL hash with every update
    derived([initialized, weaveRows, tablets, rotationDirections], ([$initialized, $weaveRows, $tablets, $rotationDirections]) => {
        if (!$initialized) {
            return null;
        }
        const rotDirValue = [...Array($weaveRows).keys()].reduce((previousValue, _, index) => {
            return [...Array($tablets.length).keys()].reduce((prev, _, idx) => {
                const rotateBack = typeof $rotationDirections[index] !== 'undefined' && $rotationDirections[index][idx] === true;
                return `${prev}${(rotateBack ? '1' : '0')}`;
            }, previousValue);
        }, '');
        const colors = $tablets.reduce((previousValue, currentValue) => {
            return `${previousValue}|${(currentValue.sDirection ? '1' : '0')}` + currentValue.threads.reduce((prev, curr) => `${prev}${curr.color}`, '');
        }, '');
        return `${$tablets.length}:${$weaveRows}:${rotDirValue}:${colors}`;
    }).subscribe((value) => {
        if (value) {
            window.location.hash = "#" + window.btoa(value);
        }
    });
    // Colors index
    const patternColors = derived(tablets, ($tablets) => {
        const summary = {};
        $tablets.forEach((tablet) => {
            tablet.threads.forEach((thread) => {
                if (typeof summary[thread.color] == 'undefined') {
                    summary[thread.color] = 1;
                }
                else {
                    summary[thread.color] = summary[thread.color] + 1;
                }
            });
        });
        return Object.entries(summary).map(([key, value]) => new ColorIndex(key, value));
    });
    // Calculation of length of each thread and total length of yarn for each color
    const weaveLength = derived([appConfig, patternColors], ([$appConfig, $patternColors]) => {
        const singleYarnLength = Number($appConfig.weaveLength) + Number($appConfig.weaveLength * 0.2) + 50;
        const yarnLengths = $patternColors.map((colorCount) => {
            const yarnLength = colorCount.count * singleYarnLength;
            return {
                color: colorCount.color,
                count: colorCount.count,
                yarnLength: yarnLength
            };
        });
        return {
            singleYarnLength: singleYarnLength,
            yarnLengths: yarnLengths
        };
    });

    const patternTemplates = [
        {
            name: "Oseberg",
            tablets: 10,
            century: "9.",
            region: "Norwegen",
            technique: "Einzugsmuster",
            hash: "MTA6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDp8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDJ8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNjYzAwMDB8MSNmZmZmYjcjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MSNjYzAwMDAjZmZmZmI3I2NjMDAwMCNmZmZmYjd8MSNjYzAwMDAjY2MwMDAwI2ZmZmZiNyNjYzAwMDB8MCNmZmZmYjcjZmZmZmI3I2ZmZmZiNyNmZmZmYjd8MCNjMTdkMTEjYzE3ZDExI2MxN2QxMSNjMTdkMTF8MSM4ZjU5MDIjOGY1OTAyIzhmNTkwMiM4ZjU5MDI="
        },
        {
            name: "Halbes Widderhorn",
            tablets: 14,
            century: "19.",
            region: "Anatolien",
            technique: "Double face",
            hash: "MTQ6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTAwMTExMDAwMDAwMTExMDAxMTEwMDAwMDAxMTEwMDExMTAwMDAwMDExMTAwMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA6fDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDEjZTBmOGZmI2UwZjhmZiNlMGY4ZmYjZTBmOGZmfDAjZTBmOGZmI2UwZjhmZiNmMGZjZmYjMmUzNDM2fDAjZjBmY2ZmI2YwZmNmZiMyZTM0MzYjMzQ2NWE0fDAjZmZmZmZmIzJlMzQzNiMzNDY1YTQjMmUzNDM2fDAjMmUzNDM2IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDAjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMzQ2NWE0IzJlMzQzNiNmZmZmZmYjMmUzNDM2fDEjMjA0YTg3IzM0NjVhNCMyZTM0MzYjZmZmZmZmfDEjMjMxZDYyIzIwNGE4NyMyMDRhODcjMmUzNDM2fDEjMjMxZDYyIzIzMWQ2MiMyMzFkNjIjMjMxZDYyfDEjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2fDAjMmUzNDM2IzJlMzQzNiMyZTM0MzYjMmUzNDM2"
        },
        {
            name: "Drachenköpfe",
            tablets: 20,
            century: "",
            region: "",
            technique: "",
            hash: "MjA6MjQ6MDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAxMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwOnwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2VmMjkyOXwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjY2MwMDAwI2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwxI2NjMDAwMCNmY2U5NGYjZWYyOTI5I2ZjZTk0ZnwxI2ZjZTk0ZiNjYzAwMDAjZmNlOTRmI2NjMDAwMHwwI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMHwxI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwwI2VmMjkyOSNmNTc5MDAjZmNhZjNlI2ZmZDU5MXwxI2E0MDAwMCNhNDAwMDAjYTQwMDAwI2E0MDAwMA=="
        },
        {
            name: "Sulawesi",
            tablets: 20,
            century: "",
            region: "Indonesien",
            technique: "Sulawesi",
            hash: "MjA6Njg6MDAwMTEwMDAwMTEwMDAwMTEwMDAwMDEwMDExMTExMTExMTEwMDEwMDAwMDExMDAwMTExMTAwMDExMDAwMDAxMTExMTAxMTExMDExMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAxMTAwMTAwMDAwMDEwMDExMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDExMDAxMDExMTEwMTAwMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMDEwMDAwMDEwMDExMDAwMDExMDAwMTAwMDAwMTAwMTEwMDAwMTEwMDAxMDAxMTEwMTEwMDAwMDAxMTAwMDEwMDExMTAxMTAwMDAwMDAwMTExMDAwMDAxMDExMDAwMDAwMDAxMTEwMDAwMDEwMTEwMDAwMDAwMDExMDExMTAwMTAxMTAwMDAwMDAwMTEwMTExMDAxMDExMDAwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAwMDExMTAxMTAwMDEwMDExMDAwMDAwMTExMDExMDAwMTAwMTEwMDAwMDAxMTEwMTEwMDAxMDAxMTAwMDAxMTAwMTAxMTAwMDEwMDExMDAwMDExMDAxMDExMDAwMTAwMTEwMDAwMTEwMDEwMTExMTEwMDAxMTAwMDAxMTAwMTAxMTExMTAwMDExMDAwMDExMDAxMDAwMTEwMTExMDAwMDAwMTEwMDEwMDAxMTAxMTEwMDAwMDAwMDExMDExMTExMDExMTAwMDAwMDAwMTEwMTExMTEwMTExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAxMTAxMDAwMDEwMTEwMDAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTExMTAxMDAwMDEwMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDAwMTEwMTExMTExMDExMDAwMDAwMDAxMTAxMTExMTEwMTEwMDAwMDAwMDExMDEwMDAwMTAxMTAwMDAwMDAwMTEwMTAwMDAxMDExMDAwMDAwMDAwMDEwMTExMTAxMDAwMDAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAwMTAwMDAxMDAwMDAwMDAwMTAwMTExMDAwMDExMTAwMTAwMDAwMTEwMDAwMDAwMDAwMTEwMDAwMDEwMDExMTEwMDExMTEwMDEwMDAwMDExMDAwMDExMDAwMDExMDAwMDAxMDAxMTExMTExMTExMDAxMDAwMDAxMTAwMDExMTEwMDAxMTAwMDAwMTExMTEwMTExMTAxMTExMTAwMDAxMTExMDEwMDAwMTAxMTExMDAwMDExMTEwMTAwMDAxMDExMTEwMDAwMTEwMDEwMTExMTAxMDAxMTAwMDAxMTAwMTAxMTExMDEwMDExMDAwMDExMDAxMDAwMDAwMTAwMTEwMDAwMTEwMDEwMDAwMDAxMDAxMTAwMDAwMDAwMTAxMTExMDEwMDAwMDAwMDAwMDAxMDExMTEwMTAwMDAwMDp8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSM3M2QyMTYjMDY2YTAwIzRlOWEwNiNjYmZmYzR8MSMwNjZhMDAjNGU5YTA2I2NiZmZjNCM3M2QyMTZ8MCMwNjZhMDAjNzNkMjE2I2NiZmZjNCM0ZTlhMDZ8MCM0ZTlhMDYjMDY2YTAwIzczZDIxNiNjYmZmYzR8MSMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDB8MCMwNjZhMDAjMDY2YTAwIzA2NmEwMCMwNjZhMDA="
        },
        {
            name: "Raute",
            tablets: 20,
            century: "19",
            region: "",
            technique: "Einzugsmuster",
            hash: "MjA6MjM6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMTExMTExMTExMTExMTEwMDAwMTExMTExMTExMTExMTExMTAwMDAxMTExMTExMTExMTExMTExMDAwMDExMTExMTExMTExMTExMTEwMDp8MSNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MCM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MCNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MSM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MSNmYTAwZmYjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCNmYTAwZmYjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MCM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MCM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MCNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSNmY2U5NGYjODMwMDk4IzgzMDA5OCNmYTAwZmZ8MSM4MzAwOTgjZmNlOTRmIzgzMDA5OCM4MzAwOTh8MSM4MzAwOTgjODMwMDk4I2ZjZTk0ZiM4MzAwOTh8MSM4MzAwOTgjODMwMDk4IzgzMDA5OCNmY2U5NGZ8MSNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGZ8MCNmY2U5NGYjZmNlOTRmI2ZjZTk0ZiNmY2U5NGY="
        },
        {
            name: "Birka 6",
            tablets: 13,
            century: "8.-10.",
            region: "Schweden",
            technique: "",
            hash: "MTM6MTk6MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAxMTAwMDAwMDAwMDExMTExMTExMTAwMDAxMTExMTExMTEwMDAwMTEwMDExMTExMDAwMDExMDAxMTExMTAwMDAwMDAwMTExMDAwMDAwMDAwMDExMTAwMDAwMDAwMDAxMDAwMDAwMDAwMDAwMTAwMDAwMDAwMTExMTAwMDExMDAwMDExMTEwMDAxMTAwMDAxMTExMDExMTEwMDAwMTExMTAxMTExMDAwMDExMTExMTExMTAwMDAxMTExMTExMTEwMDp8MCMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MCMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MCMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MCNmY2U5NGYjZmNlOTRmIzJlMzQzNiMyZTM0MzZ8MCNmY2U5NGYjMmUzNDM2IzJlMzQzNiNmY2U5NGZ8MCMyZTM0MzYjMmUzNDM2I2ZjZTk0ZiNmY2U5NGZ8MSMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2I2ZjZTk0ZiNmY2U5NGZ8MSNmY2U5NGYjMmUzNDM2IzJlMzQzNiNmY2U5NGZ8MSNmY2U5NGYjZmNlOTRmIzJlMzQzNiMyZTM0MzZ8MSMyZTM0MzYjZmNlOTRmI2ZjZTk0ZiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzZ8MSMyZTM0MzYjMmUzNDM2IzJlMzQzNiMyZTM0MzY="
        },
        {
            name: "Hallstatt 123",
            tablets: 19,
            century: "8.-4.",
            region: "Österreich",
            technique: "",
            hash: "MTk6NzI6MDAwMDAxMTEwMDExMTEwMDAwMDAwMDAwMTExMTAwMTExMDAwMDAwMDAwMDExMTExMDAxMTAxMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMTExMTExMTAwMTEwMDAwMDAwMDExMTAwMDExMDAxMDAwMDAwMDAxMTEwMDAxMTEwMDAwMDAwMDExMTExMDAwMTExMTAwMDAwMDAxMTExMTAwMDExMTExMDAwMDAwMTExMTEwMDAxMTExMTAwMDAwMDAxMTExMDAwMTExMTEwMDAwMDAwMDExMTAwMDExMTAwMDAwMDAwMTAwMTEwMDAxMTEwMDAwMDAwMDExMDAxMTExMTExMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTAxMTAwMTExMTEwMDAwMDAwMDAwMTExMDAxMTExMDAwMDAwMDAwMDExMTEwMDExMTAwMDAwMDAwMDAxMTExMTAwMTEwMTAwMDAwMDExMTExMTExMDAxMTAwMDAwMDAxMTExMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTAwMTAwMDAwMDAwMDAwMDExMTExMDAwMDAwMDAwMDAwMDAxMTExMTEwMDAwMDAwMDAwMDExMDAwMTExMTAwMDAwMDAwMDAxMTAwMDExMTEwMDAwMDAwMDAwMTEwMDAxMTExMDAwMDAwMTExMTAwMTExMDAwMDAwMDAwMDExMTEwMDExMTAwMDAwMDAwMDAxMTExMDAxMTEwMDAwMDAwMDAwMTExMTExMDAwMDAwMTAwMDAwMDExMTExMTAwMDAwMTEwMDAwMDAxMTExMTEwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMTEwMDAwMDAwMDAwMDAwMDAwMTEwMDEwMDAwMDAxMTAwMDAwMTEwMDEwMDAwMDAwMTEwMDAwMTEwMDAxMTAwMDAwMDExMDAwMTEwMDAwMTEwMDAwMDAwMTAwMTEwMDAwMDExMDAwMDAwMTAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAwMTEwMDAwMDAwMTEwMDExMTAwMDExMDAwMDAwMTEwMDAxMTEwMDAxMTAwMDAwMDEwMDAwMTExMDAwMDAwMDAwMDAwMDAwMDExMTAwMDAwMDAwMDAwMDAwMDAxMTEwMDAwMDAwMDAwMDAwMDAwMTExMDAwMDEwMDAwMDAxMTAwMDExMTAwMDExMDAwMDAwMTEwMDAxMTEwMDExMDAwMDAwMDExMDAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAxMDAwMDAwMTEwMDAwMDExMDAxMDAwMDAwMDExMDAwMDExMDAwMTEwMDAwMDAxMTAwMDExMDAwMDExMDAwMDAwMDEwMDExMDAwMDAxMTAwMDAwMDEwMDExMDAwMDAwMDAwMDAwMDAwMDExMDAwMDAwMDAwMDAwMDAwMDExMDAwMDExMTExMTAwMDAwMDExMDAwMDAxMTExMTEwMDAwMDAxMDAwMDAwMTExMTExMDAwMDAwMDAwMDExMTAwMTExMTAwMDAwMDAwMDAxMTEwMDExMTEwMDAwMDAwMDAwMTExMDAxMTExMDAwMDAwMTExMTAwMDExMDAwMDAwMDAwMDExMTEwMDAxMTAwMDAwMDAwMDAxMTExMDAwMTEwMDAwMDAwMDAwMDExMTExMTAwMDAwMDAwMDAwMDAwMTExMTEwMDAwMDAwMDAwMDAxMDAxMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTExMTAwMDAwMDAxMTAwMTExMTExMTEwMDAwMDAxMDExMDAxMTExMTAwMDAwOnwxIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwxIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwxI2NjMDAwMCNjYzAwMDAjY2MwMDAwI2NjMDAwMHwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwIzAwMTJmZiMwMDEyZmYjZmZmZmZmI2ZmZmZmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwIzAwMTJmZiMwMDEyZmYjZmZmZmZmI2ZmZmZmZnwwI2NjMDAwMCNmZmZmZmYjZmZmZmZmI2NjMDAwMHwwI2NjMDAwMCNjYzAwMDAjZmZmZmZmI2ZmZmZmZnwwI2ZmZmZmZiNjYzAwMDAjY2MwMDAwI2ZmZmZmZnwwI2NjMDAwMCNjYzAwMDAjZmZmZmZmI2ZmZmZmZnwwI2NjMDAwMCNmZmZmZmYjZmZmZmZmI2NjMDAwMHwwI2ZmZmZmZiNmZmZmZmYjMDAxMmZmIzAwMTJmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwI2ZmZmZmZiNmZmZmZmYjMDAxMmZmIzAwMTJmZnwwI2ZmZmZmZiMwMDEyZmYjMDAxMmZmI2ZmZmZmZnwwI2NjMDAwMCNjYzAwMDAjY2MwMDAwI2NjMDAwMHwwIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZnwwIzAwMTJmZiMwMDEyZmYjMDAxMmZmIzAwMTJmZg=="
        },
        {
            name: "Dublin Dragons",
            tablets: 18,
            century: "10.",
            region: "Irland",
            technique: "",
            hash: "MTg6MjQ6MDAwMDAxMTExMTEwMDExMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAxMTExMTEwMDExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMTEwMDAwMDAxMTAwMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMDAxMTAwMDAwMDExMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTExMTExMDAwMDAwMDAwMDAwMTEwMDExMTExMTAwMDAwMDAwMTEwMDExMTExMTAwMDAwOnwxIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwxI2VmMjkyOSNlZjI5MjkjZWYyOTI5I2VmMjkyOXwxIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwxI2ZmZmZmZiNmY2U5NGYjZmZmZmZmI2VmMjkyOXwxI2VmMjkyOSNmZmZmZmYjZmNlOTRmI2ZmZmZmZnwxI2ZmZmZmZiNlZjI5MjkjZmZmZmZmI2ZjZTk0ZnwxI2ZjZTk0ZiNmZmZmZmYjZWYyOTI5I2ZmZmZmZnwwIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMHwwI2VmMjkyOSNlZjI5MjkjZWYyOTI5I2VmMjkyOXwwIzAwMDAwMCMwMDAwMDAjMDAwMDAwIzAwMDAwMA=="
        }
    ];
    const templates = readable(patternTemplates);

    /* src/components/NavBar.svelte generated by Svelte v3.44.3 */
    const file$a = "src/components/NavBar.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (16:21) {#each $templates as template, index (index)}
    function create_each_block_1$4(key_1, ctx) {
    	let li;
    	let a;
    	let t_value = /*template*/ ctx[13].name + "";
    	let t;
    	let a_href_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = "?" + new Date().getTime() + "#" + /*template*/ ctx[13].hash);
    			add_location(a, file$a, 16, 29, 670);
    			add_location(li, file$a, 16, 25, 666);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, a);
    			append_dev(a, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$templates*/ 2 && t_value !== (t_value = /*template*/ ctx[13].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*$templates*/ 2 && a_href_value !== (a_href_value = "?" + new Date().getTime() + "#" + /*template*/ ctx[13].hash)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(16:21) {#each $templates as template, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (51:11) {#if $locale != l}
    function create_if_block$2(ctx) {
    	let a;
    	let t_value = /*$_*/ ctx[0]('lang', { locale: /*l*/ ctx[10] }) + "";
    	let t;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[9](/*l*/ ctx[10]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", '#');
    			attr_dev(a, "uk-icon", "icon: world");
    			attr_dev(a, "class", "svelte-28p634");
    			add_location(a, file$a, 51, 12, 2053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$_, $locales*/ 9 && t_value !== (t_value = /*$_*/ ctx[0]('lang', { locale: /*l*/ ctx[10] }) + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(51:11) {#if $locale != l}",
    		ctx
    	});

    	return block;
    }

    // (50:4) {#each $locales as l}
    function create_each_block$6(ctx) {
    	let if_block_anchor;
    	let if_block = /*$locale*/ ctx[4] != /*l*/ ctx[10] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*$locale*/ ctx[4] != /*l*/ ctx[10]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(50:4) {#each $locales as l}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let nav;
    	let div1;
    	let ul1;
    	let li0;
    	let a0;
    	let t0_value = /*$_*/ ctx[0]('navbar.templates') + "";
    	let t0;
    	let t1;
    	let div0;
    	let ul0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t2;
    	let div2;
    	let t3_value = /*$_*/ ctx[0]('navbar.title') + "";
    	let t3;
    	let t4;
    	let div4;
    	let ul3;
    	let li5;
    	let a1;
    	let t5_value = /*$_*/ ctx[0]('navbar.display') + "";
    	let t5;
    	let t6;
    	let div3;
    	let ul2;
    	let li1;
    	let t7_value = /*$_*/ ctx[0]('navbar.preview.weave') + "";
    	let t7;
    	let t8;
    	let li2;
    	let t9_value = /*$_*/ ctx[0]('navbar.preview.size') + "";
    	let t9;
    	let t10;
    	let input0;
    	let t11;
    	let li3;
    	let t12_value = /*$_*/ ctx[0]('navbar.preview.outline') + "";
    	let t12;
    	let t13;
    	let input1;
    	let t14;
    	let li4;
    	let t15_value = /*$_*/ ctx[0]('navbar.preview.weft') + "";
    	let t15;
    	let t16;
    	let input2;
    	let t17;
    	let li6;
    	let t18;
    	let li7;
    	let a2;
    	let span0;
    	let t19;
    	let li8;
    	let a3;
    	let span1;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$templates*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[15];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$4, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$4(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$4(key, child_ctx));
    	}

    	let each_value = /*$locales*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div1 = element("div");
    			ul1 = element("ul");
    			li0 = element("li");
    			a0 = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			ul0 = element("ul");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div2 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div4 = element("div");
    			ul3 = element("ul");
    			li5 = element("li");
    			a1 = element("a");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			ul2 = element("ul");
    			li1 = element("li");
    			t7 = text(t7_value);
    			t8 = space();
    			li2 = element("li");
    			t9 = text(t9_value);
    			t10 = text(":\n                        \t");
    			input0 = element("input");
    			t11 = space();
    			li3 = element("li");
    			t12 = text(t12_value);
    			t13 = text(":\n                    \t\t");
    			input1 = element("input");
    			t14 = space();
    			li4 = element("li");
    			t15 = text(t15_value);
    			t16 = text(":\n\t\t    \t\t\t\t");
    			input2 = element("input");
    			t17 = space();
    			li6 = element("li");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t18 = space();
    			li7 = element("li");
    			a2 = element("a");
    			span0 = element("span");
    			t19 = space();
    			li8 = element("li");
    			a3 = element("a");
    			span1 = element("span");
    			attr_dev(a0, "href", '#');
    			attr_dev(a0, "class", "svelte-28p634");
    			add_location(a0, file$a, 12, 16, 419);
    			attr_dev(ul0, "class", "uk-nav uk-navbar-dropdown-nav");
    			add_location(ul0, file$a, 14, 20, 531);
    			attr_dev(div0, "class", "uk-navbar-dropdown");
    			add_location(div0, file$a, 13, 16, 478);
    			attr_dev(li0, "class", "svelte-28p634");
    			add_location(li0, file$a, 11, 12, 398);
    			attr_dev(ul1, "class", "uk-navbar-nav svelte-28p634");
    			add_location(ul1, file$a, 10, 8, 359);
    			attr_dev(div1, "class", "uk-navbar-left");
    			add_location(div1, file$a, 9, 4, 322);
    			attr_dev(div2, "class", "uk-navbar-center");
    			add_location(div2, file$a, 23, 4, 872);
    			attr_dev(a1, "href", '#');
    			attr_dev(a1, "class", "svelte-28p634");
    			add_location(a1, file$a, 29, 16, 1042);
    			attr_dev(li1, "class", "uk-nav-header");
    			add_location(li1, file$a, 32, 21, 1216);
    			attr_dev(input0, "class", "uk-range svelte-28p634");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "min", "1");
    			attr_dev(input0, "max", "3");
    			attr_dev(input0, "step", "1");
    			add_location(input0, file$a, 35, 25, 1384);
    			add_location(li2, file$a, 33, 24, 1300);
    			attr_dev(input1, "class", "uk-input svelte-28p634");
    			attr_dev(input1, "type", "color");
    			add_location(input1, file$a, 39, 22, 1612);
    			add_location(li3, file$a, 37, 21, 1531);
    			attr_dev(input2, "class", "uk-input svelte-28p634");
    			attr_dev(input2, "type", "color");
    			add_location(input2, file$a, 43, 10, 1803);
    			add_location(li4, file$a, 41, 21, 1740);
    			attr_dev(ul2, "class", "uk-nav uk-navbar-dropdown-nav");
    			add_location(ul2, file$a, 31, 20, 1152);
    			attr_dev(div3, "class", "uk-navbar-dropdown");
    			add_location(div3, file$a, 30, 16, 1099);
    			attr_dev(li5, "class", "svelte-28p634");
    			add_location(li5, file$a, 28, 12, 1021);
    			attr_dev(li6, "class", "svelte-28p634");
    			add_location(li6, file$a, 48, 9, 1980);
    			attr_dev(span0, "class", "uk-icon");
    			attr_dev(span0, "uk-icon", "icon: youtube");
    			add_location(span0, file$a, 57, 14, 2321);
    			attr_dev(a2, "href", "https://www.youtube.com/watch?v=zJmZp41ZnEk");
    			attr_dev(a2, "target", "blank");
    			attr_dev(a2, "class", "svelte-28p634");
    			add_location(a2, file$a, 56, 13, 2237);
    			attr_dev(li7, "class", "svelte-28p634");
    			add_location(li7, file$a, 55, 12, 2219);
    			attr_dev(span1, "class", "uk-icon uk-margin-small-right");
    			attr_dev(span1, "uk-icon", "icon: github");
    			add_location(span1, file$a, 62, 14, 2521);
    			attr_dev(a3, "href", "https://github.com/resah/tablet-weaving");
    			attr_dev(a3, "target", "blank");
    			attr_dev(a3, "class", "svelte-28p634");
    			add_location(a3, file$a, 61, 13, 2441);
    			attr_dev(li8, "class", "svelte-28p634");
    			add_location(li8, file$a, 60, 12, 2423);
    			attr_dev(ul3, "class", "uk-navbar-nav svelte-28p634");
    			add_location(ul3, file$a, 27, 8, 982);
    			attr_dev(div4, "class", "uk-navbar-right");
    			add_location(div4, file$a, 26, 4, 944);
    			attr_dev(nav, "class", "uk-navbar-container svelte-28p634");
    			attr_dev(nav, "uk-navbar", "");
    			add_location(nav, file$a, 8, 0, 274);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div1);
    			append_dev(div1, ul1);
    			append_dev(ul1, li0);
    			append_dev(li0, a0);
    			append_dev(a0, t0);
    			append_dev(li0, t1);
    			append_dev(li0, div0);
    			append_dev(div0, ul0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(ul0, null);
    			}

    			append_dev(nav, t2);
    			append_dev(nav, div2);
    			append_dev(div2, t3);
    			append_dev(nav, t4);
    			append_dev(nav, div4);
    			append_dev(div4, ul3);
    			append_dev(ul3, li5);
    			append_dev(li5, a1);
    			append_dev(a1, t5);
    			append_dev(li5, t6);
    			append_dev(li5, div3);
    			append_dev(div3, ul2);
    			append_dev(ul2, li1);
    			append_dev(li1, t7);
    			append_dev(ul2, t8);
    			append_dev(ul2, li2);
    			append_dev(li2, t9);
    			append_dev(li2, t10);
    			append_dev(li2, input0);
    			set_input_value(input0, /*$appConfig*/ ctx[2].weaveSize);
    			append_dev(ul2, t11);
    			append_dev(ul2, li3);
    			append_dev(li3, t12);
    			append_dev(li3, t13);
    			append_dev(li3, input1);
    			set_input_value(input1, /*$appConfig*/ ctx[2].weaveBorderColor);
    			append_dev(ul2, t14);
    			append_dev(ul2, li4);
    			append_dev(li4, t15);
    			append_dev(li4, t16);
    			append_dev(li4, input2);
    			set_input_value(input2, /*$appConfig*/ ctx[2].weftColor);
    			append_dev(ul3, t17);
    			append_dev(ul3, li6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(li6, null);
    			}

    			append_dev(ul3, t18);
    			append_dev(ul3, li7);
    			append_dev(li7, a2);
    			append_dev(a2, span0);
    			append_dev(ul3, t19);
    			append_dev(ul3, li8);
    			append_dev(li8, a3);
    			append_dev(a3, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[6]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 1 && t0_value !== (t0_value = /*$_*/ ctx[0]('navbar.templates') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Date, $templates*/ 2) {
    				each_value_1 = /*$templates*/ ctx[1];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$4, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, ul0, destroy_block, create_each_block_1$4, null, get_each_context_1$4);
    			}

    			if (dirty & /*$_*/ 1 && t3_value !== (t3_value = /*$_*/ ctx[0]('navbar.title') + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*$_*/ 1 && t5_value !== (t5_value = /*$_*/ ctx[0]('navbar.display') + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$_*/ 1 && t7_value !== (t7_value = /*$_*/ ctx[0]('navbar.preview.weave') + "")) set_data_dev(t7, t7_value);
    			if (dirty & /*$_*/ 1 && t9_value !== (t9_value = /*$_*/ ctx[0]('navbar.preview.size') + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*$appConfig*/ 4) {
    				set_input_value(input0, /*$appConfig*/ ctx[2].weaveSize);
    			}

    			if (dirty & /*$_*/ 1 && t12_value !== (t12_value = /*$_*/ ctx[0]('navbar.preview.outline') + "")) set_data_dev(t12, t12_value);

    			if (dirty & /*$appConfig*/ 4) {
    				set_input_value(input1, /*$appConfig*/ ctx[2].weaveBorderColor);
    			}

    			if (dirty & /*$_*/ 1 && t15_value !== (t15_value = /*$_*/ ctx[0]('navbar.preview.weft') + "")) set_data_dev(t15, t15_value);

    			if (dirty & /*$appConfig*/ 4) {
    				set_input_value(input2, /*$appConfig*/ ctx[2].weftColor);
    			}

    			if (dirty & /*handleLocaleChange, $locales, $_, $locale*/ 57) {
    				each_value = /*$locales*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(li6, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $_;
    	let $templates;
    	let $appConfig;
    	let $locales;
    	let $locale;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(0, $_ = $$value));
    	validate_store(templates, 'templates');
    	component_subscribe($$self, templates, $$value => $$invalidate(1, $templates = $$value));
    	validate_store(appConfig, 'appConfig');
    	component_subscribe($$self, appConfig, $$value => $$invalidate(2, $appConfig = $$value));
    	validate_store(f, 'locales');
    	component_subscribe($$self, f, $$value => $$invalidate(3, $locales = $$value));
    	validate_store(M, 'locale');
    	component_subscribe($$self, M, $$value => $$invalidate(4, $locale = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavBar', slots, []);

    	const handleLocaleChange = selectedLocale => {
    		M.set(selectedLocale);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavBar> was created with unknown prop '${key}'`);
    	});

    	function input0_change_input_handler() {
    		$appConfig.weaveSize = to_number(this.value);
    		appConfig.set($appConfig);
    	}

    	function input1_input_handler() {
    		$appConfig.weaveBorderColor = this.value;
    		appConfig.set($appConfig);
    	}

    	function input2_input_handler() {
    		$appConfig.weftColor = this.value;
    		appConfig.set($appConfig);
    	}

    	const click_handler = l => handleLocaleChange(l);

    	$$self.$capture_state = () => ({
    		_: X,
    		locale: M,
    		locales: f,
    		appConfig,
    		templates,
    		handleLocaleChange,
    		$_,
    		$templates,
    		$appConfig,
    		$locales,
    		$locale
    	});

    	return [
    		$_,
    		$templates,
    		$appConfig,
    		$locales,
    		$locale,
    		handleLocaleChange,
    		input0_change_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler
    	];
    }

    class NavBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavBar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/components/ChartSummary.svelte generated by Svelte v3.44.3 */
    const file$9 = "src/components/ChartSummary.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (50:2) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let span;
    	let t_value = /*$_*/ ctx[1]('chart.summary.title') + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			t = text(t_value);
    			attr_dev(span, "uk-icon", "icon: chevron-right");
    			add_location(span, file$9, 51, 4, 2305);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "uk-button uk-button-link");
    			add_location(button, file$9, 50, 3, 2210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[9], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 2 && t_value !== (t_value = /*$_*/ ctx[1]('chart.summary.title') + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(50:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (19:2) {#if showColors}
    function create_if_block$1(ctx) {
    	let button;
    	let span;
    	let t0_value = /*$_*/ ctx[1]('chart.summary.title') + "";
    	let t0;
    	let t1;
    	let table0;
    	let tr0;
    	let td0;
    	let t2;
    	let td1;
    	let input0;
    	let input0_uk_tooltip_value;
    	let br;
    	let t3;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t4;
    	let tr1;
    	let td2;
    	let t5_value = /*$_*/ ctx[1]('chart.summary.length') + "";
    	let t5;
    	let t6;
    	let input1;
    	let t7;
    	let t8;
    	let td3;
    	let t9;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t10;
    	let table1;
    	let tr2;
    	let td4;
    	let t11_value = /*$_*/ ctx[1]('chart.summary.weaveAllowance') + "";
    	let t11;
    	let t12;
    	let t13;
    	let td5;
    	let t14_value = /*$_*/ ctx[1]('chart.summary.tabletAllowance') + "";
    	let t14;
    	let t15;
    	let t16;
    	let td6;
    	let t17;
    	let t18_value = /*$weaveLength*/ ctx[3].singleYarnLength + "";
    	let t18;
    	let t19;
    	let t20_value = /*$_*/ ctx[1]('chart.summary.perThread') + "";
    	let t20;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$weaveLength*/ ctx[3].yarnLengths;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[13];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$3(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$3(key, child_ctx));
    	}

    	let each_value = /*$weaveLength*/ ctx[3].yarnLengths;
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*index*/ ctx[13];
    	validate_each_keys(ctx, each_value, get_each_context$5, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$5(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			table0 = element("table");
    			tr0 = element("tr");
    			td0 = element("td");
    			t2 = space();
    			td1 = element("td");
    			input0 = element("input");
    			br = element("br");
    			t3 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			tr1 = element("tr");
    			td2 = element("td");
    			t5 = text(t5_value);
    			t6 = text(": ");
    			input1 = element("input");
    			t7 = text("cm");
    			t8 = space();
    			td3 = element("td");
    			t9 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t10 = space();
    			table1 = element("table");
    			tr2 = element("tr");
    			td4 = element("td");
    			t11 = text(t11_value);
    			t12 = text(": +20%");
    			t13 = space();
    			td5 = element("td");
    			t14 = text(t14_value);
    			t15 = text(": +50cm");
    			t16 = space();
    			td6 = element("td");
    			t17 = text("= ");
    			t18 = text(t18_value);
    			t19 = text("cm ");
    			t20 = text(t20_value);
    			attr_dev(span, "uk-icon", "icon: chevron-down");
    			add_location(span, file$9, 20, 7, 736);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "uk-button uk-button-link");
    			add_location(button, file$9, 19, 6, 637);
    			add_location(td0, file$9, 24, 8, 932);
    			attr_dev(input0, "type", "color");
    			attr_dev(input0, "uk-tooltip", input0_uk_tooltip_value = /*$_*/ ctx[1]('chart.summary.weft'));
    			attr_dev(input0, "class", "weftColor svelte-1ihlopf");
    			add_location(input0, file$9, 25, 12, 954);
    			add_location(br, file$9, 25, 124, 1066);
    			add_location(td1, file$9, 25, 8, 950);
    			add_location(tr0, file$9, 23, 7, 919);
    			attr_dev(input1, "class", "uk-input uk-form-small uk-form-width-xsmall");
    			attr_dev(input1, "type", "text");
    			add_location(input1, file$9, 34, 38, 1446);
    			attr_dev(td2, "class", "uk-text-left");
    			add_location(td2, file$9, 33, 8, 1381);
    			add_location(td3, file$9, 36, 8, 1580);
    			add_location(tr1, file$9, 32, 7, 1368);
    			attr_dev(table0, "class", "uk-table uk-table-small uk-table-divider uk-background-default yarnLengths svelte-1ihlopf");
    			add_location(table0, file$9, 22, 6, 821);
    			attr_dev(td4, "class", "uk-text-meta svelte-1ihlopf");
    			add_location(td4, file$9, 44, 8, 1893);
    			attr_dev(td5, "class", "uk-text-meta svelte-1ihlopf");
    			add_location(td5, file$9, 45, 8, 1974);
    			attr_dev(td6, "class", "uk-text-meta uk-text-right svelte-1ihlopf");
    			add_location(td6, file$9, 46, 8, 2057);
    			add_location(tr2, file$9, 43, 7, 1880);
    			attr_dev(table1, "class", "uk-table uk-table-small uk-table-divider uk-background-default uk-text-left singleYarnLength svelte-1ihlopf");
    			add_location(table1, file$9, 42, 6, 1764);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, table0, anchor);
    			append_dev(table0, tr0);
    			append_dev(tr0, td0);
    			append_dev(tr0, t2);
    			append_dev(tr0, td1);
    			append_dev(td1, input0);
    			set_input_value(input0, /*$appConfig*/ ctx[2].weftColor);
    			append_dev(td1, br);
    			append_dev(tr0, t3);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr0, null);
    			}

    			append_dev(table0, t4);
    			append_dev(table0, tr1);
    			append_dev(tr1, td2);
    			append_dev(td2, t5);
    			append_dev(td2, t6);
    			append_dev(td2, input1);
    			set_input_value(input1, /*$appConfig*/ ctx[2].weaveLength);
    			append_dev(td2, t7);
    			append_dev(tr1, t8);
    			append_dev(tr1, td3);
    			append_dev(tr1, t9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr1, null);
    			}

    			insert_dev(target, t10, anchor);
    			insert_dev(target, table1, anchor);
    			append_dev(table1, tr2);
    			append_dev(tr2, td4);
    			append_dev(td4, t11);
    			append_dev(td4, t12);
    			append_dev(tr2, t13);
    			append_dev(tr2, td5);
    			append_dev(td5, t14);
    			append_dev(td5, t15);
    			append_dev(tr2, t16);
    			append_dev(tr2, td6);
    			append_dev(td6, t17);
    			append_dev(td6, t18);
    			append_dev(td6, t19);
    			append_dev(td6, t20);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$_*/ 2 && t0_value !== (t0_value = /*$_*/ ctx[1]('chart.summary.title') + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$_*/ 2 && input0_uk_tooltip_value !== (input0_uk_tooltip_value = /*$_*/ ctx[1]('chart.summary.weft'))) {
    				attr_dev(input0, "uk-tooltip", input0_uk_tooltip_value);
    			}

    			if (dirty & /*$appConfig*/ 4) {
    				set_input_value(input0, /*$appConfig*/ ctx[2].weftColor);
    			}

    			if (dirty & /*$weaveLength, updateColor*/ 24) {
    				each_value_1 = /*$weaveLength*/ ctx[3].yarnLengths;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$3, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, tr0, destroy_block, create_each_block_1$3, null, get_each_context_1$3);
    			}

    			if (dirty & /*$_*/ 2 && t5_value !== (t5_value = /*$_*/ ctx[1]('chart.summary.length') + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$appConfig*/ 4 && input1.value !== /*$appConfig*/ ctx[2].weaveLength) {
    				set_input_value(input1, /*$appConfig*/ ctx[2].weaveLength);
    			}

    			if (dirty & /*$weaveLength*/ 8) {
    				each_value = /*$weaveLength*/ ctx[3].yarnLengths;
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$5, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, tr1, destroy_block, create_each_block$5, null, get_each_context$5);
    			}

    			if (dirty & /*$_*/ 2 && t11_value !== (t11_value = /*$_*/ ctx[1]('chart.summary.weaveAllowance') + "")) set_data_dev(t11, t11_value);
    			if (dirty & /*$_*/ 2 && t14_value !== (t14_value = /*$_*/ ctx[1]('chart.summary.tabletAllowance') + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*$weaveLength*/ 8 && t18_value !== (t18_value = /*$weaveLength*/ ctx[3].singleYarnLength + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*$_*/ 2 && t20_value !== (t20_value = /*$_*/ ctx[1]('chart.summary.perThread') + "")) set_data_dev(t20, t20_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(table0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(table1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(19:2) {#if showColors}",
    		ctx
    	});

    	return block;
    }

    // (27:11) {#each $weaveLength.yarnLengths as wl, index (index)}
    function create_each_block_1$3(key_1, ctx) {
    	let td;
    	let t0_value = /*wl*/ ctx[11].count + "";
    	let t0;
    	let t1;
    	let input;
    	let input_uk_tooltip_value;
    	let input_value_value;
    	let t2;
    	let mounted;
    	let dispose;

    	function change_handler(...args) {
    		return /*change_handler*/ ctx[7](/*wl*/ ctx[11], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			td = element("td");
    			t0 = text(t0_value);
    			t1 = text(" x ");
    			input = element("input");
    			t2 = space();
    			attr_dev(input, "type", "color");
    			attr_dev(input, "uk-tooltip", input_uk_tooltip_value = /*wl*/ ctx[11].color);
    			input.value = input_value_value = /*wl*/ ctx[11].color;
    			attr_dev(input, "class", "svelte-1ihlopf");
    			add_location(input, file$9, 28, 28, 1208);
    			attr_dev(td, "class", "uk-text-right");
    			add_location(td, file$9, 27, 12, 1153);
    			this.first = td;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t0);
    			append_dev(td, t1);
    			append_dev(td, input);
    			append_dev(td, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", change_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$weaveLength*/ 8 && t0_value !== (t0_value = /*wl*/ ctx[11].count + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$weaveLength*/ 8 && input_uk_tooltip_value !== (input_uk_tooltip_value = /*wl*/ ctx[11].color)) {
    				attr_dev(input, "uk-tooltip", input_uk_tooltip_value);
    			}

    			if (dirty & /*$weaveLength*/ 8 && input_value_value !== (input_value_value = /*wl*/ ctx[11].color)) {
    				prop_dev(input, "value", input_value_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(27:11) {#each $weaveLength.yarnLengths as wl, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (38:11) {#each $weaveLength.yarnLengths as wl, index (index)}
    function create_each_block$5(key_1, ctx) {
    	let td;
    	let t_value = /*wl*/ ctx[11].yarnLength + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			td = element("td");
    			t = text(t_value);
    			attr_dev(td, "class", "uk-text-right");
    			add_location(td, file$9, 38, 12, 1667);
    			this.first = td;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$weaveLength*/ 8 && t_value !== (t_value = /*wl*/ ctx[11].yarnLength + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(38:11) {#each $weaveLength.yarnLengths as wl, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;

    	function select_block_type(ctx, dirty) {
    		if (/*showColors*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			if_block.c();
    			t1 = space();
    			div2 = element("div");
    			add_location(div0, file$9, 16, 1, 570);
    			attr_dev(div1, "class", "uk-text-center");
    			add_location(div1, file$9, 17, 1, 583);
    			add_location(div2, file$9, 55, 1, 2399);
    			attr_dev(div3, "class", "uk-flex uk-flex-around uk-flex-wrap uk-flex-middle uk-margin-small-top");
    			add_location(div3, file$9, 15, 0, 484);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			if_block.m(div1, null);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $tablets;
    	let $_;
    	let $appConfig;
    	let $weaveLength;
    	validate_store(tablets, 'tablets');
    	component_subscribe($$self, tablets, $$value => $$invalidate(10, $tablets = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
    	validate_store(appConfig, 'appConfig');
    	component_subscribe($$self, appConfig, $$value => $$invalidate(2, $appConfig = $$value));
    	validate_store(weaveLength, 'weaveLength');
    	component_subscribe($$self, weaveLength, $$value => $$invalidate(3, $weaveLength = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChartSummary', slots, []);
    	let showColors = false;

    	const updateColor = (event, color) => {
    		set_store_value(
    			tablets,
    			$tablets = $tablets.map(tablet => {
    				tablet.threads = tablet.threads.map(thread => {
    					thread.color = thread.color.replace(color, event.target.value);
    					return thread;
    				});

    				return tablet;
    			}),
    			$tablets
    		);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChartSummary> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, showColors = false);

    	function input0_input_handler() {
    		$appConfig.weftColor = this.value;
    		appConfig.set($appConfig);
    	}

    	const change_handler = (wl, e) => updateColor(e, wl.color);

    	function input1_input_handler() {
    		$appConfig.weaveLength = this.value;
    		appConfig.set($appConfig);
    	}

    	const click_handler_1 = () => $$invalidate(0, showColors = true);

    	$$self.$capture_state = () => ({
    		_: X,
    		appConfig,
    		tablets,
    		weaveLength,
    		showColors,
    		updateColor,
    		$tablets,
    		$_,
    		$appConfig,
    		$weaveLength
    	});

    	$$self.$inject_state = $$props => {
    		if ('showColors' in $$props) $$invalidate(0, showColors = $$props.showColors);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		showColors,
    		$_,
    		$appConfig,
    		$weaveLength,
    		updateColor,
    		click_handler,
    		input0_input_handler,
    		change_handler,
    		input1_input_handler,
    		click_handler_1
    	];
    }

    class ChartSummary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChartSummary",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/ChartThread.svelte generated by Svelte v3.44.3 */
    const file$8 = "src/components/ChartThread.svelte";

    function create_fragment$8(ctx) {
    	let div;
    	let input;
    	let div_uk_tooltip_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			attr_dev(input, "type", "color");
    			attr_dev(input, "class", "svelte-1w07srg");
    			add_location(input, file$8, 7, 1, 186);
    			attr_dev(div, "class", "thread svelte-1w07srg");
    			attr_dev(div, "uk-tooltip", div_uk_tooltip_value = /*$_*/ ctx[1]("chart.tablet.color"));
    			set_style(div, "--backgroundColor", /*thread*/ ctx[0].color);
    			add_location(div, file$8, 4, 0, 81);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*thread*/ ctx[0].color);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*thread*/ 1) {
    				set_input_value(input, /*thread*/ ctx[0].color);
    			}

    			if (dirty & /*$_*/ 2 && div_uk_tooltip_value !== (div_uk_tooltip_value = /*$_*/ ctx[1]("chart.tablet.color"))) {
    				attr_dev(div, "uk-tooltip", div_uk_tooltip_value);
    			}

    			if (dirty & /*thread*/ 1) {
    				set_style(div, "--backgroundColor", /*thread*/ ctx[0].color);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChartThread', slots, []);
    	let { thread } = $$props;
    	const writable_props = ['thread'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChartThread> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		thread.color = this.value;
    		$$invalidate(0, thread);
    	}

    	$$self.$$set = $$props => {
    		if ('thread' in $$props) $$invalidate(0, thread = $$props.thread);
    	};

    	$$self.$capture_state = () => ({ _: X, thread, $_ });

    	$$self.$inject_state = $$props => {
    		if ('thread' in $$props) $$invalidate(0, thread = $$props.thread);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [thread, $_, input_input_handler];
    }

    class ChartThread extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { thread: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChartThread",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*thread*/ ctx[0] === undefined && !('thread' in props)) {
    			console.warn("<ChartThread> was created without expected prop 'thread'");
    		}
    	}

    	get thread() {
    		throw new Error("<ChartThread>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set thread(value) {
    		throw new Error("<ChartThread>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/ChartTablet.svelte generated by Svelte v3.44.3 */
    const file$7 = "src/components/ChartTablet.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[1] = i;
    	return child_ctx;
    }

    // (12:2) {#if index < 9}
    function create_if_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(" ");
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(12:2) {#if index < 9}",
    		ctx
    	});

    	return block;
    }

    // (15:1) {#each tablet.threads as thread, index (index)}
    function create_each_block$4(key_1, ctx) {
    	let first;
    	let chartthread;
    	let updating_thread;
    	let current;

    	function chartthread_thread_binding(value) {
    		/*chartthread_thread_binding*/ ctx[4](value, /*thread*/ ctx[5], /*each_value*/ ctx[6], /*index*/ ctx[1]);
    	}

    	let chartthread_props = {};

    	if (/*thread*/ ctx[5] !== void 0) {
    		chartthread_props.thread = /*thread*/ ctx[5];
    	}

    	chartthread = new ChartThread({ props: chartthread_props, $$inline: true });
    	binding_callbacks.push(() => bind(chartthread, 'thread', chartthread_thread_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(chartthread.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(chartthread, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const chartthread_changes = {};

    			if (!updating_thread && dirty & /*tablet*/ 1) {
    				updating_thread = true;
    				chartthread_changes.thread = /*thread*/ ctx[5];
    				add_flush_callback(() => updating_thread = false);
    			}

    			chartthread.$set(chartthread_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(chartthread.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(chartthread.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(chartthread, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(15:1) {#each tablet.threads as thread, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (23:3) {:else}
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
    		source: "(23:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:3) {#if tablet.sDirection}
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
    		source: "(21:3) {#if tablet.sDirection}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*index*/ ctx[1] + 1 + "";
    	let t0;
    	let div0_uk_tooltip_value;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let div1;
    	let button;
    	let button_uk_tooltip_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*index*/ ctx[1] < 9 && create_if_block_1(ctx);
    	let each_value = /*tablet*/ ctx[0].threads;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$4, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$4(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
    	}

    	function select_block_type(ctx, dirty) {
    		if (/*tablet*/ ctx[0].sDirection) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			if_block1.c();
    			attr_dev(div0, "class", "tabletIndex uk-text-center svelte-1u8xqhc");
    			attr_dev(div0, "uk-tooltip", div0_uk_tooltip_value = /*$_*/ ctx[2]("chart.tablet.index", { values: { index: /*index*/ ctx[1] + 1 } }));
    			add_location(div0, file$7, 10, 1, 261);
    			attr_dev(button, "uk-tooltip", button_uk_tooltip_value = /*$_*/ ctx[2]("chart.tablet.switch"));
    			attr_dev(button, "class", "svelte-1u8xqhc");
    			add_location(button, file$7, 19, 2, 547);
    			attr_dev(div1, "class", "threadDirection svelte-1u8xqhc");
    			add_location(div1, file$7, 18, 1, 515);
    			attr_dev(div2, "class", "tablet uk-flex-auto svelte-1u8xqhc");
    			add_location(div2, file$7, 9, 0, 226);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append_dev(div0, t0);
    			append_dev(div2, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			if_block1.m(button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*toggleDirection*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*index*/ ctx[1] < 9) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div0, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*index*/ 2) && t0_value !== (t0_value = /*index*/ ctx[1] + 1 + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*$_, index*/ 6 && div0_uk_tooltip_value !== (div0_uk_tooltip_value = /*$_*/ ctx[2]("chart.tablet.index", { values: { index: /*index*/ ctx[1] + 1 } }))) {
    				attr_dev(div0, "uk-tooltip", div0_uk_tooltip_value);
    			}

    			if (dirty & /*tablet*/ 1) {
    				each_value = /*tablet*/ ctx[0].threads;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$4, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div2, outro_and_destroy_block, create_each_block$4, t2, get_each_context$4);
    				check_outros();
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button, null);
    				}
    			}

    			if (!current || dirty & /*$_*/ 4 && button_uk_tooltip_value !== (button_uk_tooltip_value = /*$_*/ ctx[2]("chart.tablet.switch"))) {
    				attr_dev(button, "uk-tooltip", button_uk_tooltip_value);
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
    			if (if_block0) if_block0.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $_;
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(2, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ChartTablet', slots, []);
    	let { index } = $$props;
    	let { tablet } = $$props;

    	const toggleDirection = () => {
    		$$invalidate(0, tablet.sDirection = !tablet.sDirection, tablet);
    	};

    	const writable_props = ['index', 'tablet'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ChartTablet> was created with unknown prop '${key}'`);
    	});

    	function chartthread_thread_binding(value, thread, each_value, index) {
    		each_value[index] = value;
    		$$invalidate(0, tablet);
    	}

    	$$self.$$set = $$props => {
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('tablet' in $$props) $$invalidate(0, tablet = $$props.tablet);
    	};

    	$$self.$capture_state = () => ({
    		_: X,
    		ChartThread,
    		index,
    		tablet,
    		toggleDirection,
    		$_
    	});

    	$$self.$inject_state = $$props => {
    		if ('index' in $$props) $$invalidate(1, index = $$props.index);
    		if ('tablet' in $$props) $$invalidate(0, tablet = $$props.tablet);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tablet, index, $_, toggleDirection, chartthread_thread_binding];
    }

    class ChartTablet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { index: 1, tablet: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ChartTablet",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*index*/ ctx[1] === undefined && !('index' in props)) {
    			console.warn("<ChartTablet> was created without expected prop 'index'");
    		}

    		if (/*tablet*/ ctx[0] === undefined && !('tablet' in props)) {
    			console.warn("<ChartTablet> was created without expected prop 'tablet'");
    		}
    	}

    	get index() {
    		throw new Error("<ChartTablet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set index(value) {
    		throw new Error("<ChartTablet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tablet() {
    		throw new Error("<ChartTablet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tablet(value) {
    		throw new Error("<ChartTablet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Chart.svelte generated by Svelte v3.44.3 */
    const file$6 = "src/components/Chart.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (42:11) {#each $tablets[0].threads as _, index (index)}
    function create_each_block_1$2(key_1, ctx) {
    	let div;
    	let t0_value = String.fromCharCode(65 + /*index*/ ctx[7]) + "";
    	let t0;
    	let t1;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "holeIndex svelte-1q4wfrv");
    			add_location(div, file$6, 42, 12, 1304);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$tablets*/ 1 && t0_value !== (t0_value = String.fromCharCode(65 + /*index*/ ctx[7]) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(42:11) {#each $tablets[0].threads as _, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (49:4) {#each $tablets as tablet, index (index)}
    function create_each_block$3(key_1, ctx) {
    	let first;
    	let charttablet;
    	let updating_tablet;
    	let current;

    	function charttablet_tablet_binding(value) {
    		/*charttablet_tablet_binding*/ ctx[4](value, /*tablet*/ ctx[5], /*each_value*/ ctx[6], /*index*/ ctx[7]);
    	}

    	let charttablet_props = { index: /*index*/ ctx[7] };

    	if (/*tablet*/ ctx[5] !== void 0) {
    		charttablet_props.tablet = /*tablet*/ ctx[5];
    	}

    	charttablet = new ChartTablet({ props: charttablet_props, $$inline: true });
    	binding_callbacks.push(() => bind(charttablet, 'tablet', charttablet_tablet_binding));

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(charttablet.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(charttablet, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const charttablet_changes = {};
    			if (dirty & /*$tablets*/ 1) charttablet_changes.index = /*index*/ ctx[7];

    			if (!updating_tablet && dirty & /*$tablets*/ 1) {
    				updating_tablet = true;
    				charttablet_changes.tablet = /*tablet*/ ctx[5];
    				add_flush_callback(() => updating_tablet = false);
    			}

    			charttablet.$set(charttablet_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charttablet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charttablet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(charttablet, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(49:4) {#each $tablets as tablet, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div6;
    	let div5;
    	let h2;
    	let t0_value = /*$_*/ ctx[1]('chart.title') + "";
    	let t0;
    	let t1;
    	let div4;
    	let div0;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let img_uk_tooltip_value;
    	let t2;
    	let div2;
    	let div1;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t3;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let t4;
    	let div3;
    	let button0;
    	let button0_uk_tooltip_value;
    	let br;
    	let t5;
    	let button1;
    	let button1_uk_tooltip_value;
    	let t6;
    	let chartsummary;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$tablets*/ ctx[0][0].threads;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[7];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1$2(key, child_ctx));
    	}

    	let each_value = /*$tablets*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*index*/ ctx[7];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	chartsummary = new ChartSummary({ $$inline: true });

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div5 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div4 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			div3 = element("div");
    			button0 = element("button");
    			br = element("br");
    			t5 = space();
    			button1 = element("button");
    			t6 = space();
    			create_component(chartsummary.$$.fragment);
    			add_location(h2, file$6, 30, 2, 880);
    			if (!src_url_equal(img.src, img_src_value = "assets/tablet-4-holes.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$_*/ ctx[1]('chart.tablet.holes'));
    			attr_dev(img, "uk-tooltip", img_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.holes'));
    			attr_dev(img, "class", "svelte-1q4wfrv");
    			add_location(img, file$6, 34, 4, 992);
    			add_location(div0, file$6, 33, 3, 982);
    			attr_dev(div1, "class", "holes uk-flex-auto svelte-1q4wfrv");
    			add_location(div1, file$6, 40, 7, 1200);
    			attr_dev(div2, "class", "uk-flex uk-flex-center uk-flex-row uk-flex-auto");
    			add_location(div2, file$6, 39, 3, 1131);
    			attr_dev(button0, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom  svelte-1q4wfrv");
    			attr_dev(button0, "uk-icon", "plus");
    			attr_dev(button0, "uk-tooltip", button0_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.add'));
    			add_location(button0, file$6, 54, 7, 1561);
    			add_location(br, file$6, 56, 53, 1780);
    			attr_dev(button1, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small svelte-1q4wfrv");
    			attr_dev(button1, "uk-icon", "minus");
    			attr_dev(button1, "uk-tooltip", button1_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.remove'));
    			add_location(button1, file$6, 57, 7, 1792);
    			add_location(div3, file$6, 53, 6, 1548);
    			attr_dev(div4, "class", "uk-flex uk-flex-around uk-flex-wrap uk-flex-middle");
    			add_location(div4, file$6, 32, 2, 914);
    			attr_dev(div5, "class", "uk-container uk-container-small uk-container-expand");
    			add_location(div5, file$6, 29, 1, 812);
    			attr_dev(div6, "class", "uk-section uk-section-xsmall uk-section-muted threadingChart");
    			add_location(div6, file$6, 28, 0, 736);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div5);
    			append_dev(div5, h2);
    			append_dev(h2, t0);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, img);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div2, t3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div4, t4);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(div3, br);
    			append_dev(div3, t5);
    			append_dev(div3, button1);
    			append_dev(div5, t6);
    			mount_component(chartsummary, div5, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", prevent_default(/*addTablet*/ ctx[2]), false, true, false),
    					listen_dev(button1, "click", prevent_default(/*removeTablet*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$_*/ 2) && t0_value !== (t0_value = /*$_*/ ctx[1]('chart.title') + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*$_*/ 2 && img_alt_value !== (img_alt_value = /*$_*/ ctx[1]('chart.tablet.holes'))) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (!current || dirty & /*$_*/ 2 && img_uk_tooltip_value !== (img_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.holes'))) {
    				attr_dev(img, "uk-tooltip", img_uk_tooltip_value);
    			}

    			if (dirty & /*String, $tablets*/ 1) {
    				each_value_1 = /*$tablets*/ ctx[0][0].threads;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div1, destroy_block, create_each_block_1$2, null, get_each_context_1$2);
    			}

    			if (dirty & /*$tablets*/ 1) {
    				each_value = /*$tablets*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div2, outro_and_destroy_block, create_each_block$3, null, get_each_context$3);
    				check_outros();
    			}

    			if (!current || dirty & /*$_*/ 2 && button0_uk_tooltip_value !== (button0_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.add'))) {
    				attr_dev(button0, "uk-tooltip", button0_uk_tooltip_value);
    			}

    			if (!current || dirty & /*$_*/ 2 && button1_uk_tooltip_value !== (button1_uk_tooltip_value = /*$_*/ ctx[1]('chart.tablet.remove'))) {
    				attr_dev(button1, "uk-tooltip", button1_uk_tooltip_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(chartsummary.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(chartsummary.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(chartsummary);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $tablets;
    	let $_;
    	validate_store(tablets, 'tablets');
    	component_subscribe($$self, tablets, $$value => $$invalidate(0, $tablets = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(1, $_ = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Chart', slots, []);

    	const addTablet = () => {
    		tablets.update(t => {
    			const lastTablet = t[t.length - 1];

    			const newTablet = {
    				sDirection: lastTablet.sDirection,
    				holes: 4,
    				threads: lastTablet.threads.map(hole => {
    					return { color: hole.color };
    				})
    			};

    			t.push(newTablet);
    			return t;
    		});
    	};

    	const removeTablet = () => {
    		if ($tablets.length > 1) {
    			tablets.update(t => {
    				t.pop();
    				return t;
    			});
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Chart> was created with unknown prop '${key}'`);
    	});

    	function charttablet_tablet_binding(value, tablet, each_value, index) {
    		each_value[index] = value;
    		tablets.set($tablets);
    	}

    	$$self.$capture_state = () => ({
    		_: X,
    		tablets,
    		ChartSummary,
    		ChartTablet,
    		addTablet,
    		removeTablet,
    		$tablets,
    		$_
    	});

    	return [$tablets, $_, addTablet, removeTablet, charttablet_tablet_binding];
    }

    class Chart extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Chart",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    var _ = {
      $(selector) {
        if (typeof selector === "string") {
          return document.querySelector(selector);
        }
        return selector;
      },
      extend(...args) {
        return Object.assign(...args);
      },
      cumulativeOffset(element) {
        let top = 0;
        let left = 0;

        do {
          top += element.offsetTop || 0;
          left += element.offsetLeft || 0;
          element = element.offsetParent;
        } while (element);

        return {
          top: top,
          left: left
        };
      },
      directScroll(element) {
        return element && element !== document && element !== document.body;
      },
      scrollTop(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollTop = value) : element.scrollTop;
        } else {
          return inSetter
            ? (document.documentElement.scrollTop = document.body.scrollTop = value)
            : window.pageYOffset ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;
        }
      },
      scrollLeft(element, value) {
        let inSetter = value !== undefined;
        if (this.directScroll(element)) {
          return inSetter ? (element.scrollLeft = value) : element.scrollLeft;
        } else {
          return inSetter
            ? (document.documentElement.scrollLeft = document.body.scrollLeft = value)
            : window.pageXOffset ||
                document.documentElement.scrollLeft ||
                document.body.scrollLeft ||
                0;
        }
      }
    };

    const defaultOptions = {
      container: "body",
      duration: 500,
      delay: 0,
      offset: 0,
      easing: cubicInOut,
      onStart: noop,
      onDone: noop,
      onAborting: noop,
      scrollX: false,
      scrollY: true
    };

    const _scrollTo = options => {
      let {
        offset,
        duration,
        delay,
        easing,
        x=0,
        y=0,
        scrollX,
        scrollY,
        onStart,
        onDone,
        container,
        onAborting,
        element
      } = options;

      if (typeof offset === "function") {
        offset = offset();
      }

      var cumulativeOffsetContainer = _.cumulativeOffset(container);
      var cumulativeOffsetTarget = element
        ? _.cumulativeOffset(element)
        : { top: y, left: x };

      var initialX = _.scrollLeft(container);
      var initialY = _.scrollTop(container);

      var targetX =
        cumulativeOffsetTarget.left - cumulativeOffsetContainer.left + offset;
      var targetY =
        cumulativeOffsetTarget.top - cumulativeOffsetContainer.top + offset;

      var diffX = targetX - initialX;
    	var diffY = targetY - initialY;

      let scrolling = true;
      let started = false;
      let start_time = now() + delay;
      let end_time = start_time + duration;

      function scrollToTopLeft(element, top, left) {
        if (scrollX) _.scrollLeft(element, left);
        if (scrollY) _.scrollTop(element, top);
      }

      function start(delayStart) {
        if (!delayStart) {
          started = true;
          onStart(element, {x, y});
        }
      }

      function tick(progress) {
        scrollToTopLeft(
          container,
          initialY + diffY * progress,
          initialX + diffX * progress
        );
      }

      function stop() {
        scrolling = false;
      }

      loop(now => {
        if (!started && now >= start_time) {
          start(false);
        }

        if (started && now >= end_time) {
          tick(1);
          stop();
          onDone(element, {x, y});
        }

        if (!scrolling) {
          onAborting(element, {x, y});
          return false;
        }
        if (started) {
          const p = now - start_time;
          const t = 0 + 1 * easing(p / duration);
          tick(t);
        }

        return true;
      });

      start(delay);

      tick(0);

      return stop;
    };

    const proceedOptions = options => {
    	let opts = _.extend({}, defaultOptions, options);
      opts.container = _.$(opts.container);
      opts.element = _.$(opts.element);
      return opts;
    };

    const scrollContainerHeight = containerElement => {
      if (
        containerElement &&
        containerElement !== document &&
        containerElement !== document.body
      ) {
        return containerElement.scrollHeight - containerElement.offsetHeight;
      } else {
        let body = document.body;
        let html = document.documentElement;

        return Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );
      }
    };

    const setGlobalOptions = options => {
    	_.extend(defaultOptions, options || {});
    };

    const scrollTo = options => {
      return _scrollTo(proceedOptions(options));
    };

    const scrollToBottom = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: scrollContainerHeight(options.container)
        })
      );
    };

    const scrollToTop = options => {
      options = proceedOptions(options);

      return _scrollTo(
        _.extend(options, {
          element: null,
          y: 0
        })
      );
    };

    const makeScrollToAction = scrollToFunc => {
      return (node, options) => {
        let current = options;
        const handle = e => {
          e.preventDefault();
          scrollToFunc(
            typeof current === "string" ? { element: current } : current
          );
        };
        node.addEventListener("click", handle);
        node.addEventListener("touchstart", handle);
        return {
          update(options) {
            current = options;
          },
          destroy() {
            node.removeEventListener("click", handle);
            node.removeEventListener("touchstart", handle);
          }
        };
      };
    };

    const scrollto = makeScrollToAction(scrollTo);
    const scrolltotop = makeScrollToAction(scrollToTop);
    const scrolltobottom = makeScrollToAction(scrollToBottom);

    var animateScroll = /*#__PURE__*/Object.freeze({
        __proto__: null,
        setGlobalOptions: setGlobalOptions,
        scrollTo: scrollTo,
        scrollToBottom: scrollToBottom,
        scrollToTop: scrollToTop,
        makeScrollToAction: makeScrollToAction,
        scrollto: scrollto,
        scrolltotop: scrolltotop,
        scrolltobottom: scrolltobottom
    });

    class Weave {
        constructor(color, sDirection) {
            this.color = color;
            this.sDirection = sDirection;
        }
    }

    // Front pattern
    const weavesFront = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
        return $tablets.map((tablet, tabletIndex) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 0, tablet.sDirection));
    });
    // Back pattern
    const weavesBack = derived([weaveRows, tablets, rotationDirections], ([$weaveRows, $tablets, $rotationDirections]) => {
        return $tablets.map((tablet, tabletIndex) => generateWeaves($weaveRows, $rotationDirections, tablet, tabletIndex, 2, !tablet.sDirection));
    });
    function generateWeaves(weaveRows, rotationDirections, tablet, tabletIndex, colorIndex, direction) {
        const threads = tablet.threads;
        const numberOfHoles = threads.length;
        let previousRotation = false;
        return [...Array(weaveRows).keys()].map((i) => {
            let offset = 1;
            let tabletDirection = direction;
            const rotateBack = typeof rotationDirections[i] !== 'undefined' && rotationDirections[i][tabletIndex] === true;
            if (rotateBack) {
                tabletDirection = !direction;
                offset = -1;
            }
            if (previousRotation != rotateBack) {
                offset = 0;
            }
            colorIndex = (colorIndex + offset + threads.length) % numberOfHoles;
            const weaveColor = threads[colorIndex].color;
            previousRotation = rotateBack;
            return new Weave(weaveColor, tabletDirection);
        });
    }

    /* src/components/PreviewInstructions.svelte generated by Svelte v3.44.3 */
    const file$5 = "src/components/PreviewInstructions.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[15] = i;
    	return child_ctx;
    }

    // (36:2) {#each $tablets as _, j (j)}
    function create_each_block_2(key_1, ctx) {
    	let th;
    	let t_value = /*j*/ ctx[15] + 1 + "";
    	let t;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			th = element("th");
    			t = text(t_value);
    			attr_dev(th, "class", "svelte-k8i245");
    			add_location(th, file$5, 36, 3, 1161);
    			this.first = th;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, th, anchor);
    			append_dev(th, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$tablets*/ 2 && t_value !== (t_value = /*j*/ ctx[15] + 1 + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(th);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(36:2) {#each $tablets as _, j (j)}",
    		ctx
    	});

    	return block;
    }

    // (46:3) {#each $tablets as tablet, j (j)}
    function create_each_block_1$1(key_1, ctx) {
    	let td;
    	let button;
    	let t;
    	let button_uk_tooltip_value;
    	let td_class_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[9](/*i*/ ctx[12], /*j*/ ctx[15]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			td = element("td");
    			button = element("button");
    			t = text(" ");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "cellLink svelte-k8i245");

    			attr_dev(button, "uk-tooltip", button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.index', {
    				values: {
    					column: /*j*/ ctx[15] + 1,
    					row: /*i*/ ctx[12] + 1
    				}
    			}));

    			add_location(button, file$5, 47, 5, 1532);

    			attr_dev(td, "class", td_class_value = "" + (null_to_empty(/*isActive*/ ctx[0](/*i*/ ctx[12], /*j*/ ctx[15])
    			? 'active'
    			: '') + " svelte-k8i245"));

    			add_location(td, file$5, 46, 4, 1481);
    			this.first = td;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, td, anchor);
    			append_dev(td, button);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*$_, $tablets, $weaveRows*/ 14 && button_uk_tooltip_value !== (button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.index', {
    				values: {
    					column: /*j*/ ctx[15] + 1,
    					row: /*i*/ ctx[12] + 1
    				}
    			}))) {
    				attr_dev(button, "uk-tooltip", button_uk_tooltip_value);
    			}

    			if (dirty & /*isActive, $weaveRows, $tablets*/ 11 && td_class_value !== (td_class_value = "" + (null_to_empty(/*isActive*/ ctx[0](/*i*/ ctx[12], /*j*/ ctx[15])
    			? 'active'
    			: '') + " svelte-k8i245"))) {
    				attr_dev(td, "class", td_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(td);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(46:3) {#each $tablets as tablet, j (j)}",
    		ctx
    	});

    	return block;
    }

    // (40:1) {#each [...Array($weaveRows).keys()] as row, i (i)}
    function create_each_block$2(key_1, ctx) {
    	let tr;
    	let th;
    	let button;
    	let t0_value = /*i*/ ctx[12] + 1 + "";
    	let t0;
    	let button_uk_tooltip_value;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[8](/*i*/ ctx[12]);
    	}

    	let each_value_1 = /*$tablets*/ ctx[1];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*j*/ ctx[15];
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(button, "type", "button");
    			attr_dev(button, "uk-tooltip", button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.switchAll'));
    			attr_dev(button, "class", "svelte-k8i245");
    			add_location(button, file$5, 42, 4, 1289);
    			attr_dev(th, "class", "uk-text-right svelte-k8i245");
    			add_location(th, file$5, 41, 3, 1258);
    			attr_dev(tr, "class", "svelte-k8i245");
    			add_location(tr, file$5, 40, 2, 1250);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(th, button);
    			append_dev(button, t0);
    			append_dev(tr, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tr, null);
    			}

    			append_dev(tr, t2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$weaveRows*/ 8 && t0_value !== (t0_value = /*i*/ ctx[12] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$_*/ 4 && button_uk_tooltip_value !== (button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.switchAll'))) {
    				attr_dev(button, "uk-tooltip", button_uk_tooltip_value);
    			}

    			if (dirty & /*isActive, Array, $weaveRows, $tablets, $_, changeDirectionForCell*/ 79) {
    				each_value_1 = /*$tablets*/ ctx[1];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, tr, destroy_block, create_each_block_1$1, t2, get_each_context_1$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(40:1) {#each [...Array($weaveRows).keys()] as row, i (i)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let table;
    	let tr;
    	let th;
    	let button;
    	let button_uk_tooltip_value;
    	let t0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value_2 = /*$tablets*/ ctx[1];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*j*/ ctx[15];
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value = [...Array(/*$weaveRows*/ ctx[3]).keys()];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*i*/ ctx[12];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			tr = element("tr");
    			th = element("th");
    			button = element("button");
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(button, "class", "resetDirections svelte-k8i245");
    			attr_dev(button, "type", "button");
    			attr_dev(button, "uk-icon", "icon: trash; ratio: 0.7");
    			attr_dev(button, "uk-tooltip", button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.reset'));
    			add_location(button, file$5, 30, 3, 936);
    			attr_dev(th, "class", "svelte-k8i245");
    			add_location(th, file$5, 29, 2, 928);
    			attr_dev(tr, "uk-sticky", "");
    			attr_dev(tr, "class", "svelte-k8i245");
    			add_location(tr, file$5, 28, 1, 911);
    			attr_dev(table, "class", "svelte-k8i245");
    			add_location(table, file$5, 27, 0, 902);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, tr);
    			append_dev(tr, th);
    			append_dev(th, button);
    			append_dev(tr, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(tr, null);
    			}

    			append_dev(table, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(table, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*resetDirections*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$_*/ 4 && button_uk_tooltip_value !== (button_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.reset'))) {
    				attr_dev(button, "uk-tooltip", button_uk_tooltip_value);
    			}

    			if (dirty & /*$tablets*/ 2) {
    				each_value_2 = /*$tablets*/ ctx[1];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, tr, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty & /*$tablets, isActive, Array, $weaveRows, $_, changeDirectionForCell, changeDirectionForRow*/ 111) {
    				each_value = [...Array(/*$weaveRows*/ ctx[3]).keys()];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, table, destroy_block, create_each_block$2, null, get_each_context$2);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let isActive;
    	let $rotationDirections;
    	let $tablets;
    	let $_;
    	let $weaveRows;
    	validate_store(rotationDirections, 'rotationDirections');
    	component_subscribe($$self, rotationDirections, $$value => $$invalidate(7, $rotationDirections = $$value));
    	validate_store(tablets, 'tablets');
    	component_subscribe($$self, tablets, $$value => $$invalidate(1, $tablets = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(2, $_ = $$value));
    	validate_store(weaveRows, 'weaveRows');
    	component_subscribe($$self, weaveRows, $$value => $$invalidate(3, $weaveRows = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PreviewInstructions', slots, []);

    	const resetDirections = () => {
    		set_store_value(rotationDirections, $rotationDirections = {}, $rotationDirections);
    	};

    	const changeDirectionForRow = row => {
    		$tablets.forEach((element, column) => {
    			changeDirectionForCell(row, column);
    		});
    	};

    	const changeDirectionForCell = (row, column) => {
    		if (typeof $rotationDirections[row] === 'undefined') {
    			set_store_value(rotationDirections, $rotationDirections[row] = {}, $rotationDirections);
    		}

    		if ($rotationDirections[row][column]) {
    			delete $rotationDirections[row][column];
    			rotationDirections.set($rotationDirections);
    		} else {
    			set_store_value(rotationDirections, $rotationDirections[row][column] = true, $rotationDirections);
    		}
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PreviewInstructions> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => changeDirectionForRow(i);
    	const click_handler_1 = (i, j) => changeDirectionForCell(i, j);

    	$$self.$capture_state = () => ({
    		_: X,
    		tablets,
    		weaveRows,
    		rotationDirections,
    		resetDirections,
    		changeDirectionForRow,
    		changeDirectionForCell,
    		isActive,
    		$rotationDirections,
    		$tablets,
    		$_,
    		$weaveRows
    	});

    	$$self.$inject_state = $$props => {
    		if ('isActive' in $$props) $$invalidate(0, isActive = $$props.isActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$rotationDirections*/ 128) {
    			$$invalidate(0, isActive = (i, j) => {
    				return typeof $rotationDirections[i] !== 'undefined' && typeof $rotationDirections[i][j] !== 'undefined' && $rotationDirections[i][j] === true;
    			});
    		}
    	};

    	return [
    		isActive,
    		$tablets,
    		$_,
    		$weaveRows,
    		resetDirections,
    		changeDirectionForRow,
    		changeDirectionForCell,
    		$rotationDirections,
    		click_handler,
    		click_handler_1
    	];
    }

    class PreviewInstructions extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviewInstructions",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/PreviewThreadWeave.svelte generated by Svelte v3.44.3 */
    const file$4 = "src/components/PreviewThreadWeave.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let div_class_value;
    	let div_uk_tooltip_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", div_class_value = "weave weaveSize" + /*$appConfig*/ ctx[4].weaveSize + " " + /*classNames*/ ctx[3] + " svelte-w87f46");
    			attr_dev(div, "uk-tooltip", div_uk_tooltip_value = "" + (/*tabletIndex*/ ctx[0] + 1 + ", " + (/*weaveRow*/ ctx[1] + 1)));
    			set_style(div, "--backgroundColor", /*weave*/ ctx[2].color);
    			set_style(div, "--borderColor", /*$appConfig*/ ctx[4].weaveBorderColor);
    			toggle_class(div, "sDirection", /*weave*/ ctx[2].sDirection);
    			add_location(div, file$4, 7, 0, 172);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$appConfig, classNames*/ 24 && div_class_value !== (div_class_value = "weave weaveSize" + /*$appConfig*/ ctx[4].weaveSize + " " + /*classNames*/ ctx[3] + " svelte-w87f46")) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*tabletIndex, weaveRow*/ 3 && div_uk_tooltip_value !== (div_uk_tooltip_value = "" + (/*tabletIndex*/ ctx[0] + 1 + ", " + (/*weaveRow*/ ctx[1] + 1)))) {
    				attr_dev(div, "uk-tooltip", div_uk_tooltip_value);
    			}

    			if (dirty & /*weave*/ 4) {
    				set_style(div, "--backgroundColor", /*weave*/ ctx[2].color);
    			}

    			if (dirty & /*$appConfig*/ 16) {
    				set_style(div, "--borderColor", /*$appConfig*/ ctx[4].weaveBorderColor);
    			}

    			if (dirty & /*$appConfig, classNames, weave*/ 28) {
    				toggle_class(div, "sDirection", /*weave*/ ctx[2].sDirection);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $appConfig;
    	validate_store(appConfig, 'appConfig');
    	component_subscribe($$self, appConfig, $$value => $$invalidate(4, $appConfig = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PreviewThreadWeave', slots, []);
    	let { tabletIndex } = $$props;
    	let { weaveRow } = $$props;
    	let { weave } = $$props;
    	let { classNames = '' } = $$props;
    	const writable_props = ['tabletIndex', 'weaveRow', 'weave', 'classNames'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PreviewThreadWeave> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tabletIndex' in $$props) $$invalidate(0, tabletIndex = $$props.tabletIndex);
    		if ('weaveRow' in $$props) $$invalidate(1, weaveRow = $$props.weaveRow);
    		if ('weave' in $$props) $$invalidate(2, weave = $$props.weave);
    		if ('classNames' in $$props) $$invalidate(3, classNames = $$props.classNames);
    	};

    	$$self.$capture_state = () => ({
    		appConfig,
    		tabletIndex,
    		weaveRow,
    		weave,
    		classNames,
    		$appConfig
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabletIndex' in $$props) $$invalidate(0, tabletIndex = $$props.tabletIndex);
    		if ('weaveRow' in $$props) $$invalidate(1, weaveRow = $$props.weaveRow);
    		if ('weave' in $$props) $$invalidate(2, weave = $$props.weave);
    		if ('classNames' in $$props) $$invalidate(3, classNames = $$props.classNames);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabletIndex, weaveRow, weave, classNames, $appConfig];
    }

    class PreviewThreadWeave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {
    			tabletIndex: 0,
    			weaveRow: 1,
    			weave: 2,
    			classNames: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviewThreadWeave",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*tabletIndex*/ ctx[0] === undefined && !('tabletIndex' in props)) {
    			console.warn("<PreviewThreadWeave> was created without expected prop 'tabletIndex'");
    		}

    		if (/*weaveRow*/ ctx[1] === undefined && !('weaveRow' in props)) {
    			console.warn("<PreviewThreadWeave> was created without expected prop 'weaveRow'");
    		}

    		if (/*weave*/ ctx[2] === undefined && !('weave' in props)) {
    			console.warn("<PreviewThreadWeave> was created without expected prop 'weave'");
    		}
    	}

    	get tabletIndex() {
    		throw new Error("<PreviewThreadWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabletIndex(value) {
    		throw new Error("<PreviewThreadWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weaveRow() {
    		throw new Error("<PreviewThreadWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weaveRow(value) {
    		throw new Error("<PreviewThreadWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get weave() {
    		throw new Error("<PreviewThreadWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weave(value) {
    		throw new Error("<PreviewThreadWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classNames() {
    		throw new Error("<PreviewThreadWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classNames(value) {
    		throw new Error("<PreviewThreadWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PreviewTabletWeave.svelte generated by Svelte v3.44.3 */
    const file$3 = "src/components/PreviewTabletWeave.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (10:1) {#each weaves as weave, index (index)}
    function create_each_block$1(key_1, ctx) {
    	let first;
    	let previewthreadweave;
    	let current;

    	previewthreadweave = new PreviewThreadWeave({
    			props: {
    				weave: /*weave*/ ctx[4],
    				tabletIndex: /*tabletIndex*/ ctx[1],
    				weaveRow: /*index*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(previewthreadweave.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(previewthreadweave, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const previewthreadweave_changes = {};
    			if (dirty & /*weaves*/ 1) previewthreadweave_changes.weave = /*weave*/ ctx[4];
    			if (dirty & /*tabletIndex*/ 2) previewthreadweave_changes.tabletIndex = /*tabletIndex*/ ctx[1];
    			if (dirty & /*weaves*/ 1) previewthreadweave_changes.weaveRow = /*index*/ ctx[6];
    			previewthreadweave.$set(previewthreadweave_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previewthreadweave.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previewthreadweave.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(previewthreadweave, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(10:1) {#each weaves as weave, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t;
    	let previewthreadweave;
    	let div_class_value;
    	let current;
    	let each_value = /*weaves*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*index*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	previewthreadweave = new PreviewThreadWeave({
    			props: {
    				tabletIndex: /*tabletIndex*/ ctx[1],
    				weaveRow: /*weaves*/ ctx[0].length,
    				weave: /*finalWeave*/ ctx[3],
    				classNames: "final"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			create_component(previewthreadweave.$$.fragment);
    			attr_dev(div, "class", div_class_value = "tablet weaveSize" + /*$appConfig*/ ctx[2].weaveSize + " svelte-3hv309");
    			add_location(div, file$3, 8, 0, 273);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    			mount_component(previewthreadweave, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*weaves, tabletIndex*/ 3) {
    				each_value = /*weaves*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, t, get_each_context$1);
    				check_outros();
    			}

    			const previewthreadweave_changes = {};
    			if (dirty & /*tabletIndex*/ 2) previewthreadweave_changes.tabletIndex = /*tabletIndex*/ ctx[1];
    			if (dirty & /*weaves*/ 1) previewthreadweave_changes.weaveRow = /*weaves*/ ctx[0].length;
    			previewthreadweave.$set(previewthreadweave_changes);

    			if (!current || dirty & /*$appConfig*/ 4 && div_class_value !== (div_class_value = "tablet weaveSize" + /*$appConfig*/ ctx[2].weaveSize + " svelte-3hv309")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(previewthreadweave.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(previewthreadweave.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			destroy_component(previewthreadweave);
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
    	let $appConfig;
    	validate_store(appConfig, 'appConfig');
    	component_subscribe($$self, appConfig, $$value => $$invalidate(2, $appConfig = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PreviewTabletWeave', slots, []);
    	let { weaves } = $$props;
    	let { tabletIndex } = $$props;
    	const finalWeave = new Weave('#ffffff', true);
    	const writable_props = ['weaves', 'tabletIndex'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PreviewTabletWeave> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('weaves' in $$props) $$invalidate(0, weaves = $$props.weaves);
    		if ('tabletIndex' in $$props) $$invalidate(1, tabletIndex = $$props.tabletIndex);
    	};

    	$$self.$capture_state = () => ({
    		appConfig,
    		Weave,
    		PreviewThreadWeave,
    		weaves,
    		tabletIndex,
    		finalWeave,
    		$appConfig
    	});

    	$$self.$inject_state = $$props => {
    		if ('weaves' in $$props) $$invalidate(0, weaves = $$props.weaves);
    		if ('tabletIndex' in $$props) $$invalidate(1, tabletIndex = $$props.tabletIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [weaves, tabletIndex, $appConfig, finalWeave];
    }

    class PreviewTabletWeave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { weaves: 0, tabletIndex: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviewTabletWeave",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*weaves*/ ctx[0] === undefined && !('weaves' in props)) {
    			console.warn("<PreviewTabletWeave> was created without expected prop 'weaves'");
    		}

    		if (/*tabletIndex*/ ctx[1] === undefined && !('tabletIndex' in props)) {
    			console.warn("<PreviewTabletWeave> was created without expected prop 'tabletIndex'");
    		}
    	}

    	get weaves() {
    		throw new Error("<PreviewTabletWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weaves(value) {
    		throw new Error("<PreviewTabletWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tabletIndex() {
    		throw new Error("<PreviewTabletWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabletIndex(value) {
    		throw new Error("<PreviewTabletWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/PreviewWeave.svelte generated by Svelte v3.44.3 */
    const file$2 = "src/components/PreviewWeave.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[5] = i;
    	return child_ctx;
    }

    // (9:5) {#each [...Array($weaveRows).keys()] as _, index (index)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let t0_value = /*index*/ ctx[5] + 1 + "";
    	let t0;
    	let t1;
    	let div_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", div_class_value = "tabletWeaveIndex " + (/*index*/ ctx[5] % 2 ? 'even' : 'odd') + " svelte-1f0zce2");
    			add_location(div, file$2, 9, 6, 403);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$weaveRows*/ 4 && t0_value !== (t0_value = /*index*/ ctx[5] + 1 + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*$weaveRows*/ 4 && div_class_value !== (div_class_value = "tabletWeaveIndex " + (/*index*/ ctx[5] % 2 ? 'even' : 'odd') + " svelte-1f0zce2")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(9:5) {#each [...Array($weaveRows).keys()] as _, index (index)}",
    		ctx
    	});

    	return block;
    }

    // (16:1) {#each weavePattern as tablet, index (index)}
    function create_each_block(key_1, ctx) {
    	let first;
    	let previewtabletweave;
    	let current;

    	previewtabletweave = new PreviewTabletWeave({
    			props: {
    				weaves: /*tablet*/ ctx[3],
    				tabletIndex: /*index*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			first = empty();
    			create_component(previewtabletweave.$$.fragment);
    			this.first = first;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, first, anchor);
    			mount_component(previewtabletweave, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const previewtabletweave_changes = {};
    			if (dirty & /*weavePattern*/ 1) previewtabletweave_changes.weaves = /*tablet*/ ctx[3];
    			if (dirty & /*weavePattern*/ 1) previewtabletweave_changes.tabletIndex = /*index*/ ctx[5];
    			previewtabletweave.$set(previewtabletweave_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previewtabletweave.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previewtabletweave.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(first);
    			destroy_component(previewtabletweave, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(16:1) {#each weavePattern as tablet, index (index)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div1;
    	let div0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let div0_class_value;
    	let t;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let current;
    	let each_value_1 = [...Array(/*$weaveRows*/ ctx[2]).keys()];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*index*/ ctx[5];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*weavePattern*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key_1 = ctx => /*index*/ ctx[5];
    	validate_each_keys(ctx, each_value, get_each_context, get_key_1);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", div0_class_value = "tabletWeaveIndices weaveSize" + /*$appConfig*/ ctx[1].weaveSize + " uk-text-small" + " svelte-1f0zce2");
    			add_location(div0, file$2, 7, 1, 255);
    			attr_dev(div1, "class", "uk-flex uk-flex-center");
    			add_location(div1, file$2, 6, 0, 217);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div1, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*Array, $weaveRows*/ 4) {
    				each_value_1 = [...Array(/*$weaveRows*/ ctx[2]).keys()];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div0, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (!current || dirty & /*$appConfig*/ 2 && div0_class_value !== (div0_class_value = "tabletWeaveIndices weaveSize" + /*$appConfig*/ ctx[1].weaveSize + " uk-text-small" + " svelte-1f0zce2")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*weavePattern*/ 1) {
    				each_value = /*weavePattern*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value, each1_lookup, div1, outro_and_destroy_block, create_each_block, null, get_each_context);
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
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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
    	let $appConfig;
    	let $weaveRows;
    	validate_store(appConfig, 'appConfig');
    	component_subscribe($$self, appConfig, $$value => $$invalidate(1, $appConfig = $$value));
    	validate_store(weaveRows, 'weaveRows');
    	component_subscribe($$self, weaveRows, $$value => $$invalidate(2, $weaveRows = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PreviewWeave', slots, []);
    	let { weavePattern } = $$props;
    	const writable_props = ['weavePattern'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PreviewWeave> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('weavePattern' in $$props) $$invalidate(0, weavePattern = $$props.weavePattern);
    	};

    	$$self.$capture_state = () => ({
    		appConfig,
    		weaveRows,
    		PreviewTabletWeave,
    		weavePattern,
    		$appConfig,
    		$weaveRows
    	});

    	$$self.$inject_state = $$props => {
    		if ('weavePattern' in $$props) $$invalidate(0, weavePattern = $$props.weavePattern);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [weavePattern, $appConfig, $weaveRows];
    }

    class PreviewWeave extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { weavePattern: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PreviewWeave",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*weavePattern*/ ctx[0] === undefined && !('weavePattern' in props)) {
    			console.warn("<PreviewWeave> was created without expected prop 'weavePattern'");
    		}
    	}

    	get weavePattern() {
    		throw new Error("<PreviewWeave>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set weavePattern(value) {
    		throw new Error("<PreviewWeave>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Preview.svelte generated by Svelte v3.44.3 */
    const file$1 = "src/components/Preview.svelte";

    function create_fragment$1(ctx) {
    	let div17;
    	let div16;
    	let div5;
    	let div0;
    	let ul0;
    	let li0;
    	let button0;
    	let button0_uk_tooltip_value;
    	let li0_hidden_value;
    	let t0;
    	let div1;
    	let h30;
    	let t1_value = /*$_*/ ctx[2]('preview.patternDevelopment.title') + "";
    	let t1;
    	let t2;
    	let button1;
    	let span0;
    	let button1_uk_tooltip_value;
    	let t3;
    	let div2;
    	let h31;
    	let t4_value = /*$_*/ ctx[2]('preview.front.title') + "";
    	let t4;
    	let t5;
    	let div3;
    	let h32;
    	let t6_value = /*$_*/ ctx[2]('preview.back.title') + "";
    	let t6;
    	let t7;
    	let button2;
    	let span1;
    	let button2_uk_tooltip_value;
    	let t8;
    	let div4;
    	let ul1;
    	let li1;
    	let button3;
    	let button3_uk_tooltip_value;
    	let li1_hidden_value;
    	let t9;
    	let div11;
    	let div6;
    	let t10;
    	let div7;
    	let previewinstructions;
    	let t11;
    	let div8;
    	let previewweave0;
    	let t12;
    	let div9;
    	let previewweave1;
    	let t13;
    	let div10;
    	let t14;
    	let div15;
    	let div12;
    	let t15;
    	let div13;
    	let button4;
    	let button4_uk_tooltip_value;
    	let t16;
    	let button5;
    	let button5_uk_tooltip_value;
    	let t17;
    	let div14;
    	let current;
    	let mounted;
    	let dispose;
    	previewinstructions = new PreviewInstructions({ $$inline: true });

    	previewweave0 = new PreviewWeave({
    			props: { weavePattern: /*$weavesFront*/ ctx[3] },
    			$$inline: true
    		});

    	previewweave1 = new PreviewWeave({
    			props: { weavePattern: /*$weavesBack*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div17 = element("div");
    			div16 = element("div");
    			div5 = element("div");
    			div0 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			button0 = element("button");
    			t0 = space();
    			div1 = element("div");
    			h30 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			button1 = element("button");
    			span0 = element("span");
    			t3 = space();
    			div2 = element("div");
    			h31 = element("h3");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			h32 = element("h3");
    			t6 = text(t6_value);
    			t7 = space();
    			button2 = element("button");
    			span1 = element("span");
    			t8 = space();
    			div4 = element("div");
    			ul1 = element("ul");
    			li1 = element("li");
    			button3 = element("button");
    			t9 = space();
    			div11 = element("div");
    			div6 = element("div");
    			t10 = space();
    			div7 = element("div");
    			create_component(previewinstructions.$$.fragment);
    			t11 = space();
    			div8 = element("div");
    			create_component(previewweave0.$$.fragment);
    			t12 = space();
    			div9 = element("div");
    			create_component(previewweave1.$$.fragment);
    			t13 = space();
    			div10 = element("div");
    			t14 = space();
    			div15 = element("div");
    			div12 = element("div");
    			t15 = space();
    			div13 = element("div");
    			button4 = element("button");
    			t16 = space();
    			button5 = element("button");
    			t17 = space();
    			div14 = element("div");
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "uk-icon", "icon: thumbnails");
    			attr_dev(button0, "uk-tooltip", button0_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.show'));
    			attr_dev(button0, "class", "svelte-1pw4u05");
    			add_location(button0, file$1, 25, 9, 889);
    			li0.hidden = li0_hidden_value = !/*hiddenInstructions*/ ctx[0];
    			add_location(li0, file$1, 24, 8, 846);
    			attr_dev(ul0, "class", "uk-iconnav uk-iconnav-vertical");
    			add_location(ul0, file$1, 23, 4, 794);
    			attr_dev(div0, "class", "uk-flex-none");
    			add_location(div0, file$1, 22, 3, 763);
    			attr_dev(span0, "class", "uk-margin-small-right");
    			attr_dev(span0, "uk-icon", "shrink");
    			add_location(span0, file$1, 38, 52, 1433);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "uk-button uk-button-link svelte-1pw4u05");
    			attr_dev(button1, "uk-tooltip", button1_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.hide'));
    			add_location(button1, file$1, 35, 8, 1256);
    			add_location(h30, file$1, 33, 7, 1193);
    			attr_dev(div1, "class", "uk-first-column uk-text-center");
    			div1.hidden = /*hiddenInstructions*/ ctx[0];
    			add_location(div1, file$1, 32, 6, 1113);
    			add_location(h31, file$1, 42, 7, 1594);
    			attr_dev(div2, "class", "uk-text-center uk-margin-small-bottom");
    			add_location(div2, file$1, 41, 6, 1535);
    			attr_dev(span1, "class", "uk-margin-small-right");
    			attr_dev(span1, "uk-icon", "shrink");
    			add_location(span1, file$1, 50, 49, 1920);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "uk-button uk-button-link svelte-1pw4u05");
    			attr_dev(button2, "uk-tooltip", button2_uk_tooltip_value = /*$_*/ ctx[2]('preview.back.hide'));
    			add_location(button2, file$1, 47, 8, 1759);
    			add_location(h32, file$1, 45, 7, 1711);
    			attr_dev(div3, "class", "uk-text-center");
    			div3.hidden = /*hiddenWeaveBack*/ ctx[1];
    			add_location(div3, file$1, 44, 6, 1650);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "uk-icon", "icon: grid");
    			attr_dev(button3, "uk-tooltip", button3_uk_tooltip_value = /*$_*/ ctx[2]('preview.back.show'));
    			attr_dev(button3, "class", "svelte-1pw4u05");
    			add_location(button3, file$1, 56, 9, 2142);
    			li1.hidden = li1_hidden_value = !/*hiddenWeaveBack*/ ctx[1];
    			add_location(li1, file$1, 55, 8, 2102);
    			attr_dev(ul1, "class", "uk-iconnav uk-iconnav-vertical");
    			add_location(ul1, file$1, 54, 4, 2050);
    			attr_dev(div4, "class", "uk-flex-none");
    			add_location(div4, file$1, 53, 3, 2019);
    			attr_dev(div5, "class", "uk-flex uk-flex-between uk-flex-top");
    			add_location(div5, file$1, 21, 2, 710);
    			attr_dev(div6, "class", "uk-flex-none");
    			add_location(div6, file$1, 67, 6, 2440);
    			attr_dev(div7, "class", "scrollable svelte-1pw4u05");
    			div7.hidden = /*hiddenInstructions*/ ctx[0];
    			add_location(div7, file$1, 68, 6, 2479);
    			attr_dev(div8, "class", "uk-margin-medium-top scrollable svelte-1pw4u05");
    			add_location(div8, file$1, 71, 6, 2579);
    			attr_dev(div9, "class", "uk-margin-medium-top scrollable svelte-1pw4u05");
    			div9.hidden = /*hiddenWeaveBack*/ ctx[1];
    			add_location(div9, file$1, 74, 6, 2698);
    			attr_dev(div10, "class", "uk-flex-none");
    			add_location(div10, file$1, 77, 6, 2838);
    			attr_dev(div11, "class", "uk-flex uk-flex-between uk-flex-top");
    			add_location(div11, file$1, 66, 5, 2384);
    			attr_dev(div12, "class", "uk-first-column");
    			add_location(div12, file$1, 82, 6, 2968);
    			attr_dev(button4, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom svelte-1pw4u05");
    			attr_dev(button4, "uk-icon", "plus");
    			attr_dev(button4, "uk-tooltip", button4_uk_tooltip_value = /*$_*/ ctx[2]('preview.rows.add'));
    			add_location(button4, file$1, 84, 7, 3066);
    			attr_dev(button5, "class", "uk-icon-button uk-button-secondary uk-button-large uk-width-small uk-margin-small-bottom svelte-1pw4u05");
    			attr_dev(button5, "uk-icon", "minus");
    			attr_dev(button5, "uk-tooltip", button5_uk_tooltip_value = /*$_*/ ctx[2]('preview.rows.remove'));
    			add_location(button5, file$1, 87, 7, 3294);
    			attr_dev(div13, "class", "uk-margin-small-top uk-text-center");
    			add_location(div13, file$1, 83, 6, 3010);
    			add_location(div14, file$1, 91, 6, 3541);
    			attr_dev(div15, "class", "uk-flex uk-flex-around uk-flex-top");
    			add_location(div15, file$1, 81, 5, 2913);
    			attr_dev(div16, "class", "uk-container uk-container-small uk-container-expand");
    			add_location(div16, file$1, 18, 1, 618);
    			attr_dev(div17, "class", "uk-section uk-section-xsmall preview svelte-1pw4u05");
    			add_location(div17, file$1, 17, 0, 566);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div17, anchor);
    			append_dev(div17, div16);
    			append_dev(div16, div5);
    			append_dev(div5, div0);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, button0);
    			append_dev(div5, t0);
    			append_dev(div5, div1);
    			append_dev(div1, h30);
    			append_dev(h30, t1);
    			append_dev(h30, t2);
    			append_dev(h30, button1);
    			append_dev(button1, span0);
    			append_dev(div5, t3);
    			append_dev(div5, div2);
    			append_dev(div2, h31);
    			append_dev(h31, t4);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, h32);
    			append_dev(h32, t6);
    			append_dev(h32, t7);
    			append_dev(h32, button2);
    			append_dev(button2, span1);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, ul1);
    			append_dev(ul1, li1);
    			append_dev(li1, button3);
    			append_dev(div16, t9);
    			append_dev(div16, div11);
    			append_dev(div11, div6);
    			append_dev(div11, t10);
    			append_dev(div11, div7);
    			mount_component(previewinstructions, div7, null);
    			append_dev(div11, t11);
    			append_dev(div11, div8);
    			mount_component(previewweave0, div8, null);
    			append_dev(div11, t12);
    			append_dev(div11, div9);
    			mount_component(previewweave1, div9, null);
    			append_dev(div11, t13);
    			append_dev(div11, div10);
    			append_dev(div16, t14);
    			append_dev(div16, div15);
    			append_dev(div15, div12);
    			append_dev(div15, t15);
    			append_dev(div15, div13);
    			append_dev(div13, button4);
    			append_dev(div13, t16);
    			append_dev(div13, button5);
    			append_dev(div15, t17);
    			append_dev(div15, div14);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[9], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[10], false, false, false),
    					listen_dev(button4, "click", prevent_default(/*addWeaveRow*/ ctx[5]), false, true, false),
    					listen_dev(button5, "click", prevent_default(/*removeWeaveRow*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$_*/ 4 && button0_uk_tooltip_value !== (button0_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.show'))) {
    				attr_dev(button0, "uk-tooltip", button0_uk_tooltip_value);
    			}

    			if (!current || dirty & /*hiddenInstructions*/ 1 && li0_hidden_value !== (li0_hidden_value = !/*hiddenInstructions*/ ctx[0])) {
    				prop_dev(li0, "hidden", li0_hidden_value);
    			}

    			if ((!current || dirty & /*$_*/ 4) && t1_value !== (t1_value = /*$_*/ ctx[2]('preview.patternDevelopment.title') + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*$_*/ 4 && button1_uk_tooltip_value !== (button1_uk_tooltip_value = /*$_*/ ctx[2]('preview.patternDevelopment.hide'))) {
    				attr_dev(button1, "uk-tooltip", button1_uk_tooltip_value);
    			}

    			if (!current || dirty & /*hiddenInstructions*/ 1) {
    				prop_dev(div1, "hidden", /*hiddenInstructions*/ ctx[0]);
    			}

    			if ((!current || dirty & /*$_*/ 4) && t4_value !== (t4_value = /*$_*/ ctx[2]('preview.front.title') + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*$_*/ 4) && t6_value !== (t6_value = /*$_*/ ctx[2]('preview.back.title') + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*$_*/ 4 && button2_uk_tooltip_value !== (button2_uk_tooltip_value = /*$_*/ ctx[2]('preview.back.hide'))) {
    				attr_dev(button2, "uk-tooltip", button2_uk_tooltip_value);
    			}

    			if (!current || dirty & /*hiddenWeaveBack*/ 2) {
    				prop_dev(div3, "hidden", /*hiddenWeaveBack*/ ctx[1]);
    			}

    			if (!current || dirty & /*$_*/ 4 && button3_uk_tooltip_value !== (button3_uk_tooltip_value = /*$_*/ ctx[2]('preview.back.show'))) {
    				attr_dev(button3, "uk-tooltip", button3_uk_tooltip_value);
    			}

    			if (!current || dirty & /*hiddenWeaveBack*/ 2 && li1_hidden_value !== (li1_hidden_value = !/*hiddenWeaveBack*/ ctx[1])) {
    				prop_dev(li1, "hidden", li1_hidden_value);
    			}

    			if (!current || dirty & /*hiddenInstructions*/ 1) {
    				prop_dev(div7, "hidden", /*hiddenInstructions*/ ctx[0]);
    			}

    			const previewweave0_changes = {};
    			if (dirty & /*$weavesFront*/ 8) previewweave0_changes.weavePattern = /*$weavesFront*/ ctx[3];
    			previewweave0.$set(previewweave0_changes);
    			const previewweave1_changes = {};
    			if (dirty & /*$weavesBack*/ 16) previewweave1_changes.weavePattern = /*$weavesBack*/ ctx[4];
    			previewweave1.$set(previewweave1_changes);

    			if (!current || dirty & /*hiddenWeaveBack*/ 2) {
    				prop_dev(div9, "hidden", /*hiddenWeaveBack*/ ctx[1]);
    			}

    			if (!current || dirty & /*$_*/ 4 && button4_uk_tooltip_value !== (button4_uk_tooltip_value = /*$_*/ ctx[2]('preview.rows.add'))) {
    				attr_dev(button4, "uk-tooltip", button4_uk_tooltip_value);
    			}

    			if (!current || dirty & /*$_*/ 4 && button5_uk_tooltip_value !== (button5_uk_tooltip_value = /*$_*/ ctx[2]('preview.rows.remove'))) {
    				attr_dev(button5, "uk-tooltip", button5_uk_tooltip_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(previewinstructions.$$.fragment, local);
    			transition_in(previewweave0.$$.fragment, local);
    			transition_in(previewweave1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(previewinstructions.$$.fragment, local);
    			transition_out(previewweave0.$$.fragment, local);
    			transition_out(previewweave1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div17);
    			destroy_component(previewinstructions);
    			destroy_component(previewweave0);
    			destroy_component(previewweave1);
    			mounted = false;
    			run_all(dispose);
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
    	let $weaveRows;
    	let $_;
    	let $weavesFront;
    	let $weavesBack;
    	validate_store(weaveRows, 'weaveRows');
    	component_subscribe($$self, weaveRows, $$value => $$invalidate(11, $weaveRows = $$value));
    	validate_store(X, '_');
    	component_subscribe($$self, X, $$value => $$invalidate(2, $_ = $$value));
    	validate_store(weavesFront, 'weavesFront');
    	component_subscribe($$self, weavesFront, $$value => $$invalidate(3, $weavesFront = $$value));
    	validate_store(weavesBack, 'weavesBack');
    	component_subscribe($$self, weavesBack, $$value => $$invalidate(4, $weavesBack = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Preview', slots, []);
    	let hiddenInstructions = false;
    	let hiddenWeaveBack = false;

    	const addWeaveRow = () => {
    		set_store_value(weaveRows, $weaveRows = $weaveRows + 1, $weaveRows);
    		scrollToBottom();
    	};

    	const removeWeaveRow = () => {
    		set_store_value(weaveRows, $weaveRows = $weaveRows - 1, $weaveRows);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Preview> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(0, hiddenInstructions = false);
    	const click_handler_1 = () => $$invalidate(0, hiddenInstructions = true);
    	const click_handler_2 = () => $$invalidate(1, hiddenWeaveBack = true);
    	const click_handler_3 = () => $$invalidate(1, hiddenWeaveBack = false);

    	$$self.$capture_state = () => ({
    		animateScroll,
    		_: X,
    		weaveRows,
    		weavesFront,
    		weavesBack,
    		PreviewInstructions,
    		PreviewWeave,
    		hiddenInstructions,
    		hiddenWeaveBack,
    		addWeaveRow,
    		removeWeaveRow,
    		$weaveRows,
    		$_,
    		$weavesFront,
    		$weavesBack
    	});

    	$$self.$inject_state = $$props => {
    		if ('hiddenInstructions' in $$props) $$invalidate(0, hiddenInstructions = $$props.hiddenInstructions);
    		if ('hiddenWeaveBack' in $$props) $$invalidate(1, hiddenWeaveBack = $$props.hiddenWeaveBack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		hiddenInstructions,
    		hiddenWeaveBack,
    		$_,
    		$weavesFront,
    		$weavesBack,
    		addWeaveRow,
    		removeWeaveRow,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3
    	];
    }

    class Preview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Preview",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.44.3 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let navbar;
    	let t0;
    	let chart;
    	let t1;
    	let preview;
    	let current;
    	navbar = new NavBar({ $$inline: true });
    	chart = new Chart({ $$inline: true });
    	preview = new Preview({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			create_component(chart.$$.fragment);
    			t1 = space();
    			create_component(preview.$$.fragment);
    			add_location(main, file, 19, 0, 575);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(navbar, main, null);
    			append_dev(main, t0);
    			mount_component(chart, main, null);
    			append_dev(main, t1);
    			mount_component(preview, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(chart.$$.fragment, local);
    			transition_in(preview.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(chart.$$.fragment, local);
    			transition_out(preview.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(navbar);
    			destroy_component(chart);
    			destroy_component(preview);
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	onMount(() => {
    		initStores();
    	});

    	m('en', en);
    	m('de', de);

    	$({
    		fallbackLocale: 'de',
    		initialLocale: F('lang')
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		addMessages: m,
    		getLocaleFromQueryString: F,
    		init: $,
    		en,
    		de,
    		initStores,
    		NavBar,
    		Chart,
    		Preview
    	});

    	return [];
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
