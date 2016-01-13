(function() {

'use strict';

/**
 * @ngdoc function
 * @name 4me.ui.spvr.mapping.constants
 * @description
 * Multiple services with static content (sectors, positions)
 */

angular.module('4me.ui.spvr.mapping.constants', [])
.constant('crnaAtomicSectors', [
    'UR', 'XR', 'KR', 'YR', 'HR',
    'UB', 'UN', 'KN', 'HN',
    'KD',
    'UF', 'KF',
    'E', 'UE', 'XE', 'KE', 'HE',
    'SE', 'UH', 'XH', 'KH', 'HH'
])
// Config
.constant('cdsBackendUrl', 'http://localhost:3000')
.constant('crnaSectors',[
    { name: 'UXR',    children: ['UR', 'XR'] },
    { name: 'UXKR',   children: ['UXR', 'KR'] },
    { name: 'KHR',    children: ['KR', 'YR', 'HR'] },
    { name: 'HYR',    children: ['YR', 'HR'] },
    { name: '5R',     children: ['UXR', 'KHR'] },
    { name: 'UBN',    children: ['UN', 'UB'] },
    { name: 'UBKN',   children: ['UBN', 'KN'] },
    { name: 'KHN',    children: ['KN', 'HN'] },
    { name: '4N',     children: ['UB', 'UN', 'KN', 'HN'] },
    { name: 'URMN',   children: ['5R', '4N'] },
    { name: '2F',     children: ['KF', 'UF'] },
    { name: 'KD2F',   children: ['KF', 'UF', 'KD'] },
    { name: '4E',     children: ['UXE', 'KHE']},
    { name: '4H',     children: ['UXH', 'KHH']},
    { name: 'UXH',    children: ['UH', 'XH']},
    { name: 'KHH',    children: ['KH', 'HH']},
    { name: 'UXE',    children: ['UE', 'XE']},
    { name: 'UXKE',   children: ['UXE', 'KE']},
    { name: 'XKHE',   children: ['XE', 'KHE']},
    { name: 'KHE',    children: ['KE', 'HE']},
    { name: 'FIR',    children: ['E', 'SE']},
    { name: '5H',     children: ['4H', 'SE']},
    { name: '5E',     children: ['4E', 'E']},
    { name: '5EH',    children: ['5E', '5H']},
    { name: '4EH',    children: ['4E', '4H']},
    { name: 'KDFE',   children: ['5EH', 'KD2F']},
    { name: 'RMS',    children: ['KDFE', 'URMN']}
])
.constant('crnaPositions', [
    '30', '31', '32', '33', // 4R
    '34', '35', '36', '37', // 4N
    '20', '21', '22', '23', // KD + 4H + FIR
    '24', '25', '26', '27', // 4E + 2F
    '11', '12', '13', '14'  // FIR + KF + Nuit
])
// Sectors splitting suggestions
.constant('suggestedSectorsEmptyPosition', {
    '20': ['KD', '2F', 'KD2F'],
    '21': ['4H', 'UXH', 'KHH', 'KH', 'HH', '5H'],
    '22': ['4H', 'UXH', 'KHH', 'KH', 'HH', '5H'],
    '23': ['FIR', 'E', 'SE'],
    '24': ['KF', '2F', 'UE', 'UXE'],
    '25': ['4E', 'UXE', 'KHE', 'HE'],
    '26': ['4E', 'UXE', 'KHE', 'HE'],
    '27': ['2F', 'KD']
})
.constant('suggestedSectorAdditions', {
    '4H': ['4EH', '5H'],
    '4E': ['4EH', '5E'],
    '4EH': ['5EH', 'KDFE'],
    '5EH': ['KDFE'],
    'FIR': ['5EH'],
    'UXE': ['UXKE', '4E']
});
}());
