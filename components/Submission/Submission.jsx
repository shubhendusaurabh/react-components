import React from 'react'
import classNames from 'classnames'

require('./Submission.scss')

const Submission = ({submission}) => {

  return (
    <div className="Submission">
      <div className="drag-handle">
        <i className="fa fa-align-justify" />
      </div>
      <div className="submission-rank">
        <div className="up-arrow"><i className="fa fa-arrow-up"/></div>
        <div className="rank">{ submission.data.submitterRank }</div>
        <div className="down-arrow"><i className="fa fa-arrow-down"/></div>
      </div>
      <div className="submission-thumbnail">
        <img src={ submission.thumbnail } />
      </div>
      <div className="submission-id">{ submission.data.submissionId }</div>
      <div className="submission-date">{ submission.data.createdAt }</div>
      <div className="submission-type">{ submission.type }</div>
      <div className="actions">
        <div className="download-action">
          <i className="fa fa-download"/>
          <span className="action-text">Download</span>
        </div>
        <div className="delete-action">
          <i className="fa fa-trash-o"/>
          <span className="action-text">Delete</span>
        </div>
      </div>
    </div>
  )
}

Submission.propTypes = {
  submission :  React.PropTypes.object.isRequired
}

export default Submission
