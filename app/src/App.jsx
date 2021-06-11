import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Header from './common/header';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Gift from './common/gift/index'
import Home from './common/home/index'

class App extends PureComponent {
  render() {
    return (  
      <BrowserRouter>
        <div>
          <Header />
          <Route  path="/" exact component={Home} />
				  <Route path="/gift" component={Gift} />
        </div>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.getIn(['header', 'language']),
});

export default connect(mapStateToProps)(App);
