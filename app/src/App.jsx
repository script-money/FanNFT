import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import Header from './common/header';
import { BrowserRouter } from 'react-router-dom';
import { Route } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import Gift from './common/gift/index'
import Home from './common/home/index'
import CreatePackage from './common/createpackage/index'

class App extends PureComponent {
  render() {
    const { language } = this.props;
    return (
      <IntlProvider
        locale={'en'}
        messages={language}
      >
        <BrowserRouter>
          <div>
            <Header />
            <Route path="/" exact component={Home} />
            <Route path="/gift" component={Gift} />
            <Route path="/createpackage" component={CreatePackage} />
          </div>
        </BrowserRouter>
      </IntlProvider>
    );
  }
}

const mapStateToProps = (state) => ({
  language: state.getIn(['header', 'language']),
});

export default connect(mapStateToProps)(App);
