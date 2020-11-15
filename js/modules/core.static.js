import Evidence from './evidence.obj.js';
import Ghost from './ghost.obj.js';
import Tactic from './tactic.obj.js';

export default class Core {
    static #ghostIndex = new Map();
    static #evidenceIndex = new Map();
    static #tacticIndex = new Map();

    static #evidenceTree = new Map();

    static #evidenceSelected = new Set();
    static #evidenceEliminated = new Set();
    static #ghostsEliminated = new Set();
    static #evidenceAutoEliminated = new Set();

    static #currentEvidenceTreePosition = this.#evidenceTree;

    static #maxEvidence = 3;
    static #debugMode = false;

    constructor() {}

    static init(debugMode = false) {
        this.#debugMode = debugMode;
        this.#buildEvidenceTree();
        this.refetchCurrentTreePosition();
    }

    static get maxEvidence()
    {
        return this.#maxEvidence;
    }

    /**
     * Builds the evidence tree for quick evidence and ghost referencing.
     */
    static #buildEvidenceTree() {
        this.#evidenceTree = new Map();

        for (const [ghostKey, ghost] of this.allGhosts().entries()) {
            for (const [evidenceKey, evidence] of ghost.evidence) {
                if (!this.#evidenceTree.has(evidenceKey)) {
                    this.#evidenceTree.set(evidenceKey, {
                        ghosts: new Map(),
                        nextEvidence: new Map()
                    });
                }

                this.#evidenceTree.get(evidenceKey).ghosts.set(ghostKey, ghost);
                let newEvidenceList = Array.from(ghost.evidence.keys());
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
        let ghostStatusProps = {
            isPossibleByEvidence: true,
            isForceEliminated: false,
            eliminatedByEvidence: new Set()
        };

        let ghostEvidenceList = ghostData.evidence;
        ghostData.evidence = new Map();
        for (let i = 0; i < ghostEvidenceList.length; i++) {
            ghostData.evidence.set(ghostEvidenceList[i], this.evidence(ghostEvidenceList[i]));
        }
        this.#ghostIndex.set(ghostKey, new Ghost(ghostKey, ghostData));

        this.ghost(ghostKey).setProp(ghostStatusProps);
        this.ghost(ghostKey)
            .addIsCheck('possible', function () {
                return (this.prop('isPossibleByEvidence') && !this.prop('isForceEliminated'));
            })
            .addPropAutoUpdate('isPossibleByEvidence', function() {
                if (this.prop('eliminatedByEvidence').size) {
                    this.setProp('isPossibleByEvidence', false);
                    return;
                } else if (!this.prop('isPossibleByEvidence')) {
                    this.setProp('isPossibleByEvidence', true);
                }

                for (const [evidenceKey, evidence] of this.evidence) {
                    if (!evidence.is('possible')) {
                        this.setProp('isPossibleByEvidence', false);
                        break;
                    }
                }
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
                isEliminatedByEvidence: false,
                isPossible: true
            })
            .addPropAutoUpdate('isPossible', function() {
                if (!this.prop('isSelected') && !this.prop('isEliminated') && !this.prop('isEliminatedByEvidence')) {
                    this.setProp('isPossible', true);
                } else {
                    this.setProp('isPossible', false);
                }

                return this;
            })
            .addIsCheck('possible', function() {
                return (this.prop('isSelected') || this.prop('isPossible'));
            })
            .addIsCheck('eliminated', function() {
                return (this.prop('isEliminated') || this.prop('isEliminatedByEvidence'));
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

    static evidenceSelected(evidenceKey, value, refreshGhostProps = true)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceSelected;
        } else if (typeof value === 'undefined') {
            return this.#evidenceSelected.has(evidenceKey);
        } else {
            if (value) {
                this.#evidenceSelected.add(evidenceKey);
                this.moveTreeToNextEvidence(evidenceKey);
            } else {
                this.#evidenceSelected.delete(evidenceKey);
                this.refetchCurrentTreePosition();

                for (const [workingEvidenceKey, evidence] of this.possibleEvidence()) {
                    if (evidence.prop('isEliminatedByEvidence')) {
                        //Evidence was previously eliminated by evidence so unEliminate it
                        evidence.setProp('isEliminatedByEvidence')
                            .autoUpdateProp('isPossible');

                        if (evidence.is('possible') && this.evidenceAutoEliminated(workingEvidenceKey)) {
                            //If evidence is now possible and is currently marked as auto-eliminated then drop it
                            //from auto-elimination
                            this.evidenceAutoEliminated(workingEvidenceKey, false);
                        }
                    }
                }
            }

            this.evidence(evidenceKey)
                .setProp('isSelected', value)
                .autoUpdateProp('isPossible');

            if (refreshGhostProps) {
                this.refreshGhostsSelectedByEvidence(evidenceKey, value);
            }

            return this;
        }
    }

