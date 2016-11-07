const React = require('react');
const ReactRedux = require('react-redux');

const StepMenu = require('../components/StepMenu.jsx');
const TargetRelease = require('./TargetRelease.jsx');
const TargetReleaseRO = require('./TargetReleaseRO.jsx');
const ButtonGitUpdate = require('./buttons/GitUpdate.jsx');

const Approval = require('./Approval.jsx');
const ApprovalRO = require('./ApprovalRO.jsx');
const Deployment = require('./Deployment.jsx');
const DeployPlan = require('./DeployPlan.jsx');
const DeployPlanRO = require('./DeployPlanRO.jsx');
const Messages = require('../components/Messages.jsx');
const Modal = require('../Modal.jsx');
const LoadingBar = require('../components/LoadingBar.jsx');

const actions = require('../_actions.js');
const constants = require('../constants/deployment.js');

function calculateSteps(props) {
	return [
		{
			title: "Target Release",
			show: props.show[0],
			is_loading: props.is_loading[0],
			is_finished: props.is_finished[0]
		},
		{
			title: "Deployment Plan",
			show: props.show[1],
			is_loading: props.is_loading[1],
			is_finished: props.is_finished[1]
		},
		{
			title: "Approval",
			show: props.show[2],
			is_loading: props.is_loading[2],
			is_finished: props.is_finished[2]
		},
		{
			title: "Deployment",
			show: props.show[3],
			is_loading: props.is_loading[3],
			is_finished: props.is_finished[3]
		}
	];
}


