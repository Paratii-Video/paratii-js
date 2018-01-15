'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.ParatiiUtils = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _paratiiEth = require('./paratii.eth.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var crypto = require('crypto');
var Web3 = require('web3');
var dopts = require('default-options');

var ParatiiUtils = exports.ParatiiUtils = function () {
	function ParatiiUtils(config) {
		(0, _classCallCheck3.default)(this, ParatiiUtils);

		var defaults = {
			provider: 'http://localhost:8545/rpc/',
			wsprovider: 'ws://localhost:8546/rpc/',
			registryAddress: null,
			account: {
				address: null,
				privateKey: null
			},
			web3: null,
			isTestNet: false
		};
		var options = dopts(config, defaults, { allowUnknown: true });
		this.config = config;

		if (options.web3) {
			this.web3 = options.web3;
		} else {
			this.web3 = new Web3();
			this.web3.setProvider(new this.web3.providers.HttpProvider(options.provider));
		}

		if (this.config.account.privateKey) {
			this.web3.eth.defaultAccount = this.config.account.address;
			this.web3.eth.accounts.wallet.add(this.config.account.privateKey);
		}
	}

	(0, _createClass3.default)(ParatiiUtils, [{
		key: 'newChallenge',
		value: function newChallenge() {
			return crypto.newRandomBytes(20).toString('hex');
		}
	}, {
		key: 'signMessage',
		value: function signMessage(messageToSign) {
			return this.web3.eth.sign(messageToSign, this.config.account.privateKey);
		}
	}, {
		key: 'recoverAccount',
		value: function recoverAccount(msg) {
			return this.web3.eth.accounts.recover(msg);
		}
	}]);
	return ParatiiUtils;
}();