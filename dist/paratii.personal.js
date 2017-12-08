"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Perhaps this is not really necessary
var ParatiiPersonal = exports.ParatiiPersonal = function () {
  function ParatiiPersonal(context) {
    _classCallCheck(this, ParatiiPersonal);

    this.context = context;
  }

  _createClass(ParatiiPersonal, [{
    key: "setAccount",
    value: function setAccount(address, privateKey) {
      return this.context.setAccount(address, privateKey);
    }
  }]);

  return ParatiiPersonal;
}();