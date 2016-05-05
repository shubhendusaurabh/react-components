import React, {Component, PropTypes} from 'react'
import ReactDOM from 'react-dom'
import SearchSuggestions from '../SearchSuggestions/SearchSuggestions'
import Loader from '../Loader/Loader'

import classNames from 'classnames'
require('./SearchBar.scss')

class SearchBar extends Component {
  constructor(props) {
    super(props)

    const initialTerm = this.getQueryStringValue(props.searchTermKey)

    this.state = {
      // Possible search states: 'empty', 'filled', or 'focused'
      searchState: initialTerm.length ? 'filled' : 'empty',
      suggestions: [],
      searchValue: initialTerm
    }

    this.onFocus     = this.onFocus.bind(this)
    this.onChange    = this.onChange.bind(this)
    this.onKeyUp     = this.onKeyUp.bind(this)

    this.clearSearch = this.clearSearch.bind(this)
    this.search      = this.search.bind(this)

    this.handleSuggestionSelect  = this.handleSuggestionSelect.bind(this)
    this.handleOutsideClick      = this.handleOutsideClick.bind(this)
    this.handleSuggestionsUpdate = this.handleSuggestionsUpdate.bind(this)
  }

  componentDidMount() {
    window.addEventListener('click', this.handleOutsideClick)
  }

  componentWillUnmount() {
    window.removeEventListener('click', this.handleOutsideClick)
  }

  getQueryStringValue(key) {
    return unescape(window.location.href.replace(new RegExp('^(?:.*[&\\?]' + escape(key).replace(/[\.\+\*]/g, '\\$&') + '(?:\\=([^&]*))?)?.*$', 'i'), '$1'))
  }


  handleOutsideClick(event) {
    const searchBarNode = ReactDOM.findDOMNode(this)

    let target = event.target
    let i = 0
    let clickedInside = false

    // TODO: Add comment to explain approach
    while(target !== null && i < 10) {
      i++
      if (target === searchBarNode) {
        clickedInside = true
        break
      }
      target = target.parentNode
    }

    if (!clickedInside) {
      if(this.state.searchValue) {
        this.setState({ searchState: 'filled' })

      } else {
        this.setState({ searchState: 'empty' })
      }
    }
  }

  onFocus() {
    this.setState({ searchState: 'focused' })
  }

  handleSuggestionsUpdate(requestNo, data) {
    if (requestNo === this.state.maxRequestNo) {
      this.setState({loading: false, suggestions: data, selectedSuggestionIdx: null})
    }
  }

  onChange() {
    const oldTerm = this.state.searchValue
    const newTerm = this.refs.searchValue.value ? this.refs.searchValue.value.trim() : ''
    this.setState(
      function(prevState) {
        const rc = prevState.requestNo ? prevState.requestNo + 1 : 1
        return {
          searchValue: this.refs.searchValue.value,
          requestNo: rc,
          maxRequestNo: rc,
          loading: newTerm.length > 0,
          searchState: 'focused'
        }
      },
      function() {
        if (newTerm.length) {
          this.props.onTermChange.apply(null, [
            oldTerm,
            newTerm,
            this.state.requestNo,
            this.handleSuggestionsUpdate
          ])
        }
      }
    )
  }

  clearSearch() {
    this.refs.searchValue.value = null

    this.setState({ searchValue: this.refs.searchValue.value })
    this.setState({ searchState: 'empty' })
  }

  onKeyUp(event) {
    const eventKey = event.keyCode

    event.stopPropagation()
    event.preventDefault()

    if (eventKey === 13) { // Return/Enter key
      this.setState({ searchState: 'filled' }, function() {
        this.search()
      })

    } else if (eventKey === 39) { // Right arrow key
      const suggestion = this.state.suggestions[0]

      if (suggestion) {
        this.refs.searchValue.value = suggestion

        this.onChange()
      }
    } else if (eventKey === 38) { // Up arrow key
      const currSelectedIdx = this.state.selectedSuggestionIdx

      if (currSelectedIdx) { // Index is none of (undefined, null, 0)
        const suggestionIdx = currSelectedIdx - 1
        const suggestion = this.state.suggestions[suggestionIdx]

        this.refs.searchValue.value = suggestion

        this.setState({
          selectedSuggestionIdx : suggestionIdx,
          searchValue: suggestion
        })
      }

    } else if (eventKey === 40) { // Down arrow key
      const currSelectedIdx = this.state.selectedSuggestionIdx

      // Index is none of (undefined, null, 0)
      if (typeof currSelectedIdx === 'undefined'
        || currSelectedIdx === null
        || this.state.suggestions.length > currSelectedIdx + 1) {

        const suggestionIdx = typeof currSelectedIdx === 'number' ? currSelectedIdx + 1 : 0
        const suggestion = this.state.suggestions[suggestionIdx]

        this.refs.searchValue.value = suggestion

        this.setState({
          selectedSuggestionIdx: suggestionIdx,
          searchValue: suggestion
        })
      }
    }
  }

  handleSuggestionSelect(selectedTerm) {
    this.setState({ searchValue: selectedTerm, searchState: 'filled' }, function() {
      this.search()
    })
  }

  search() {
    const searchTerm = this.state.searchValue ? this.state.searchValue.trim() : ''

    if(searchTerm.length > 0) {
      this.props.onSearch.apply(this, [searchTerm])
    }
  }

  render() {
    const recentList  = this.props.recentTerms
    const popularList = this.state.suggestions

    const searchState = this.state.searchState
    const searchValue = this.state.searchValue

    let typeaheadText = ''

    if(searchValue) {
      for(let i = 0; i < popularList.length; i++) {
        const idx = popularList[i].toLowerCase().indexOf(searchValue.toLowerCase())

        // show typeahead hint only if the search term matched at 0 index
        if(!typeaheadText && idx === 0) {
          typeaheadText = searchValue + popularList[i].substring(searchValue.length)
        }
      }

    } else {
      typeaheadText = ''
    }

    const sbClasses = classNames('SearchBar', {
      'state-empty'  : searchState === 'empty',
      'state-focused': searchState === 'focused',
      'state-filled' : searchState === 'filled'
    })

    const results = this.state.loading === true
      ? <div className="loading-suggestions"><Loader /></div>
      : <SearchSuggestions recentSearch={ recentList } searchTerm={ this.state.searchValue } popularSearch={ popularList } onSuggestionSelect={ this.handleSuggestionSelect } />

    return (
      <div className={ sbClasses }>
        <input className="search-bar__text" onFocus={ this.onFocus } onChange={ this.onChange } onKeyUp={ this.onKeyUp } ref="searchValue" value={this.state.searchValue} />

        <span className="search-typeahead-text">{ typeaheadText }</span>

        <img className="search-bar__clear" src={ require('./x-mark.svg') } onClick={ this.clearSearch }/>

        <div className="search-icon-wrap" onClick={ this.search }>
          <img className="search-bar__icon" src={ require('./ico-mobile-search-selected.svg') } />
        </div>

        <div className="suggestions-panel">
          {results}
        </div>

      </div>
    )

  }
}


SearchBar.propTypes = {
  onSearch     : PropTypes.func.isRequired,
  onTermChange : PropTypes.func.isRequired,
  recentTerms  : PropTypes.array,
  searchTermKey: PropTypes.string
}

SearchBar.defaultProps = {
  recentTerms  : [],
  searchTermKey: 'q'
}

export default SearchBar
