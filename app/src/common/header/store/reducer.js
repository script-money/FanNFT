import { fromJS } from 'immutable';
import * as constants from './constants';

const defaultState = fromJS({
  user: [],
  connectWallet: false,
  data: null
});

export default (state = defaultState, action) => {
  switch(action.type) {
    case constants.CONNECTWALLET:
      return state.merge({
        connectWallet: !state.get('connectWallet'),
      })
    case constants.USERINFO:
      return state.merge({
        'user': action.user,
      })
    case constants.DATAINFO:
      return state.merge({
        'data': action.user,
      })
    default:
      return state;
  }
}