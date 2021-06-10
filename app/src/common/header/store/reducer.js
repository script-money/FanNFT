import { fromJS } from 'immutable';
import * as constants from './constants';

const defaultState = fromJS({
  connectWallet: true,
});

export default (state = defaultState, action) => {
  switch(action.type) {
    case constants.CONNECTWALLET:
      return state.merge({
        connectWallet: !state.get('connectWallet'),
      })
    default:
      return state;
  }
}