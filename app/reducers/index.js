import { combineReducers } from 'redux';

import cwpReducer from './cwp';
import mappingReducer from './mapping';
import whoAmIReducer from './who-am-i';
import statusReducer from './status';
import suggestReducer from './suggest';


const rootReducer = combineReducers({
  whoAmI: whoAmIReducer,
  status: statusReducer,
  cwp: cwpReducer,
  mapping: mappingReducer,
  suggest: suggestReducer
});

export default rootReducer;