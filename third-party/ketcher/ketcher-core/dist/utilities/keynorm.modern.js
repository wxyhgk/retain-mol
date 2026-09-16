/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import _typeof from '@babel/runtime/helpers/typeof';
import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';

var isMac = typeof navigator !== 'undefined' ? /Mac/.test(navigator.platform) : false;
var KeyboardModifiers = {
  Alt: 'Alt',
  Control: 'Control',
  Ctrl: 'Ctrl',
  Meta: 'Meta',
  Shift: 'Shift'
};
var KeyCodePrefixes = {
  Key: 'Key',
  Digit: 'Digit'
};
var CanonicalModifiersOrder = [KeyboardModifiers.Ctrl, KeyboardModifiers.Alt, KeyboardModifiers.Shift, KeyboardModifiers.Meta];
var ModifiersRegex = {
  Mod: /^mod$/i,
  Meta: /^(meta|cmd|m)$/i,
  Ctrl: /^(ctrl|control|c)$/i,
  Alt: /^(alt|a)$/i,
  Shift: /^(shift|s)$/i
};
var normalizeCode = function normalizeCode(code) {
  if (code.startsWith(KeyCodePrefixes.Key)) {
    return code.slice(3);
  }
  if (code.startsWith(KeyCodePrefixes.Digit)) {
    return code.slice(5);
  }
  return code;
};
var normalizeShortcut = function normalizeShortcut(input) {
  var activeModifiers = new Set();
  var key;
  if (typeof input === 'string') {
    var _tokens$pop;
    var tokens = input.split(/\+(?!$)/).map(function (p) {
      return p.trim();
    });
    key = (_tokens$pop = tokens.pop()) !== null && _tokens$pop !== void 0 ? _tokens$pop : '';
    if (key.length === 1) {
      key = key.toUpperCase();
    }
    if (tokens.some(function (mod) {
      return ModifiersRegex.Mod.test(mod);
    })) {
      activeModifiers.add(isMac ? KeyboardModifiers.Meta : KeyboardModifiers.Ctrl);
    }
    if (tokens.some(function (mod) {
      return ModifiersRegex.Meta.test(mod);
    })) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (tokens.some(function (mod) {
      return ModifiersRegex.Ctrl.test(mod);
    })) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (tokens.some(function (mod) {
      return ModifiersRegex.Alt.test(mod);
    })) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (tokens.some(function (mod) {
      return ModifiersRegex.Shift.test(mod);
    })) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }
  } else if (input instanceof KeyboardEvent) {
    var e = input;
    if (e.code.includes(KeyboardModifiers.Control)) {
      return KeyboardModifiers.Ctrl;
    }
    if (e.code.includes(KeyboardModifiers.Alt)) {
      return KeyboardModifiers.Alt;
    }
    if (e.code.includes(KeyboardModifiers.Meta)) {
      return KeyboardModifiers.Meta;
    }
    if (e.code.includes(KeyboardModifiers.Shift)) {
      return KeyboardModifiers.Shift;
    }
    if (e.ctrlKey) {
      activeModifiers.add(KeyboardModifiers.Ctrl);
    }
    if (e.altKey) {
      activeModifiers.add(KeyboardModifiers.Alt);
    }
    if (e.metaKey) {
      activeModifiers.add(KeyboardModifiers.Meta);
    }
    if (e.shiftKey) {
      activeModifiers.add(KeyboardModifiers.Shift);
    }
    key = normalizeCode(e.code);
  } else {
    throw new Error('normalizeShortcut expects string or KeyboardEvent');
  }
  var appliedModifiersInOrder = CanonicalModifiersOrder.filter(function (modifier) {
    return activeModifiers.has(modifier);
  });
  return [].concat(_toConsumableArray(appliedModifiersInOrder), [key]).join('+');
};
var normalizeKeyMap = function normalizeKeyMap(map) {
  var copy = Object.create(null);
  Object.keys(map).forEach(function (prop) {
    copy[normalizeShortcut(prop)] = map[prop];
  });
  return copy;
};
var isControlKey = function isControlKey(event) {
  return isMac ? event.metaKey : event.ctrlKey;
};
function keyNormBase(obj) {
  if (obj instanceof KeyboardEvent) {
    return normalizeShortcut(obj);
  }
  return _typeof(obj) === 'object' ? normalizeKeyMap(obj) : normalizeShortcut(obj);
}
var setHotKey = function setHotKey(key, actName, hotKeys) {
  var existing = hotKeys[key];
  if (Array.isArray(existing)) {
    existing.push(actName);
  } else {
    hotKeys[key] = [actName];
  }
};
var initHotKeys = function initHotKeys(actions) {
  var hotKeys = {};
  Object.keys(actions).forEach(function (actName) {
    var act = actions[actName];
    if (!act.shortcut) return;
    if (Array.isArray(act.shortcut)) {
      act.shortcut.forEach(function (key) {
        setHotKey(key, actName, hotKeys);
      });
    } else {
      setHotKey(act.shortcut, actName, hotKeys);
    }
  });
  return keyNormBase(hotKeys);
};
var keyNorm = Object.assign(keyNormBase, {
  lookup: function lookup(map, event) {
    return map[normalizeShortcut(event)];
  }
});

export { CanonicalModifiersOrder, KeyCodePrefixes, KeyboardModifiers, ModifiersRegex, initHotKeys, isControlKey, keyNorm };
//# sourceMappingURL=keynorm.modern.js.map