const DeployModal = React.createClass({

	componentDidMount: function() {
		window.addEventListener("resize", this.resize);
		const bodyElements = document.getElementsByClassName("modal-body");
		if (bodyElements.length === 0) {
			return;
		}

		this.bodyElement = bodyElements[0];
		this.bodyElement.addEventListener("scroll", this.calculateActiveSection);

		this.resize();
		this.calculateActiveSection();
	},

	componentDidUpdate: function() {
		this.resize();
		this.calculateActiveSection();
	},

	componentWillUnmount: function() {
		window.removeEventListener("resize", this.resize);
		if (this.bodyElement) {
			this.bodyElement.removeEventListener("scroll", this.calculateActiveSection);
		}
	},

	bodyElement: null,

	calculateActiveSection: function() {
		// menu items
		const menuItems = $('.menu').find("li");
		// section anchors corresponding to menu items
		const scrollItems = menuItems.map(function() {
			const item = $($(this).attr("href"));
			if (item.length) { return item; }
		});

		// this is a carefully hand tweaked value (:P) that will ensure that when a section
		// is reasonable in view it will mark the menu as active
		const topOffset = 230;

		// find all items that are above the topOffset
		const cur = scrollItems.map(function() {
			if ($(this).offset().top < topOffset) {
				return this;
			}
		});
		// we take the last item in the list above and mark it as action
		if (cur && cur.length) {
			$(menuItems[cur.length - 1]).addClass("active");
			$(menuItems[cur.length - 1]).siblings().removeClass("active");
		}
	},

	// calculate and set a pixel value on the modal height instead of a percentage
	// value so that we get a scrollbar inside the body of the modal
	resize: function() {
		// We need to calculate the height of the ".modal .body" in the browsers window
		let headerHeight = 0;
		const headerElements = document.getElementsByClassName("modal-header");
		if (headerElements.length > 0) {
			headerHeight = headerElements[0].offsetHeight;
		}
		const bodyElements = document.getElementsByClassName("modal-body");
		let bodyHeight = 0;
		if (bodyElements.length > 0) {
			// leave 16px of space to the bottom of the window
			bodyHeight = (window.innerHeight - headerHeight) - 16;
		}

		if (bodyHeight === 0) {
			return;
		}

		// Increase the height of the modal, this cannot be done reliable in CSS because
		// a pixel value is required to use the "sticky" side bar
		bodyElements[0].style.height = bodyHeight + 'px';

		// first reset the height of all sections in case additional siblings have
		// been loaded.
		const sections = this.bodyElement.getElementsByClassName("section");
		for (let i = 0; i > sections.length; i++) {
			sections[i].style.minHeight = null;
		}

		const lastSection = sections[sections.length - 1];
		if (lastSection) {
			const sectionHeight = sections[sections.length - 1].offsetHeight;
			// calculate the required margin to pad the section so that it can be
			// properly scrolled to the top
			const sectionMargin = bodyHeight - sectionHeight;
			if (sectionMargin > 0) {
				lastSection.style.minHeight = sectionMargin + 'px';
			}
		}
	},

	render: function() {
		const steps = calculateSteps(this.props);

		const content = [];

		content[0] = (
			<div key={0} className="section">
				<LoadingBar show />
			</div>
		);
		if (steps[0].show) {
			if (this.props.can_edit) {
				content[0] = (<TargetRelease key={0} />);
			} else {
				content[0] = (<TargetReleaseRO key={0} />);
			}
		}
		if (steps[1].show) {
			if (this.props.can_edit) {
				content[1] = (<DeployPlan key={1} />);
			} else {
				content[1] = (<DeployPlanRO key={1} />);
			}
		}
		if (steps[2].show) {
			if (this.props.can_edit) {
				content[2] = (<Approval key={2} />);
			} else {
				content[2] = (<ApprovalRO key={2} />);
			}
		}
		if (steps[3].show) {
			content[3] = (<Deployment key={3} />);
		}

		let options = [];
		if (this.props.deployment_id && constants.canDelete(this.props.state)) {
			options.push({
				title: "Delete",
				handler: this.props.onDelete
			});
		}

		return (
			<Modal
				show={this.props.is_open}
				className="deploy"
				closeHandler={this.props.onClose}
				title={"Deploy to " + this.props.project_name + ' / ' + this.props.environment_name}
				closeTitle="Close"
				options={options}
			>
				<div className="row">
					<div className="col-md-3 menu affix">
						<StepMenu
							steps={steps}
							value={this.props.active_step}
							onClick={this.props.onStepClick}
						/>
					</div>
					<div className="col-md-9 main" >
						<div className="deploy-form">
							<Messages
								messages={this.props.messages}
							/>
							<div>
								<div className="fetch">
									<div className="pull-right">
										<ButtonGitUpdate />
									</div>
									<div><i className="fa fa-code" aria-hidden="true"></i> Last synced {this.props.last_fetched_date} <span className="small">{this.props.last_fetched_ago}</span></div>
									<div><i>Ensure you have the most recent code before setting up your deployment</i></div>
								</div>
								{content}
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
});

const mapStateToProps = function(state, ownProps) {
	function deployPlanIsOk() {
		return state.plan.validation_code === 'success' || state.plan.validation_code === 'warning';
	}

	let active_step = 0;
	if (window.location.hash) {
		active_step = parseInt(window.location.hash.substring(1), 10);
	}

	return {
		show: [
			(!state.git.is_loading && !state.deployment.is_loading),
			state.git.selected_ref !== "",
			state.deployment.id !== "",
			state.deployment.approved
		],
		is_loading: [
			state.git.is_loading || state.git.is_updating,
			state.plan.is_loading || state.deployment.is_loading,
			state.deployment.approval_is_loading,
			constants.isDeploying(state.deployment.state)
		],
		is_finished: [
			state.git.selected_ref !== "",
			state.deployment.id !== "",
			deployPlanIsOk() && state.deployment.approved,
			constants.isDeployDone(state.deployment.state)
		],
		can_edit: constants.canEdit(state),
		is_open: typeof (ownProps.params.id) !== 'undefined' && ownProps.params.id !== null,
		plan_success: deployPlanIsOk(),
		messages: state.messages,
		sha_is_selected: (state.git.selected_ref !== ""),
		last_fetched_date: state.git.last_fetched_date,
		last_fetched_ago: state.git.last_fetched_ago,
		can_deploy: state.deployment.approved,
		state: state.deployment.state,
		active_step: active_step,
		environment_name: state.environment.name,
		project_name: state.environment.project_name,
		deployment_id: state.deployment.id
	};
};

const mapDispatchToProps = function(dispatch) {
	return {
		onClose: function() {
			actions.history.push('/');
		},
		onStepClick: function(active_step) {
			document.location.hash = active_step;
		},
		onDelete: function() {
			dispatch(actions.deleteDeployment())
				.then(() => actions.history.push('/'));
		}
	};
};

module.exports = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(DeployModal);
