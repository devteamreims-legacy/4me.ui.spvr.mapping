import controlRoom from './control-room';
import cwpButton from './cwp-button';
import dialog from './dialog';
import sectorPicker from './sector-picker';
import sectorSuggest from './sector-suggest';

export default angular.module('4me.ui.spvr.mapping.components', [
  controlRoom,
  cwpButton,
  dialog,
  sectorPicker,
  sectorSuggest
])
.name;