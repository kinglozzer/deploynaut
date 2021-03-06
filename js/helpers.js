/**
 * Helper class to concatinate strings depeding on a true or false.
 *
 * Example:
 * var classes = Helpers.classNames({
 *     "deploy-dropdown": true,
 *     "loading": false,
 *     "open": true,
 * });
 *
 * then classes will equal "deploy-dropdown open"
 *
 * @returns {string}
 */
module.exports = {
	classNames: function classNames() {
		var classes = '';
		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) {
				continue;
			}

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes += ' ' + arg;

			} else if (Array.isArray(arg)) {
				classes += ' ' + classNames.apply(null, arg);

			} else if (argType === 'object') {
				for (var key in arg) {
					if (arg.hasOwnProperty(key) && arg[key]) {
						classes += ' ' + key;
					}
				}
			}
		}
		return classes.substr(1);
	}
};
