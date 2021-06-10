import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import './index.less';

class Home extends PureComponent{

  render(){
    return (
      <div className="homeBox">
        <div className="firstArea">
          <div className="one">
          </div>
          <div className="one">
          </div>
          <div className="one">
          </div>
          <div className="one">
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  
});

const mapDispatchToProps = (dispatch) => {
  return{
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);