    static evidenceEliminated(evidenceKey, value, refreshGhostProps = true)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceEliminated;
        } else if (typeof value === 'undefined') {
            return this.#evidenceEliminated.has(evidenceKey);
        } else {
            if (value) {
                this.#evidenceEliminated.add(evidenceKey);
            } else {
                this.#evidenceEliminated.delete(evidenceKey);
            }

            this.evidence(evidenceKey)
                .setProp('isEliminated', value)
                .autoUpdateProp('isPossible');

            if (refreshGhostProps) {
                this.refreshGhostsEliminatedByEvidence(evidenceKey, value);
            }

            return this;
        }
    }

    static refreshGhostsSelectedByEvidence(evidenceKey, selected)
    {
        for (const [ghostKey, ghost] of this.allGhosts()) {
            if (
                !ghost.evidence.has(evidenceKey) && !ghost.prop('eliminatedByEvidence').has(evidenceKey) &&
                selected
            ) {
                ghost.prop('eliminatedByEvidence').add(evidenceKey);
            } else if (ghost.prop('eliminatedByEvidence').has(evidenceKey) && !selected) {
                ghost.prop('eliminatedByEvidence').delete(evidenceKey);
            }

            ghost.autoUpdateProp('isPossibleByEvidence');
        }
    }

    static refreshGhostsSelectedByAllEvidence(selected)
    {
        for (const [ghostKey, ghost] of this.allGhosts()) {
            for (const [evidenceKey, evidence] of this.allEvidence()) {
                if (
                    !ghost.evidence.has(evidenceKey) && !ghost.prop('eliminatedByEvidence').has(evidenceKey) &&
                    selected
                ) {
                    ghost.prop('eliminatedByEvidence').add(evidenceKey);
                } else if (ghost.prop('eliminatedByEvidence').has(evidenceKey) && !selected) {
                    ghost.prop('eliminatedByEvidence').delete(evidenceKey);
                }
            }

            ghost.autoUpdateProp('isPossibleByEvidence');
        }
    }

    static refreshGhostsEliminatedByEvidence(evidenceKey, eliminated)
    {
        for (const [ghostKey, ghost] of this.allGhosts()) {
            if (ghost.evidence.has(evidenceKey) && !ghost.prop('eliminatedByEvidence').has(evidenceKey) && eliminated) {
                ghost.prop('eliminatedByEvidence').add(evidenceKey);
            } else if (ghost.prop('eliminatedByEvidence').has(evidenceKey) && !eliminated) {
                ghost.prop('eliminatedByEvidence').delete(evidenceKey);
            } else {
                continue;
            }

            ghost.autoUpdateProp('isPossibleByEvidence');
        }
    }

    static refreshGhostsEliminatedByAllEvidence(eliminated)
    {
        for (const [ghostKey, ghost] of this.allGhosts()) {
            for (const [evidenceKey, evidence] of this.allEvidence()) {
                if (ghost.evidence.has(evidenceKey) && !ghost.prop('eliminatedByEvidence').has(evidenceKey) && eliminated) {
                    ghost.prop('eliminatedByEvidence').add(evidenceKey);
                } else if (ghost.prop('eliminatedByEvidence').has(evidenceKey) && !eliminated) {
                    ghost.prop('eliminatedByEvidence').delete(evidenceKey);
                } else {
                    continue;
                }
            }

            ghost.autoUpdateProp('isPossibleByEvidence');
        }
    }

    static ghostsEliminated(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#ghostsEliminated;
        } else if (typeof value === 'undefined') {
            return this.#ghostsEliminated.has(evidenceKey);
        } else {
            if (value) {
                this.#ghostsEliminated.add(evidenceKey);
            } else {
                this.#ghostsEliminated.delete(evidenceKey);
            }

            return this;
        }
    }

    static evidenceAutoEliminated(evidenceKey, value)
    {
        if (typeof evidenceKey === 'undefined') {
            return this.#evidenceAutoEliminated;
        } else if (typeof value === 'undefined') {
            return this.#evidenceAutoEliminated.has(evidenceKey);
        } else {
            if (value) {
                this.#evidenceAutoEliminated.add(evidenceKey);
            } else {
                this.#evidenceAutoEliminated.delete(evidenceKey);
            }

            return this;
        }
    }

    static evidenceCanBeSelected(evidenceKey)
    {
        return (!this.evidenceEliminated(evidenceKey) && !this.evidenceAutoEliminated(evidenceKey));
    }

    static evidenceCanBeEliminated(evidenceKey)
    {
        return (!this.evidenceEliminated(evidenceKey) && !this.evidenceAutoEliminated(evidenceKey));
    }

    static get currentTree()
    {
        return this.#currentEvidenceTreePosition;
    }

    static moveTreeToNextEvidence(evidenceKey)
    {
        if (typeof this.#currentEvidenceTreePosition.nextEvidence === 'undefined') {
            this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition.get(evidenceKey);
        } else {
            this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition.nextEvidence.get(evidenceKey);
        }

        return this;
    }

    static refetchCurrentTreePosition()
    {
        this.#currentEvidenceTreePosition = this.#evidenceTree;
        for (const evidenceKey of this.evidenceSelected()) {
            if (typeof this.#currentEvidenceTreePosition.nextEvidence === 'undefined') {
                this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition.get(evidenceKey);
            } else {
                this.#currentEvidenceTreePosition = this.#currentEvidenceTreePosition.nextEvidence.get(evidenceKey);
            }
        }

        return this;
    }

    static possibleGhosts()
    {
        if (typeof this.currentTree.ghosts === 'undefined') {
            //We are at the start of the tree
            return this.allGhosts();
        }

        return this.currentTree.ghosts;
    }

    static possibleEvidence()
    {
        if (typeof this.currentTree.nextEvidence === 'undefined') {
            return this.allEvidence();
        }

        let evidence = new Map();
        for (const [evidenceKey, evidenceTreeData] of this.currentTree.nextEvidence) {
            evidence.set(evidenceKey, this.evidence(evidenceKey));
        }

        return evidence;
    }

    static notPossibleEvidence()
    {
        if (typeof this.currentTree.nextEvidence === 'undefined') {
            return new Map();
        }

        let possible = this.possibleEvidence();
        let notPossible = new Map();
        for (const [evidenceKey, evidence] of this.allEvidence()) {
            if (!possible.has(evidenceKey)) {
                notPossible.set(evidenceKey, evidence);
            }
        }

        return notPossible;
    }

    static notPossibleGhosts()
    {
        if (typeof this.currentTree.ghosts === 'undefined') {
            //We are at the start of the tree
            return new Map();
        }

        let possible = this.possibleGhosts();
        let notPossible = new Map();
        for (const [ghostKey, ghost] of this.allGhosts()) {
            if (!possible.has(ghostKey)) {
                notPossible.set(ghostKey, ghost);
            }
        }

        return notPossible;
    }

    static get tree()
    {
        return this.#evidenceTree;
    }

    static selectEvidence(evidenceKey)
    {
        this.evidenceSelected(evidenceKey, true);

        return true;
    }

    static debug() {
        if (!this.#debugMode) {
            return;
        }

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