import Evidence from './evidence.obj.js';
import Ghost from './ghost.obj.js';
import Tactic from './tactic.obj.js';

export default class Core
{
    static ghostIndex = new Map();
    static evidenceIndex = new Map();
    static tacticIndex = new Map();

    static evidenceTree = new Map();

    static evidenceSelected = [];
    static evidenceEliminated = [];
    static ghostsEliminated = [];
    static evidenceAutoEliminated = [];

    static currentEvidenceTreePosition = {};

    constructor() {}

    static init()
    {
        this.#buildEvidenceTree();
    }

    static #buildEvidenceTree()
    {
        this.evidenceTree = new Map();

        for (const [ghostKey, ghostData] of this.ghostIndex.entries()) {
            for (const evidenceKey of ghostData.evidence) {
                if (!this.evidenceTree.has(evidenceKey)) {
                    this.evidenceTree.set(evidenceKey, {
                        ghosts: new Map(),
                        nextEvidence: new Map()
                    });
                }
                this.evidenceTree.get(evidenceKey).ghosts.set(ghostKey, ghostData);
                let newEvidenceList = [].concat(ghostData.evidence);
                newEvidenceList.splice(newEvidenceList.indexOf(evidenceKey), 1);
                this.#setEvidenceData(this.evidenceTree.get(evidenceKey).nextEvidence, newEvidenceList, ghostKey);
            }
        }
    }

    static #setEvidenceData(currentEvidenceTreePointer, evidenceList, ghostKey)
    {
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
            currentEvidenceTreePointer.get(evidenceList[i]).ghosts.set(ghostKey, this.getGhost(ghostKey));

            let newEvidenceList = [].concat(evidenceList);
            let currentEvidence = newEvidenceList.splice(i, 1);
            this.#setEvidenceData(currentEvidenceTreePointer.get(currentEvidence[0]).nextEvidence, newEvidenceList, ghostKey);
        }
    }

    static addGhost(ghostKey, ghostData)
    {
        this.ghostIndex.set(ghostKey, new Ghost(ghostKey, ghostData));

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

        this.ghostIndex.get(ghostKey).setProp(ghostStatusProps);

        return this;
    }

    static getGhost(ghostKey)
    {
        return this.ghostIndex.get(ghostKey);
    }

    static getAllGhosts(ghostKey)
    {
        return this.ghostIndex;
    }

    static addEvidence(evidenceKey, evidenceData)
    {
        this.evidenceIndex.set(evidenceKey, new Evidence(evidenceKey, evidenceData));
        this.evidenceIndex.get(evidenceKey).setProp({
            isSelected: false,
            isEliminated: false
        });

        return this;
    }

    static getEvidence(evidenceKey)
    {
        return this.evidenceIndex.get(evidenceKey);
    }

    static addTactic(tacticKey, tacticData)
    {
        this.tacticIndex.set(tacticKey, new Tactic(tacticKey, tacticData));

        return this;
    }

    static getTactic(tacticKey)
    {
        return this.tacticIndex.get(tacticKey);
    }

    static debug()
    {
        console.warn('Displaying Debug Data');
        console.warn('--Evidence Index');
        console.log(this.evidenceIndex);
        console.warn('--Ghost Index');
        console.log(this.ghostIndex);
        console.warn('--Tactic Index');
        console.log(this.tacticIndex);
        console.warn('--Evidence Tree');
        console.log(this.evidenceTree);
        console.warn('--Evidence Selected');
        console.log(this.evidenceSelected);
        console.warn('--Current Evidence Tree Position');
        console.log(this.currentEvidenceTreePosition);
        console.warn('--Evidence Eliminated');
        console.log(this.evidenceEliminated);
        console.warn('--Ghosts Eliminated');
        console.log(this.ghostsEliminated);
        console.warn('--Auto Eliminated Evidence');
        console.log(this.evidenceAutoEliminated);
    }
}