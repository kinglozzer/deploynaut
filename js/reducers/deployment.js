const _ = require('underscore');

const actions = require('../_actions.js');

const initialState = {
	// this is the time of the last update we got from the server
	// it is used for syncronising with the backend
	server_time: 0,
	is_creating: false,
	is_loading: false,
	is_queuing: false,
	// this is the "list" (actually an object) of all deployments that we fetched, updated etc keyed by deployment id
	list: {},
	// point to a deployment in the list above and is used to for the modal
	current_id: "",
	// this is a "list" (actually an object) of deployment logs keyed by the deployment id
	logs: {},
	history_error: null,
	error: null,
	current_page: 1,
	history_is_loading: false,
	abort_is_loading: false
};

module.exports = function deployment(state, action) {
	if (typeof state === 'undefined') {
		return initialState;
	}

	switch (action.type) {
		case actions.SET_DEPLOY_HISTORY_PAGE: {
			return _.assign({}, state, {
				current_page: action.page
			});
		}
		case actions.START_DEPLOY_HISTORY_GET:
			return _.assign({}, state, {
				history_is_loading: true
			});
		case actions.FAIL_DEPLOY_HISTORY_GET:
			return _.assign({}, state, {
				history_is_loading: false,
				history_error: action.error.toString()
			});
		case actions.SUCCEED_DEPLOY_HISTORY_GET: {
			// get current list
			const newList = _.assign({}, state.list);
			let new_current_build_id = null;

			// add or update the entries in the current list
			for (let i = 0; i < action.data.list.length; i++) {
				// if one of the new entries is the current_build,
				// we'll be invalidating the current one for the new one
				if (action.data.list[i].is_current_build === true) {
					new_current_build_id = action.data.list[i].id;
				}
				newList[action.data.list[i].id] = action.data.list[i];
			}

			if (new_current_build_id !== null) {
				// first of all, set everything to not be the current build
				Object.keys(newList).forEach(function(key) {
					newList[key].is_current_build = false;
				});
				// now set the item we need to current
				newList[new_current_build_id].is_current_build = true;
			}

			return _.assign({}, state, {
				server_time: action.data.server_time,
				list: newList,
				history_is_loading: false
			});
		}
		case actions.NEW_DEPLOYMENT:
			return _.assign({}, state, {
				current_id: "",
				error: null,
			});

		case actions.START_DEPLOYMENT_CREATE:
			return _.assign({}, state, {
				is_creating: true,
			});

		case actions.SUCCEED_DEPLOYMENT_CREATE: {
			const newList = _.assign({}, state.list);
			newList[action.data.deployment.id] = action.data.deployment;
			return _.assign({}, state, {
				is_creating: false,
				current_id: action.data.deployment.id,
				list: newList
			});
		}

		case actions.FAIL_DEPLOYMENT_CREATE:
			return _.assign({}, state, {
				is_creating: false,
				error: action.error.toString()
			});

		case actions.START_DEPLOYMENT_GET:
			return _.assign({}, state, {
				is_loading: true,
				error: null
			});

		case actions.SET_APPROVER: {
			if (!state.list[state.current_id]) {
				return state;
			}
			const newList = _.assign({}, state.list);
			newList[state.current_id].approver_id = action.id;
			return _.assign({}, state, {
				list: newList
			});
		}

		case actions.SET_REJECT_REASON: {
			if (!state.list[state.current_id]) {
				return state;
			}
			const newList = _.assign({}, state.list);
			newList[state.current_id].rejected_reason = action.value;

			return _.assign({}, state, {
				list: newList
			});
		}

		case actions.START_DEPLOYMENT_QUEUE:
			return _.assign({}, state, {
				is_queuing: true
			});

		case actions.SUCCEED_APPROVAL_SUBMIT:
		case actions.SUCCEED_APPROVAL_CANCEL:
		case actions.SUCCEED_APPROVAL_APPROVE:
		case actions.SUCCEED_APPROVAL_REJECT:
		case actions.SUCCEED_DEPLOYMENT_QUEUE:
		case actions.SUCCEED_DEPLOYMENT_GET: {
			// get current list
			const newList = _.assign({}, state.list);
			newList[action.data.deployment.id] = action.data.deployment;

			return _.assign({}, state, {
				is_loading: false,
				is_queuing: false,
				error: null,
				current_id: action.data.deployment.id,
				list: newList
			});
		}

		case actions.FAIL_DEPLOYMENT_QUEUE:
		case actions.FAIL_DEPLOY_LOG_UPDATE:
		case actions.FAIL_DEPLOYMENT_GET:
			return _.assign({}, state, {
				is_loading: false,
				error: action.error.toString()
			});

		case actions.SUCCEED_DEPLOY_LOG_UPDATE: {
			const newList = _.assign({}, state.list);
			newList[action.data.deployment.id] = action.data.deployment;

			const newLogList = _.assign({}, state.logs);
			newLogList[action.data.deployment.id] = action.data.message;

			return _.assign({}, state, {
				logs: newLogList,
				error: null,
				list: newList
			});
		}
		case actions.SUCCEED_DEPLOYMENT_DELETE: {
			// get current list
			const newList = _.assign({}, state.list);
			newList[action.data.deployment.id] = action.data.deployment;

			return _.assign({}, state, {
				error: null,
				list: newList
			});
		}

		case actions.SET_TITLE:
		case actions.SET_SUMMARY:
		case actions.SET_REVISION:
		case actions.TOGGLE_OPTION: {
			if (!state.list[state.current_id]) {
				return state;
			}
			const newList = _.assign({}, state.list);
			newList[state.current_id].dirty = true;
			return _.assign({}, state, {
				list: newList
			});
		}

		case actions.START_ABORT_DEPLOYMENT:
			return _.assign({}, state, {
				abort_is_loading: true
			});
		case actions.FAIL_ABORT_DEPLOYMENT:
			return _.assign({}, state, {
				abort_is_loading: false
			});
		case actions.SUCCEED_ABORT_DEPLOYMENT: {
			const newList = _.assign({}, state.list);
			newList[action.data.deployment.id] = action.data.deployment;

			return _.assign({}, state, {
				list: newList,
				abort_is_loading: false
			});
		}

		default:
			return state;
	}
};
