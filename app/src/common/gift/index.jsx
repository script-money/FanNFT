import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import './index.less';

class Gift extends PureComponent{

  render(){
    const {

    } = this.props;
    return (
      <div className="giftBox">
          liwu
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

export default connect(mapStateToProps, mapDispatchToProps)(Gift);