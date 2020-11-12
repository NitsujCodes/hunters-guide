import Evidence from './evidence.obj.js';
import Ghost from './ghost.obj.js';
import Tactic from './tactic.obj.js';

export default class Core {
    static #ghostIndex = new Map();
    static #evidenceIndex = new Map();
    static #tacticIndex = new Map();

    static #evidenceTree = new Map();

    static #evidenceSelected = [];
    static #evidenceEliminated = [];
    static #ghostsEliminated = [];
    static #evidenceAutoEliminated = [];

    static #currentEvidenceTreePosition = {};

    static #maxEvidence = 3;

    constructor() {
    }

    static init() {
        this.#buildEvidenceTree();
    }

    static get maxEvidence()
    {
        return this.#maxEvidence;
    }

    static #buildEvidenceTree() {
        this.#evidenceTree = new Map();

        for (const [ghostKey, ghost] of this.allGhosts().entries()) {
            for (const evidenceKey of ghost.evidence) {
                if (!this.#evidenceTree.has(evidenceKey)) {
                    this.#evidenceTree.set(evidenceKey, {
                        ghosts: new Map(),
                        nextEvidence: new Map()
                    });
                }
                this.#evidenceTree.get(evidenceKey).ghosts.set(ghostKey, ghost);
                let newEvidenceList = [].concat(ghost.evidence);
                newEvidenceList.splice(newEvidenceList.indexOf(evidenceKey), 1);
                this.#setEvidenceData(this.#evidenceTree.get(evidenceKey).nextEvidence, newEvidenceList, ghostKey);
            }
        }
    }

    static #setEvidenceData(currentEvidenceTreePointer, evidenceList, ghostKey) {
        if (!evidenceList.length) {
            return;
        }

        for (let i = 0; i < evidenceList.length; i++) {
            if (!currentEvidenceTreePointer.has(evidenceList[i])) {
                currentEvidenceTreePointer.set(evidenceList[i], {
                    ghosts: new Map(),
                    nextEvidence: new Map()
                });
            }
            currentEvidenceTreePointer.get(evidenceList[i]).ghosts.set(ghostKey, this.ghost(ghostKey));

            let newEvidenceList = [].concat(evidenceList);
            let currentEvidence = newEvidenceList.splice(i, 1);
            this.#setEvidenceData(currentEvidenceTreePointer.get(currentEvidence[0]).nextEvidence, newEvidenceList, ghostKey);
        }
    }

    static addGhost(ghostKey, ghostData) {
        this.#ghostIndex.set(ghostKey, new Ghost(ghostKey, ghostData));

        let ghostStatusProps = {
            isPossibleByEvidence: true,
            isEliminatedByEvidence: false,
            possibleEvidence: {},
            eliminated: {},
            isForceEliminated: false
        };

        for (let i = 0; i < ghostData.evidence.length; i++) {
            ghostStatusProps.eliminated[ghostData.evidence[i]] = false;
            ghostStatusProps.possibleEvidence[ghostData.evidence[i]] = true;
        }

        this.ghost(ghostKey).setProp(ghostStatusProps);
        this.ghost(ghostKey)
            .addIsCheck('possible', function () {
                let eliminated = false;
                let ghostEliminatedEvidence = this.prop('eliminated');

                for (let evidence in ghostEliminatedEvidence) {
                    if (ghostEliminatedEvidence.hasOwnProperty(evidence)) {
                        if (ghostEliminatedEvidence[evidence]) {
                            eliminated = true;
                            break;
                        }
                    }
                }

                return (
                    this.prop('isPossibleByEvidence') &&
                    !eliminated
                );
            });

        return this;
    }

    static ghost(ghostKey) {
        return this.#ghostIndex.get(ghostKey);
    }

    static allGhosts()
    {
        return this.#ghostIndex;
    }

    static addEvidence(evidenceKey, evidenceData) {
        this.#evidenceIndex.set(evidenceKey, new Evidence(evidenceKey, evidenceData));
        this.#evidenceIndex.get(evidenceKey)
            .setProp({
                isSelected: false,
                isEliminated: false,
                isPossible: true
            })
            .addPropAutoUpdate('isPossible', function() {
                if (this.prop('isSelected') && !this.prop('isEliminated')) {
                    this.setProp('isPossible', true);
                }

                return this;
            });

        return this;
    }

    static evidence(evidenceKey) {
        return this.#evidenceIndex.get(evidenceKey);
    }

    static allEvidence() {
        return this.#evidenceIndex;
    }

    static addTactic(tacticKey, tacticData) {
        this.#tacticIndex.set(tacticKey, new Tactic(tacticKey, tacticData));

        return this;
    }

    static tactic(tacticKey) {
        return this.#tacticIndex.get(tacticKey);
    }

    static allTactics()
    {
        return this.#tacticIndex;
    }

    static evidenceSelected(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceSelected;
        } else if (typeof value === 'undefined') {
            return this.#evidenceSelected[evidenceKey];
        } else {
            this.#evidenceSelected[evidenceKey] = value;
            this.evidence(evidenceKey)
                .setProp('isSelected', value)
                .autoUpdateProp('isPossible');
            return this;
        }
    }

    static evidenceEliminated(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceEliminated;
        } else if (typeof value === 'undefined') {
            return this.#evidenceEliminated[evidenceKey];
        } else {
            this.#evidenceEliminated[evidenceKey] = value;
            this.evidence(evidenceKey)
                .setProp('isEliminated', value)
                .autoUpdateProp('isPossible');
            return this;
        }
    }

    static ghostsEliminated(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#ghostsEliminated;
        } else if (typeof value === 'undefined') {
            return this.#ghostsEliminated[evidenceKey];
        } else {
            this.#ghostsEliminated[evidenceKey] = value;
            return this;
        }
    }

    static evidenceAutoEliminated(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceAutoEliminated;
        } else if (typeof value === 'undefined') {
            return this.#evidenceAutoEliminated[evidenceKey];
        } else {
            this.#evidenceAutoEliminated[evidenceKey] = value;
            return this;
        }
    }

    static get currentTree()
    {
        return this.#currentEvidenceTreePosition;
    }

    static updateCurrentTree()
    {
        this.#currentEvidenceTreePosition = this.#evidenceTree;
        for (let i = 0; i < this.#evidenceSelected.length; i++) {
            if (typeof this.#currentEvidenceTreePosition.nextEvidence === 'undefined') {
                this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition[this.#evidenceSelected[i]];
            } else {
                this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition.nextEvidence[this.#evidenceSelected[i]];
            }
        }

        return this;
    }

    static get tree()
    {
        return this.#evidenceTree;
    }

    static selectEvidence(evidenceKey)
    {
        this.evidenceSelected(evidenceKey, true);

    }

    static debug() {
        console.warn('[Core Debug]');
        console.warn('--Evidence Index');
        console.log(this.allEvidence());
        console.warn('--Ghost Index');
        console.log(this.allGhosts());
        console.warn('--Tactic Index');
        console.log(this.allTactics());
        console.warn('--Evidence Tree');
        console.log(this.tree);
        console.warn('--Evidence Selected');
        console.log(this.evidenceSelected());
        console.warn('--Current Evidence Tree Position');
        console.log(this.currentTree);
        console.warn('--Evidence Eliminated');
        console.log(this.evidenceEliminated());
        console.warn('--Ghosts Eliminated');
        console.log(this.ghostsEliminated());
        console.warn('--Auto Eliminated Evidence');
        console.log(this.evidenceAutoEliminated());
    }
}