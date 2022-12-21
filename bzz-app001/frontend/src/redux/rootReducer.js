import { combineReducers } from "redux";

import { reducer as authReducer } from "./auth";
import { reducer as crudReducer } from "./crud";
import { reducer as searchReducer } from "./search";
import { reducer as userReducer } from "./search";
import { reducer as MCReducer } from "./mc-export";
import { reducer as MFReducer } from "./mf-export";




import * as actionTypes from "./auth/types";

// Combine all reducers.

const appReducer = combineReducers({
  auth: authReducer,
  crud: crudReducer,
  search: searchReducer,
  user: userReducer,
  mcExport: MCReducer,
  mfExport: MFReducer


});

const rootReducer = (state, action) => {
  if (action.type === actionTypes.LOGOUT_SUCCESS) {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
