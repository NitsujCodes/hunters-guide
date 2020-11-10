import Core from '../modules/core.static.js';

Core.addTactic('salt', {
    tactic: 'Place salt in choke points where you know that the ghost walks, and then put as much UV in that area as you can or just hold a torch and be ready.',
    trueText: 'If the ghost disturbs a salt pile but you don\'t see any green footprints with the UV, then it is a Wraith',
    falseText: 'If the ghost disturbs a salt pile and leaves green footprints, then it is not a wraith',
    ifFalse: [
        {
            action: 'eliminateGhost',
            target: 'wraith'
        }
    ],
    ifTrue: [
        {
            action: 'selectGhost',
            target: 'wraith'
        }
    ],
    requiredGhosts: [
        'wraith'
    ]
});
Core.addTactic('fingerprint', {
    tactic: 'If you get the ghost to perform some interactions and one of them is either \'Door Open/Close\', \'Light Switch On/Off\', \'Window Knock\' then immediately check with UV',
    trueText: 'If there are fingerprints then you can check off Fingerprints evidence',
    falseText: 'If there are no Fingerprints then there will never be Fingerprints',
    ifFalse: [
        {
            action: 'eliminateEvidence',
            target: 'fingerprints'
        }
    ],
    ifTrue: [
        {
            action: 'selectEvidence',
            target: 'fingerprints'
        }
    ],
    requiredGhosts: [],
    requiredPossibleEvidence: [
        'fingerprints'
    ]
});
Core.addTactic('photograph', {
    tactic: 'Get the ghost to show itself and then take a photo of it',
    trueText: 'If the ghost vanishes but you can still hear it making a noise, then this ghost is just invisible and is therefore a Phantom',
    falseText: 'If the ghost vanishes and no longer makes a noise or if the ghost is still standing there, then it is not a Phantom',
    ifFalse: [
        {
            action: 'eliminateGhost',
            target: 'phantom'
        }
    ],
    ifTrue: [
        {
            action: 'selectGhost',
            target: 'phantom'
        }
    ],
    requiredGhosts: [
        'phantom'
    ],
});