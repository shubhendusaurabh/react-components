/* global
  fetch
*/

import moment from 'moment';
import _ from 'lodash';
/**
 * Progress Bar Tooltip.
 *
 * It renders the tooltip with detailed timeline of a specified challenge.
 * As TC API v2 does not provide all necessary information for some types of
 * challenges, this component does not work perfect yet.
 *
 * USAGE:
 * Wrap with <ProgressBarTooltip></ProgressBarTooltip> the element(s) which should
 * show the tooltip when hovered. Pass in the challenge details object via the
 * 'challenge' prop.
 */

import React, { PropTypes as PT } from 'react';
import Tooltip from '../Tooltip';
import LoaderIcon from '../../../Loader/Loader.cjsx';
import './ProgressBarTooltip.scss';

const ID_LENGTH = 6;

const getDate = date => moment(date).format('MMM DD');
const getTime = (date) => {
  const duration = moment(date);
  const hour = duration.hours();
  const hString = hour < 10 ? `0${hour}` : hour;
  const min = duration.minutes();
  const mString = min < 10 ? `0${min}` : min;
  const res = `${hString}:${mString}`;
  return res[1] === '-' ? 'Late' : `${res}`;
};

/**
 * Renders a separate challenge phase element.
 * It includes: phase name, starting date, the point, representing the starting
 * date, the bar with inner-bar, representing the progress.
 * @param {Date} props.date Starting date of the phase.
 * @param {Boolean} props.last If true, the 'last' class will be added to the progress
 *  bar, allowing to hide it for the last phase element, which represent the end point
 *  of the challenge.
 * @param {String} props.phase Name of the phase.
 * @param {String} props.progress The progress of the phase. It will set the width
 *  of the colored part of the progress bar.
 * @param {Boolean} props.started When true, the 'started' class is added to the
 *  progress bar, allowing to color the point at its start.
 * @param {String} props.width The width of the phase element in the UI.
 */
function Phase(props) {
  const progress = props.progress;
  const limitProgress = parseFloat(_.replace(progress, '%', ''));
  const limitWidth = limitProgress <= 100 ? limitProgress : 100;
  return (
    <div className="phase">
      <div>{props.phase}</div>
      <div className={`bar ${props.last ? 'last' : ''} ${props.started ? 'started' : ''}`}>
        <div className="point" />
        <div className="inner-bar" style={{ width: `${limitWidth}%` }} />
      </div>
      <div className="date">
        {props.isLoaded ? `${getDate(props.date)}, ${getTime(props.date)}` : <span className="loading"><LoaderIcon /></span>}
      </div>
    </div>
  );
}

Phase.defaultProps = {
  isLoaded: false,
};

Phase.propTypes = {
  date: PT.shape({}).isRequired,
  last: PT.bool.isRequired,
  phase: PT.string.isRequired,
  progress: PT.string.isRequired,
  started: PT.bool.isRequired,
  isLoaded: PT.bool,
};

/**
 * Renders the tooltip's content.
 */
function Tip(props) {
  const c = props.challenge;
  const isLoaded = props.isLoaded;
  if (!c) return <div />;
  // TC API v2 does not provide detailed information on challenge phases,
  // it just includes some deadlines into the challenge details. The code below,
  // sorts these deadlines by their dates, and then generates the challenge timeline.
  // The result should be fine for simple dev challenges, but will be strange for
  // such as Assembly, etc.
  let steps = c.allPhases || [];
  steps = steps.map((step, index) => {
    let progress = 0;
    const now = moment();
    let left = 1000 * moment.duration(now.diff(moment(step.scheduledStartTime))).asSeconds();
    let duration = 1000 * moment.duration(moment(step.scheduledEndTime).diff(moment(step.scheduledStartTime))).asSeconds();
    if (left < 0) progress = -1;
    else progress = 100 * (left / duration);

    const phaseId = index;
    return (
      <Phase
        date={moment(step.scheduledStartTime)}
        key={phaseId}
        phase={step.phaseType}
        last={index === steps.length - 1}
        progress={`${progress}%`}
        started={moment(step.scheduledStartTime) > now}
        isLoaded={isLoaded}
      />
    );
  });

  return (
    <div className="tip">
      {steps}
    </div>
  );
}

Tip.defaultProps = {
  isLoaded: false,
};

Tip.propTypes = {
  challenge: PT.shape({}).isRequired,
  isLoaded: PT.bool,
};

/**
 * Renders the tooltip.
 */
class ProgressBarTooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chDetails: {},
      isLoaded: false,
    };
    this.onTooltipHover = this.onTooltipHover.bind(this);
  }
  onTooltipHover() {
    this.setState({
      chDetails: this.props.challenge,
      isLoaded: true,
    });
  }
  render() {
    const tip = <Tip challenge={this.state.chDetails} isLoaded={this.state.isLoaded} />;
    return (
      <Tooltip className="progress-bar-tooltip" content={tip} onTooltipHover={this.onTooltipHover}>
        {this.props.children}
      </Tooltip>
    );
  }
}
ProgressBarTooltip.defaultProps = {
  challenge: {},
  config: {},
};

ProgressBarTooltip.propTypes = {
  challenge: PT.shape({}),
  children: PT.node.isRequired,
  config: PT.object,
};

export default ProgressBarTooltip;
