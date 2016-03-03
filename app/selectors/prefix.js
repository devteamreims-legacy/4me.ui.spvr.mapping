import get from 'lodash/get';

const globalPrefix = (state) => state;

const prefixer = (prefix) => (state) => get(globalPrefix(state), prefix);

export default prefixer;