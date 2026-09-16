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
import func2Module from 'ajv/dist/runtime/ucs2length';

var compiledSchema = validate10;
var _default = validate10;
var schema12 = {
  "type": "object",
  "required": ["type", "data"],
  "properties": {
    "type": {
      "const": "simpleObject"
    },
    "data": {
      "type": "object",
      "required": ["mode"],
      "properties": {
        "mode": {
          "type": "string",
          "enum": ["line", "rectangle", "circle", "ellipse", "polyline"]
        }
      },
      "if": {
        "properties": {
          "mode": {
            "const": "polyline"
          }
        }
      },
      "then": {
        "required": ["pos"],
        "properties": {
          "pos": {
            "type": "array",
            "minItems": 2,
            "items": {
              "type": "object",
              "required": ["x", "y"],
              "properties": {
                "x": {
                  "type": "number"
                },
                "y": {
                  "type": "number"
                },
                "z": {
                  "type": "number"
                }
              }
            }
          }
        }
      },
      "else": {
        "required": ["pos"],
        "properties": {
          "pos": {
            "type": "array",
            "minItems": 2,
            "maxItems": 2,
            "items": {
              "type": "object",
              "required": ["x", "y"],
              "properties": {
                "x": {
                  "type": "number"
                },
                "y": {
                  "type": "number"
                },
                "z": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    },
    "selected": {
      "type": "boolean"
    }
  }
};
var pattern0 = new RegExp("^rg[1-9]\\d*", "u");
var pattern1 = new RegExp("^mol\\d+", "u");
var pattern2 = new RegExp("^header$", "u");
var pattern6 = new RegExp("^image/(png|svg\\+xml)$", "u");
var pattern7 = new RegExp("^(mol\\d+|rg[1-9]\\d*)", "u");
var schema13 = {
  "type": "object",
  "required": ["type"],
  "properties": {
    "type": {
      "const": "text"
    },
    "selected": {
      "type": "boolean"
    }
  },
  "oneOf": [{
    "required": ["data"],
    "properties": {
      "data": {
        "type": "object",
        "required": ["content"],
        "properties": {
          "content": {
            "type": "string"
          },
          "position": {
            "type": "object",
            "properties": {
              "x": {
                "type": "number"
              },
              "y": {
                "type": "number"
              },
              "z": {
                "type": "number"
              }
            }
          },
          "pos": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "x": {
                  "type": "number"
                },
                "y": {
                  "type": "number"
                },
                "z": {
                  "type": "number"
                }
              }
            }
          }
        }
      }
    }
  }, {
    "required": ["boundingBox", "paragraphs"],
    "properties": {
      "boundingBox": {
        "type": "object",
        "required": ["x", "y", "width", "height"],
        "properties": {
          "x": {
            "type": "number"
          },
          "y": {
            "type": "number"
          },
          "z": {
            "type": "number"
          },
          "width": {
            "type": "number",
            "minimum": 0
          },
          "height": {
            "type": "number",
            "minimum": 0
          }
        }
      },
      "paragraphs": {
        "type": "array",
        "items": {
          "$ref": "#/definitions/textParagraph"
        }
      },
      "alignment": {
        "type": "string",
        "enum": ["left", "center", "right"]
      },
      "indent": {
        "$ref": "#/definitions/textIndent"
      },
      "font": {
        "$ref": "#/definitions/textFont"
      },
      "color": {
        "type": "string"
      },
      "bold": {
        "type": "boolean"
      },
      "italic": {
        "type": "boolean"
      },
      "subscript": {
        "type": "boolean"
      },
      "superscript": {
        "type": "boolean"
      }
    }
  }]
};
var schema14 = {
  "type": "object",
  "required": ["parts"],
  "properties": {
    "alignment": {
      "type": "string",
      "enum": ["left", "center", "right"]
    },
    "indent": {
      "$ref": "#/definitions/textIndent"
    },
    "font": {
      "$ref": "#/definitions/textFont"
    },
    "color": {
      "type": "string"
    },
    "bold": {
      "type": "boolean"
    },
    "italic": {
      "type": "boolean"
    },
    "subscript": {
      "type": "boolean"
    },
    "superscript": {
      "type": "boolean"
    },
    "parts": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/textPart"
      }
    }
  }
};
var pattern3 = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", "u");
function validate13(data) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref$instancePath = _ref.instancePath,
    instancePath = _ref$instancePath === void 0 ? "" : _ref$instancePath;
    _ref.parentData;
    _ref.parentDataProperty;
    _ref.rootData;
  var vErrors = null;
  var errors = 0;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.text === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "text"
        },
        message: "must have required property '" + "text" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.text !== undefined) {
      if (typeof data.text !== "string") {
        var err1 = {
          instancePath: instancePath + "/text",
          schemaPath: "#/properties/text/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.font !== undefined) {
      var data1 = data.font;
      if (data1 && _typeof(data1) == "object" && !Array.isArray(data1)) {
        if (data1.family !== undefined) {
          if (typeof data1.family !== "string") {
            var err2 = {
              instancePath: instancePath + "/font/family",
              schemaPath: "#/definitions/textFont/properties/family/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
        if (data1.size !== undefined) {
          var data3 = data1.size;
          if (!(typeof data3 == "number" && !(data3 % 1) && !isNaN(data3))) {
            var err3 = {
              instancePath: instancePath + "/font/size",
              schemaPath: "#/definitions/textFont/properties/size/type",
              keyword: "type",
              params: {
                type: "integer"
              },
              message: "must be integer"
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
        }
        if (data1.color !== undefined) {
          var data4 = data1.color;
          if (typeof data4 === "string") {
            if (!pattern3.test(data4)) {
              var err4 = {
                instancePath: instancePath + "/font/color",
                schemaPath: "#/definitions/textFont/properties/color/pattern",
                keyword: "pattern",
                params: {
                  pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                },
                message: "must match pattern \"" + "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" + "\""
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
          } else {
            var err5 = {
              instancePath: instancePath + "/font/color",
              schemaPath: "#/definitions/textFont/properties/color/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
        if (data1.bold !== undefined) {
          if (typeof data1.bold !== "boolean") {
            var err6 = {
              instancePath: instancePath + "/font/bold",
              schemaPath: "#/definitions/textFont/properties/bold/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data1.italic !== undefined) {
          if (typeof data1.italic !== "boolean") {
            var err7 = {
              instancePath: instancePath + "/font/italic",
              schemaPath: "#/definitions/textFont/properties/italic/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err7];
            } else {
              vErrors.push(err7);
            }
            errors++;
          }
        }
        if (data1.subscript !== undefined) {
          if (typeof data1.subscript !== "boolean") {
            var err8 = {
              instancePath: instancePath + "/font/subscript",
              schemaPath: "#/definitions/textFont/properties/subscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
        if (data1.superscript !== undefined) {
          if (typeof data1.superscript !== "boolean") {
            var err9 = {
              instancePath: instancePath + "/font/superscript",
              schemaPath: "#/definitions/textFont/properties/superscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
      } else {
        var err10 = {
          instancePath: instancePath + "/font",
          schemaPath: "#/definitions/textFont/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err10];
        } else {
          vErrors.push(err10);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      if (typeof data.color !== "string") {
        var err11 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err11];
        } else {
          vErrors.push(err11);
        }
        errors++;
      }
    }
    if (data.bold !== undefined) {
      if (typeof data.bold !== "boolean") {
        var err12 = {
          instancePath: instancePath + "/bold",
          schemaPath: "#/properties/bold/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
    if (data.italic !== undefined) {
      if (typeof data.italic !== "boolean") {
        var err13 = {
          instancePath: instancePath + "/italic",
          schemaPath: "#/properties/italic/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.subscript !== undefined) {
      if (typeof data.subscript !== "boolean") {
        var err14 = {
          instancePath: instancePath + "/subscript",
          schemaPath: "#/properties/subscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
    if (data.superscript !== undefined) {
      if (typeof data.superscript !== "boolean") {
        var err15 = {
          instancePath: instancePath + "/superscript",
          schemaPath: "#/properties/superscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err15];
        } else {
          vErrors.push(err15);
        }
        errors++;
      }
    }
  } else {
    var err16 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err16];
    } else {
      vErrors.push(err16);
    }
    errors++;
  }
  validate13.errors = vErrors;
  return errors === 0;
}
function validate12(data) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref2$instancePath = _ref2.instancePath,
    instancePath = _ref2$instancePath === void 0 ? "" : _ref2$instancePath;
    _ref2.parentData;
    _ref2.parentDataProperty;
    var _ref2$rootData = _ref2.rootData,
    rootData = _ref2$rootData === void 0 ? data : _ref2$rootData;
  var vErrors = null;
  var errors = 0;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.parts === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "parts"
        },
        message: "must have required property '" + "parts" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.alignment !== undefined) {
      var data0 = data.alignment;
      if (typeof data0 !== "string") {
        var err1 = {
          instancePath: instancePath + "/alignment",
          schemaPath: "#/properties/alignment/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      if (!(data0 === "left" || data0 === "center" || data0 === "right")) {
        var err2 = {
          instancePath: instancePath + "/alignment",
          schemaPath: "#/properties/alignment/enum",
          keyword: "enum",
          params: {
            allowedValues: schema14.properties.alignment["enum"]
          },
          message: "must be equal to one of the allowed values"
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.indent !== undefined) {
      var data1 = data.indent;
      var _errs5 = errors;
      var valid2 = false;
      var passing0 = null;
      var _errs6 = errors;
      if (!(typeof data1 == "number")) {
        var err3 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf/0/type",
          keyword: "type",
          params: {
            type: "number"
          },
          message: "must be number"
        };
        if (vErrors === null) {
          vErrors = [err3];
        } else {
          vErrors.push(err3);
        }
        errors++;
      }
      var _valid0 = _errs6 === errors;
      if (_valid0) {
        valid2 = true;
        passing0 = 0;
      }
      var _errs8 = errors;
      if (data1 && _typeof(data1) == "object" && !Array.isArray(data1)) {
        if (data1.first_line !== undefined) {
          if (!(typeof data1.first_line == "number")) {
            var err4 = {
              instancePath: instancePath + "/indent/first_line",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/first_line/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
        if (data1.left !== undefined) {
          if (!(typeof data1.left == "number")) {
            var err5 = {
              instancePath: instancePath + "/indent/left",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/left/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err5];
            } else {
              vErrors.push(err5);
            }
            errors++;
          }
        }
        if (data1.right !== undefined) {
          if (!(typeof data1.right == "number")) {
            var err6 = {
              instancePath: instancePath + "/indent/right",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/right/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
      } else {
        var err7 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf/1/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err7];
        } else {
          vErrors.push(err7);
        }
        errors++;
      }
      var _valid0 = _errs8 === errors;
      if (_valid0 && valid2) {
        valid2 = false;
        passing0 = [passing0, 1];
      } else {
        if (_valid0) {
          valid2 = true;
          passing0 = 1;
        }
      }
      if (!valid2) {
        var err8 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf",
          keyword: "oneOf",
          params: {
            passingSchemas: passing0
          },
          message: "must match exactly one schema in oneOf"
        };
        if (vErrors === null) {
          vErrors = [err8];
        } else {
          vErrors.push(err8);
        }
        errors++;
      } else {
        errors = _errs5;
        if (vErrors !== null) {
          if (_errs5) {
            vErrors.length = _errs5;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.font !== undefined) {
      var data5 = data.font;
      if (data5 && _typeof(data5) == "object" && !Array.isArray(data5)) {
        if (data5.family !== undefined) {
          if (typeof data5.family !== "string") {
            var err9 = {
              instancePath: instancePath + "/font/family",
              schemaPath: "#/definitions/textFont/properties/family/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data5.size !== undefined) {
          var data7 = data5.size;
          if (!(typeof data7 == "number" && !(data7 % 1) && !isNaN(data7))) {
            var err10 = {
              instancePath: instancePath + "/font/size",
              schemaPath: "#/definitions/textFont/properties/size/type",
              keyword: "type",
              params: {
                type: "integer"
              },
              message: "must be integer"
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data5.color !== undefined) {
          var data8 = data5.color;
          if (typeof data8 === "string") {
            if (!pattern3.test(data8)) {
              var err11 = {
                instancePath: instancePath + "/font/color",
                schemaPath: "#/definitions/textFont/properties/color/pattern",
                keyword: "pattern",
                params: {
                  pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                },
                message: "must match pattern \"" + "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" + "\""
              };
              if (vErrors === null) {
                vErrors = [err11];
              } else {
                vErrors.push(err11);
              }
              errors++;
            }
          } else {
            var err12 = {
              instancePath: instancePath + "/font/color",
              schemaPath: "#/definitions/textFont/properties/color/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err12];
            } else {
              vErrors.push(err12);
            }
            errors++;
          }
        }
        if (data5.bold !== undefined) {
          if (typeof data5.bold !== "boolean") {
            var err13 = {
              instancePath: instancePath + "/font/bold",
              schemaPath: "#/definitions/textFont/properties/bold/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data5.italic !== undefined) {
          if (typeof data5.italic !== "boolean") {
            var err14 = {
              instancePath: instancePath + "/font/italic",
              schemaPath: "#/definitions/textFont/properties/italic/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err14];
            } else {
              vErrors.push(err14);
            }
            errors++;
          }
        }
        if (data5.subscript !== undefined) {
          if (typeof data5.subscript !== "boolean") {
            var err15 = {
              instancePath: instancePath + "/font/subscript",
              schemaPath: "#/definitions/textFont/properties/subscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err15];
            } else {
              vErrors.push(err15);
            }
            errors++;
          }
        }
        if (data5.superscript !== undefined) {
          if (typeof data5.superscript !== "boolean") {
            var err16 = {
              instancePath: instancePath + "/font/superscript",
              schemaPath: "#/definitions/textFont/properties/superscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err16];
            } else {
              vErrors.push(err16);
            }
            errors++;
          }
        }
      } else {
        var err17 = {
          instancePath: instancePath + "/font",
          schemaPath: "#/definitions/textFont/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err17];
        } else {
          vErrors.push(err17);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      if (typeof data.color !== "string") {
        var err18 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/properties/color/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err18];
        } else {
          vErrors.push(err18);
        }
        errors++;
      }
    }
    if (data.bold !== undefined) {
      if (typeof data.bold !== "boolean") {
        var err19 = {
          instancePath: instancePath + "/bold",
          schemaPath: "#/properties/bold/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err19];
        } else {
          vErrors.push(err19);
        }
        errors++;
      }
    }
    if (data.italic !== undefined) {
      if (typeof data.italic !== "boolean") {
        var err20 = {
          instancePath: instancePath + "/italic",
          schemaPath: "#/properties/italic/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err20];
        } else {
          vErrors.push(err20);
        }
        errors++;
      }
    }
    if (data.subscript !== undefined) {
      if (typeof data.subscript !== "boolean") {
        var err21 = {
          instancePath: instancePath + "/subscript",
          schemaPath: "#/properties/subscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err21];
        } else {
          vErrors.push(err21);
        }
        errors++;
      }
    }
    if (data.superscript !== undefined) {
      if (typeof data.superscript !== "boolean") {
        var err22 = {
          instancePath: instancePath + "/superscript",
          schemaPath: "#/properties/superscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err22];
        } else {
          vErrors.push(err22);
        }
        errors++;
      }
    }
    if (data.parts !== undefined) {
      var data18 = data.parts;
      if (Array.isArray(data18)) {
        var len0 = data18.length;
        for (var i0 = 0; i0 < len0; i0++) {
          if (!validate13(data18[i0], {
            instancePath: instancePath + "/parts/" + i0,
            parentData: data18,
            parentDataProperty: i0,
            rootData: rootData
          })) {
            vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
            errors = vErrors.length;
          }
        }
      } else {
        var err23 = {
          instancePath: instancePath + "/parts",
          schemaPath: "#/properties/parts/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err23];
        } else {
          vErrors.push(err23);
        }
        errors++;
      }
    }
  } else {
    var err24 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err24];
    } else {
      vErrors.push(err24);
    }
    errors++;
  }
  validate12.errors = vErrors;
  return errors === 0;
}
function validate11(data) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref3$instancePath = _ref3.instancePath,
    instancePath = _ref3$instancePath === void 0 ? "" : _ref3$instancePath;
    _ref3.parentData;
    _ref3.parentDataProperty;
    var _ref3$rootData = _ref3.rootData,
    rootData = _ref3$rootData === void 0 ? data : _ref3$rootData;
  var vErrors = null;
  var errors = 0;
  var _errs1 = errors;
  var valid0 = false;
  var passing0 = null;
  var _errs2 = errors;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.data === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/oneOf/0/required",
        keyword: "required",
        params: {
          missingProperty: "data"
        },
        message: "must have required property '" + "data" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.data !== undefined) {
      var data0 = data.data;
      if (data0 && _typeof(data0) == "object" && !Array.isArray(data0)) {
        if (data0.content === undefined) {
          var err1 = {
            instancePath: instancePath + "/data",
            schemaPath: "#/oneOf/0/properties/data/required",
            keyword: "required",
            params: {
              missingProperty: "content"
            },
            message: "must have required property '" + "content" + "'"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.content !== undefined) {
          if (typeof data0.content !== "string") {
            var err2 = {
              instancePath: instancePath + "/data/content",
              schemaPath: "#/oneOf/0/properties/data/properties/content/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err2];
            } else {
              vErrors.push(err2);
            }
            errors++;
          }
        }
        if (data0.position !== undefined) {
          var data2 = data0.position;
          if (data2 && _typeof(data2) == "object" && !Array.isArray(data2)) {
            if (data2.x !== undefined) {
              if (!(typeof data2.x == "number")) {
                var err3 = {
                  instancePath: instancePath + "/data/position/x",
                  schemaPath: "#/oneOf/0/properties/data/properties/position/properties/x/type",
                  keyword: "type",
                  params: {
                    type: "number"
                  },
                  message: "must be number"
                };
                if (vErrors === null) {
                  vErrors = [err3];
                } else {
                  vErrors.push(err3);
                }
                errors++;
              }
            }
            if (data2.y !== undefined) {
              if (!(typeof data2.y == "number")) {
                var err4 = {
                  instancePath: instancePath + "/data/position/y",
                  schemaPath: "#/oneOf/0/properties/data/properties/position/properties/y/type",
                  keyword: "type",
                  params: {
                    type: "number"
                  },
                  message: "must be number"
                };
                if (vErrors === null) {
                  vErrors = [err4];
                } else {
                  vErrors.push(err4);
                }
                errors++;
              }
            }
            if (data2.z !== undefined) {
              if (!(typeof data2.z == "number")) {
                var err5 = {
                  instancePath: instancePath + "/data/position/z",
                  schemaPath: "#/oneOf/0/properties/data/properties/position/properties/z/type",
                  keyword: "type",
                  params: {
                    type: "number"
                  },
                  message: "must be number"
                };
                if (vErrors === null) {
                  vErrors = [err5];
                } else {
                  vErrors.push(err5);
                }
                errors++;
              }
            }
          } else {
            var err6 = {
              instancePath: instancePath + "/data/position",
              schemaPath: "#/oneOf/0/properties/data/properties/position/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
        }
        if (data0.pos !== undefined) {
          var data6 = data0.pos;
          if (Array.isArray(data6)) {
            var len0 = data6.length;
            for (var i0 = 0; i0 < len0; i0++) {
              var data7 = data6[i0];
              if (data7 && _typeof(data7) == "object" && !Array.isArray(data7)) {
                if (data7.x !== undefined) {
                  if (!(typeof data7.x == "number")) {
                    var err7 = {
                      instancePath: instancePath + "/data/pos/" + i0 + "/x",
                      schemaPath: "#/oneOf/0/properties/data/properties/pos/items/properties/x/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                }
                if (data7.y !== undefined) {
                  if (!(typeof data7.y == "number")) {
                    var err8 = {
                      instancePath: instancePath + "/data/pos/" + i0 + "/y",
                      schemaPath: "#/oneOf/0/properties/data/properties/pos/items/properties/y/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err8];
                    } else {
                      vErrors.push(err8);
                    }
                    errors++;
                  }
                }
                if (data7.z !== undefined) {
                  if (!(typeof data7.z == "number")) {
                    var err9 = {
                      instancePath: instancePath + "/data/pos/" + i0 + "/z",
                      schemaPath: "#/oneOf/0/properties/data/properties/pos/items/properties/z/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err9];
                    } else {
                      vErrors.push(err9);
                    }
                    errors++;
                  }
                }
              } else {
                var err10 = {
                  instancePath: instancePath + "/data/pos/" + i0,
                  schemaPath: "#/oneOf/0/properties/data/properties/pos/items/type",
                  keyword: "type",
                  params: {
                    type: "object"
                  },
                  message: "must be object"
                };
                if (vErrors === null) {
                  vErrors = [err10];
                } else {
                  vErrors.push(err10);
                }
                errors++;
              }
            }
          } else {
            var err11 = {
              instancePath: instancePath + "/data/pos",
              schemaPath: "#/oneOf/0/properties/data/properties/pos/type",
              keyword: "type",
              params: {
                type: "array"
              },
              message: "must be array"
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
        }
      } else {
        var err12 = {
          instancePath: instancePath + "/data",
          schemaPath: "#/oneOf/0/properties/data/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err12];
        } else {
          vErrors.push(err12);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs2 === errors;
  if (_valid0) {
    valid0 = true;
    passing0 = 0;
  }
  var _errs25 = errors;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.boundingBox === undefined) {
      var err13 = {
        instancePath: instancePath,
        schemaPath: "#/oneOf/1/required",
        keyword: "required",
        params: {
          missingProperty: "boundingBox"
        },
        message: "must have required property '" + "boundingBox" + "'"
      };
      if (vErrors === null) {
        vErrors = [err13];
      } else {
        vErrors.push(err13);
      }
      errors++;
    }
    if (data.paragraphs === undefined) {
      var err14 = {
        instancePath: instancePath,
        schemaPath: "#/oneOf/1/required",
        keyword: "required",
        params: {
          missingProperty: "paragraphs"
        },
        message: "must have required property '" + "paragraphs" + "'"
      };
      if (vErrors === null) {
        vErrors = [err14];
      } else {
        vErrors.push(err14);
      }
      errors++;
    }
    if (data.boundingBox !== undefined) {
      var data11 = data.boundingBox;
      if (data11 && _typeof(data11) == "object" && !Array.isArray(data11)) {
        if (data11.x === undefined) {
          var err15 = {
            instancePath: instancePath + "/boundingBox",
            schemaPath: "#/oneOf/1/properties/boundingBox/required",
            keyword: "required",
            params: {
              missingProperty: "x"
            },
            message: "must have required property '" + "x" + "'"
          };
          if (vErrors === null) {
            vErrors = [err15];
          } else {
            vErrors.push(err15);
          }
          errors++;
        }
        if (data11.y === undefined) {
          var err16 = {
            instancePath: instancePath + "/boundingBox",
            schemaPath: "#/oneOf/1/properties/boundingBox/required",
            keyword: "required",
            params: {
              missingProperty: "y"
            },
            message: "must have required property '" + "y" + "'"
          };
          if (vErrors === null) {
            vErrors = [err16];
          } else {
            vErrors.push(err16);
          }
          errors++;
        }
        if (data11.width === undefined) {
          var err17 = {
            instancePath: instancePath + "/boundingBox",
            schemaPath: "#/oneOf/1/properties/boundingBox/required",
            keyword: "required",
            params: {
              missingProperty: "width"
            },
            message: "must have required property '" + "width" + "'"
          };
          if (vErrors === null) {
            vErrors = [err17];
          } else {
            vErrors.push(err17);
          }
          errors++;
        }
        if (data11.height === undefined) {
          var err18 = {
            instancePath: instancePath + "/boundingBox",
            schemaPath: "#/oneOf/1/properties/boundingBox/required",
            keyword: "required",
            params: {
              missingProperty: "height"
            },
            message: "must have required property '" + "height" + "'"
          };
          if (vErrors === null) {
            vErrors = [err18];
          } else {
            vErrors.push(err18);
          }
          errors++;
        }
        if (data11.x !== undefined) {
          if (!(typeof data11.x == "number")) {
            var err19 = {
              instancePath: instancePath + "/boundingBox/x",
              schemaPath: "#/oneOf/1/properties/boundingBox/properties/x/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err19];
            } else {
              vErrors.push(err19);
            }
            errors++;
          }
        }
        if (data11.y !== undefined) {
          if (!(typeof data11.y == "number")) {
            var err20 = {
              instancePath: instancePath + "/boundingBox/y",
              schemaPath: "#/oneOf/1/properties/boundingBox/properties/y/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err20];
            } else {
              vErrors.push(err20);
            }
            errors++;
          }
        }
        if (data11.z !== undefined) {
          if (!(typeof data11.z == "number")) {
            var err21 = {
              instancePath: instancePath + "/boundingBox/z",
              schemaPath: "#/oneOf/1/properties/boundingBox/properties/z/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err21];
            } else {
              vErrors.push(err21);
            }
            errors++;
          }
        }
        if (data11.width !== undefined) {
          var data15 = data11.width;
          if (typeof data15 == "number") {
            if (data15 < 0 || isNaN(data15)) {
              var err22 = {
                instancePath: instancePath + "/boundingBox/width",
                schemaPath: "#/oneOf/1/properties/boundingBox/properties/width/minimum",
                keyword: "minimum",
                params: {
                  comparison: ">=",
                  limit: 0
                },
                message: "must be >= 0"
              };
              if (vErrors === null) {
                vErrors = [err22];
              } else {
                vErrors.push(err22);
              }
              errors++;
            }
          } else {
            var err23 = {
              instancePath: instancePath + "/boundingBox/width",
              schemaPath: "#/oneOf/1/properties/boundingBox/properties/width/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err23];
            } else {
              vErrors.push(err23);
            }
            errors++;
          }
        }
        if (data11.height !== undefined) {
          var data16 = data11.height;
          if (typeof data16 == "number") {
            if (data16 < 0 || isNaN(data16)) {
              var err24 = {
                instancePath: instancePath + "/boundingBox/height",
                schemaPath: "#/oneOf/1/properties/boundingBox/properties/height/minimum",
                keyword: "minimum",
                params: {
                  comparison: ">=",
                  limit: 0
                },
                message: "must be >= 0"
              };
              if (vErrors === null) {
                vErrors = [err24];
              } else {
                vErrors.push(err24);
              }
              errors++;
            }
          } else {
            var err25 = {
              instancePath: instancePath + "/boundingBox/height",
              schemaPath: "#/oneOf/1/properties/boundingBox/properties/height/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err25];
            } else {
              vErrors.push(err25);
            }
            errors++;
          }
        }
      } else {
        var err26 = {
          instancePath: instancePath + "/boundingBox",
          schemaPath: "#/oneOf/1/properties/boundingBox/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err26];
        } else {
          vErrors.push(err26);
        }
        errors++;
      }
    }
    if (data.paragraphs !== undefined) {
      var data17 = data.paragraphs;
      if (Array.isArray(data17)) {
        var len1 = data17.length;
        for (var i1 = 0; i1 < len1; i1++) {
          if (!validate12(data17[i1], {
            instancePath: instancePath + "/paragraphs/" + i1,
            parentData: data17,
            parentDataProperty: i1,
            rootData: rootData
          })) {
            vErrors = vErrors === null ? validate12.errors : vErrors.concat(validate12.errors);
            errors = vErrors.length;
          }
        }
      } else {
        var err27 = {
          instancePath: instancePath + "/paragraphs",
          schemaPath: "#/oneOf/1/properties/paragraphs/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err27];
        } else {
          vErrors.push(err27);
        }
        errors++;
      }
    }
    if (data.alignment !== undefined) {
      var data19 = data.alignment;
      if (typeof data19 !== "string") {
        var err28 = {
          instancePath: instancePath + "/alignment",
          schemaPath: "#/oneOf/1/properties/alignment/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err28];
        } else {
          vErrors.push(err28);
        }
        errors++;
      }
      if (!(data19 === "left" || data19 === "center" || data19 === "right")) {
        var err29 = {
          instancePath: instancePath + "/alignment",
          schemaPath: "#/oneOf/1/properties/alignment/enum",
          keyword: "enum",
          params: {
            allowedValues: schema13.oneOf[1].properties.alignment["enum"]
          },
          message: "must be equal to one of the allowed values"
        };
        if (vErrors === null) {
          vErrors = [err29];
        } else {
          vErrors.push(err29);
        }
        errors++;
      }
    }
    if (data.indent !== undefined) {
      var data20 = data.indent;
      var _errs45 = errors;
      var valid12 = false;
      var passing1 = null;
      var _errs46 = errors;
      if (!(typeof data20 == "number")) {
        var err30 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf/0/type",
          keyword: "type",
          params: {
            type: "number"
          },
          message: "must be number"
        };
        if (vErrors === null) {
          vErrors = [err30];
        } else {
          vErrors.push(err30);
        }
        errors++;
      }
      var _valid1 = _errs46 === errors;
      if (_valid1) {
        valid12 = true;
        passing1 = 0;
      }
      var _errs48 = errors;
      if (data20 && _typeof(data20) == "object" && !Array.isArray(data20)) {
        if (data20.first_line !== undefined) {
          if (!(typeof data20.first_line == "number")) {
            var err31 = {
              instancePath: instancePath + "/indent/first_line",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/first_line/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err31];
            } else {
              vErrors.push(err31);
            }
            errors++;
          }
        }
        if (data20.left !== undefined) {
          if (!(typeof data20.left == "number")) {
            var err32 = {
              instancePath: instancePath + "/indent/left",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/left/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err32];
            } else {
              vErrors.push(err32);
            }
            errors++;
          }
        }
        if (data20.right !== undefined) {
          if (!(typeof data20.right == "number")) {
            var err33 = {
              instancePath: instancePath + "/indent/right",
              schemaPath: "#/definitions/textIndent/oneOf/1/properties/right/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err33];
            } else {
              vErrors.push(err33);
            }
            errors++;
          }
        }
      } else {
        var err34 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf/1/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err34];
        } else {
          vErrors.push(err34);
        }
        errors++;
      }
      var _valid1 = _errs48 === errors;
      if (_valid1 && valid12) {
        valid12 = false;
        passing1 = [passing1, 1];
      } else {
        if (_valid1) {
          valid12 = true;
          passing1 = 1;
        }
      }
      if (!valid12) {
        var err35 = {
          instancePath: instancePath + "/indent",
          schemaPath: "#/definitions/textIndent/oneOf",
          keyword: "oneOf",
          params: {
            passingSchemas: passing1
          },
          message: "must match exactly one schema in oneOf"
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      } else {
        errors = _errs45;
        if (vErrors !== null) {
          if (_errs45) {
            vErrors.length = _errs45;
          } else {
            vErrors = null;
          }
        }
      }
    }
    if (data.font !== undefined) {
      var data24 = data.font;
      if (data24 && _typeof(data24) == "object" && !Array.isArray(data24)) {
        if (data24.family !== undefined) {
          if (typeof data24.family !== "string") {
            var err36 = {
              instancePath: instancePath + "/font/family",
              schemaPath: "#/definitions/textFont/properties/family/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err36];
            } else {
              vErrors.push(err36);
            }
            errors++;
          }
        }
        if (data24.size !== undefined) {
          var data26 = data24.size;
          if (!(typeof data26 == "number" && !(data26 % 1) && !isNaN(data26))) {
            var err37 = {
              instancePath: instancePath + "/font/size",
              schemaPath: "#/definitions/textFont/properties/size/type",
              keyword: "type",
              params: {
                type: "integer"
              },
              message: "must be integer"
            };
            if (vErrors === null) {
              vErrors = [err37];
            } else {
              vErrors.push(err37);
            }
            errors++;
          }
        }
        if (data24.color !== undefined) {
          var data27 = data24.color;
          if (typeof data27 === "string") {
            if (!pattern3.test(data27)) {
              var err38 = {
                instancePath: instancePath + "/font/color",
                schemaPath: "#/definitions/textFont/properties/color/pattern",
                keyword: "pattern",
                params: {
                  pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                },
                message: "must match pattern \"" + "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" + "\""
              };
              if (vErrors === null) {
                vErrors = [err38];
              } else {
                vErrors.push(err38);
              }
              errors++;
            }
          } else {
            var err39 = {
              instancePath: instancePath + "/font/color",
              schemaPath: "#/definitions/textFont/properties/color/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err39];
            } else {
              vErrors.push(err39);
            }
            errors++;
          }
        }
        if (data24.bold !== undefined) {
          if (typeof data24.bold !== "boolean") {
            var err40 = {
              instancePath: instancePath + "/font/bold",
              schemaPath: "#/definitions/textFont/properties/bold/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err40];
            } else {
              vErrors.push(err40);
            }
            errors++;
          }
        }
        if (data24.italic !== undefined) {
          if (typeof data24.italic !== "boolean") {
            var err41 = {
              instancePath: instancePath + "/font/italic",
              schemaPath: "#/definitions/textFont/properties/italic/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err41];
            } else {
              vErrors.push(err41);
            }
            errors++;
          }
        }
        if (data24.subscript !== undefined) {
          if (typeof data24.subscript !== "boolean") {
            var err42 = {
              instancePath: instancePath + "/font/subscript",
              schemaPath: "#/definitions/textFont/properties/subscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err42];
            } else {
              vErrors.push(err42);
            }
            errors++;
          }
        }
        if (data24.superscript !== undefined) {
          if (typeof data24.superscript !== "boolean") {
            var err43 = {
              instancePath: instancePath + "/font/superscript",
              schemaPath: "#/definitions/textFont/properties/superscript/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err43];
            } else {
              vErrors.push(err43);
            }
            errors++;
          }
        }
      } else {
        var err44 = {
          instancePath: instancePath + "/font",
          schemaPath: "#/definitions/textFont/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err44];
        } else {
          vErrors.push(err44);
        }
        errors++;
      }
    }
    if (data.color !== undefined) {
      if (typeof data.color !== "string") {
        var err45 = {
          instancePath: instancePath + "/color",
          schemaPath: "#/oneOf/1/properties/color/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err45];
        } else {
          vErrors.push(err45);
        }
        errors++;
      }
    }
    if (data.bold !== undefined) {
      if (typeof data.bold !== "boolean") {
        var err46 = {
          instancePath: instancePath + "/bold",
          schemaPath: "#/oneOf/1/properties/bold/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err46];
        } else {
          vErrors.push(err46);
        }
        errors++;
      }
    }
    if (data.italic !== undefined) {
      if (typeof data.italic !== "boolean") {
        var err47 = {
          instancePath: instancePath + "/italic",
          schemaPath: "#/oneOf/1/properties/italic/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err47];
        } else {
          vErrors.push(err47);
        }
        errors++;
      }
    }
    if (data.subscript !== undefined) {
      if (typeof data.subscript !== "boolean") {
        var err48 = {
          instancePath: instancePath + "/subscript",
          schemaPath: "#/oneOf/1/properties/subscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err48];
        } else {
          vErrors.push(err48);
        }
        errors++;
      }
    }
    if (data.superscript !== undefined) {
      if (typeof data.superscript !== "boolean") {
        var err49 = {
          instancePath: instancePath + "/superscript",
          schemaPath: "#/oneOf/1/properties/superscript/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err49];
        } else {
          vErrors.push(err49);
        }
        errors++;
      }
    }
  }
  var _valid0 = _errs25 === errors;
  if (_valid0 && valid0) {
    valid0 = false;
    passing0 = [passing0, 1];
  } else {
    if (_valid0) {
      valid0 = true;
      passing0 = 1;
    }
  }
  if (!valid0) {
    var err50 = {
      instancePath: instancePath,
      schemaPath: "#/oneOf",
      keyword: "oneOf",
      params: {
        passingSchemas: passing0
      },
      message: "must match exactly one schema in oneOf"
    };
    if (vErrors === null) {
      vErrors = [err50];
    } else {
      vErrors.push(err50);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
      var err51 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "type"
        },
        message: "must have required property '" + "type" + "'"
      };
      if (vErrors === null) {
        vErrors = [err51];
      } else {
        vErrors.push(err51);
      }
      errors++;
    }
    if (data.type !== undefined) {
      if ("text" !== data.type) {
        var err52 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: {
            allowedValue: "text"
          },
          message: "must be equal to constant"
        };
        if (vErrors === null) {
          vErrors = [err52];
        } else {
          vErrors.push(err52);
        }
        errors++;
      }
    }
    if (data.selected !== undefined) {
      if (typeof data.selected !== "boolean") {
        var err53 = {
          instancePath: instancePath + "/selected",
          schemaPath: "#/properties/selected/type",
          keyword: "type",
          params: {
            type: "boolean"
          },
          message: "must be boolean"
        };
        if (vErrors === null) {
          vErrors = [err53];
        } else {
          vErrors.push(err53);
        }
        errors++;
      }
    }
  } else {
    var err54 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err54];
    } else {
      vErrors.push(err54);
    }
    errors++;
  }
  validate11.errors = vErrors;
  return errors === 0;
}
function validate17(data) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref4$instancePath = _ref4.instancePath,
    instancePath = _ref4$instancePath === void 0 ? "" : _ref4$instancePath;
    _ref4.parentData;
    _ref4.parentDataProperty;
    _ref4.rootData;
  var vErrors = null;
  var errors = 0;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "type"
        },
        message: "must have required property '" + "type" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.data === undefined) {
      var err1 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "data"
        },
        message: "must have required property '" + "data" + "'"
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.type !== undefined) {
      if ("multi-tailed-arrow" !== data.type) {
        var err2 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: {
            allowedValue: "multi-tailed-arrow"
          },
          message: "must be equal to constant"
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.data !== undefined) {
      var data1 = data.data;
      if (data1 && _typeof(data1) == "object" && !Array.isArray(data1)) {
        if (data1.head === undefined) {
          var err3 = {
            instancePath: instancePath + "/data",
            schemaPath: "#/properties/data/required",
            keyword: "required",
            params: {
              missingProperty: "head"
            },
            message: "must have required property '" + "head" + "'"
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data1.spine === undefined) {
          var err4 = {
            instancePath: instancePath + "/data",
            schemaPath: "#/properties/data/required",
            keyword: "required",
            params: {
              missingProperty: "spine"
            },
            message: "must have required property '" + "spine" + "'"
          };
          if (vErrors === null) {
            vErrors = [err4];
          } else {
            vErrors.push(err4);
          }
          errors++;
        }
        if (data1.tails === undefined) {
          var err5 = {
            instancePath: instancePath + "/data",
            schemaPath: "#/properties/data/required",
            keyword: "required",
            params: {
              missingProperty: "tails"
            },
            message: "must have required property '" + "tails" + "'"
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data1.head !== undefined) {
          var data2 = data1.head;
          if (data2 && _typeof(data2) == "object" && !Array.isArray(data2)) {
            if (data2.position === undefined) {
              var err6 = {
                instancePath: instancePath + "/data/head",
                schemaPath: "#/properties/data/properties/head/required",
                keyword: "required",
                params: {
                  missingProperty: "position"
                },
                message: "must have required property '" + "position" + "'"
              };
              if (vErrors === null) {
                vErrors = [err6];
              } else {
                vErrors.push(err6);
              }
              errors++;
            }
            if (data2.position !== undefined) {
              var data3 = data2.position;
              if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                if (data3.x === undefined) {
                  var err7 = {
                    instancePath: instancePath + "/data/head/position",
                    schemaPath: "#/definitions/point/required",
                    keyword: "required",
                    params: {
                      missingProperty: "x"
                    },
                    message: "must have required property '" + "x" + "'"
                  };
                  if (vErrors === null) {
                    vErrors = [err7];
                  } else {
                    vErrors.push(err7);
                  }
                  errors++;
                }
                if (data3.y === undefined) {
                  var err8 = {
                    instancePath: instancePath + "/data/head/position",
                    schemaPath: "#/definitions/point/required",
                    keyword: "required",
                    params: {
                      missingProperty: "y"
                    },
                    message: "must have required property '" + "y" + "'"
                  };
                  if (vErrors === null) {
                    vErrors = [err8];
                  } else {
                    vErrors.push(err8);
                  }
                  errors++;
                }
                if (data3.x !== undefined) {
                  if (!(typeof data3.x == "number")) {
                    var err9 = {
                      instancePath: instancePath + "/data/head/position/x",
                      schemaPath: "#/definitions/point/properties/x/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err9];
                    } else {
                      vErrors.push(err9);
                    }
                    errors++;
                  }
                }
                if (data3.y !== undefined) {
                  if (!(typeof data3.y == "number")) {
                    var err10 = {
                      instancePath: instancePath + "/data/head/position/y",
                      schemaPath: "#/definitions/point/properties/y/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err10];
                    } else {
                      vErrors.push(err10);
                    }
                    errors++;
                  }
                }
                if (data3.z !== undefined) {
                  if (!(typeof data3.z == "number")) {
                    var err11 = {
                      instancePath: instancePath + "/data/head/position/z",
                      schemaPath: "#/definitions/point/properties/z/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err11];
                    } else {
                      vErrors.push(err11);
                    }
                    errors++;
                  }
                }
              } else {
                var err12 = {
                  instancePath: instancePath + "/data/head/position",
                  schemaPath: "#/definitions/point/type",
                  keyword: "type",
                  params: {
                    type: "object"
                  },
                  message: "must be object"
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
          } else {
            var err13 = {
              instancePath: instancePath + "/data/head",
              schemaPath: "#/properties/data/properties/head/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err13];
            } else {
              vErrors.push(err13);
            }
            errors++;
          }
        }
        if (data1.spine !== undefined) {
          var data7 = data1.spine;
          if (data7 && _typeof(data7) == "object" && !Array.isArray(data7)) {
            if (data7.pos === undefined) {
              var err14 = {
                instancePath: instancePath + "/data/spine",
                schemaPath: "#/properties/data/properties/spine/required",
                keyword: "required",
                params: {
                  missingProperty: "pos"
                },
                message: "must have required property '" + "pos" + "'"
              };
              if (vErrors === null) {
                vErrors = [err14];
              } else {
                vErrors.push(err14);
              }
              errors++;
            }
            if (data7.pos !== undefined) {
              var data8 = data7.pos;
              if (Array.isArray(data8)) {
                if (data8.length > 2) {
                  var err15 = {
                    instancePath: instancePath + "/data/spine/pos",
                    schemaPath: "#/properties/data/properties/spine/properties/pos/maxItems",
                    keyword: "maxItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have more than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
                if (data8.length < 2) {
                  var err16 = {
                    instancePath: instancePath + "/data/spine/pos",
                    schemaPath: "#/properties/data/properties/spine/properties/pos/minItems",
                    keyword: "minItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have fewer than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err16];
                  } else {
                    vErrors.push(err16);
                  }
                  errors++;
                }
                var len0 = data8.length;
                for (var i0 = 0; i0 < len0; i0++) {
                  var data9 = data8[i0];
                  if (data9 && _typeof(data9) == "object" && !Array.isArray(data9)) {
                    if (data9.x === undefined) {
                      var err17 = {
                        instancePath: instancePath + "/data/spine/pos/" + i0,
                        schemaPath: "#/definitions/point/required",
                        keyword: "required",
                        params: {
                          missingProperty: "x"
                        },
                        message: "must have required property '" + "x" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err17];
                      } else {
                        vErrors.push(err17);
                      }
                      errors++;
                    }
                    if (data9.y === undefined) {
                      var err18 = {
                        instancePath: instancePath + "/data/spine/pos/" + i0,
                        schemaPath: "#/definitions/point/required",
                        keyword: "required",
                        params: {
                          missingProperty: "y"
                        },
                        message: "must have required property '" + "y" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err18];
                      } else {
                        vErrors.push(err18);
                      }
                      errors++;
                    }
                    if (data9.x !== undefined) {
                      if (!(typeof data9.x == "number")) {
                        var err19 = {
                          instancePath: instancePath + "/data/spine/pos/" + i0 + "/x",
                          schemaPath: "#/definitions/point/properties/x/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err19];
                        } else {
                          vErrors.push(err19);
                        }
                        errors++;
                      }
                    }
                    if (data9.y !== undefined) {
                      if (!(typeof data9.y == "number")) {
                        var err20 = {
                          instancePath: instancePath + "/data/spine/pos/" + i0 + "/y",
                          schemaPath: "#/definitions/point/properties/y/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err20];
                        } else {
                          vErrors.push(err20);
                        }
                        errors++;
                      }
                    }
                    if (data9.z !== undefined) {
                      if (!(typeof data9.z == "number")) {
                        var err21 = {
                          instancePath: instancePath + "/data/spine/pos/" + i0 + "/z",
                          schemaPath: "#/definitions/point/properties/z/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err21];
                        } else {
                          vErrors.push(err21);
                        }
                        errors++;
                      }
                    }
                  } else {
                    var err22 = {
                      instancePath: instancePath + "/data/spine/pos/" + i0,
                      schemaPath: "#/definitions/point/type",
                      keyword: "type",
                      params: {
                        type: "object"
                      },
                      message: "must be object"
                    };
                    if (vErrors === null) {
                      vErrors = [err22];
                    } else {
                      vErrors.push(err22);
                    }
                    errors++;
                  }
                }
              } else {
                var err23 = {
                  instancePath: instancePath + "/data/spine/pos",
                  schemaPath: "#/properties/data/properties/spine/properties/pos/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
          } else {
            var err24 = {
              instancePath: instancePath + "/data/spine",
              schemaPath: "#/properties/data/properties/spine/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err24];
            } else {
              vErrors.push(err24);
            }
            errors++;
          }
        }
        if (data1.tails !== undefined) {
          var data13 = data1.tails;
          if (data13 && _typeof(data13) == "object" && !Array.isArray(data13)) {
            if (data13.pos === undefined) {
              var err25 = {
                instancePath: instancePath + "/data/tails",
                schemaPath: "#/properties/data/properties/tails/required",
                keyword: "required",
                params: {
                  missingProperty: "pos"
                },
                message: "must have required property '" + "pos" + "'"
              };
              if (vErrors === null) {
                vErrors = [err25];
              } else {
                vErrors.push(err25);
              }
              errors++;
            }
            if (data13.pos !== undefined) {
              var data14 = data13.pos;
              if (Array.isArray(data14)) {
                if (data14.length < 2) {
                  var err26 = {
                    instancePath: instancePath + "/data/tails/pos",
                    schemaPath: "#/properties/data/properties/tails/properties/pos/minItems",
                    keyword: "minItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have fewer than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
                var len1 = data14.length;
                for (var i1 = 0; i1 < len1; i1++) {
                  var data15 = data14[i1];
                  if (data15 && _typeof(data15) == "object" && !Array.isArray(data15)) {
                    if (data15.x === undefined) {
                      var err27 = {
                        instancePath: instancePath + "/data/tails/pos/" + i1,
                        schemaPath: "#/definitions/point/required",
                        keyword: "required",
                        params: {
                          missingProperty: "x"
                        },
                        message: "must have required property '" + "x" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err27];
                      } else {
                        vErrors.push(err27);
                      }
                      errors++;
                    }
                    if (data15.y === undefined) {
                      var err28 = {
                        instancePath: instancePath + "/data/tails/pos/" + i1,
                        schemaPath: "#/definitions/point/required",
                        keyword: "required",
                        params: {
                          missingProperty: "y"
                        },
                        message: "must have required property '" + "y" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err28];
                      } else {
                        vErrors.push(err28);
                      }
                      errors++;
                    }
                    if (data15.x !== undefined) {
                      if (!(typeof data15.x == "number")) {
                        var err29 = {
                          instancePath: instancePath + "/data/tails/pos/" + i1 + "/x",
                          schemaPath: "#/definitions/point/properties/x/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err29];
                        } else {
                          vErrors.push(err29);
                        }
                        errors++;
                      }
                    }
                    if (data15.y !== undefined) {
                      if (!(typeof data15.y == "number")) {
                        var err30 = {
                          instancePath: instancePath + "/data/tails/pos/" + i1 + "/y",
                          schemaPath: "#/definitions/point/properties/y/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err30];
                        } else {
                          vErrors.push(err30);
                        }
                        errors++;
                      }
                    }
                    if (data15.z !== undefined) {
                      if (!(typeof data15.z == "number")) {
                        var err31 = {
                          instancePath: instancePath + "/data/tails/pos/" + i1 + "/z",
                          schemaPath: "#/definitions/point/properties/z/type",
                          keyword: "type",
                          params: {
                            type: "number"
                          },
                          message: "must be number"
                        };
                        if (vErrors === null) {
                          vErrors = [err31];
                        } else {
                          vErrors.push(err31);
                        }
                        errors++;
                      }
                    }
                  } else {
                    var err32 = {
                      instancePath: instancePath + "/data/tails/pos/" + i1,
                      schemaPath: "#/definitions/point/type",
                      keyword: "type",
                      params: {
                        type: "object"
                      },
                      message: "must be object"
                    };
                    if (vErrors === null) {
                      vErrors = [err32];
                    } else {
                      vErrors.push(err32);
                    }
                    errors++;
                  }
                }
              } else {
                var err33 = {
                  instancePath: instancePath + "/data/tails/pos",
                  schemaPath: "#/properties/data/properties/tails/properties/pos/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err33];
                } else {
                  vErrors.push(err33);
                }
                errors++;
              }
            }
          } else {
            var err34 = {
              instancePath: instancePath + "/data/tails",
              schemaPath: "#/properties/data/properties/tails/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err34];
            } else {
              vErrors.push(err34);
            }
            errors++;
          }
        }
      } else {
        var err35 = {
          instancePath: instancePath + "/data",
          schemaPath: "#/properties/data/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err35];
        } else {
          vErrors.push(err35);
        }
        errors++;
      }
    }
  } else {
    var err36 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err36];
    } else {
      vErrors.push(err36);
    }
    errors++;
  }
  validate17.errors = vErrors;
  return errors === 0;
}
var schema30 = {
  "type": "object",
  "required": ["label"],
  "properties": {
    "label": {
      "type": "string"
    },
    "alias": {
      "type": "string"
    },
    "location": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "items": {
        "type": "number"
      }
    },
    "selected": {
      "type": "boolean"
    },
    "charge": {
      "type": "integer",
      "minimum": -1000,
      "maximum": 1000
    },
    "explicitValence": {
      "type": "integer",
      "enum": [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    },
    "isotope": {
      "type": "integer",
      "minimum": 0,
      "maximum": 1000
    },
    "radical": {
      "type": "integer",
      "enum": [0, 2, 1, 3]
    },
    "attachmentPoints": {
      "type": "integer",
      "enum": [0, 1, 2, 3]
    },
    "stereoLabel": {
      "type": "string",
      "pattern": "(?:(?:^&|or)[0-9]+$)|(?:^abs$)"
    },
    "stereoParity": {
      "type": "integer",
      "enum": [0, 1, 2, 3]
    },
    "ringBondCount": {
      "type": "integer",
      "enum": [0, -2, -1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    "substitutionCount": {
      "type": "integer",
      "enum": [0, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    "unsaturatedAtom": {
      "type": "boolean"
    },
    "hCount": {
      "type": "integer",
      "enum": [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    "implicitHCount": {
      "type": "integer",
      "enum": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    },
    "mapping": {
      "type": "integer",
      "minimum": 0
    },
    "invRet": {
      "type": "integer",
      "enum": [0, 1, 2]
    },
    "exactChangeFlag": {
      "type": "boolean"
    },
    "cip": {
      "type": "string",
      "enum": ["R", "S", "r", "s"]
    },
    "queryProperties": {
      "type": "object",
      "properties": {
        "aromaticity": {
          "type": "string",
          "enum": ["aromatic", "aliphatic"]
        },
        "ringMembership": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9
        },
        "ringSize": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9
        },
        "connectivity": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9
        },
        "chirality": {
          "type": "string",
          "enum": ["clockwise", "anticlockwise"]
        },
        "customQuery": {
          "type": "string"
        }
      }
    }
  },
  "additionalProperties": false
};
var schema31 = {
  "type": "object",
  "required": ["type", "location"],
  "properties": {
    "type": {
      "const": "rg-label"
    },
    "location": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "items": {
        "type": "number"
      }
    },
    "$refs": {
      "type": "array",
      "items": {
        "type": "string",
        "pattern": "^rg-[1-9]\\d*"
      }
    },
    "attachmentPoints": {
      "type": "integer",
      "enum": [0, 1, 2, 3]
    }
  }
};
var schema32 = {
  "type": "object",
  "required": ["type", "location"],
  "properties": {
    "type": {
      "enum": ["atom-list"]
    },
    "notList": {
      "type": "boolean"
    },
    "location": {
      "type": "array",
      "minItems": 2,
      "maxItems": 3,
      "items": {
        "type": "number"
      }
    },
    "elements": {
      "type": "array",
      "minItems": 1,
      "items": {
        "type": "string",
        "minLength": 1
      }
    },
    "attachmentPoints": {
      "type": "integer",
      "enum": [0, 1, 2, 3]
    }
  }
};
var schema33 = {
  "type": "object",
  "required": ["atoms"],
  "properties": {
    "atoms": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "uniqueItems": true,
      "items": {
        "type": "integer",
        "minimum": 0
      }
    },
    "selected": {
      "type": "boolean"
    },
    "stereobox": {
      "type": "integer",
      "enum": [0, 1]
    },
    "cip": {
      "type": "string",
      "enum": ["Z", "E"]
    }
  },
  "oneOf": [{
    "required": ["type"],
    "properties": {
      "type": {
        "type": "integer",
        "enum": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
      },
      "stereo": {
        "type": "integer",
        "enum": [0, 1, 3, 4, 6]
      },
      "topology": {
        "type": "integer",
        "enum": [0, 1, 2]
      },
      "center": {
        "type": "integer",
        "enum": [0, -1, 1, 2, 4, 8, 12]
      }
    }
  }, {
    "required": ["customQuery"],
    "properties": {
      "customQuery": {
        "type": "string"
      }
    }
  }]
};
var schema36 = {
  "type": "array",
  "items": {
    "required": ["atoms", "type"],
    "type": "object",
    "properties": {
      "atoms": {
        "type": "array",
        "items": {
          "type": "integer",
          "minimum": 0
        }
      },
      "type": {
        "type": "string",
        "enum": ["GEN", "MUL", "SRU", "SUP", "DAT", "queryComponent", "COP"]
      }
    },
    "if": {
      "properties": {
        "type": {
          "const": "DAT"
        }
      }
    },
    "then": {
      "properties": {
        "context": {
          "enum": ["Fragment", "Multifragment", "Bond", "Atom", "Group"]
        },
        "fieldName": {
          "type": "string"
        },
        "fieldValue": {
          "type": "string",
          "minLength": 1
        },
        "display": {
          "type": "boolean"
        },
        "placement": {
          "type": "boolean"
        },
        "bonds": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 0
          }
        }
      }
    }
  }
};
var func3 = Object.prototype.hasOwnProperty;
var func2 = typeof func2Module === "function" ? func2Module : typeof func2Module["default"] === "function" ? func2Module["default"] : func2Module["default"]["default"];
var pattern9 = new RegExp("(?:(?:^&|or)[0-9]+$)|(?:^abs$)", "u");
var pattern10 = new RegExp("^rg-[1-9]\\d*", "u");
function validate20(data) {
  var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref5$instancePath = _ref5.instancePath,
    instancePath = _ref5$instancePath === void 0 ? "" : _ref5$instancePath;
    _ref5.parentData;
    _ref5.parentDataProperty;
    _ref5.rootData;
  var vErrors = null;
  var errors = 0;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.atoms === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "atoms"
        },
        message: "must have required property '" + "atoms" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.stereoFlagPosition !== undefined) {
      var data0 = data.stereoFlagPosition;
      if (data0 && _typeof(data0) == "object" && !Array.isArray(data0)) {
        if (data0.x === undefined) {
          var err1 = {
            instancePath: instancePath + "/stereoFlagPosition",
            schemaPath: "#/properties/stereoFlagPosition/required",
            keyword: "required",
            params: {
              missingProperty: "x"
            },
            message: "must have required property '" + "x" + "'"
          };
          if (vErrors === null) {
            vErrors = [err1];
          } else {
            vErrors.push(err1);
          }
          errors++;
        }
        if (data0.y === undefined) {
          var err2 = {
            instancePath: instancePath + "/stereoFlagPosition",
            schemaPath: "#/properties/stereoFlagPosition/required",
            keyword: "required",
            params: {
              missingProperty: "y"
            },
            message: "must have required property '" + "y" + "'"
          };
          if (vErrors === null) {
            vErrors = [err2];
          } else {
            vErrors.push(err2);
          }
          errors++;
        }
        if (data0.x !== undefined) {
          if (!(typeof data0.x == "number")) {
            var err3 = {
              instancePath: instancePath + "/stereoFlagPosition/x",
              schemaPath: "#/properties/stereoFlagPosition/properties/x/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err3];
            } else {
              vErrors.push(err3);
            }
            errors++;
          }
        }
        if (data0.y !== undefined) {
          if (!(typeof data0.y == "number")) {
            var err4 = {
              instancePath: instancePath + "/stereoFlagPosition/y",
              schemaPath: "#/properties/stereoFlagPosition/properties/y/type",
              keyword: "type",
              params: {
                type: "number"
              },
              message: "must be number"
            };
            if (vErrors === null) {
              vErrors = [err4];
            } else {
              vErrors.push(err4);
            }
            errors++;
          }
        }
      } else {
        var err5 = {
          instancePath: instancePath + "/stereoFlagPosition",
          schemaPath: "#/properties/stereoFlagPosition/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err5];
        } else {
          vErrors.push(err5);
        }
        errors++;
      }
    }
    if (data.properties !== undefined) {
      var data3 = data.properties;
      if (Array.isArray(data3)) {
        var len0 = data3.length;
        for (var i0 = 0; i0 < len0; i0++) {
          var data4 = data3[i0];
          if (data4 && _typeof(data4) == "object" && !Array.isArray(data4)) {
            if (data4.key !== undefined) {
              if (typeof data4.key !== "string") {
                var err6 = {
                  instancePath: instancePath + "/properties/" + i0 + "/key",
                  schemaPath: "#/properties/properties/items/properties/key/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err6];
                } else {
                  vErrors.push(err6);
                }
                errors++;
              }
            }
            if (data4.value !== undefined) {
              if (typeof data4.value !== "string") {
                var err7 = {
                  instancePath: instancePath + "/properties/" + i0 + "/value",
                  schemaPath: "#/properties/properties/items/properties/value/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err7];
                } else {
                  vErrors.push(err7);
                }
                errors++;
              }
            }
          } else {
            var err8 = {
              instancePath: instancePath + "/properties/" + i0,
              schemaPath: "#/properties/properties/items/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err8];
            } else {
              vErrors.push(err8);
            }
            errors++;
          }
        }
      } else {
        var err9 = {
          instancePath: instancePath + "/properties",
          schemaPath: "#/properties/properties/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err9];
        } else {
          vErrors.push(err9);
        }
        errors++;
      }
    }
    if (data.atoms !== undefined) {
      var data7 = data.atoms;
      if (Array.isArray(data7)) {
        var len1 = data7.length;
        for (var i1 = 0; i1 < len1; i1++) {
          var data8 = data7[i1];
          var _errs18 = errors;
          var valid7 = false;
          var passing0 = null;
          var _errs19 = errors;
          if (data8 && _typeof(data8) == "object" && !Array.isArray(data8)) {
            if (data8.label === undefined) {
              var err10 = {
                instancePath: instancePath + "/atoms/" + i1,
                schemaPath: "#/definitions/atom/required",
                keyword: "required",
                params: {
                  missingProperty: "label"
                },
                message: "must have required property '" + "label" + "'"
              };
              if (vErrors === null) {
                vErrors = [err10];
              } else {
                vErrors.push(err10);
              }
              errors++;
            }
            for (var key0 in data8) {
              if (!func3.call(schema30.properties, key0)) {
                var err11 = {
                  instancePath: instancePath + "/atoms/" + i1,
                  schemaPath: "#/definitions/atom/additionalProperties",
                  keyword: "additionalProperties",
                  params: {
                    additionalProperty: key0
                  },
                  message: "must NOT have additional properties"
                };
                if (vErrors === null) {
                  vErrors = [err11];
                } else {
                  vErrors.push(err11);
                }
                errors++;
              }
            }
            if (data8.label !== undefined) {
              if (typeof data8.label !== "string") {
                var err12 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/label",
                  schemaPath: "#/definitions/atom/properties/label/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err12];
                } else {
                  vErrors.push(err12);
                }
                errors++;
              }
            }
            if (data8.alias !== undefined) {
              if (typeof data8.alias !== "string") {
                var err13 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/alias",
                  schemaPath: "#/definitions/atom/properties/alias/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err13];
                } else {
                  vErrors.push(err13);
                }
                errors++;
              }
            }
            if (data8.location !== undefined) {
              var data11 = data8.location;
              if (Array.isArray(data11)) {
                if (data11.length > 3) {
                  var err14 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/location",
                    schemaPath: "#/definitions/atom/properties/location/maxItems",
                    keyword: "maxItems",
                    params: {
                      limit: 3
                    },
                    message: "must NOT have more than 3 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err14];
                  } else {
                    vErrors.push(err14);
                  }
                  errors++;
                }
                if (data11.length < 2) {
                  var err15 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/location",
                    schemaPath: "#/definitions/atom/properties/location/minItems",
                    keyword: "minItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have fewer than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err15];
                  } else {
                    vErrors.push(err15);
                  }
                  errors++;
                }
                var len2 = data11.length;
                for (var i2 = 0; i2 < len2; i2++) {
                  if (!(typeof data11[i2] == "number")) {
                    var err16 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/location/" + i2,
                      schemaPath: "#/definitions/atom/properties/location/items/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err16];
                    } else {
                      vErrors.push(err16);
                    }
                    errors++;
                  }
                }
              } else {
                var err17 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/location",
                  schemaPath: "#/definitions/atom/properties/location/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err17];
                } else {
                  vErrors.push(err17);
                }
                errors++;
              }
            }
            if (data8.selected !== undefined) {
              if (typeof data8.selected !== "boolean") {
                var err18 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/selected",
                  schemaPath: "#/definitions/atom/properties/selected/type",
                  keyword: "type",
                  params: {
                    type: "boolean"
                  },
                  message: "must be boolean"
                };
                if (vErrors === null) {
                  vErrors = [err18];
                } else {
                  vErrors.push(err18);
                }
                errors++;
              }
            }
            if (data8.charge !== undefined) {
              var data14 = data8.charge;
              if (!(typeof data14 == "number" && !(data14 % 1) && !isNaN(data14))) {
                var err19 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/charge",
                  schemaPath: "#/definitions/atom/properties/charge/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err19];
                } else {
                  vErrors.push(err19);
                }
                errors++;
              }
              if (typeof data14 == "number") {
                if (data14 > 1000 || isNaN(data14)) {
                  var err20 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/charge",
                    schemaPath: "#/definitions/atom/properties/charge/maximum",
                    keyword: "maximum",
                    params: {
                      comparison: "<=",
                      limit: 1000
                    },
                    message: "must be <= 1000"
                  };
                  if (vErrors === null) {
                    vErrors = [err20];
                  } else {
                    vErrors.push(err20);
                  }
                  errors++;
                }
                if (data14 < -1000 || isNaN(data14)) {
                  var err21 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/charge",
                    schemaPath: "#/definitions/atom/properties/charge/minimum",
                    keyword: "minimum",
                    params: {
                      comparison: ">=",
                      limit: -1000
                    },
                    message: "must be >= -1000"
                  };
                  if (vErrors === null) {
                    vErrors = [err21];
                  } else {
                    vErrors.push(err21);
                  }
                  errors++;
                }
              }
            }
            if (data8.explicitValence !== undefined) {
              var data15 = data8.explicitValence;
              if (!(typeof data15 == "number" && !(data15 % 1) && !isNaN(data15))) {
                var err22 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/explicitValence",
                  schemaPath: "#/definitions/atom/properties/explicitValence/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err22];
                } else {
                  vErrors.push(err22);
                }
                errors++;
              }
              if (!(data15 === -1 || data15 === 0 || data15 === 1 || data15 === 2 || data15 === 3 || data15 === 4 || data15 === 5 || data15 === 6 || data15 === 7 || data15 === 8 || data15 === 9 || data15 === 10 || data15 === 11 || data15 === 12)) {
                var err23 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/explicitValence",
                  schemaPath: "#/definitions/atom/properties/explicitValence/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.explicitValence["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err23];
                } else {
                  vErrors.push(err23);
                }
                errors++;
              }
            }
            if (data8.isotope !== undefined) {
              var data16 = data8.isotope;
              if (!(typeof data16 == "number" && !(data16 % 1) && !isNaN(data16))) {
                var err24 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/isotope",
                  schemaPath: "#/definitions/atom/properties/isotope/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err24];
                } else {
                  vErrors.push(err24);
                }
                errors++;
              }
              if (typeof data16 == "number") {
                if (data16 > 1000 || isNaN(data16)) {
                  var err25 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/isotope",
                    schemaPath: "#/definitions/atom/properties/isotope/maximum",
                    keyword: "maximum",
                    params: {
                      comparison: "<=",
                      limit: 1000
                    },
                    message: "must be <= 1000"
                  };
                  if (vErrors === null) {
                    vErrors = [err25];
                  } else {
                    vErrors.push(err25);
                  }
                  errors++;
                }
                if (data16 < 0 || isNaN(data16)) {
                  var err26 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/isotope",
                    schemaPath: "#/definitions/atom/properties/isotope/minimum",
                    keyword: "minimum",
                    params: {
                      comparison: ">=",
                      limit: 0
                    },
                    message: "must be >= 0"
                  };
                  if (vErrors === null) {
                    vErrors = [err26];
                  } else {
                    vErrors.push(err26);
                  }
                  errors++;
                }
              }
            }
            if (data8.radical !== undefined) {
              var data17 = data8.radical;
              if (!(typeof data17 == "number" && !(data17 % 1) && !isNaN(data17))) {
                var err27 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/radical",
                  schemaPath: "#/definitions/atom/properties/radical/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err27];
                } else {
                  vErrors.push(err27);
                }
                errors++;
              }
              if (!(data17 === 0 || data17 === 2 || data17 === 1 || data17 === 3)) {
                var err28 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/radical",
                  schemaPath: "#/definitions/atom/properties/radical/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.radical["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err28];
                } else {
                  vErrors.push(err28);
                }
                errors++;
              }
            }
            if (data8.attachmentPoints !== undefined) {
              var data18 = data8.attachmentPoints;
              if (!(typeof data18 == "number" && !(data18 % 1) && !isNaN(data18))) {
                var err29 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                  schemaPath: "#/definitions/atom/properties/attachmentPoints/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err29];
                } else {
                  vErrors.push(err29);
                }
                errors++;
              }
              if (!(data18 === 0 || data18 === 1 || data18 === 2 || data18 === 3)) {
                var err30 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                  schemaPath: "#/definitions/atom/properties/attachmentPoints/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.attachmentPoints["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err30];
                } else {
                  vErrors.push(err30);
                }
                errors++;
              }
            }
            if (data8.stereoLabel !== undefined) {
              var data19 = data8.stereoLabel;
              if (typeof data19 === "string") {
                if (!pattern9.test(data19)) {
                  var err31 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/stereoLabel",
                    schemaPath: "#/definitions/atom/properties/stereoLabel/pattern",
                    keyword: "pattern",
                    params: {
                      pattern: "(?:(?:^&|or)[0-9]+$)|(?:^abs$)"
                    },
                    message: "must match pattern \"" + "(?:(?:^&|or)[0-9]+$)|(?:^abs$)" + "\""
                  };
                  if (vErrors === null) {
                    vErrors = [err31];
                  } else {
                    vErrors.push(err31);
                  }
                  errors++;
                }
              } else {
                var err32 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/stereoLabel",
                  schemaPath: "#/definitions/atom/properties/stereoLabel/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err32];
                } else {
                  vErrors.push(err32);
                }
                errors++;
              }
            }
            if (data8.stereoParity !== undefined) {
              var data20 = data8.stereoParity;
              if (!(typeof data20 == "number" && !(data20 % 1) && !isNaN(data20))) {
                var err33 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/stereoParity",
                  schemaPath: "#/definitions/atom/properties/stereoParity/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err33];
                } else {
                  vErrors.push(err33);
                }
                errors++;
              }
              if (!(data20 === 0 || data20 === 1 || data20 === 2 || data20 === 3)) {
                var err34 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/stereoParity",
                  schemaPath: "#/definitions/atom/properties/stereoParity/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.stereoParity["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err34];
                } else {
                  vErrors.push(err34);
                }
                errors++;
              }
            }
            if (data8.ringBondCount !== undefined) {
              var data21 = data8.ringBondCount;
              if (!(typeof data21 == "number" && !(data21 % 1) && !isNaN(data21))) {
                var err35 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/ringBondCount",
                  schemaPath: "#/definitions/atom/properties/ringBondCount/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err35];
                } else {
                  vErrors.push(err35);
                }
                errors++;
              }
              if (!(data21 === 0 || data21 === -2 || data21 === -1 || data21 === 2 || data21 === 3 || data21 === 4 || data21 === 5 || data21 === 6 || data21 === 7 || data21 === 8 || data21 === 9)) {
                var err36 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/ringBondCount",
                  schemaPath: "#/definitions/atom/properties/ringBondCount/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.ringBondCount["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err36];
                } else {
                  vErrors.push(err36);
                }
                errors++;
              }
            }
            if (data8.substitutionCount !== undefined) {
              var data22 = data8.substitutionCount;
              if (!(typeof data22 == "number" && !(data22 % 1) && !isNaN(data22))) {
                var err37 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/substitutionCount",
                  schemaPath: "#/definitions/atom/properties/substitutionCount/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err37];
                } else {
                  vErrors.push(err37);
                }
                errors++;
              }
              if (!(data22 === 0 || data22 === -2 || data22 === -1 || data22 === 1 || data22 === 2 || data22 === 3 || data22 === 4 || data22 === 5 || data22 === 6 || data22 === 7 || data22 === 8 || data22 === 9)) {
                var err38 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/substitutionCount",
                  schemaPath: "#/definitions/atom/properties/substitutionCount/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.substitutionCount["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err38];
                } else {
                  vErrors.push(err38);
                }
                errors++;
              }
            }
            if (data8.unsaturatedAtom !== undefined) {
              if (typeof data8.unsaturatedAtom !== "boolean") {
                var err39 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/unsaturatedAtom",
                  schemaPath: "#/definitions/atom/properties/unsaturatedAtom/type",
                  keyword: "type",
                  params: {
                    type: "boolean"
                  },
                  message: "must be boolean"
                };
                if (vErrors === null) {
                  vErrors = [err39];
                } else {
                  vErrors.push(err39);
                }
                errors++;
              }
            }
            if (data8.hCount !== undefined) {
              var data24 = data8.hCount;
              if (!(typeof data24 == "number" && !(data24 % 1) && !isNaN(data24))) {
                var err40 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/hCount",
                  schemaPath: "#/definitions/atom/properties/hCount/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err40];
                } else {
                  vErrors.push(err40);
                }
                errors++;
              }
              if (!(data24 === -1 || data24 === 0 || data24 === 1 || data24 === 2 || data24 === 3 || data24 === 4 || data24 === 5 || data24 === 6 || data24 === 7 || data24 === 8 || data24 === 9 || data24 === 10)) {
                var err41 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/hCount",
                  schemaPath: "#/definitions/atom/properties/hCount/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.hCount["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err41];
                } else {
                  vErrors.push(err41);
                }
                errors++;
              }
            }
            if (data8.implicitHCount !== undefined) {
              var data25 = data8.implicitHCount;
              if (!(typeof data25 == "number" && !(data25 % 1) && !isNaN(data25))) {
                var err42 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/implicitHCount",
                  schemaPath: "#/definitions/atom/properties/implicitHCount/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err42];
                } else {
                  vErrors.push(err42);
                }
                errors++;
              }
              if (!(data25 === 0 || data25 === 1 || data25 === 2 || data25 === 3 || data25 === 4 || data25 === 5 || data25 === 6 || data25 === 7 || data25 === 8 || data25 === 9)) {
                var err43 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/implicitHCount",
                  schemaPath: "#/definitions/atom/properties/implicitHCount/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.implicitHCount["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err43];
                } else {
                  vErrors.push(err43);
                }
                errors++;
              }
            }
            if (data8.mapping !== undefined) {
              var data26 = data8.mapping;
              if (!(typeof data26 == "number" && !(data26 % 1) && !isNaN(data26))) {
                var err44 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/mapping",
                  schemaPath: "#/definitions/atom/properties/mapping/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err44];
                } else {
                  vErrors.push(err44);
                }
                errors++;
              }
              if (typeof data26 == "number") {
                if (data26 < 0 || isNaN(data26)) {
                  var err45 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/mapping",
                    schemaPath: "#/definitions/atom/properties/mapping/minimum",
                    keyword: "minimum",
                    params: {
                      comparison: ">=",
                      limit: 0
                    },
                    message: "must be >= 0"
                  };
                  if (vErrors === null) {
                    vErrors = [err45];
                  } else {
                    vErrors.push(err45);
                  }
                  errors++;
                }
              }
            }
            if (data8.invRet !== undefined) {
              var data27 = data8.invRet;
              if (!(typeof data27 == "number" && !(data27 % 1) && !isNaN(data27))) {
                var err46 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/invRet",
                  schemaPath: "#/definitions/atom/properties/invRet/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err46];
                } else {
                  vErrors.push(err46);
                }
                errors++;
              }
              if (!(data27 === 0 || data27 === 1 || data27 === 2)) {
                var err47 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/invRet",
                  schemaPath: "#/definitions/atom/properties/invRet/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.invRet["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err47];
                } else {
                  vErrors.push(err47);
                }
                errors++;
              }
            }
            if (data8.exactChangeFlag !== undefined) {
              if (typeof data8.exactChangeFlag !== "boolean") {
                var err48 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/exactChangeFlag",
                  schemaPath: "#/definitions/atom/properties/exactChangeFlag/type",
                  keyword: "type",
                  params: {
                    type: "boolean"
                  },
                  message: "must be boolean"
                };
                if (vErrors === null) {
                  vErrors = [err48];
                } else {
                  vErrors.push(err48);
                }
                errors++;
              }
            }
            if (data8.cip !== undefined) {
              var data29 = data8.cip;
              if (typeof data29 !== "string") {
                var err49 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/cip",
                  schemaPath: "#/definitions/atom/properties/cip/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err49];
                } else {
                  vErrors.push(err49);
                }
                errors++;
              }
              if (!(data29 === "R" || data29 === "S" || data29 === "r" || data29 === "s")) {
                var err50 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/cip",
                  schemaPath: "#/definitions/atom/properties/cip/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema30.properties.cip["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err50];
                } else {
                  vErrors.push(err50);
                }
                errors++;
              }
            }
            if (data8.queryProperties !== undefined) {
              var data30 = data8.queryProperties;
              if (data30 && _typeof(data30) == "object" && !Array.isArray(data30)) {
                if (data30.aromaticity !== undefined) {
                  var data31 = data30.aromaticity;
                  if (typeof data31 !== "string") {
                    var err51 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/aromaticity",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/aromaticity/type",
                      keyword: "type",
                      params: {
                        type: "string"
                      },
                      message: "must be string"
                    };
                    if (vErrors === null) {
                      vErrors = [err51];
                    } else {
                      vErrors.push(err51);
                    }
                    errors++;
                  }
                  if (!(data31 === "aromatic" || data31 === "aliphatic")) {
                    var err52 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/aromaticity",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/aromaticity/enum",
                      keyword: "enum",
                      params: {
                        allowedValues: schema30.properties.queryProperties.properties.aromaticity["enum"]
                      },
                      message: "must be equal to one of the allowed values"
                    };
                    if (vErrors === null) {
                      vErrors = [err52];
                    } else {
                      vErrors.push(err52);
                    }
                    errors++;
                  }
                }
                if (data30.ringMembership !== undefined) {
                  var data32 = data30.ringMembership;
                  if (!(typeof data32 == "number" && !(data32 % 1) && !isNaN(data32))) {
                    var err53 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringMembership",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringMembership/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err53];
                    } else {
                      vErrors.push(err53);
                    }
                    errors++;
                  }
                  if (typeof data32 == "number") {
                    if (data32 > 9 || isNaN(data32)) {
                      var err54 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringMembership",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringMembership/maximum",
                        keyword: "maximum",
                        params: {
                          comparison: "<=",
                          limit: 9
                        },
                        message: "must be <= 9"
                      };
                      if (vErrors === null) {
                        vErrors = [err54];
                      } else {
                        vErrors.push(err54);
                      }
                      errors++;
                    }
                    if (data32 < 0 || isNaN(data32)) {
                      var err55 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringMembership",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringMembership/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err55];
                      } else {
                        vErrors.push(err55);
                      }
                      errors++;
                    }
                  }
                }
                if (data30.ringSize !== undefined) {
                  var data33 = data30.ringSize;
                  if (!(typeof data33 == "number" && !(data33 % 1) && !isNaN(data33))) {
                    var err56 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringSize",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringSize/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err56];
                    } else {
                      vErrors.push(err56);
                    }
                    errors++;
                  }
                  if (typeof data33 == "number") {
                    if (data33 > 9 || isNaN(data33)) {
                      var err57 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringSize",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringSize/maximum",
                        keyword: "maximum",
                        params: {
                          comparison: "<=",
                          limit: 9
                        },
                        message: "must be <= 9"
                      };
                      if (vErrors === null) {
                        vErrors = [err57];
                      } else {
                        vErrors.push(err57);
                      }
                      errors++;
                    }
                    if (data33 < 0 || isNaN(data33)) {
                      var err58 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/ringSize",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/ringSize/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err58];
                      } else {
                        vErrors.push(err58);
                      }
                      errors++;
                    }
                  }
                }
                if (data30.connectivity !== undefined) {
                  var data34 = data30.connectivity;
                  if (!(typeof data34 == "number" && !(data34 % 1) && !isNaN(data34))) {
                    var err59 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/connectivity",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/connectivity/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err59];
                    } else {
                      vErrors.push(err59);
                    }
                    errors++;
                  }
                  if (typeof data34 == "number") {
                    if (data34 > 9 || isNaN(data34)) {
                      var err60 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/connectivity",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/connectivity/maximum",
                        keyword: "maximum",
                        params: {
                          comparison: "<=",
                          limit: 9
                        },
                        message: "must be <= 9"
                      };
                      if (vErrors === null) {
                        vErrors = [err60];
                      } else {
                        vErrors.push(err60);
                      }
                      errors++;
                    }
                    if (data34 < 0 || isNaN(data34)) {
                      var err61 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/connectivity",
                        schemaPath: "#/definitions/atom/properties/queryProperties/properties/connectivity/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err61];
                      } else {
                        vErrors.push(err61);
                      }
                      errors++;
                    }
                  }
                }
                if (data30.chirality !== undefined) {
                  var data35 = data30.chirality;
                  if (typeof data35 !== "string") {
                    var err62 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/chirality",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/chirality/type",
                      keyword: "type",
                      params: {
                        type: "string"
                      },
                      message: "must be string"
                    };
                    if (vErrors === null) {
                      vErrors = [err62];
                    } else {
                      vErrors.push(err62);
                    }
                    errors++;
                  }
                  if (!(data35 === "clockwise" || data35 === "anticlockwise")) {
                    var err63 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/chirality",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/chirality/enum",
                      keyword: "enum",
                      params: {
                        allowedValues: schema30.properties.queryProperties.properties.chirality["enum"]
                      },
                      message: "must be equal to one of the allowed values"
                    };
                    if (vErrors === null) {
                      vErrors = [err63];
                    } else {
                      vErrors.push(err63);
                    }
                    errors++;
                  }
                }
                if (data30.customQuery !== undefined) {
                  if (typeof data30.customQuery !== "string") {
                    var err64 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/queryProperties/customQuery",
                      schemaPath: "#/definitions/atom/properties/queryProperties/properties/customQuery/type",
                      keyword: "type",
                      params: {
                        type: "string"
                      },
                      message: "must be string"
                    };
                    if (vErrors === null) {
                      vErrors = [err64];
                    } else {
                      vErrors.push(err64);
                    }
                    errors++;
                  }
                }
              } else {
                var err65 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/queryProperties",
                  schemaPath: "#/definitions/atom/properties/queryProperties/type",
                  keyword: "type",
                  params: {
                    type: "object"
                  },
                  message: "must be object"
                };
                if (vErrors === null) {
                  vErrors = [err65];
                } else {
                  vErrors.push(err65);
                }
                errors++;
              }
            }
          } else {
            var err66 = {
              instancePath: instancePath + "/atoms/" + i1,
              schemaPath: "#/definitions/atom/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err66];
            } else {
              vErrors.push(err66);
            }
            errors++;
          }
          var _valid0 = _errs19 === errors;
          if (_valid0) {
            valid7 = true;
            passing0 = 0;
          }
          var _errs79 = errors;
          if (data8 && _typeof(data8) == "object" && !Array.isArray(data8)) {
            if (data8.type === undefined) {
              var err67 = {
                instancePath: instancePath + "/atoms/" + i1,
                schemaPath: "#/definitions/rsite/required",
                keyword: "required",
                params: {
                  missingProperty: "type"
                },
                message: "must have required property '" + "type" + "'"
              };
              if (vErrors === null) {
                vErrors = [err67];
              } else {
                vErrors.push(err67);
              }
              errors++;
            }
            if (data8.location === undefined) {
              var err68 = {
                instancePath: instancePath + "/atoms/" + i1,
                schemaPath: "#/definitions/rsite/required",
                keyword: "required",
                params: {
                  missingProperty: "location"
                },
                message: "must have required property '" + "location" + "'"
              };
              if (vErrors === null) {
                vErrors = [err68];
              } else {
                vErrors.push(err68);
              }
              errors++;
            }
            if (data8.type !== undefined) {
              if ("rg-label" !== data8.type) {
                var err69 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/type",
                  schemaPath: "#/definitions/rsite/properties/type/const",
                  keyword: "const",
                  params: {
                    allowedValue: "rg-label"
                  },
                  message: "must be equal to constant"
                };
                if (vErrors === null) {
                  vErrors = [err69];
                } else {
                  vErrors.push(err69);
                }
                errors++;
              }
            }
            if (data8.location !== undefined) {
              var data38 = data8.location;
              if (Array.isArray(data38)) {
                if (data38.length > 3) {
                  var err70 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/location",
                    schemaPath: "#/definitions/rsite/properties/location/maxItems",
                    keyword: "maxItems",
                    params: {
                      limit: 3
                    },
                    message: "must NOT have more than 3 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err70];
                  } else {
                    vErrors.push(err70);
                  }
                  errors++;
                }
                if (data38.length < 2) {
                  var err71 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/location",
                    schemaPath: "#/definitions/rsite/properties/location/minItems",
                    keyword: "minItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have fewer than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err71];
                  } else {
                    vErrors.push(err71);
                  }
                  errors++;
                }
                var len3 = data38.length;
                for (var i3 = 0; i3 < len3; i3++) {
                  if (!(typeof data38[i3] == "number")) {
                    var err72 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/location/" + i3,
                      schemaPath: "#/definitions/rsite/properties/location/items/type",
                      keyword: "type",
                      params: {
                        type: "number"
                      },
                      message: "must be number"
                    };
                    if (vErrors === null) {
                      vErrors = [err72];
                    } else {
                      vErrors.push(err72);
                    }
                    errors++;
                  }
                }
              } else {
                var err73 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/location",
                  schemaPath: "#/definitions/rsite/properties/location/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err73];
                } else {
                  vErrors.push(err73);
                }
                errors++;
              }
            }
            if (data8.$refs !== undefined) {
              var data40 = data8.$refs;
              if (Array.isArray(data40)) {
                var len4 = data40.length;
                for (var i4 = 0; i4 < len4; i4++) {
                  var data41 = data40[i4];
                  if (typeof data41 === "string") {
                    if (!pattern10.test(data41)) {
                      var err74 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/$refs/" + i4,
                        schemaPath: "#/definitions/rsite/properties/%24refs/items/pattern",
                        keyword: "pattern",
                        params: {
                          pattern: "^rg-[1-9]\\d*"
                        },
                        message: "must match pattern \"" + "^rg-[1-9]\\d*" + "\""
                      };
                      if (vErrors === null) {
                        vErrors = [err74];
                      } else {
                        vErrors.push(err74);
                      }
                      errors++;
                    }
                  } else {
                    var err75 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/$refs/" + i4,
                      schemaPath: "#/definitions/rsite/properties/%24refs/items/type",
                      keyword: "type",
                      params: {
                        type: "string"
                      },
                      message: "must be string"
                    };
                    if (vErrors === null) {
                      vErrors = [err75];
                    } else {
                      vErrors.push(err75);
                    }
                    errors++;
                  }
                }
              } else {
                var err76 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/$refs",
                  schemaPath: "#/definitions/rsite/properties/%24refs/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err76];
                } else {
                  vErrors.push(err76);
                }
                errors++;
              }
            }
            if (data8.attachmentPoints !== undefined) {
              var data42 = data8.attachmentPoints;
              if (!(typeof data42 == "number" && !(data42 % 1) && !isNaN(data42))) {
                var err77 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                  schemaPath: "#/definitions/rsite/properties/attachmentPoints/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err77];
                } else {
                  vErrors.push(err77);
                }
                errors++;
              }
              if (!(data42 === 0 || data42 === 1 || data42 === 2 || data42 === 3)) {
                var err78 = {
                  instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                  schemaPath: "#/definitions/rsite/properties/attachmentPoints/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema31.properties.attachmentPoints["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err78];
                } else {
                  vErrors.push(err78);
                }
                errors++;
              }
            }
          } else {
            var err79 = {
              instancePath: instancePath + "/atoms/" + i1,
              schemaPath: "#/definitions/rsite/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err79];
            } else {
              vErrors.push(err79);
            }
            errors++;
          }
          var _valid0 = _errs79 === errors;
          if (_valid0 && valid7) {
            valid7 = false;
            passing0 = [passing0, 1];
          } else {
            if (_valid0) {
              valid7 = true;
              passing0 = 1;
            }
            var _errs93 = errors;
            if (data8 && _typeof(data8) == "object" && !Array.isArray(data8)) {
              if (data8.type === undefined) {
                var err80 = {
                  instancePath: instancePath + "/atoms/" + i1,
                  schemaPath: "#/definitions/atomlist/required",
                  keyword: "required",
                  params: {
                    missingProperty: "type"
                  },
                  message: "must have required property '" + "type" + "'"
                };
                if (vErrors === null) {
                  vErrors = [err80];
                } else {
                  vErrors.push(err80);
                }
                errors++;
              }
              if (data8.location === undefined) {
                var err81 = {
                  instancePath: instancePath + "/atoms/" + i1,
                  schemaPath: "#/definitions/atomlist/required",
                  keyword: "required",
                  params: {
                    missingProperty: "location"
                  },
                  message: "must have required property '" + "location" + "'"
                };
                if (vErrors === null) {
                  vErrors = [err81];
                } else {
                  vErrors.push(err81);
                }
                errors++;
              }
              if (data8.type !== undefined) {
                if (!(data8.type === "atom-list")) {
                  var err82 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/type",
                    schemaPath: "#/definitions/atomlist/properties/type/enum",
                    keyword: "enum",
                    params: {
                      allowedValues: schema32.properties.type["enum"]
                    },
                    message: "must be equal to one of the allowed values"
                  };
                  if (vErrors === null) {
                    vErrors = [err82];
                  } else {
                    vErrors.push(err82);
                  }
                  errors++;
                }
              }
              if (data8.notList !== undefined) {
                if (typeof data8.notList !== "boolean") {
                  var err83 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/notList",
                    schemaPath: "#/definitions/atomlist/properties/notList/type",
                    keyword: "type",
                    params: {
                      type: "boolean"
                    },
                    message: "must be boolean"
                  };
                  if (vErrors === null) {
                    vErrors = [err83];
                  } else {
                    vErrors.push(err83);
                  }
                  errors++;
                }
              }
              if (data8.location !== undefined) {
                var data45 = data8.location;
                if (Array.isArray(data45)) {
                  if (data45.length > 3) {
                    var err84 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/location",
                      schemaPath: "#/definitions/atomlist/properties/location/maxItems",
                      keyword: "maxItems",
                      params: {
                        limit: 3
                      },
                      message: "must NOT have more than 3 items"
                    };
                    if (vErrors === null) {
                      vErrors = [err84];
                    } else {
                      vErrors.push(err84);
                    }
                    errors++;
                  }
                  if (data45.length < 2) {
                    var err85 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/location",
                      schemaPath: "#/definitions/atomlist/properties/location/minItems",
                      keyword: "minItems",
                      params: {
                        limit: 2
                      },
                      message: "must NOT have fewer than 2 items"
                    };
                    if (vErrors === null) {
                      vErrors = [err85];
                    } else {
                      vErrors.push(err85);
                    }
                    errors++;
                  }
                  var len5 = data45.length;
                  for (var i5 = 0; i5 < len5; i5++) {
                    if (!(typeof data45[i5] == "number")) {
                      var err86 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/location/" + i5,
                        schemaPath: "#/definitions/atomlist/properties/location/items/type",
                        keyword: "type",
                        params: {
                          type: "number"
                        },
                        message: "must be number"
                      };
                      if (vErrors === null) {
                        vErrors = [err86];
                      } else {
                        vErrors.push(err86);
                      }
                      errors++;
                    }
                  }
                } else {
                  var err87 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/location",
                    schemaPath: "#/definitions/atomlist/properties/location/type",
                    keyword: "type",
                    params: {
                      type: "array"
                    },
                    message: "must be array"
                  };
                  if (vErrors === null) {
                    vErrors = [err87];
                  } else {
                    vErrors.push(err87);
                  }
                  errors++;
                }
              }
              if (data8.elements !== undefined) {
                var data47 = data8.elements;
                if (Array.isArray(data47)) {
                  if (data47.length < 1) {
                    var err88 = {
                      instancePath: instancePath + "/atoms/" + i1 + "/elements",
                      schemaPath: "#/definitions/atomlist/properties/elements/minItems",
                      keyword: "minItems",
                      params: {
                        limit: 1
                      },
                      message: "must NOT have fewer than 1 items"
                    };
                    if (vErrors === null) {
                      vErrors = [err88];
                    } else {
                      vErrors.push(err88);
                    }
                    errors++;
                  }
                  var len6 = data47.length;
                  for (var i6 = 0; i6 < len6; i6++) {
                    var data48 = data47[i6];
                    if (typeof data48 === "string") {
                      if (func2(data48) < 1) {
                        var err89 = {
                          instancePath: instancePath + "/atoms/" + i1 + "/elements/" + i6,
                          schemaPath: "#/definitions/atomlist/properties/elements/items/minLength",
                          keyword: "minLength",
                          params: {
                            limit: 1
                          },
                          message: "must NOT have fewer than 1 characters"
                        };
                        if (vErrors === null) {
                          vErrors = [err89];
                        } else {
                          vErrors.push(err89);
                        }
                        errors++;
                      }
                    } else {
                      var err90 = {
                        instancePath: instancePath + "/atoms/" + i1 + "/elements/" + i6,
                        schemaPath: "#/definitions/atomlist/properties/elements/items/type",
                        keyword: "type",
                        params: {
                          type: "string"
                        },
                        message: "must be string"
                      };
                      if (vErrors === null) {
                        vErrors = [err90];
                      } else {
                        vErrors.push(err90);
                      }
                      errors++;
                    }
                  }
                } else {
                  var err91 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/elements",
                    schemaPath: "#/definitions/atomlist/properties/elements/type",
                    keyword: "type",
                    params: {
                      type: "array"
                    },
                    message: "must be array"
                  };
                  if (vErrors === null) {
                    vErrors = [err91];
                  } else {
                    vErrors.push(err91);
                  }
                  errors++;
                }
              }
              if (data8.attachmentPoints !== undefined) {
                var data49 = data8.attachmentPoints;
                if (!(typeof data49 == "number" && !(data49 % 1) && !isNaN(data49))) {
                  var err92 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                    schemaPath: "#/definitions/atomlist/properties/attachmentPoints/type",
                    keyword: "type",
                    params: {
                      type: "integer"
                    },
                    message: "must be integer"
                  };
                  if (vErrors === null) {
                    vErrors = [err92];
                  } else {
                    vErrors.push(err92);
                  }
                  errors++;
                }
                if (!(data49 === 0 || data49 === 1 || data49 === 2 || data49 === 3)) {
                  var err93 = {
                    instancePath: instancePath + "/atoms/" + i1 + "/attachmentPoints",
                    schemaPath: "#/definitions/atomlist/properties/attachmentPoints/enum",
                    keyword: "enum",
                    params: {
                      allowedValues: schema32.properties.attachmentPoints["enum"]
                    },
                    message: "must be equal to one of the allowed values"
                  };
                  if (vErrors === null) {
                    vErrors = [err93];
                  } else {
                    vErrors.push(err93);
                  }
                  errors++;
                }
              }
            } else {
              var err94 = {
                instancePath: instancePath + "/atoms/" + i1,
                schemaPath: "#/definitions/atomlist/type",
                keyword: "type",
                params: {
                  type: "object"
                },
                message: "must be object"
              };
              if (vErrors === null) {
                vErrors = [err94];
              } else {
                vErrors.push(err94);
              }
              errors++;
            }
            var _valid0 = _errs93 === errors;
            if (_valid0 && valid7) {
              valid7 = false;
              passing0 = [passing0, 2];
            } else {
              if (_valid0) {
                valid7 = true;
                passing0 = 2;
              }
            }
          }
          if (!valid7) {
            var err95 = {
              instancePath: instancePath + "/atoms/" + i1,
              schemaPath: "#/properties/atoms/items/oneOf",
              keyword: "oneOf",
              params: {
                passingSchemas: passing0
              },
              message: "must match exactly one schema in oneOf"
            };
            if (vErrors === null) {
              vErrors = [err95];
            } else {
              vErrors.push(err95);
            }
            errors++;
          } else {
            errors = _errs18;
            if (vErrors !== null) {
              if (_errs18) {
                vErrors.length = _errs18;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        var err96 = {
          instancePath: instancePath + "/atoms",
          schemaPath: "#/properties/atoms/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err96];
        } else {
          vErrors.push(err96);
        }
        errors++;
      }
    }
    if (data.bonds !== undefined) {
      var data50 = data.bonds;
      if (Array.isArray(data50)) {
        var len7 = data50.length;
        for (var i7 = 0; i7 < len7; i7++) {
          var data51 = data50[i7];
          var _errs114 = errors;
          var valid28 = false;
          var passing1 = null;
          var _errs115 = errors;
          if (data51 && _typeof(data51) == "object" && !Array.isArray(data51)) {
            if (data51.type === undefined) {
              var err97 = {
                instancePath: instancePath + "/bonds/" + i7,
                schemaPath: "#/definitions/bond/oneOf/0/required",
                keyword: "required",
                params: {
                  missingProperty: "type"
                },
                message: "must have required property '" + "type" + "'"
              };
              if (vErrors === null) {
                vErrors = [err97];
              } else {
                vErrors.push(err97);
              }
              errors++;
            }
            if (data51.type !== undefined) {
              var data52 = data51.type;
              if (!(typeof data52 == "number" && !(data52 % 1) && !isNaN(data52))) {
                var err98 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/type",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/type/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err98];
                } else {
                  vErrors.push(err98);
                }
                errors++;
              }
              if (!(data52 === 1 || data52 === 2 || data52 === 3 || data52 === 4 || data52 === 5 || data52 === 6 || data52 === 7 || data52 === 8 || data52 === 9 || data52 === 10 || data52 === 11 || data52 === 12)) {
                var err99 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/type",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/type/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.oneOf[0].properties.type["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err99];
                } else {
                  vErrors.push(err99);
                }
                errors++;
              }
            }
            if (data51.stereo !== undefined) {
              var data53 = data51.stereo;
              if (!(typeof data53 == "number" && !(data53 % 1) && !isNaN(data53))) {
                var err100 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/stereo",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/stereo/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err100];
                } else {
                  vErrors.push(err100);
                }
                errors++;
              }
              if (!(data53 === 0 || data53 === 1 || data53 === 3 || data53 === 4 || data53 === 6)) {
                var err101 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/stereo",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/stereo/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.oneOf[0].properties.stereo["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err101];
                } else {
                  vErrors.push(err101);
                }
                errors++;
              }
            }
            if (data51.topology !== undefined) {
              var data54 = data51.topology;
              if (!(typeof data54 == "number" && !(data54 % 1) && !isNaN(data54))) {
                var err102 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/topology",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/topology/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err102];
                } else {
                  vErrors.push(err102);
                }
                errors++;
              }
              if (!(data54 === 0 || data54 === 1 || data54 === 2)) {
                var err103 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/topology",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/topology/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.oneOf[0].properties.topology["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err103];
                } else {
                  vErrors.push(err103);
                }
                errors++;
              }
            }
            if (data51.center !== undefined) {
              var data55 = data51.center;
              if (!(typeof data55 == "number" && !(data55 % 1) && !isNaN(data55))) {
                var err104 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/center",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/center/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err104];
                } else {
                  vErrors.push(err104);
                }
                errors++;
              }
              if (!(data55 === 0 || data55 === -1 || data55 === 1 || data55 === 2 || data55 === 4 || data55 === 8 || data55 === 12)) {
                var err105 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/center",
                  schemaPath: "#/definitions/bond/oneOf/0/properties/center/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.oneOf[0].properties.center["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err105];
                } else {
                  vErrors.push(err105);
                }
                errors++;
              }
            }
          }
          var _valid1 = _errs115 === errors;
          if (_valid1) {
            valid28 = true;
            passing1 = 0;
          }
          var _errs124 = errors;
          if (data51 && _typeof(data51) == "object" && !Array.isArray(data51)) {
            if (data51.customQuery === undefined) {
              var err106 = {
                instancePath: instancePath + "/bonds/" + i7,
                schemaPath: "#/definitions/bond/oneOf/1/required",
                keyword: "required",
                params: {
                  missingProperty: "customQuery"
                },
                message: "must have required property '" + "customQuery" + "'"
              };
              if (vErrors === null) {
                vErrors = [err106];
              } else {
                vErrors.push(err106);
              }
              errors++;
            }
            if (data51.customQuery !== undefined) {
              if (typeof data51.customQuery !== "string") {
                var err107 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/customQuery",
                  schemaPath: "#/definitions/bond/oneOf/1/properties/customQuery/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err107];
                } else {
                  vErrors.push(err107);
                }
                errors++;
              }
            }
          }
          var _valid1 = _errs124 === errors;
          if (_valid1 && valid28) {
            valid28 = false;
            passing1 = [passing1, 1];
          } else {
            if (_valid1) {
              valid28 = true;
              passing1 = 1;
            }
          }
          if (!valid28) {
            var err108 = {
              instancePath: instancePath + "/bonds/" + i7,
              schemaPath: "#/definitions/bond/oneOf",
              keyword: "oneOf",
              params: {
                passingSchemas: passing1
              },
              message: "must match exactly one schema in oneOf"
            };
            if (vErrors === null) {
              vErrors = [err108];
            } else {
              vErrors.push(err108);
            }
            errors++;
          } else {
            errors = _errs114;
            if (vErrors !== null) {
              if (_errs114) {
                vErrors.length = _errs114;
              } else {
                vErrors = null;
              }
            }
          }
          if (data51 && _typeof(data51) == "object" && !Array.isArray(data51)) {
            if (data51.atoms === undefined) {
              var err109 = {
                instancePath: instancePath + "/bonds/" + i7,
                schemaPath: "#/definitions/bond/required",
                keyword: "required",
                params: {
                  missingProperty: "atoms"
                },
                message: "must have required property '" + "atoms" + "'"
              };
              if (vErrors === null) {
                vErrors = [err109];
              } else {
                vErrors.push(err109);
              }
              errors++;
            }
            if (data51.atoms !== undefined) {
              var data57 = data51.atoms;
              if (Array.isArray(data57)) {
                if (data57.length > 2) {
                  var err110 = {
                    instancePath: instancePath + "/bonds/" + i7 + "/atoms",
                    schemaPath: "#/definitions/bond/properties/atoms/maxItems",
                    keyword: "maxItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have more than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err110];
                  } else {
                    vErrors.push(err110);
                  }
                  errors++;
                }
                if (data57.length < 2) {
                  var err111 = {
                    instancePath: instancePath + "/bonds/" + i7 + "/atoms",
                    schemaPath: "#/definitions/bond/properties/atoms/minItems",
                    keyword: "minItems",
                    params: {
                      limit: 2
                    },
                    message: "must NOT have fewer than 2 items"
                  };
                  if (vErrors === null) {
                    vErrors = [err111];
                  } else {
                    vErrors.push(err111);
                  }
                  errors++;
                }
                var len8 = data57.length;
                for (var i8 = 0; i8 < len8; i8++) {
                  var data58 = data57[i8];
                  if (!(typeof data58 == "number" && !(data58 % 1) && !isNaN(data58))) {
                    var err112 = {
                      instancePath: instancePath + "/bonds/" + i7 + "/atoms/" + i8,
                      schemaPath: "#/definitions/bond/properties/atoms/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err112];
                    } else {
                      vErrors.push(err112);
                    }
                    errors++;
                  }
                  if (typeof data58 == "number") {
                    if (data58 < 0 || isNaN(data58)) {
                      var err113 = {
                        instancePath: instancePath + "/bonds/" + i7 + "/atoms/" + i8,
                        schemaPath: "#/definitions/bond/properties/atoms/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err113];
                      } else {
                        vErrors.push(err113);
                      }
                      errors++;
                    }
                  }
                }
                var i9 = data57.length;
                var j0 = void 0;
                if (i9 > 1) {
                  var indices0 = {};
                  for (; i9--;) {
                    var item0 = data57[i9];
                    if (!(typeof item0 == "number" && !(item0 % 1) && !isNaN(item0))) {
                      continue;
                    }
                    if (typeof indices0[item0] == "number") {
                      j0 = indices0[item0];
                      var err114 = {
                        instancePath: instancePath + "/bonds/" + i7 + "/atoms",
                        schemaPath: "#/definitions/bond/properties/atoms/uniqueItems",
                        keyword: "uniqueItems",
                        params: {
                          i: i9,
                          j: j0
                        },
                        message: "must NOT have duplicate items (items ## " + j0 + " and " + i9 + " are identical)"
                      };
                      if (vErrors === null) {
                        vErrors = [err114];
                      } else {
                        vErrors.push(err114);
                      }
                      errors++;
                      break;
                    }
                    indices0[item0] = i9;
                  }
                }
              } else {
                var err115 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/atoms",
                  schemaPath: "#/definitions/bond/properties/atoms/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err115];
                } else {
                  vErrors.push(err115);
                }
                errors++;
              }
            }
            if (data51.selected !== undefined) {
              if (typeof data51.selected !== "boolean") {
                var err116 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/selected",
                  schemaPath: "#/definitions/bond/properties/selected/type",
                  keyword: "type",
                  params: {
                    type: "boolean"
                  },
                  message: "must be boolean"
                };
                if (vErrors === null) {
                  vErrors = [err116];
                } else {
                  vErrors.push(err116);
                }
                errors++;
              }
            }
            if (data51.stereobox !== undefined) {
              var data60 = data51.stereobox;
              if (!(typeof data60 == "number" && !(data60 % 1) && !isNaN(data60))) {
                var err117 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/stereobox",
                  schemaPath: "#/definitions/bond/properties/stereobox/type",
                  keyword: "type",
                  params: {
                    type: "integer"
                  },
                  message: "must be integer"
                };
                if (vErrors === null) {
                  vErrors = [err117];
                } else {
                  vErrors.push(err117);
                }
                errors++;
              }
              if (!(data60 === 0 || data60 === 1)) {
                var err118 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/stereobox",
                  schemaPath: "#/definitions/bond/properties/stereobox/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.properties.stereobox["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err118];
                } else {
                  vErrors.push(err118);
                }
                errors++;
              }
            }
            if (data51.cip !== undefined) {
              var data61 = data51.cip;
              if (typeof data61 !== "string") {
                var err119 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/cip",
                  schemaPath: "#/definitions/bond/properties/cip/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err119];
                } else {
                  vErrors.push(err119);
                }
                errors++;
              }
              if (!(data61 === "Z" || data61 === "E")) {
                var err120 = {
                  instancePath: instancePath + "/bonds/" + i7 + "/cip",
                  schemaPath: "#/definitions/bond/properties/cip/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema33.properties.cip["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err120];
                } else {
                  vErrors.push(err120);
                }
                errors++;
              }
            }
          } else {
            var err121 = {
              instancePath: instancePath + "/bonds/" + i7,
              schemaPath: "#/definitions/bond/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err121];
            } else {
              vErrors.push(err121);
            }
            errors++;
          }
        }
      } else {
        var err122 = {
          instancePath: instancePath + "/bonds",
          schemaPath: "#/properties/bonds/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err122];
        } else {
          vErrors.push(err122);
        }
        errors++;
      }
    }
    if (data.highlight !== undefined) {
      var data62 = data.highlight;
      if (Array.isArray(data62)) {
        if (data62.length > 2) {
          var err123 = {
            instancePath: instancePath + "/highlight",
            schemaPath: "#/definitions/subset/maxItems",
            keyword: "maxItems",
            params: {
              limit: 2
            },
            message: "must NOT have more than 2 items"
          };
          if (vErrors === null) {
            vErrors = [err123];
          } else {
            vErrors.push(err123);
          }
          errors++;
        }
        if (data62.length < 1) {
          var err124 = {
            instancePath: instancePath + "/highlight",
            schemaPath: "#/definitions/subset/minItems",
            keyword: "minItems",
            params: {
              limit: 1
            },
            message: "must NOT have fewer than 1 items"
          };
          if (vErrors === null) {
            vErrors = [err124];
          } else {
            vErrors.push(err124);
          }
          errors++;
        }
        var len9 = data62.length;
        for (var i10 = 0; i10 < len9; i10++) {
          var data63 = data62[i10];
          var _errs141 = errors;
          var valid38 = false;
          var passing2 = null;
          var _errs142 = errors;
          if (data63 && _typeof(data63) == "object" && !Array.isArray(data63)) {
            if (data63.entityType === undefined) {
              var err125 = {
                instancePath: instancePath + "/highlight/" + i10,
                schemaPath: "#/definitions/subset/items/oneOf/0/required",
                keyword: "required",
                params: {
                  missingProperty: "entityType"
                },
                message: "must have required property '" + "entityType" + "'"
              };
              if (vErrors === null) {
                vErrors = [err125];
              } else {
                vErrors.push(err125);
              }
              errors++;
            }
            if (data63.items === undefined) {
              var err126 = {
                instancePath: instancePath + "/highlight/" + i10,
                schemaPath: "#/definitions/subset/items/oneOf/0/required",
                keyword: "required",
                params: {
                  missingProperty: "items"
                },
                message: "must have required property '" + "items" + "'"
              };
              if (vErrors === null) {
                vErrors = [err126];
              } else {
                vErrors.push(err126);
              }
              errors++;
            }
            if (data63.entityType !== undefined) {
              var data64 = data63.entityType;
              if (typeof data64 !== "string") {
                var err127 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/entityType/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err127];
                } else {
                  vErrors.push(err127);
                }
                errors++;
              }
              if ("atoms" !== data64) {
                var err128 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/entityType/const",
                  keyword: "const",
                  params: {
                    allowedValue: "atoms"
                  },
                  message: "must be equal to constant"
                };
                if (vErrors === null) {
                  vErrors = [err128];
                } else {
                  vErrors.push(err128);
                }
                errors++;
              }
            }
            if (data63.items !== undefined) {
              var data65 = data63.items;
              if (Array.isArray(data65)) {
                var len10 = data65.length;
                for (var i11 = 0; i11 < len10; i11++) {
                  var data66 = data65[i11];
                  if (!(typeof data66 == "number" && !(data66 % 1) && !isNaN(data66))) {
                    var err129 = {
                      instancePath: instancePath + "/highlight/" + i10 + "/items/" + i11,
                      schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err129];
                    } else {
                      vErrors.push(err129);
                    }
                    errors++;
                  }
                  if (typeof data66 == "number") {
                    if (data66 < 0 || isNaN(data66)) {
                      var err130 = {
                        instancePath: instancePath + "/highlight/" + i10 + "/items/" + i11,
                        schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err130];
                      } else {
                        vErrors.push(err130);
                      }
                      errors++;
                    }
                  }
                }
                var i12 = data65.length;
                var j1 = void 0;
                if (i12 > 1) {
                  var indices1 = {};
                  for (; i12--;) {
                    var item1 = data65[i12];
                    if (!(typeof item1 == "number" && !(item1 % 1) && !isNaN(item1))) {
                      continue;
                    }
                    if (typeof indices1[item1] == "number") {
                      j1 = indices1[item1];
                      var err131 = {
                        instancePath: instancePath + "/highlight/" + i10 + "/items",
                        schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/uniqueItems",
                        keyword: "uniqueItems",
                        params: {
                          i: i12,
                          j: j1
                        },
                        message: "must NOT have duplicate items (items ## " + j1 + " and " + i12 + " are identical)"
                      };
                      if (vErrors === null) {
                        vErrors = [err131];
                      } else {
                        vErrors.push(err131);
                      }
                      errors++;
                      break;
                    }
                    indices1[item1] = i12;
                  }
                }
              } else {
                var err132 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/items",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err132];
                } else {
                  vErrors.push(err132);
                }
                errors++;
              }
            }
          } else {
            var err133 = {
              instancePath: instancePath + "/highlight/" + i10,
              schemaPath: "#/definitions/subset/items/oneOf/0/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err133];
            } else {
              vErrors.push(err133);
            }
            errors++;
          }
          var _valid2 = _errs142 === errors;
          if (_valid2) {
            valid38 = true;
            passing2 = 0;
          }
          var _errs150 = errors;
          if (data63 && _typeof(data63) == "object" && !Array.isArray(data63)) {
            if (data63.entityType === undefined) {
              var err134 = {
                instancePath: instancePath + "/highlight/" + i10,
                schemaPath: "#/definitions/subset/items/oneOf/1/required",
                keyword: "required",
                params: {
                  missingProperty: "entityType"
                },
                message: "must have required property '" + "entityType" + "'"
              };
              if (vErrors === null) {
                vErrors = [err134];
              } else {
                vErrors.push(err134);
              }
              errors++;
            }
            if (data63.items === undefined) {
              var err135 = {
                instancePath: instancePath + "/highlight/" + i10,
                schemaPath: "#/definitions/subset/items/oneOf/1/required",
                keyword: "required",
                params: {
                  missingProperty: "items"
                },
                message: "must have required property '" + "items" + "'"
              };
              if (vErrors === null) {
                vErrors = [err135];
              } else {
                vErrors.push(err135);
              }
              errors++;
            }
            if (data63.entityType !== undefined) {
              var data67 = data63.entityType;
              if (typeof data67 !== "string") {
                var err136 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/entityType/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err136];
                } else {
                  vErrors.push(err136);
                }
                errors++;
              }
              if ("bonds" !== data67) {
                var err137 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/entityType/const",
                  keyword: "const",
                  params: {
                    allowedValue: "bonds"
                  },
                  message: "must be equal to constant"
                };
                if (vErrors === null) {
                  vErrors = [err137];
                } else {
                  vErrors.push(err137);
                }
                errors++;
              }
            }
            if (data63.items !== undefined) {
              var data68 = data63.items;
              if (Array.isArray(data68)) {
                var len11 = data68.length;
                for (var i13 = 0; i13 < len11; i13++) {
                  var data69 = data68[i13];
                  if (!(typeof data69 == "number" && !(data69 % 1) && !isNaN(data69))) {
                    var err138 = {
                      instancePath: instancePath + "/highlight/" + i10 + "/items/" + i13,
                      schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err138];
                    } else {
                      vErrors.push(err138);
                    }
                    errors++;
                  }
                  if (typeof data69 == "number") {
                    if (data69 < 0 || isNaN(data69)) {
                      var err139 = {
                        instancePath: instancePath + "/highlight/" + i10 + "/items/" + i13,
                        schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err139];
                      } else {
                        vErrors.push(err139);
                      }
                      errors++;
                    }
                  }
                }
                var i14 = data68.length;
                var j2 = void 0;
                if (i14 > 1) {
                  var indices2 = {};
                  for (; i14--;) {
                    var item2 = data68[i14];
                    if (!(typeof item2 == "number" && !(item2 % 1) && !isNaN(item2))) {
                      continue;
                    }
                    if (typeof indices2[item2] == "number") {
                      j2 = indices2[item2];
                      var err140 = {
                        instancePath: instancePath + "/highlight/" + i10 + "/items",
                        schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/uniqueItems",
                        keyword: "uniqueItems",
                        params: {
                          i: i14,
                          j: j2
                        },
                        message: "must NOT have duplicate items (items ## " + j2 + " and " + i14 + " are identical)"
                      };
                      if (vErrors === null) {
                        vErrors = [err140];
                      } else {
                        vErrors.push(err140);
                      }
                      errors++;
                      break;
                    }
                    indices2[item2] = i14;
                  }
                }
              } else {
                var err141 = {
                  instancePath: instancePath + "/highlight/" + i10 + "/items",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err141];
                } else {
                  vErrors.push(err141);
                }
                errors++;
              }
            }
          } else {
            var err142 = {
              instancePath: instancePath + "/highlight/" + i10,
              schemaPath: "#/definitions/subset/items/oneOf/1/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err142];
            } else {
              vErrors.push(err142);
            }
            errors++;
          }
          var _valid2 = _errs150 === errors;
          if (_valid2 && valid38) {
            valid38 = false;
            passing2 = [passing2, 1];
          } else {
            if (_valid2) {
              valid38 = true;
              passing2 = 1;
            }
          }
          if (!valid38) {
            var err143 = {
              instancePath: instancePath + "/highlight/" + i10,
              schemaPath: "#/definitions/subset/items/oneOf",
              keyword: "oneOf",
              params: {
                passingSchemas: passing2
              },
              message: "must match exactly one schema in oneOf"
            };
            if (vErrors === null) {
              vErrors = [err143];
            } else {
              vErrors.push(err143);
            }
            errors++;
          } else {
            errors = _errs141;
            if (vErrors !== null) {
              if (_errs141) {
                vErrors.length = _errs141;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        var err144 = {
          instancePath: instancePath + "/highlight",
          schemaPath: "#/definitions/subset/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err144];
        } else {
          vErrors.push(err144);
        }
        errors++;
      }
    }
    if (data.selection !== undefined) {
      var data70 = data.selection;
      if (Array.isArray(data70)) {
        if (data70.length > 2) {
          var err145 = {
            instancePath: instancePath + "/selection",
            schemaPath: "#/definitions/subset/maxItems",
            keyword: "maxItems",
            params: {
              limit: 2
            },
            message: "must NOT have more than 2 items"
          };
          if (vErrors === null) {
            vErrors = [err145];
          } else {
            vErrors.push(err145);
          }
          errors++;
        }
        if (data70.length < 1) {
          var err146 = {
            instancePath: instancePath + "/selection",
            schemaPath: "#/definitions/subset/minItems",
            keyword: "minItems",
            params: {
              limit: 1
            },
            message: "must NOT have fewer than 1 items"
          };
          if (vErrors === null) {
            vErrors = [err146];
          } else {
            vErrors.push(err146);
          }
          errors++;
        }
        var len12 = data70.length;
        for (var i15 = 0; i15 < len12; i15++) {
          var data71 = data70[i15];
          var _errs162 = errors;
          var valid50 = false;
          var passing3 = null;
          var _errs163 = errors;
          if (data71 && _typeof(data71) == "object" && !Array.isArray(data71)) {
            if (data71.entityType === undefined) {
              var err147 = {
                instancePath: instancePath + "/selection/" + i15,
                schemaPath: "#/definitions/subset/items/oneOf/0/required",
                keyword: "required",
                params: {
                  missingProperty: "entityType"
                },
                message: "must have required property '" + "entityType" + "'"
              };
              if (vErrors === null) {
                vErrors = [err147];
              } else {
                vErrors.push(err147);
              }
              errors++;
            }
            if (data71.items === undefined) {
              var err148 = {
                instancePath: instancePath + "/selection/" + i15,
                schemaPath: "#/definitions/subset/items/oneOf/0/required",
                keyword: "required",
                params: {
                  missingProperty: "items"
                },
                message: "must have required property '" + "items" + "'"
              };
              if (vErrors === null) {
                vErrors = [err148];
              } else {
                vErrors.push(err148);
              }
              errors++;
            }
            if (data71.entityType !== undefined) {
              var data72 = data71.entityType;
              if (typeof data72 !== "string") {
                var err149 = {
                  instancePath: instancePath + "/selection/" + i15 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/entityType/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err149];
                } else {
                  vErrors.push(err149);
                }
                errors++;
              }
              if ("atoms" !== data72) {
                var err150 = {
                  instancePath: instancePath + "/selection/" + i15 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/entityType/const",
                  keyword: "const",
                  params: {
                    allowedValue: "atoms"
                  },
                  message: "must be equal to constant"
                };
                if (vErrors === null) {
                  vErrors = [err150];
                } else {
                  vErrors.push(err150);
                }
                errors++;
              }
            }
            if (data71.items !== undefined) {
              var data73 = data71.items;
              if (Array.isArray(data73)) {
                var len13 = data73.length;
                for (var i16 = 0; i16 < len13; i16++) {
                  var data74 = data73[i16];
                  if (!(typeof data74 == "number" && !(data74 % 1) && !isNaN(data74))) {
                    var err151 = {
                      instancePath: instancePath + "/selection/" + i15 + "/items/" + i16,
                      schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err151];
                    } else {
                      vErrors.push(err151);
                    }
                    errors++;
                  }
                  if (typeof data74 == "number") {
                    if (data74 < 0 || isNaN(data74)) {
                      var err152 = {
                        instancePath: instancePath + "/selection/" + i15 + "/items/" + i16,
                        schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err152];
                      } else {
                        vErrors.push(err152);
                      }
                      errors++;
                    }
                  }
                }
                var i17 = data73.length;
                var j3 = void 0;
                if (i17 > 1) {
                  var indices3 = {};
                  for (; i17--;) {
                    var item3 = data73[i17];
                    if (!(typeof item3 == "number" && !(item3 % 1) && !isNaN(item3))) {
                      continue;
                    }
                    if (typeof indices3[item3] == "number") {
                      j3 = indices3[item3];
                      var err153 = {
                        instancePath: instancePath + "/selection/" + i15 + "/items",
                        schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/uniqueItems",
                        keyword: "uniqueItems",
                        params: {
                          i: i17,
                          j: j3
                        },
                        message: "must NOT have duplicate items (items ## " + j3 + " and " + i17 + " are identical)"
                      };
                      if (vErrors === null) {
                        vErrors = [err153];
                      } else {
                        vErrors.push(err153);
                      }
                      errors++;
                      break;
                    }
                    indices3[item3] = i17;
                  }
                }
              } else {
                var err154 = {
                  instancePath: instancePath + "/selection/" + i15 + "/items",
                  schemaPath: "#/definitions/subset/items/oneOf/0/properties/items/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err154];
                } else {
                  vErrors.push(err154);
                }
                errors++;
              }
            }
          } else {
            var err155 = {
              instancePath: instancePath + "/selection/" + i15,
              schemaPath: "#/definitions/subset/items/oneOf/0/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err155];
            } else {
              vErrors.push(err155);
            }
            errors++;
          }
          var _valid3 = _errs163 === errors;
          if (_valid3) {
            valid50 = true;
            passing3 = 0;
          }
          var _errs171 = errors;
          if (data71 && _typeof(data71) == "object" && !Array.isArray(data71)) {
            if (data71.entityType === undefined) {
              var err156 = {
                instancePath: instancePath + "/selection/" + i15,
                schemaPath: "#/definitions/subset/items/oneOf/1/required",
                keyword: "required",
                params: {
                  missingProperty: "entityType"
                },
                message: "must have required property '" + "entityType" + "'"
              };
              if (vErrors === null) {
                vErrors = [err156];
              } else {
                vErrors.push(err156);
              }
              errors++;
            }
            if (data71.items === undefined) {
              var err157 = {
                instancePath: instancePath + "/selection/" + i15,
                schemaPath: "#/definitions/subset/items/oneOf/1/required",
                keyword: "required",
                params: {
                  missingProperty: "items"
                },
                message: "must have required property '" + "items" + "'"
              };
              if (vErrors === null) {
                vErrors = [err157];
              } else {
                vErrors.push(err157);
              }
              errors++;
            }
            if (data71.entityType !== undefined) {
              var data75 = data71.entityType;
              if (typeof data75 !== "string") {
                var err158 = {
                  instancePath: instancePath + "/selection/" + i15 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/entityType/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err158];
                } else {
                  vErrors.push(err158);
                }
                errors++;
              }
              if ("bonds" !== data75) {
                var err159 = {
                  instancePath: instancePath + "/selection/" + i15 + "/entityType",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/entityType/const",
                  keyword: "const",
                  params: {
                    allowedValue: "bonds"
                  },
                  message: "must be equal to constant"
                };
                if (vErrors === null) {
                  vErrors = [err159];
                } else {
                  vErrors.push(err159);
                }
                errors++;
              }
            }
            if (data71.items !== undefined) {
              var data76 = data71.items;
              if (Array.isArray(data76)) {
                var len14 = data76.length;
                for (var i18 = 0; i18 < len14; i18++) {
                  var data77 = data76[i18];
                  if (!(typeof data77 == "number" && !(data77 % 1) && !isNaN(data77))) {
                    var err160 = {
                      instancePath: instancePath + "/selection/" + i15 + "/items/" + i18,
                      schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err160];
                    } else {
                      vErrors.push(err160);
                    }
                    errors++;
                  }
                  if (typeof data77 == "number") {
                    if (data77 < 0 || isNaN(data77)) {
                      var err161 = {
                        instancePath: instancePath + "/selection/" + i15 + "/items/" + i18,
                        schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err161];
                      } else {
                        vErrors.push(err161);
                      }
                      errors++;
                    }
                  }
                }
                var i19 = data76.length;
                var j4 = void 0;
                if (i19 > 1) {
                  var indices4 = {};
                  for (; i19--;) {
                    var item4 = data76[i19];
                    if (!(typeof item4 == "number" && !(item4 % 1) && !isNaN(item4))) {
                      continue;
                    }
                    if (typeof indices4[item4] == "number") {
                      j4 = indices4[item4];
                      var err162 = {
                        instancePath: instancePath + "/selection/" + i15 + "/items",
                        schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/uniqueItems",
                        keyword: "uniqueItems",
                        params: {
                          i: i19,
                          j: j4
                        },
                        message: "must NOT have duplicate items (items ## " + j4 + " and " + i19 + " are identical)"
                      };
                      if (vErrors === null) {
                        vErrors = [err162];
                      } else {
                        vErrors.push(err162);
                      }
                      errors++;
                      break;
                    }
                    indices4[item4] = i19;
                  }
                }
              } else {
                var err163 = {
                  instancePath: instancePath + "/selection/" + i15 + "/items",
                  schemaPath: "#/definitions/subset/items/oneOf/1/properties/items/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err163];
                } else {
                  vErrors.push(err163);
                }
                errors++;
              }
            }
          } else {
            var err164 = {
              instancePath: instancePath + "/selection/" + i15,
              schemaPath: "#/definitions/subset/items/oneOf/1/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err164];
            } else {
              vErrors.push(err164);
            }
            errors++;
          }
          var _valid3 = _errs171 === errors;
          if (_valid3 && valid50) {
            valid50 = false;
            passing3 = [passing3, 1];
          } else {
            if (_valid3) {
              valid50 = true;
              passing3 = 1;
            }
          }
          if (!valid50) {
            var err165 = {
              instancePath: instancePath + "/selection/" + i15,
              schemaPath: "#/definitions/subset/items/oneOf",
              keyword: "oneOf",
              params: {
                passingSchemas: passing3
              },
              message: "must match exactly one schema in oneOf"
            };
            if (vErrors === null) {
              vErrors = [err165];
            } else {
              vErrors.push(err165);
            }
            errors++;
          } else {
            errors = _errs162;
            if (vErrors !== null) {
              if (_errs162) {
                vErrors.length = _errs162;
              } else {
                vErrors = null;
              }
            }
          }
        }
      } else {
        var err166 = {
          instancePath: instancePath + "/selection",
          schemaPath: "#/definitions/subset/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err166];
        } else {
          vErrors.push(err166);
        }
        errors++;
      }
    }
    if (data.sgroups !== undefined) {
      var data78 = data.sgroups;
      if (Array.isArray(data78)) {
        var len15 = data78.length;
        for (var i20 = 0; i20 < len15; i20++) {
          var data79 = data78[i20];
          var _errs184 = errors;
          var valid62 = true;
          var _errs185 = errors;
          if (data79 && _typeof(data79) == "object" && !Array.isArray(data79)) {
            if (data79.type !== undefined) {
              if ("DAT" !== data79.type) {
                var err167 = {};
                if (vErrors === null) {
                  vErrors = [err167];
                } else {
                  vErrors.push(err167);
                }
                errors++;
              }
            }
          }
          var _valid4 = _errs185 === errors;
          errors = _errs184;
          if (vErrors !== null) {
            if (_errs184) {
              vErrors.length = _errs184;
            } else {
              vErrors = null;
            }
          }
          if (_valid4) {
            var _errs187 = errors;
            if (data79 && _typeof(data79) == "object" && !Array.isArray(data79)) {
              if (data79.context !== undefined) {
                var data81 = data79.context;
                if (!(data81 === "Fragment" || data81 === "Multifragment" || data81 === "Bond" || data81 === "Atom" || data81 === "Group")) {
                  var err168 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/context",
                    schemaPath: "#/definitions/sgroups/items/then/properties/context/enum",
                    keyword: "enum",
                    params: {
                      allowedValues: schema36.items.then.properties.context["enum"]
                    },
                    message: "must be equal to one of the allowed values"
                  };
                  if (vErrors === null) {
                    vErrors = [err168];
                  } else {
                    vErrors.push(err168);
                  }
                  errors++;
                }
              }
              if (data79.fieldName !== undefined) {
                if (typeof data79.fieldName !== "string") {
                  var err169 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/fieldName",
                    schemaPath: "#/definitions/sgroups/items/then/properties/fieldName/type",
                    keyword: "type",
                    params: {
                      type: "string"
                    },
                    message: "must be string"
                  };
                  if (vErrors === null) {
                    vErrors = [err169];
                  } else {
                    vErrors.push(err169);
                  }
                  errors++;
                }
              }
              if (data79.fieldValue !== undefined) {
                var data83 = data79.fieldValue;
                if (typeof data83 === "string") {
                  if (func2(data83) < 1) {
                    var err170 = {
                      instancePath: instancePath + "/sgroups/" + i20 + "/fieldValue",
                      schemaPath: "#/definitions/sgroups/items/then/properties/fieldValue/minLength",
                      keyword: "minLength",
                      params: {
                        limit: 1
                      },
                      message: "must NOT have fewer than 1 characters"
                    };
                    if (vErrors === null) {
                      vErrors = [err170];
                    } else {
                      vErrors.push(err170);
                    }
                    errors++;
                  }
                } else {
                  var err171 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/fieldValue",
                    schemaPath: "#/definitions/sgroups/items/then/properties/fieldValue/type",
                    keyword: "type",
                    params: {
                      type: "string"
                    },
                    message: "must be string"
                  };
                  if (vErrors === null) {
                    vErrors = [err171];
                  } else {
                    vErrors.push(err171);
                  }
                  errors++;
                }
              }
              if (data79.display !== undefined) {
                if (typeof data79.display !== "boolean") {
                  var err172 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/display",
                    schemaPath: "#/definitions/sgroups/items/then/properties/display/type",
                    keyword: "type",
                    params: {
                      type: "boolean"
                    },
                    message: "must be boolean"
                  };
                  if (vErrors === null) {
                    vErrors = [err172];
                  } else {
                    vErrors.push(err172);
                  }
                  errors++;
                }
              }
              if (data79.placement !== undefined) {
                if (typeof data79.placement !== "boolean") {
                  var err173 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/placement",
                    schemaPath: "#/definitions/sgroups/items/then/properties/placement/type",
                    keyword: "type",
                    params: {
                      type: "boolean"
                    },
                    message: "must be boolean"
                  };
                  if (vErrors === null) {
                    vErrors = [err173];
                  } else {
                    vErrors.push(err173);
                  }
                  errors++;
                }
              }
              if (data79.bonds !== undefined) {
                var data86 = data79.bonds;
                if (Array.isArray(data86)) {
                  var len16 = data86.length;
                  for (var i21 = 0; i21 < len16; i21++) {
                    var data87 = data86[i21];
                    if (!(typeof data87 == "number" && !(data87 % 1) && !isNaN(data87))) {
                      var err174 = {
                        instancePath: instancePath + "/sgroups/" + i20 + "/bonds/" + i21,
                        schemaPath: "#/definitions/sgroups/items/then/properties/bonds/items/type",
                        keyword: "type",
                        params: {
                          type: "integer"
                        },
                        message: "must be integer"
                      };
                      if (vErrors === null) {
                        vErrors = [err174];
                      } else {
                        vErrors.push(err174);
                      }
                      errors++;
                    }
                    if (typeof data87 == "number") {
                      if (data87 < 0 || isNaN(data87)) {
                        var err175 = {
                          instancePath: instancePath + "/sgroups/" + i20 + "/bonds/" + i21,
                          schemaPath: "#/definitions/sgroups/items/then/properties/bonds/items/minimum",
                          keyword: "minimum",
                          params: {
                            comparison: ">=",
                            limit: 0
                          },
                          message: "must be >= 0"
                        };
                        if (vErrors === null) {
                          vErrors = [err175];
                        } else {
                          vErrors.push(err175);
                        }
                        errors++;
                      }
                    }
                  }
                } else {
                  var err176 = {
                    instancePath: instancePath + "/sgroups/" + i20 + "/bonds",
                    schemaPath: "#/definitions/sgroups/items/then/properties/bonds/type",
                    keyword: "type",
                    params: {
                      type: "array"
                    },
                    message: "must be array"
                  };
                  if (vErrors === null) {
                    vErrors = [err176];
                  } else {
                    vErrors.push(err176);
                  }
                  errors++;
                }
              }
            }
            var _valid4 = _errs187 === errors;
            valid62 = _valid4;
          }
          if (!valid62) {
            var err177 = {
              instancePath: instancePath + "/sgroups/" + i20,
              schemaPath: "#/definitions/sgroups/items/if",
              keyword: "if",
              params: {
                failingKeyword: "then"
              },
              message: "must match \"then\" schema"
            };
            if (vErrors === null) {
              vErrors = [err177];
            } else {
              vErrors.push(err177);
            }
            errors++;
          }
          if (data79 && _typeof(data79) == "object" && !Array.isArray(data79)) {
            if (data79.atoms === undefined) {
              var err178 = {
                instancePath: instancePath + "/sgroups/" + i20,
                schemaPath: "#/definitions/sgroups/items/required",
                keyword: "required",
                params: {
                  missingProperty: "atoms"
                },
                message: "must have required property '" + "atoms" + "'"
              };
              if (vErrors === null) {
                vErrors = [err178];
              } else {
                vErrors.push(err178);
              }
              errors++;
            }
            if (data79.type === undefined) {
              var err179 = {
                instancePath: instancePath + "/sgroups/" + i20,
                schemaPath: "#/definitions/sgroups/items/required",
                keyword: "required",
                params: {
                  missingProperty: "type"
                },
                message: "must have required property '" + "type" + "'"
              };
              if (vErrors === null) {
                vErrors = [err179];
              } else {
                vErrors.push(err179);
              }
              errors++;
            }
            if (data79.atoms !== undefined) {
              var data88 = data79.atoms;
              if (Array.isArray(data88)) {
                var len17 = data88.length;
                for (var i22 = 0; i22 < len17; i22++) {
                  var data89 = data88[i22];
                  if (!(typeof data89 == "number" && !(data89 % 1) && !isNaN(data89))) {
                    var err180 = {
                      instancePath: instancePath + "/sgroups/" + i20 + "/atoms/" + i22,
                      schemaPath: "#/definitions/sgroups/items/properties/atoms/items/type",
                      keyword: "type",
                      params: {
                        type: "integer"
                      },
                      message: "must be integer"
                    };
                    if (vErrors === null) {
                      vErrors = [err180];
                    } else {
                      vErrors.push(err180);
                    }
                    errors++;
                  }
                  if (typeof data89 == "number") {
                    if (data89 < 0 || isNaN(data89)) {
                      var err181 = {
                        instancePath: instancePath + "/sgroups/" + i20 + "/atoms/" + i22,
                        schemaPath: "#/definitions/sgroups/items/properties/atoms/items/minimum",
                        keyword: "minimum",
                        params: {
                          comparison: ">=",
                          limit: 0
                        },
                        message: "must be >= 0"
                      };
                      if (vErrors === null) {
                        vErrors = [err181];
                      } else {
                        vErrors.push(err181);
                      }
                      errors++;
                    }
                  }
                }
              } else {
                var err182 = {
                  instancePath: instancePath + "/sgroups/" + i20 + "/atoms",
                  schemaPath: "#/definitions/sgroups/items/properties/atoms/type",
                  keyword: "type",
                  params: {
                    type: "array"
                  },
                  message: "must be array"
                };
                if (vErrors === null) {
                  vErrors = [err182];
                } else {
                  vErrors.push(err182);
                }
                errors++;
              }
            }
            if (data79.type !== undefined) {
              var data90 = data79.type;
              if (typeof data90 !== "string") {
                var err183 = {
                  instancePath: instancePath + "/sgroups/" + i20 + "/type",
                  schemaPath: "#/definitions/sgroups/items/properties/type/type",
                  keyword: "type",
                  params: {
                    type: "string"
                  },
                  message: "must be string"
                };
                if (vErrors === null) {
                  vErrors = [err183];
                } else {
                  vErrors.push(err183);
                }
                errors++;
              }
              if (!(data90 === "GEN" || data90 === "MUL" || data90 === "SRU" || data90 === "SUP" || data90 === "DAT" || data90 === "queryComponent" || data90 === "COP")) {
                var err184 = {
                  instancePath: instancePath + "/sgroups/" + i20 + "/type",
                  schemaPath: "#/definitions/sgroups/items/properties/type/enum",
                  keyword: "enum",
                  params: {
                    allowedValues: schema36.items.properties.type["enum"]
                  },
                  message: "must be equal to one of the allowed values"
                };
                if (vErrors === null) {
                  vErrors = [err184];
                } else {
                  vErrors.push(err184);
                }
                errors++;
              }
            }
          } else {
            var err185 = {
              instancePath: instancePath + "/sgroups/" + i20,
              schemaPath: "#/definitions/sgroups/items/type",
              keyword: "type",
              params: {
                type: "object"
              },
              message: "must be object"
            };
            if (vErrors === null) {
              vErrors = [err185];
            } else {
              vErrors.push(err185);
            }
            errors++;
          }
        }
      } else {
        var err186 = {
          instancePath: instancePath + "/sgroups",
          schemaPath: "#/definitions/sgroups/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err186];
        } else {
          vErrors.push(err186);
        }
        errors++;
      }
    }
  } else {
    var err187 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err187];
    } else {
      vErrors.push(err187);
    }
    errors++;
  }
  validate20.errors = vErrors;
  return errors === 0;
}
function validate19(data) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref6$instancePath = _ref6.instancePath,
    instancePath = _ref6$instancePath === void 0 ? "" : _ref6$instancePath,
    parentData = _ref6.parentData,
    parentDataProperty = _ref6.parentDataProperty,
    _ref6$rootData = _ref6.rootData,
    rootData = _ref6$rootData === void 0 ? data : _ref6$rootData;
  var vErrors = null;
  var errors = 0;
  var _errs1 = errors;
  var valid0 = false;
  var _errs2 = errors;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.fragments === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/anyOf/0/required",
        keyword: "required",
        params: {
          missingProperty: "fragments"
        },
        message: "must have required property '" + "fragments" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  var _valid0 = _errs2 === errors;
  valid0 = valid0 || _valid0;
  if (!valid0) {
    var _errs3 = errors;
    if (!validate20(data, {
      instancePath: instancePath,
      parentData: parentData,
      parentDataProperty: parentDataProperty,
      rootData: rootData
    })) {
      vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
      errors = vErrors.length;
    }
    var _valid0 = _errs3 === errors;
    valid0 = valid0 || _valid0;
  }
  if (!valid0) {
    var err1 = {
      instancePath: instancePath,
      schemaPath: "#/anyOf",
      keyword: "anyOf",
      params: {},
      message: "must match a schema in anyOf"
    };
    if (vErrors === null) {
      vErrors = [err1];
    } else {
      vErrors.push(err1);
    }
    errors++;
  } else {
    errors = _errs1;
    if (vErrors !== null) {
      if (_errs1) {
        vErrors.length = _errs1;
      } else {
        vErrors = null;
      }
    }
  }
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.rlogic === undefined) {
      var err2 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "rlogic"
        },
        message: "must have required property '" + "rlogic" + "'"
      };
      if (vErrors === null) {
        vErrors = [err2];
      } else {
        vErrors.push(err2);
      }
      errors++;
    }
    if (data.type === undefined) {
      var err3 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "type"
        },
        message: "must have required property '" + "type" + "'"
      };
      if (vErrors === null) {
        vErrors = [err3];
      } else {
        vErrors.push(err3);
      }
      errors++;
    }
    if (data.type !== undefined) {
      if ("rgroup" !== data.type) {
        var err4 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: {
            allowedValue: "rgroup"
          },
          message: "must be equal to constant"
        };
        if (vErrors === null) {
          vErrors = [err4];
        } else {
          vErrors.push(err4);
        }
        errors++;
      }
    }
    if (data.rlogic !== undefined) {
      var data1 = data.rlogic;
      if (data1 && _typeof(data1) == "object" && !Array.isArray(data1)) {
        if (data1.number === undefined) {
          var err5 = {
            instancePath: instancePath + "/rlogic",
            schemaPath: "#/properties/rlogic/required",
            keyword: "required",
            params: {
              missingProperty: "number"
            },
            message: "must have required property '" + "number" + "'"
          };
          if (vErrors === null) {
            vErrors = [err5];
          } else {
            vErrors.push(err5);
          }
          errors++;
        }
        if (data1.number !== undefined) {
          var data2 = data1.number;
          if (!(typeof data2 == "number" && !(data2 % 1) && !isNaN(data2))) {
            var err6 = {
              instancePath: instancePath + "/rlogic/number",
              schemaPath: "#/properties/rlogic/properties/number/type",
              keyword: "type",
              params: {
                type: "integer"
              },
              message: "must be integer"
            };
            if (vErrors === null) {
              vErrors = [err6];
            } else {
              vErrors.push(err6);
            }
            errors++;
          }
          if (typeof data2 == "number") {
            if (data2 < 1 || isNaN(data2)) {
              var err7 = {
                instancePath: instancePath + "/rlogic/number",
                schemaPath: "#/properties/rlogic/properties/number/minimum",
                keyword: "minimum",
                params: {
                  comparison: ">=",
                  limit: 1
                },
                message: "must be >= 1"
              };
              if (vErrors === null) {
                vErrors = [err7];
              } else {
                vErrors.push(err7);
              }
              errors++;
            }
          }
        }
        if (data1.range !== undefined) {
          var data3 = data1.range;
          if (typeof data3 === "string") {
            if (func2(data3) > 50) {
              var err8 = {
                instancePath: instancePath + "/rlogic/range",
                schemaPath: "#/properties/rlogic/properties/range/maxLength",
                keyword: "maxLength",
                params: {
                  limit: 50
                },
                message: "must NOT have more than 50 characters"
              };
              if (vErrors === null) {
                vErrors = [err8];
              } else {
                vErrors.push(err8);
              }
              errors++;
            }
          } else {
            var err9 = {
              instancePath: instancePath + "/rlogic/range",
              schemaPath: "#/properties/rlogic/properties/range/type",
              keyword: "type",
              params: {
                type: "string"
              },
              message: "must be string"
            };
            if (vErrors === null) {
              vErrors = [err9];
            } else {
              vErrors.push(err9);
            }
            errors++;
          }
        }
        if (data1.resth !== undefined) {
          if (typeof data1.resth !== "boolean") {
            var err10 = {
              instancePath: instancePath + "/rlogic/resth",
              schemaPath: "#/properties/rlogic/properties/resth/type",
              keyword: "type",
              params: {
                type: "boolean"
              },
              message: "must be boolean"
            };
            if (vErrors === null) {
              vErrors = [err10];
            } else {
              vErrors.push(err10);
            }
            errors++;
          }
        }
        if (data1.ifthen !== undefined) {
          var data5 = data1.ifthen;
          if (!(typeof data5 == "number" && !(data5 % 1) && !isNaN(data5))) {
            var err11 = {
              instancePath: instancePath + "/rlogic/ifthen",
              schemaPath: "#/properties/rlogic/properties/ifthen/type",
              keyword: "type",
              params: {
                type: "integer"
              },
              message: "must be integer"
            };
            if (vErrors === null) {
              vErrors = [err11];
            } else {
              vErrors.push(err11);
            }
            errors++;
          }
          if (typeof data5 == "number") {
            if (data5 < 0 || isNaN(data5)) {
              var err12 = {
                instancePath: instancePath + "/rlogic/ifthen",
                schemaPath: "#/properties/rlogic/properties/ifthen/minimum",
                keyword: "minimum",
                params: {
                  comparison: ">=",
                  limit: 0
                },
                message: "must be >= 0"
              };
              if (vErrors === null) {
                vErrors = [err12];
              } else {
                vErrors.push(err12);
              }
              errors++;
            }
          }
        }
      } else {
        var err13 = {
          instancePath: instancePath + "/rlogic",
          schemaPath: "#/properties/rlogic/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err13];
        } else {
          vErrors.push(err13);
        }
        errors++;
      }
    }
    if (data.fragments !== undefined) {
      var data6 = data.fragments;
      if (Array.isArray(data6)) {
        var len0 = data6.length;
        for (var i0 = 0; i0 < len0; i0++) {
          if (!validate20(data6[i0], {
            instancePath: instancePath + "/fragments/" + i0,
            parentData: data6,
            parentDataProperty: i0,
            rootData: rootData
          })) {
            vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
            errors = vErrors.length;
          }
        }
      } else {
        var err14 = {
          instancePath: instancePath + "/fragments",
          schemaPath: "#/properties/fragments/type",
          keyword: "type",
          params: {
            type: "array"
          },
          message: "must be array"
        };
        if (vErrors === null) {
          vErrors = [err14];
        } else {
          vErrors.push(err14);
        }
        errors++;
      }
    }
  } else {
    var err15 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err15];
    } else {
      vErrors.push(err15);
    }
    errors++;
  }
  validate19.errors = vErrors;
  return errors === 0;
}
function validate24(data) {
  var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref7$instancePath = _ref7.instancePath,
    instancePath = _ref7$instancePath === void 0 ? "" : _ref7$instancePath,
    parentData = _ref7.parentData,
    parentDataProperty = _ref7.parentDataProperty,
    _ref7$rootData = _ref7.rootData,
    rootData = _ref7$rootData === void 0 ? data : _ref7$rootData;
  var vErrors = null;
  var errors = 0;
  if (!validate20(data, {
    instancePath: instancePath,
    parentData: parentData,
    parentDataProperty: parentDataProperty,
    rootData: rootData
  })) {
    vErrors = vErrors === null ? validate20.errors : vErrors.concat(validate20.errors);
    errors = vErrors.length;
  }
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "type"
        },
        message: "must have required property '" + "type" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.type !== undefined) {
      if ("molecule" !== data.type) {
        var err1 = {
          instancePath: instancePath + "/type",
          schemaPath: "#/properties/type/const",
          keyword: "const",
          params: {
            allowedValue: "molecule"
          },
          message: "must be equal to constant"
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
  } else {
    var err2 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate24.errors = vErrors;
  return errors === 0;
}
function validate10(data) {
  var _ref8 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref8$instancePath = _ref8.instancePath,
    instancePath = _ref8$instancePath === void 0 ? "" : _ref8$instancePath;
    _ref8.parentData;
    _ref8.parentDataProperty;
    var _ref8$rootData = _ref8.rootData,
    rootData = _ref8$rootData === void 0 ? data : _ref8$rootData;
  var vErrors = null;
  var errors = 0;
  if (data && _typeof(data) == "object" && !Array.isArray(data)) {
    if (data.root === undefined) {
      var err0 = {
        instancePath: instancePath,
        schemaPath: "#/required",
        keyword: "required",
        params: {
          missingProperty: "root"
        },
        message: "must have required property '" + "root" + "'"
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    for (var key0 in data) {
      if (!(key0 === "ket_version" || key0 === "root" || pattern0.test(key0) || pattern1.test(key0) || pattern2.test(key0))) {
        var err1 = {
          instancePath: instancePath,
          schemaPath: "#/additionalProperties",
          keyword: "additionalProperties",
          params: {
            additionalProperty: key0
          },
          message: "must NOT have additional properties"
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
    }
    if (data.ket_version !== undefined) {
      if (typeof data.ket_version !== "string") {
        var err2 = {
          instancePath: instancePath + "/ket_version",
          schemaPath: "#/properties/ket_version/type",
          keyword: "type",
          params: {
            type: "string"
          },
          message: "must be string"
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
    }
    if (data.root !== undefined) {
      var data1 = data.root;
      if (data1 && _typeof(data1) == "object" && !Array.isArray(data1)) {
        if (data1.nodes === undefined) {
          var err3 = {
            instancePath: instancePath + "/root",
            schemaPath: "#/properties/root/required",
            keyword: "required",
            params: {
              missingProperty: "nodes"
            },
            message: "must have required property '" + "nodes" + "'"
          };
          if (vErrors === null) {
            vErrors = [err3];
          } else {
            vErrors.push(err3);
          }
          errors++;
        }
        if (data1.nodes !== undefined) {
          var data2 = data1.nodes;
          if (Array.isArray(data2)) {
            if (data2.length < 0) {
              var err4 = {
                instancePath: instancePath + "/root/nodes",
                schemaPath: "#/properties/root/properties/nodes/minItems",
                keyword: "minItems",
                params: {
                  limit: 0
                },
                message: "must NOT have fewer than 0 items"
              };
              if (vErrors === null) {
                vErrors = [err4];
              } else {
                vErrors.push(err4);
              }
              errors++;
            }
            var len0 = data2.length;
            for (var i0 = 0; i0 < len0; i0++) {
              var data3 = data2[i0];
              var _errs9 = errors;
              var valid4 = false;
              var passing0 = null;
              var _errs10 = errors;
              if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                if (data3.type === undefined) {
                  var err5 = {
                    instancePath: instancePath + "/root/nodes/" + i0,
                    schemaPath: "#/definitions/simpleObject/required",
                    keyword: "required",
                    params: {
                      missingProperty: "type"
                    },
                    message: "must have required property '" + "type" + "'"
                  };
                  if (vErrors === null) {
                    vErrors = [err5];
                  } else {
                    vErrors.push(err5);
                  }
                  errors++;
                }
                if (data3.data === undefined) {
                  var err6 = {
                    instancePath: instancePath + "/root/nodes/" + i0,
                    schemaPath: "#/definitions/simpleObject/required",
                    keyword: "required",
                    params: {
                      missingProperty: "data"
                    },
                    message: "must have required property '" + "data" + "'"
                  };
                  if (vErrors === null) {
                    vErrors = [err6];
                  } else {
                    vErrors.push(err6);
                  }
                  errors++;
                }
                if (data3.type !== undefined) {
                  if ("simpleObject" !== data3.type) {
                    var err7 = {
                      instancePath: instancePath + "/root/nodes/" + i0 + "/type",
                      schemaPath: "#/definitions/simpleObject/properties/type/const",
                      keyword: "const",
                      params: {
                        allowedValue: "simpleObject"
                      },
                      message: "must be equal to constant"
                    };
                    if (vErrors === null) {
                      vErrors = [err7];
                    } else {
                      vErrors.push(err7);
                    }
                    errors++;
                  }
                }
                if (data3.data !== undefined) {
                  var data5 = data3.data;
                  var _errs16 = errors;
                  var valid7 = true;
                  var _errs17 = errors;
                  if (data5 && _typeof(data5) == "object" && !Array.isArray(data5)) {
                    if (data5.mode !== undefined) {
                      if ("polyline" !== data5.mode) {
                        var err8 = {};
                        if (vErrors === null) {
                          vErrors = [err8];
                        } else {
                          vErrors.push(err8);
                        }
                        errors++;
                      }
                    }
                  }
                  var _valid1 = _errs17 === errors;
                  errors = _errs16;
                  if (vErrors !== null) {
                    if (_errs16) {
                      vErrors.length = _errs16;
                    } else {
                      vErrors = null;
                    }
                  }
                  var ifClause0 = void 0;
                  if (_valid1) {
                    var _errs19 = errors;
                    if (data5 && _typeof(data5) == "object" && !Array.isArray(data5)) {
                      if (data5.pos === undefined) {
                        var err9 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                          schemaPath: "#/definitions/simpleObject/properties/data/then/required",
                          keyword: "required",
                          params: {
                            missingProperty: "pos"
                          },
                          message: "must have required property '" + "pos" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err9];
                        } else {
                          vErrors.push(err9);
                        }
                        errors++;
                      }
                      if (data5.pos !== undefined) {
                        var data7 = data5.pos;
                        if (Array.isArray(data7)) {
                          if (data7.length < 2) {
                            var err10 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                              schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/minItems",
                              keyword: "minItems",
                              params: {
                                limit: 2
                              },
                              message: "must NOT have fewer than 2 items"
                            };
                            if (vErrors === null) {
                              vErrors = [err10];
                            } else {
                              vErrors.push(err10);
                            }
                            errors++;
                          }
                          var len1 = data7.length;
                          for (var i1 = 0; i1 < len1; i1++) {
                            var data8 = data7[i1];
                            if (data8 && _typeof(data8) == "object" && !Array.isArray(data8)) {
                              if (data8.x === undefined) {
                                var err11 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1,
                                  schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "x"
                                  },
                                  message: "must have required property '" + "x" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err11];
                                } else {
                                  vErrors.push(err11);
                                }
                                errors++;
                              }
                              if (data8.y === undefined) {
                                var err12 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1,
                                  schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "y"
                                  },
                                  message: "must have required property '" + "y" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err12];
                                } else {
                                  vErrors.push(err12);
                                }
                                errors++;
                              }
                              if (data8.x !== undefined) {
                                if (!(typeof data8.x == "number")) {
                                  var err13 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1 + "/x",
                                    schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/properties/x/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err13];
                                  } else {
                                    vErrors.push(err13);
                                  }
                                  errors++;
                                }
                              }
                              if (data8.y !== undefined) {
                                if (!(typeof data8.y == "number")) {
                                  var err14 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1 + "/y",
                                    schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/properties/y/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err14];
                                  } else {
                                    vErrors.push(err14);
                                  }
                                  errors++;
                                }
                              }
                              if (data8.z !== undefined) {
                                if (!(typeof data8.z == "number")) {
                                  var err15 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1 + "/z",
                                    schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/properties/z/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err15];
                                  } else {
                                    vErrors.push(err15);
                                  }
                                  errors++;
                                }
                              }
                            } else {
                              var err16 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i1,
                                schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/items/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              };
                              if (vErrors === null) {
                                vErrors = [err16];
                              } else {
                                vErrors.push(err16);
                              }
                              errors++;
                            }
                          }
                        } else {
                          var err17 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                            schemaPath: "#/definitions/simpleObject/properties/data/then/properties/pos/type",
                            keyword: "type",
                            params: {
                              type: "array"
                            },
                            message: "must be array"
                          };
                          if (vErrors === null) {
                            vErrors = [err17];
                          } else {
                            vErrors.push(err17);
                          }
                          errors++;
                        }
                      }
                    }
                    var _valid1 = _errs19 === errors;
                    valid7 = _valid1;
                    ifClause0 = "then";
                  } else {
                    var _errs30 = errors;
                    if (data5 && _typeof(data5) == "object" && !Array.isArray(data5)) {
                      if (data5.pos === undefined) {
                        var err18 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                          schemaPath: "#/definitions/simpleObject/properties/data/else/required",
                          keyword: "required",
                          params: {
                            missingProperty: "pos"
                          },
                          message: "must have required property '" + "pos" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err18];
                        } else {
                          vErrors.push(err18);
                        }
                        errors++;
                      }
                      if (data5.pos !== undefined) {
                        var data12 = data5.pos;
                        if (Array.isArray(data12)) {
                          if (data12.length > 2) {
                            var err19 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                              schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/maxItems",
                              keyword: "maxItems",
                              params: {
                                limit: 2
                              },
                              message: "must NOT have more than 2 items"
                            };
                            if (vErrors === null) {
                              vErrors = [err19];
                            } else {
                              vErrors.push(err19);
                            }
                            errors++;
                          }
                          if (data12.length < 2) {
                            var err20 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                              schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/minItems",
                              keyword: "minItems",
                              params: {
                                limit: 2
                              },
                              message: "must NOT have fewer than 2 items"
                            };
                            if (vErrors === null) {
                              vErrors = [err20];
                            } else {
                              vErrors.push(err20);
                            }
                            errors++;
                          }
                          var len2 = data12.length;
                          for (var i2 = 0; i2 < len2; i2++) {
                            var data13 = data12[i2];
                            if (data13 && _typeof(data13) == "object" && !Array.isArray(data13)) {
                              if (data13.x === undefined) {
                                var err21 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2,
                                  schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "x"
                                  },
                                  message: "must have required property '" + "x" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err21];
                                } else {
                                  vErrors.push(err21);
                                }
                                errors++;
                              }
                              if (data13.y === undefined) {
                                var err22 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2,
                                  schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "y"
                                  },
                                  message: "must have required property '" + "y" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err22];
                                } else {
                                  vErrors.push(err22);
                                }
                                errors++;
                              }
                              if (data13.x !== undefined) {
                                if (!(typeof data13.x == "number")) {
                                  var err23 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2 + "/x",
                                    schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/properties/x/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err23];
                                  } else {
                                    vErrors.push(err23);
                                  }
                                  errors++;
                                }
                              }
                              if (data13.y !== undefined) {
                                if (!(typeof data13.y == "number")) {
                                  var err24 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2 + "/y",
                                    schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/properties/y/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err24];
                                  } else {
                                    vErrors.push(err24);
                                  }
                                  errors++;
                                }
                              }
                              if (data13.z !== undefined) {
                                if (!(typeof data13.z == "number")) {
                                  var err25 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2 + "/z",
                                    schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/properties/z/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err25];
                                  } else {
                                    vErrors.push(err25);
                                  }
                                  errors++;
                                }
                              }
                            } else {
                              var err26 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i2,
                                schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/items/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              };
                              if (vErrors === null) {
                                vErrors = [err26];
                              } else {
                                vErrors.push(err26);
                              }
                              errors++;
                            }
                          }
                        } else {
                          var err27 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                            schemaPath: "#/definitions/simpleObject/properties/data/else/properties/pos/type",
                            keyword: "type",
                            params: {
                              type: "array"
                            },
                            message: "must be array"
                          };
                          if (vErrors === null) {
                            vErrors = [err27];
                          } else {
                            vErrors.push(err27);
                          }
                          errors++;
                        }
                      }
                    }
                    var _valid1 = _errs30 === errors;
                    valid7 = _valid1;
                    ifClause0 = "else";
                  }
                  if (!valid7) {
                    var err28 = {
                      instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                      schemaPath: "#/definitions/simpleObject/properties/data/if",
                      keyword: "if",
                      params: {
                        failingKeyword: ifClause0
                      },
                      message: "must match \"" + ifClause0 + "\" schema"
                    };
                    if (vErrors === null) {
                      vErrors = [err28];
                    } else {
                      vErrors.push(err28);
                    }
                    errors++;
                  }
                  if (data5 && _typeof(data5) == "object" && !Array.isArray(data5)) {
                    if (data5.mode === undefined) {
                      var err29 = {
                        instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                        schemaPath: "#/definitions/simpleObject/properties/data/required",
                        keyword: "required",
                        params: {
                          missingProperty: "mode"
                        },
                        message: "must have required property '" + "mode" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err29];
                      } else {
                        vErrors.push(err29);
                      }
                      errors++;
                    }
                    if (data5.mode !== undefined) {
                      var data17 = data5.mode;
                      if (typeof data17 !== "string") {
                        var err30 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/data/mode",
                          schemaPath: "#/definitions/simpleObject/properties/data/properties/mode/type",
                          keyword: "type",
                          params: {
                            type: "string"
                          },
                          message: "must be string"
                        };
                        if (vErrors === null) {
                          vErrors = [err30];
                        } else {
                          vErrors.push(err30);
                        }
                        errors++;
                      }
                      if (!(data17 === "line" || data17 === "rectangle" || data17 === "circle" || data17 === "ellipse" || data17 === "polyline")) {
                        var err31 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/data/mode",
                          schemaPath: "#/definitions/simpleObject/properties/data/properties/mode/enum",
                          keyword: "enum",
                          params: {
                            allowedValues: schema12.properties.data.properties.mode["enum"]
                          },
                          message: "must be equal to one of the allowed values"
                        };
                        if (vErrors === null) {
                          vErrors = [err31];
                        } else {
                          vErrors.push(err31);
                        }
                        errors++;
                      }
                    }
                  } else {
                    var err32 = {
                      instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                      schemaPath: "#/definitions/simpleObject/properties/data/type",
                      keyword: "type",
                      params: {
                        type: "object"
                      },
                      message: "must be object"
                    };
                    if (vErrors === null) {
                      vErrors = [err32];
                    } else {
                      vErrors.push(err32);
                    }
                    errors++;
                  }
                }
                if (data3.selected !== undefined) {
                  if (typeof data3.selected !== "boolean") {
                    var err33 = {
                      instancePath: instancePath + "/root/nodes/" + i0 + "/selected",
                      schemaPath: "#/definitions/simpleObject/properties/selected/type",
                      keyword: "type",
                      params: {
                        type: "boolean"
                      },
                      message: "must be boolean"
                    };
                    if (vErrors === null) {
                      vErrors = [err33];
                    } else {
                      vErrors.push(err33);
                    }
                    errors++;
                  }
                }
              } else {
                var err34 = {
                  instancePath: instancePath + "/root/nodes/" + i0,
                  schemaPath: "#/definitions/simpleObject/type",
                  keyword: "type",
                  params: {
                    type: "object"
                  },
                  message: "must be object"
                };
                if (vErrors === null) {
                  vErrors = [err34];
                } else {
                  vErrors.push(err34);
                }
                errors++;
              }
              var _valid0 = _errs10 === errors;
              if (_valid0) {
                valid4 = true;
                passing0 = 0;
              }
              var _errs45 = errors;
              if (!validate11(data3, {
                instancePath: instancePath + "/root/nodes/" + i0,
                parentData: data2,
                parentDataProperty: i0,
                rootData: rootData
              })) {
                vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
                errors = vErrors.length;
              }
              var _valid0 = _errs45 === errors;
              if (_valid0 && valid4) {
                valid4 = false;
                passing0 = [passing0, 1];
              } else {
                if (_valid0) {
                  valid4 = true;
                  passing0 = 1;
                }
                var _errs46 = errors;
                if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                  if (data3.type === undefined) {
                    var err35 = {
                      instancePath: instancePath + "/root/nodes/" + i0,
                      schemaPath: "#/definitions/arrow/required",
                      keyword: "required",
                      params: {
                        missingProperty: "type"
                      },
                      message: "must have required property '" + "type" + "'"
                    };
                    if (vErrors === null) {
                      vErrors = [err35];
                    } else {
                      vErrors.push(err35);
                    }
                    errors++;
                  }
                  if (data3.data === undefined) {
                    var err36 = {
                      instancePath: instancePath + "/root/nodes/" + i0,
                      schemaPath: "#/definitions/arrow/required",
                      keyword: "required",
                      params: {
                        missingProperty: "data"
                      },
                      message: "must have required property '" + "data" + "'"
                    };
                    if (vErrors === null) {
                      vErrors = [err36];
                    } else {
                      vErrors.push(err36);
                    }
                    errors++;
                  }
                  if (data3.type !== undefined) {
                    if ("arrow" !== data3.type) {
                      var err37 = {
                        instancePath: instancePath + "/root/nodes/" + i0 + "/type",
                        schemaPath: "#/definitions/arrow/properties/type/const",
                        keyword: "const",
                        params: {
                          allowedValue: "arrow"
                        },
                        message: "must be equal to constant"
                      };
                      if (vErrors === null) {
                        vErrors = [err37];
                      } else {
                        vErrors.push(err37);
                      }
                      errors++;
                    }
                  }
                  if (data3.data !== undefined) {
                    var data20 = data3.data;
                    if (data20 && _typeof(data20) == "object" && !Array.isArray(data20)) {
                      if (data20.mode === undefined) {
                        var err38 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                          schemaPath: "#/definitions/arrow/properties/data/required",
                          keyword: "required",
                          params: {
                            missingProperty: "mode"
                          },
                          message: "must have required property '" + "mode" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err38];
                        } else {
                          vErrors.push(err38);
                        }
                        errors++;
                      }
                      if (data20.mode !== undefined) {
                        if (typeof data20.mode !== "string") {
                          var err39 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data/mode",
                            schemaPath: "#/definitions/arrow/properties/data/properties/mode/type",
                            keyword: "type",
                            params: {
                              type: "string"
                            },
                            message: "must be string"
                          };
                          if (vErrors === null) {
                            vErrors = [err39];
                          } else {
                            vErrors.push(err39);
                          }
                          errors++;
                        }
                      }
                      if (data20.pos !== undefined) {
                        var data22 = data20.pos;
                        if (Array.isArray(data22)) {
                          var len3 = data22.length;
                          for (var i3 = 0; i3 < len3; i3++) {
                            var data23 = data22[i3];
                            if (data23 && _typeof(data23) == "object" && !Array.isArray(data23)) {
                              if (data23.x === undefined) {
                                var err40 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3,
                                  schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "x"
                                  },
                                  message: "must have required property '" + "x" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err40];
                                } else {
                                  vErrors.push(err40);
                                }
                                errors++;
                              }
                              if (data23.y === undefined) {
                                var err41 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3,
                                  schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/required",
                                  keyword: "required",
                                  params: {
                                    missingProperty: "y"
                                  },
                                  message: "must have required property '" + "y" + "'"
                                };
                                if (vErrors === null) {
                                  vErrors = [err41];
                                } else {
                                  vErrors.push(err41);
                                }
                                errors++;
                              }
                              if (data23.x !== undefined) {
                                if (!(typeof data23.x == "number")) {
                                  var err42 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3 + "/x",
                                    schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/properties/x/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err42];
                                  } else {
                                    vErrors.push(err42);
                                  }
                                  errors++;
                                }
                              }
                              if (data23.y !== undefined) {
                                if (!(typeof data23.y == "number")) {
                                  var err43 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3 + "/y",
                                    schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/properties/y/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err43];
                                  } else {
                                    vErrors.push(err43);
                                  }
                                  errors++;
                                }
                              }
                              if (data23.z !== undefined) {
                                if (!(typeof data23.z == "number")) {
                                  var err44 = {
                                    instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3 + "/z",
                                    schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/properties/z/type",
                                    keyword: "type",
                                    params: {
                                      type: "number"
                                    },
                                    message: "must be number"
                                  };
                                  if (vErrors === null) {
                                    vErrors = [err44];
                                  } else {
                                    vErrors.push(err44);
                                  }
                                  errors++;
                                }
                              }
                            } else {
                              var err45 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos/" + i3,
                                schemaPath: "#/definitions/arrow/properties/data/properties/pos/items/type",
                                keyword: "type",
                                params: {
                                  type: "object"
                                },
                                message: "must be object"
                              };
                              if (vErrors === null) {
                                vErrors = [err45];
                              } else {
                                vErrors.push(err45);
                              }
                              errors++;
                            }
                          }
                        } else {
                          var err46 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data/pos",
                            schemaPath: "#/definitions/arrow/properties/data/properties/pos/type",
                            keyword: "type",
                            params: {
                              type: "array"
                            },
                            message: "must be array"
                          };
                          if (vErrors === null) {
                            vErrors = [err46];
                          } else {
                            vErrors.push(err46);
                          }
                          errors++;
                        }
                      }
                      if (data20.height !== undefined) {
                        if (!(typeof data20.height == "number")) {
                          var err47 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data/height",
                            schemaPath: "#/definitions/arrow/properties/data/properties/height/type",
                            keyword: "type",
                            params: {
                              type: "number"
                            },
                            message: "must be number"
                          };
                          if (vErrors === null) {
                            vErrors = [err47];
                          } else {
                            vErrors.push(err47);
                          }
                          errors++;
                        }
                      }
                    } else {
                      var err48 = {
                        instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                        schemaPath: "#/definitions/arrow/properties/data/type",
                        keyword: "type",
                        params: {
                          type: "object"
                        },
                        message: "must be object"
                      };
                      if (vErrors === null) {
                        vErrors = [err48];
                      } else {
                        vErrors.push(err48);
                      }
                      errors++;
                    }
                  }
                  if (data3.selected !== undefined) {
                    if (typeof data3.selected !== "boolean") {
                      var err49 = {
                        instancePath: instancePath + "/root/nodes/" + i0 + "/selected",
                        schemaPath: "#/definitions/arrow/properties/selected/type",
                        keyword: "type",
                        params: {
                          type: "boolean"
                        },
                        message: "must be boolean"
                      };
                      if (vErrors === null) {
                        vErrors = [err49];
                      } else {
                        vErrors.push(err49);
                      }
                      errors++;
                    }
                  }
                } else {
                  var err50 = {
                    instancePath: instancePath + "/root/nodes/" + i0,
                    schemaPath: "#/definitions/arrow/type",
                    keyword: "type",
                    params: {
                      type: "object"
                    },
                    message: "must be object"
                  };
                  if (vErrors === null) {
                    vErrors = [err50];
                  } else {
                    vErrors.push(err50);
                  }
                  errors++;
                }
                var _valid0 = _errs46 === errors;
                if (_valid0 && valid4) {
                  valid4 = false;
                  passing0 = [passing0, 2];
                } else {
                  if (_valid0) {
                    valid4 = true;
                    passing0 = 2;
                  }
                  var _errs68 = errors;
                  if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                    if (data3.type === undefined) {
                      var err51 = {
                        instancePath: instancePath + "/root/nodes/" + i0,
                        schemaPath: "#/definitions/plus/required",
                        keyword: "required",
                        params: {
                          missingProperty: "type"
                        },
                        message: "must have required property '" + "type" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err51];
                      } else {
                        vErrors.push(err51);
                      }
                      errors++;
                    }
                    if (data3.location === undefined) {
                      var err52 = {
                        instancePath: instancePath + "/root/nodes/" + i0,
                        schemaPath: "#/definitions/plus/required",
                        keyword: "required",
                        params: {
                          missingProperty: "location"
                        },
                        message: "must have required property '" + "location" + "'"
                      };
                      if (vErrors === null) {
                        vErrors = [err52];
                      } else {
                        vErrors.push(err52);
                      }
                      errors++;
                    }
                    if (data3.type !== undefined) {
                      if ("plus" !== data3.type) {
                        var err53 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/type",
                          schemaPath: "#/definitions/plus/properties/type/const",
                          keyword: "const",
                          params: {
                            allowedValue: "plus"
                          },
                          message: "must be equal to constant"
                        };
                        if (vErrors === null) {
                          vErrors = [err53];
                        } else {
                          vErrors.push(err53);
                        }
                        errors++;
                      }
                    }
                    if (data3.location !== undefined) {
                      var data30 = data3.location;
                      if (Array.isArray(data30)) {
                        if (data30.length > 3) {
                          var err54 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/location",
                            schemaPath: "#/definitions/plus/properties/location/maxItems",
                            keyword: "maxItems",
                            params: {
                              limit: 3
                            },
                            message: "must NOT have more than 3 items"
                          };
                          if (vErrors === null) {
                            vErrors = [err54];
                          } else {
                            vErrors.push(err54);
                          }
                          errors++;
                        }
                        if (data30.length < 2) {
                          var err55 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/location",
                            schemaPath: "#/definitions/plus/properties/location/minItems",
                            keyword: "minItems",
                            params: {
                              limit: 2
                            },
                            message: "must NOT have fewer than 2 items"
                          };
                          if (vErrors === null) {
                            vErrors = [err55];
                          } else {
                            vErrors.push(err55);
                          }
                          errors++;
                        }
                        var len4 = data30.length;
                        for (var i4 = 0; i4 < len4; i4++) {
                          if (!(typeof data30[i4] == "number")) {
                            var err56 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/location/" + i4,
                              schemaPath: "#/definitions/plus/properties/location/items/type",
                              keyword: "type",
                              params: {
                                type: "number"
                              },
                              message: "must be number"
                            };
                            if (vErrors === null) {
                              vErrors = [err56];
                            } else {
                              vErrors.push(err56);
                            }
                            errors++;
                          }
                        }
                      } else {
                        var err57 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/location",
                          schemaPath: "#/definitions/plus/properties/location/type",
                          keyword: "type",
                          params: {
                            type: "array"
                          },
                          message: "must be array"
                        };
                        if (vErrors === null) {
                          vErrors = [err57];
                        } else {
                          vErrors.push(err57);
                        }
                        errors++;
                      }
                    }
                    if (data3.selected !== undefined) {
                      if (typeof data3.selected !== "boolean") {
                        var err58 = {
                          instancePath: instancePath + "/root/nodes/" + i0 + "/selected",
                          schemaPath: "#/definitions/plus/properties/selected/type",
                          keyword: "type",
                          params: {
                            type: "boolean"
                          },
                          message: "must be boolean"
                        };
                        if (vErrors === null) {
                          vErrors = [err58];
                        } else {
                          vErrors.push(err58);
                        }
                        errors++;
                      }
                    }
                  } else {
                    var err59 = {
                      instancePath: instancePath + "/root/nodes/" + i0,
                      schemaPath: "#/definitions/plus/type",
                      keyword: "type",
                      params: {
                        type: "object"
                      },
                      message: "must be object"
                    };
                    if (vErrors === null) {
                      vErrors = [err59];
                    } else {
                      vErrors.push(err59);
                    }
                    errors++;
                  }
                  var _valid0 = _errs68 === errors;
                  if (_valid0 && valid4) {
                    valid4 = false;
                    passing0 = [passing0, 3];
                  } else {
                    if (_valid0) {
                      valid4 = true;
                      passing0 = 3;
                    }
                    var _errs78 = errors;
                    if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                      if (data3.type === undefined) {
                        var err60 = {
                          instancePath: instancePath + "/root/nodes/" + i0,
                          schemaPath: "#/definitions/image/required",
                          keyword: "required",
                          params: {
                            missingProperty: "type"
                          },
                          message: "must have required property '" + "type" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err60];
                        } else {
                          vErrors.push(err60);
                        }
                        errors++;
                      }
                      if (data3.format === undefined) {
                        var err61 = {
                          instancePath: instancePath + "/root/nodes/" + i0,
                          schemaPath: "#/definitions/image/required",
                          keyword: "required",
                          params: {
                            missingProperty: "format"
                          },
                          message: "must have required property '" + "format" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err61];
                        } else {
                          vErrors.push(err61);
                        }
                        errors++;
                      }
                      if (data3.boundingBox === undefined) {
                        var err62 = {
                          instancePath: instancePath + "/root/nodes/" + i0,
                          schemaPath: "#/definitions/image/required",
                          keyword: "required",
                          params: {
                            missingProperty: "boundingBox"
                          },
                          message: "must have required property '" + "boundingBox" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err62];
                        } else {
                          vErrors.push(err62);
                        }
                        errors++;
                      }
                      if (data3.data === undefined) {
                        var err63 = {
                          instancePath: instancePath + "/root/nodes/" + i0,
                          schemaPath: "#/definitions/image/required",
                          keyword: "required",
                          params: {
                            missingProperty: "data"
                          },
                          message: "must have required property '" + "data" + "'"
                        };
                        if (vErrors === null) {
                          vErrors = [err63];
                        } else {
                          vErrors.push(err63);
                        }
                        errors++;
                      }
                      if (data3.type !== undefined) {
                        if ("image" !== data3.type) {
                          var err64 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/type",
                            schemaPath: "#/definitions/image/properties/type/const",
                            keyword: "const",
                            params: {
                              allowedValue: "image"
                            },
                            message: "must be equal to constant"
                          };
                          if (vErrors === null) {
                            vErrors = [err64];
                          } else {
                            vErrors.push(err64);
                          }
                          errors++;
                        }
                      }
                      if (data3.format !== undefined) {
                        var data34 = data3.format;
                        if (typeof data34 === "string") {
                          if (!pattern6.test(data34)) {
                            var err65 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/format",
                              schemaPath: "#/definitions/image/properties/format/pattern",
                              keyword: "pattern",
                              params: {
                                pattern: "^image/(png|svg\\+xml)$"
                              },
                              message: "must match pattern \"" + "^image/(png|svg\\+xml)$" + "\""
                            };
                            if (vErrors === null) {
                              vErrors = [err65];
                            } else {
                              vErrors.push(err65);
                            }
                            errors++;
                          }
                        } else {
                          var err66 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/format",
                            schemaPath: "#/definitions/image/properties/format/type",
                            keyword: "type",
                            params: {
                              type: "string"
                            },
                            message: "must be string"
                          };
                          if (vErrors === null) {
                            vErrors = [err66];
                          } else {
                            vErrors.push(err66);
                          }
                          errors++;
                        }
                      }
                      if (data3.boundingBox !== undefined) {
                        var data35 = data3.boundingBox;
                        if (data35 && _typeof(data35) == "object" && !Array.isArray(data35)) {
                          if (data35.width === undefined) {
                            var err67 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox",
                              schemaPath: "#/definitions/image/properties/boundingBox/required",
                              keyword: "required",
                              params: {
                                missingProperty: "width"
                              },
                              message: "must have required property '" + "width" + "'"
                            };
                            if (vErrors === null) {
                              vErrors = [err67];
                            } else {
                              vErrors.push(err67);
                            }
                            errors++;
                          }
                          if (data35.height === undefined) {
                            var err68 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox",
                              schemaPath: "#/definitions/image/properties/boundingBox/required",
                              keyword: "required",
                              params: {
                                missingProperty: "height"
                              },
                              message: "must have required property '" + "height" + "'"
                            };
                            if (vErrors === null) {
                              vErrors = [err68];
                            } else {
                              vErrors.push(err68);
                            }
                            errors++;
                          }
                          if (data35.x === undefined) {
                            var err69 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox",
                              schemaPath: "#/definitions/image/properties/boundingBox/required",
                              keyword: "required",
                              params: {
                                missingProperty: "x"
                              },
                              message: "must have required property '" + "x" + "'"
                            };
                            if (vErrors === null) {
                              vErrors = [err69];
                            } else {
                              vErrors.push(err69);
                            }
                            errors++;
                          }
                          if (data35.y === undefined) {
                            var err70 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox",
                              schemaPath: "#/definitions/image/properties/boundingBox/required",
                              keyword: "required",
                              params: {
                                missingProperty: "y"
                              },
                              message: "must have required property '" + "y" + "'"
                            };
                            if (vErrors === null) {
                              vErrors = [err70];
                            } else {
                              vErrors.push(err70);
                            }
                            errors++;
                          }
                          if (data35.width !== undefined) {
                            var data36 = data35.width;
                            if (typeof data36 == "number") {
                              if (data36 <= 0 || isNaN(data36)) {
                                var err71 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/width",
                                  schemaPath: "#/definitions/image/properties/boundingBox/properties/width/exclusiveMinimum",
                                  keyword: "exclusiveMinimum",
                                  params: {
                                    comparison: ">",
                                    limit: 0
                                  },
                                  message: "must be > 0"
                                };
                                if (vErrors === null) {
                                  vErrors = [err71];
                                } else {
                                  vErrors.push(err71);
                                }
                                errors++;
                              }
                            } else {
                              var err72 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/width",
                                schemaPath: "#/definitions/image/properties/boundingBox/properties/width/type",
                                keyword: "type",
                                params: {
                                  type: "number"
                                },
                                message: "must be number"
                              };
                              if (vErrors === null) {
                                vErrors = [err72];
                              } else {
                                vErrors.push(err72);
                              }
                              errors++;
                            }
                          }
                          if (data35.height !== undefined) {
                            var data37 = data35.height;
                            if (typeof data37 == "number") {
                              if (data37 <= 0 || isNaN(data37)) {
                                var err73 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/height",
                                  schemaPath: "#/definitions/image/properties/boundingBox/properties/height/exclusiveMinimum",
                                  keyword: "exclusiveMinimum",
                                  params: {
                                    comparison: ">",
                                    limit: 0
                                  },
                                  message: "must be > 0"
                                };
                                if (vErrors === null) {
                                  vErrors = [err73];
                                } else {
                                  vErrors.push(err73);
                                }
                                errors++;
                              }
                            } else {
                              var err74 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/height",
                                schemaPath: "#/definitions/image/properties/boundingBox/properties/height/type",
                                keyword: "type",
                                params: {
                                  type: "number"
                                },
                                message: "must be number"
                              };
                              if (vErrors === null) {
                                vErrors = [err74];
                              } else {
                                vErrors.push(err74);
                              }
                              errors++;
                            }
                          }
                          if (data35.x !== undefined) {
                            if (!(typeof data35.x == "number")) {
                              var err75 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/x",
                                schemaPath: "#/definitions/image/properties/boundingBox/properties/x/type",
                                keyword: "type",
                                params: {
                                  type: "number"
                                },
                                message: "must be number"
                              };
                              if (vErrors === null) {
                                vErrors = [err75];
                              } else {
                                vErrors.push(err75);
                              }
                              errors++;
                            }
                          }
                          if (data35.y !== undefined) {
                            if (!(typeof data35.y == "number")) {
                              var err76 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/y",
                                schemaPath: "#/definitions/image/properties/boundingBox/properties/y/type",
                                keyword: "type",
                                params: {
                                  type: "number"
                                },
                                message: "must be number"
                              };
                              if (vErrors === null) {
                                vErrors = [err76];
                              } else {
                                vErrors.push(err76);
                              }
                              errors++;
                            }
                          }
                          if (data35.z !== undefined) {
                            if (!(typeof data35.z == "number")) {
                              var err77 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox/z",
                                schemaPath: "#/definitions/image/properties/boundingBox/properties/z/type",
                                keyword: "type",
                                params: {
                                  type: "number"
                                },
                                message: "must be number"
                              };
                              if (vErrors === null) {
                                vErrors = [err77];
                              } else {
                                vErrors.push(err77);
                              }
                              errors++;
                            }
                          }
                        } else {
                          var err78 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/boundingBox",
                            schemaPath: "#/definitions/image/properties/boundingBox/type",
                            keyword: "type",
                            params: {
                              type: "object"
                            },
                            message: "must be object"
                          };
                          if (vErrors === null) {
                            vErrors = [err78];
                          } else {
                            vErrors.push(err78);
                          }
                          errors++;
                        }
                      }
                      if (data3.data !== undefined) {
                        var data41 = data3.data;
                        if (typeof data41 === "string") {
                          if (func2(data41) < 160) {
                            var err79 = {
                              instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                              schemaPath: "#/definitions/image/properties/data/minLength",
                              keyword: "minLength",
                              params: {
                                limit: 160
                              },
                              message: "must NOT have fewer than 160 characters"
                            };
                            if (vErrors === null) {
                              vErrors = [err79];
                            } else {
                              vErrors.push(err79);
                            }
                            errors++;
                          }
                        } else {
                          var err80 = {
                            instancePath: instancePath + "/root/nodes/" + i0 + "/data",
                            schemaPath: "#/definitions/image/properties/data/type",
                            keyword: "type",
                            params: {
                              type: "string"
                            },
                            message: "must be string"
                          };
                          if (vErrors === null) {
                            vErrors = [err80];
                          } else {
                            vErrors.push(err80);
                          }
                          errors++;
                        }
                      }
                    } else {
                      var err81 = {
                        instancePath: instancePath + "/root/nodes/" + i0,
                        schemaPath: "#/definitions/image/type",
                        keyword: "type",
                        params: {
                          type: "object"
                        },
                        message: "must be object"
                      };
                      if (vErrors === null) {
                        vErrors = [err81];
                      } else {
                        vErrors.push(err81);
                      }
                      errors++;
                    }
                    var _valid0 = _errs78 === errors;
                    if (_valid0 && valid4) {
                      valid4 = false;
                      passing0 = [passing0, 4];
                    } else {
                      if (_valid0) {
                        valid4 = true;
                        passing0 = 4;
                      }
                      var _errs98 = errors;
                      if (!validate17(data3, {
                        instancePath: instancePath + "/root/nodes/" + i0,
                        parentData: data2,
                        parentDataProperty: i0,
                        rootData: rootData
                      })) {
                        vErrors = vErrors === null ? validate17.errors : vErrors.concat(validate17.errors);
                        errors = vErrors.length;
                      }
                      var _valid0 = _errs98 === errors;
                      if (_valid0 && valid4) {
                        valid4 = false;
                        passing0 = [passing0, 5];
                      } else {
                        if (_valid0) {
                          valid4 = true;
                          passing0 = 5;
                        }
                        var _errs99 = errors;
                        if (data3 && _typeof(data3) == "object" && !Array.isArray(data3)) {
                          if (data3.$ref === undefined) {
                            var err82 = {
                              instancePath: instancePath + "/root/nodes/" + i0,
                              schemaPath: "#/properties/root/properties/nodes/items/oneOf/6/required",
                              keyword: "required",
                              params: {
                                missingProperty: "$ref"
                              },
                              message: "must have required property '" + "$ref" + "'"
                            };
                            if (vErrors === null) {
                              vErrors = [err82];
                            } else {
                              vErrors.push(err82);
                            }
                            errors++;
                          }
                          if (data3.$ref !== undefined) {
                            var data42 = data3.$ref;
                            if (typeof data42 === "string") {
                              if (!pattern7.test(data42)) {
                                var err83 = {
                                  instancePath: instancePath + "/root/nodes/" + i0 + "/$ref",
                                  schemaPath: "#/properties/root/properties/nodes/items/oneOf/6/properties/%24ref/pattern",
                                  keyword: "pattern",
                                  params: {
                                    pattern: "^(mol\\d+|rg[1-9]\\d*)"
                                  },
                                  message: "must match pattern \"" + "^(mol\\d+|rg[1-9]\\d*)" + "\""
                                };
                                if (vErrors === null) {
                                  vErrors = [err83];
                                } else {
                                  vErrors.push(err83);
                                }
                                errors++;
                              }
                            } else {
                              var err84 = {
                                instancePath: instancePath + "/root/nodes/" + i0 + "/$ref",
                                schemaPath: "#/properties/root/properties/nodes/items/oneOf/6/properties/%24ref/type",
                                keyword: "type",
                                params: {
                                  type: "string"
                                },
                                message: "must be string"
                              };
                              if (vErrors === null) {
                                vErrors = [err84];
                              } else {
                                vErrors.push(err84);
                              }
                              errors++;
                            }
                          }
                        } else {
                          var err85 = {
                            instancePath: instancePath + "/root/nodes/" + i0,
                            schemaPath: "#/properties/root/properties/nodes/items/oneOf/6/type",
                            keyword: "type",
                            params: {
                              type: "object"
                            },
                            message: "must be object"
                          };
                          if (vErrors === null) {
                            vErrors = [err85];
                          } else {
                            vErrors.push(err85);
                          }
                          errors++;
                        }
                        var _valid0 = _errs99 === errors;
                        if (_valid0 && valid4) {
                          valid4 = false;
                          passing0 = [passing0, 6];
                        } else {
                          if (_valid0) {
                            valid4 = true;
                            passing0 = 6;
                          }
                        }
                      }
                    }
                  }
                }
              }
              if (!valid4) {
                var err86 = {
                  instancePath: instancePath + "/root/nodes/" + i0,
                  schemaPath: "#/properties/root/properties/nodes/items/oneOf",
                  keyword: "oneOf",
                  params: {
                    passingSchemas: passing0
                  },
                  message: "must match exactly one schema in oneOf"
                };
                if (vErrors === null) {
                  vErrors = [err86];
                } else {
                  vErrors.push(err86);
                }
                errors++;
              } else {
                errors = _errs9;
                if (vErrors !== null) {
                  if (_errs9) {
                    vErrors.length = _errs9;
                  } else {
                    vErrors = null;
                  }
                }
              }
            }
          } else {
            var err87 = {
              instancePath: instancePath + "/root/nodes",
              schemaPath: "#/properties/root/properties/nodes/type",
              keyword: "type",
              params: {
                type: "array"
              },
              message: "must be array"
            };
            if (vErrors === null) {
              vErrors = [err87];
            } else {
              vErrors.push(err87);
            }
            errors++;
          }
        }
      } else {
        var err88 = {
          instancePath: instancePath + "/root",
          schemaPath: "#/properties/root/type",
          keyword: "type",
          params: {
            type: "object"
          },
          message: "must be object"
        };
        if (vErrors === null) {
          vErrors = [err88];
        } else {
          vErrors.push(err88);
        }
        errors++;
      }
    }
    for (var key1 in data) {
      if (pattern0.test(key1)) {
        if (!validate19(data[key1], {
          instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"),
          parentData: data,
          parentDataProperty: key1,
          rootData: rootData
        })) {
          vErrors = vErrors === null ? validate19.errors : vErrors.concat(validate19.errors);
          errors = vErrors.length;
        }
      }
    }
    for (var key2 in data) {
      if (pattern1.test(key2)) {
        if (!validate24(data[key2], {
          instancePath: instancePath + "/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"),
          parentData: data,
          parentDataProperty: key2,
          rootData: rootData
        })) {
          vErrors = vErrors === null ? validate24.errors : vErrors.concat(validate24.errors);
          errors = vErrors.length;
        }
      }
    }
    for (var key3 in data) {
      if (pattern2.test(key3)) {
        var data45 = data[key3];
        if (data45 && _typeof(data45) == "object" && !Array.isArray(data45)) {
          if (data45.moleculeName !== undefined) {
            if (typeof data45.moleculeName !== "string") {
              var err89 = {
                instancePath: instancePath + "/" + key3.replace(/~/g, "~0").replace(/\//g, "~1") + "/moleculeName",
                schemaPath: "#/definitions/header/properties/moleculeName/type",
                keyword: "type",
                params: {
                  type: "string"
                },
                message: "must be string"
              };
              if (vErrors === null) {
                vErrors = [err89];
              } else {
                vErrors.push(err89);
              }
              errors++;
            }
          }
        } else {
          var err90 = {
            instancePath: instancePath + "/" + key3.replace(/~/g, "~0").replace(/\//g, "~1"),
            schemaPath: "#/definitions/header/type",
            keyword: "type",
            params: {
              type: "object"
            },
            message: "must be object"
          };
          if (vErrors === null) {
            vErrors = [err90];
          } else {
            vErrors.push(err90);
          }
          errors++;
        }
      }
    }
  } else {
    var err91 = {
      instancePath: instancePath,
      schemaPath: "#/type",
      keyword: "type",
      params: {
        type: "object"
      },
      message: "must be object"
    };
    if (vErrors === null) {
      vErrors = [err91];
    } else {
      vErrors.push(err91);
    }
    errors++;
  }
  validate10.errors = vErrors;
  return errors === 0;
}
compiledSchema["default"] = _default;

export { compiledSchema as default };
//# sourceMappingURL=compiledSchema.modern.js.map
