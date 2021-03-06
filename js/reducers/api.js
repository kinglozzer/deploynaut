const _ = require('underscore');

const actions = require('../_api.js');

module.exports = function api(state, action) {
	if (typeof state === 'undefined') {
		return {
			endpoint: '',
			auth: {
				name: "",
				value: ""
			}
		};
	}
	switch (action.type) {
		case actions.SETUP_API: {
			return _.assign({}, state, {
				dispatchers: action.dispatchers,
				auth: {
					name: action.auth.name,
					value: action.auth.value
				}
			});
		}
		default:
			return state;
	}
};
