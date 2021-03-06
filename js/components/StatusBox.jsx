var React = require("react");

var StatusBox = function(props) {
	return (
		<div className={"status-box " + props.type}>
			{props.children}
		</div>
	);
};

StatusBox.propTypes = {
	type: React.PropTypes.string,
};

StatusBox.defaultProps = {
	type: "default"
};

module.exports = StatusBox;
