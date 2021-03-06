<?php

use Gitonomy\Git\Reference\Tag;

class DNTag extends ViewableData {

	/**
	 * @var Gitonomy\Git\Reference\Tag
	 */
	protected $tag = null;

	protected $project = null;

	protected $data = null;

	protected $name = null;

	protected $references = null;

	private static $casting = array(
		'Name' => 'Text',
		'SHA' => 'Text'
	);

	/**
	 * @param Tag $tag
	 * @param DNProject $project
	 * @param DNData $data
	 */
	public function  __construct(Tag $tag, DNProject $project, DNData $data) {
		$this->tag = $tag;
		$this->project = $project;
		$this->data = $data;
	}

	/**
	 * @return string
	 */
	public function Name() {
		return htmlentities($this->tag->getName());
	}

	/**
	 * @return string
	 */
	public function SHA() {
		return htmlentities($this->tag->getCommitHash());
	}

	/**
	 * @return SS_Datetime
	 */
	public function Created() {
		$created = $this->tag->getCommit()->getCommitterDate();

		$created->setTimezone(new DateTimeZone(date_default_timezone_get()));

		$d = SS_Datetime::create();
		$d->setValue($created->format('Y-m-d H:i:s'));

		return $d;
	}

}
