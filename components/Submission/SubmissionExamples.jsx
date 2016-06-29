import React from 'react'
import Submission from './Submission'

require('./SubmissionExamples.scss')

const submission = {
  id: 352,
  type: 'Final',
  data: {
    submitterRank: 1,
    submissionId: 30048733,
    createdAt: 'May 19, 2016 | 12:02h'
  }
}

const SubmissionExample = () => (
  <div>
    <div className="submission-card">
      <Submission submission={ submission } />
    </div>
    <br/>
  </div>
)

module.exports = SubmissionExample
