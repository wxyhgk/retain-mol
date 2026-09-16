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
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var BondAdd = require('./BondAdd.js');
var BondDelete = require('./BondDelete.js');
var BondAttr = require('./BondAttr.js');
var BondMove = require('./BondMove.js');

BondAdd.BondAdd.InverseConstructor = BondDelete.BondDelete;
BondDelete.BondDelete.InverseConstructor = BondAdd.BondAdd;

exports.BondAdd = BondAdd.BondAdd;
exports.BondDelete = BondDelete.BondDelete;
exports.BondAttr = BondAttr.BondAttr;
exports.BondMove = BondMove.BondMove;
//# sourceMappingURL=index.js.map
