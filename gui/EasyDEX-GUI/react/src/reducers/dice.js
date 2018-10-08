import { DICE_LIST } from '../actions/storeType';

export const AddCoin = (state = {
  diceList: [],
}, action) => {
  switch (action.type) {
    case DICE_LIST:
      return {
        ...state,
        diceList: action.data,
      };
    default:
      return state;
	}
}

export default AddCoin;