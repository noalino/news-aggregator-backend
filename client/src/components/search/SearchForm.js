import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getParams, setSearchParams } from '../../_utils';

import SearchBar from './SearchBar';
import Options from './Options';
import Sort from './Sort';
import styles from '../../styles/search/SearchForm.scss';

class SearchForm extends Component {
  constructor(props) {
    super(props);
    const { location: { search } } = this.props;
    const { query, from, to, source, sortBy } = getParams(search);
    // Initialize query & options from URL
    this.state = {
      query: query || '',
      from: from || '',
      to: to || '',
      source: source || '',
      sortBy: sortBy || 'date',
    };
  }

  resetOptions = () => {
    this.setState({
      from: '',
      to: '',
      source: '',
    });
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    const { history, location } = this.props;

    this.setState({ [name]: value }, () => {
      if (name === 'sortBy') {
        history.replace(`${location.pathname}?${setSearchParams(this.state)}`);
      }
    });
  }

  onSubmit = (e) => {
    e.preventDefault();
    const { query } = this.state;
    const { location, history } = this.props;

    if (query) {
      history.push(`${location.pathname}?${setSearchParams(this.state)}`);
    }
  }

  render() {
    const { query, ...options } = this.state;
    const { location, optionsOpen, toggleOptions } = this.props;
    const lastQuery = getParams(location.search).query;

    return (
      <form className={styles.header} role="search" onSubmit={this.onSubmit}>
        <SearchBar
          className="search"
          query={query}
          onChange={this.handleInputChange}
          focus
        />
        <Options
          options={options}
          onChange={this.handleInputChange}
          optionsOpen={optionsOpen}
          toggleOptions={toggleOptions}
          resetOptions={this.resetOptions}
        />
        {lastQuery && <Sort onChange={this.handleInputChange} />}
      </form>
    );
  }
}

SearchForm.propTypes = {
  location: PropTypes.instanceOf(Object).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  optionsOpen: PropTypes.bool.isRequired,
  toggleOptions: PropTypes.func.isRequired,
};

export default withRouter(SearchForm);