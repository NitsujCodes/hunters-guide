let ghostIndex = {
    'spirit': {
        name: 'Spirit',
        description: '',
        uniqueStrength: '',
        weakness: 'Using a smudge stick will stop it from attacking for a long period of time.',
        evidence: [
            'spirit_box',
            'fingerprints',
            'ghost_writing'
        ]
    },
    'wraith': {
        name: 'Wraith',
        description: '',
        uniqueStrength: 'Almost never touch the ground and so cannot be tracked by footsteps.',
        weakness: '',
        evidence: [
            'fingerprints',
            'freezing_temps',
            'spirit_box'
        ]
    },
    'phantom': {
        name: 'Phantom',
        description: '',
        uniqueStrength: 'Looking at a Phantom will considerably drop your sanity.',
        weakness: 'Taking a photo will make it temporarily invisible.',
        evidence: [
            'emf5',
            'ghost_orbs',
            'freezing_temps'
        ]
    },
    'poltergeist': {
        name: 'Poltergeist',
        description: '',
        uniqueStrength: 'Can throw a huge amount of objects all at once.',
        weakness: 'Is almost ineffective in an empty room.',
        evidence: [
            'spirit_box',
            'fingerprints',
            'ghost_orbs'
        ]
    },
    'banshee': {
        name: 'Banshee',
        description: '',
        uniqueStrength: 'Will only target one person at a time.',
        weakness: 'Fears the crucifix and so will be less aggressive when near one.',
        evidence: [
            'emf5',
            'fingerprints',
            'freezing_temps'
        ]
    },
    'jinn': {
        name: 'Jinn',
        description: '',
        uniqueStrength: 'Will travel at a faster speed if it\'s target is far away.',
        weakness: 'Turning off the locations power source will disable the Jinns ability.',
        evidence: [
            'spirit_box',
            'ghost_orbs',
            'emf5'
        ]
    },
    'mare': {
        name: 'Mare',
        description: '',
        uniqueStrength: 'Will have an increased chance to attack in the dark.',
        weakness: 'Turning the lights on around it will decrease its chance to attack.',
        evidence: [
            'spirit_box',
            'ghost_orbs',
            'freezing_temps'
        ]
    },
    'revenant': {
        name: 'Revenant',
        description: '',
        uniqueStrength: 'Will travel at a significantly faster speed while hunting if it can see its target.',
        weakness: 'Hiding from it will cause it to move very slowly.',
        evidence: [
            'emf5',
            'fingerprints',
            'ghost_writing'
        ]
    },
    'shade': {
        name: 'Shade',
        description: '',
        uniqueStrength: 'Being shy means that it will be harder to find.',
        weakness: 'Will not hunt if there are multiple people nearby.',
        evidence: [
            'emf5',
            'ghost_orbs',
            'ghost_writing'
        ]
    },
    'demon': {
        name: 'Demon',
        description: '',
        uniqueStrength: 'Will attack more often than any other ghost.',
        weakness: 'Asking successful questions on the Ouija Board will not lower the users sanity.',
        evidence: [
            'spirit_box',
            'ghost_writing',
            'freezing_temps'
        ]
    },
    'yurei': {
        name: 'Yurei',
        description: '',
        uniqueStrength: 'Has a much stronger affect on a persons sanity.',
        weakness: 'Smudging its room will cause it to not wonder around the location for a long time.',
        evidence: [
            'ghost_orbs',
            'ghost_writing',
            'freezing_temps'
        ]
    },
    'oni': {
        name: 'Oni',
        description: '',
        uniqueStrength: 'Are more active when people are nearby and have been seen moving objects at great speed.',
        weakness: 'Being more active will make it easier to find.',
        evidence: [
            'emf5',
            'spirit_box',
            'ghost_writing'
        ]
    }
};

let eliminationTactics = {
    'salt': {
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
    },
    'fingerprint': {
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
    },
    'photograph': {
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
    }
};