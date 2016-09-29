var React = require("react");
var ReactRedux = require('react-redux');

var Dropdown = require('../components/Dropdown.jsx');
var RequestApproval = require('./buttons/RequestApproval.jsx');
var CancelApprovalRequest = require('./buttons/CancelApprovalRequest.jsx');
var ApproveRequest = require('./buttons/ApproveRequest.jsx');
var RejectRequest = require('./buttons/RejectRequest.jsx');
var Bypass = require('./buttons/Bypass.jsx');

var actions = require('../_actions.js');

function Approval(props) {

	var sentTime = null;
	if (props.requested) {
		var date = new Date(props.requestSentTime);
		sentTime = "Sent: " + date.toTimeString();
	}

	return (

		<div className="section">
			<header id="2">Approval</header>

			<p>
				Once this request has been approved, your team will be able to
				progress to the final Deployment step.
			</p>

			<div className="form-group">
				<label htmlFor="approver">Request approval from</label>
				<Dropdown
					name="approver"
					options={props.approvers}
					value={props.selected_approver}
					onSelect={props.onApproverSelect}
					disabled={props.disabled}
				/>
				<small>
					Only one request can be active at a time, approval can also
					be granted by others with the same access level, e.g. Release
					manager.
				</small>
			</div>
			<div>
				{sentTime}
			</div>
			<div>
				<RequestApproval /> <CancelApprovalRequest />
			</div>
			<div>
				<ApproveRequest /> <RejectRequest />
			</div>
			<div>
				<Bypass />
			</div>
		</div>
	);
}

function isDisabled(state) {
	if (state.approval.request_sent) {
		return true;
	}
	if (state.approval.approved) {
		return true;
	}
	if (state.approval.bypassed) {
		return true;
	}
	if (state.deployment.enqueued) {
		return true;
	}
	return false;
}

const mapStateToProps = function(state) {

	const approvers = state.approval.approvers.map(function(val) {
		return {
			key: val.id,
			value: val.email + " - " + val.role
		};
	});


	return {
		disabled: isDisabled(state),
		requested: state.approval.requested,
		requestSent: state.approval.request_sent,
		requestSentTime: state.approval.request_sent_time,
		approvers: approvers,
		selected_approver: state.approval.approved_by || 0
	};
};

const mapDispatchToProps = function(dispatch) {
	return {
		onApproverSelect: function(id) {
			dispatch(actions.setApprover(id));
		}
	};
};

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Approval);
