import React, { Component } from 'react'

import ResultRow from './ResultBox'
import ResultHeader from './ResultHeader'

const CourseResults = (props) => {
  getVote = () => {
    return Math.round(Math.random() * 50)
  }

  render() {
    return (
      <div className="curri-column">
        <ResultHeader
          title1={this.props.course}
          title2='Useful'
          title3='Must'
        />
        {this.props.topics.map(topic =>
          <ResultRow
            key={topic.name}
            course={this.props.course}
            topic={topic}
            text={topic.name}
            votes={this.getVote()}
            votes2={this.getVote()}
          />
        )}
        <ResultHeader
          title1='Total'
          title2='NaN'
          title3='NaN'
        />
      </div>
    )
  }
}

export default CourseResults