let btnEvidenceClass = 'btn-dark';
let btnEvidenceSelectedClass = 'btn-success';
let btnEvidenceEliminatedClass = 'btn-outline-danger disabled';
let eliminateIcon = 'fa-unlock';
let unEliminateIcon = 'fa-lock';
let maxEvidence = 3;

let debug;

$(function () {
    let core = (function() {

        this.ghostStatus = {};
        this.evidenceStatus = {}

        this.init = function() {

        };

        return this;
    })();

    let $evidenceSection = $('#evidence');
    let $ghostsSection = $('#ghosts');
    let $ghostList = $ghostsSection.find('#ghostList');
    let $evidencePossibleSection = $('#evidencePossibleContainer');
    let $evidencePossible = $evidencePossibleSection.find('#evidencePossible');

    let ghostStatus = {};
    let evidenceStatus = {};
    let evidenceTree = {};

    let evidenceSelected = [];
    let evidenceEliminated = [];
    let ghostsEliminated = [];
    let evidenceAutoEliminated = [];

    let currentEvidenceTreePosition = evidenceTree;

    /**
     * Initialises Data Loading
     */
    function init(rebuildTree) {
        //Process ghost list
        ghostStatus = {};
        evidenceStatus = {};
        evidenceSelected = [];
        evidenceEliminated = [];
        ghostsEliminated = [];
        evidenceAutoEliminated = [];

        currentEvidenceTreePosition = evidenceTree;

        loadGhosts(((typeof rebuildTree === 'undefined') ? true : rebuildTree));

        //Load UI
        loadEvidence();
        renderGhosts();
    }

    function loadGhosts(rebuildTree) {
        if (rebuildTree) {
            evidenceTree = {};
        }

        for (let ghostKey in ghostIndex) {
            if (ghostIndex.hasOwnProperty(ghostKey)) {
                if (rebuildTree) {
                    setEvidenceData(evidenceTree, ghostIndex[ghostKey].evidence, ghostKey);
                }

                ghostStatus[ghostKey] = {
                    isPossibleByEvidence: true,
                    isEliminatedByEvidence: false,
                    possibleEvidence: {},
                    eliminated: {},
                    isForceEliminated: false
                };

                for (let i = 0; i < ghostIndex[ghostKey].evidence.length; i++) {
                    ghostStatus[ghostKey].eliminated[ghostIndex[ghostKey].evidence[i]] = false;
                    ghostStatus[ghostKey].possibleEvidence[ghostIndex[ghostKey].evidence[i]] = true;
                }
            }
        }
    }

    /**
     * Builds the evidence dictionary
     *
     * @param currentEvidencePointer
     * @param evidenceList
     * @param ghostKey
     * @return void
     */
    function setEvidenceData(currentEvidencePointer, evidenceList, ghostKey) {
        let newEvidenceList = [];

        for (let i = 0; i < evidenceList.length; i++) {
            if (typeof currentEvidencePointer[evidenceList[i]] === 'undefined') {
                currentEvidencePointer[evidenceList[i]] = {
                    ghosts: {},
                    nextEvidence: {}
                };
            }
            currentEvidencePointer[evidenceList[i]].ghosts[ghostKey] = ghostIndex[ghostKey];

            newEvidenceList = $.merge([], evidenceList);
            newEvidenceList.splice(i, 1);
            setEvidenceData(currentEvidencePointer[evidenceList[i]].nextEvidence, newEvidenceList, ghostKey);
        }
    }

    function getEvidenceData(currentEvidencePointer, evidence) {
        if (typeof currentEvidencePointer[evidence] !== 'undefined') {
            return currentEvidencePointer[evidence];
        } else if (typeof currentEvidencePointer.nextEvidence[evidence] !== 'undefined') {
            return currentEvidencePointer.nextEvidence[evidence];
        }

        return {
            nextEvidence: {},
            ghosts: []
        };
    }

    function getEvidenceGhosts(currentEvidencePointer, evidence) {
        return getEvidenceData.ghosts;
    }

    debug = function () {
        console.warn('Displaying Debug Data');
        console.warn('--Evidence Tree');
        console.log(evidenceTree);
        console.warn('--Ghost Status');
        console.log(ghostStatus);
        console.warn('--Evidence Selected');
        console.log(evidenceSelected);
        console.warn('--Current Evidence Tree Position');
        console.log(currentEvidenceTreePosition);
        console.warn('--Evidence Eliminated');
        console.log(evidenceEliminated);
        console.warn('--Ghosts Eliminated');
        console.log(ghostsEliminated);
        console.warn('--Auto Eliminated Evidence');
        console.log(evidenceAutoEliminated);
        console.warn('--Evidence Status');
        console.log(evidenceStatus);
    };

    function selectEvidenceByName(evidence) {
        let $button = $evidenceSection.find('[data-evidence="' + evidence + '"]');
        selectEvidence($button);
    }

    function deselectEvidenceByName(evidence) {
        let $button = $evidenceSection.find('[data-evidence="' + evidence + '"]');
        deselectEvidence($button);
    }

    function eliminateEvidenceByName(evidence, canBeUndone) {
        let $button = $evidenceSection.find('[data-evidence="' + evidence + '"]');
        eliminateEvidence($button, canBeUndone);
    }

    function unEliminateEvidenceByName(evidence, forceUndo) {
        forceUndo = (typeof forceUndo === 'undefined') ? false : forceUndo;
        let $button = $evidenceSection.find('[data-evidence="' + evidence + '"]');
        unEliminateEvidence($button, forceUndo);
    }

    function selectEvidence($button) {
        if (evidenceSelected.length === maxEvidence) {
            return false;
        }

        $button.removeClass(btnEvidenceClass).addClass(btnEvidenceSelectedClass);
        evidenceSelected.push($button.data('evidence'));
        evidenceStatus[$button.data('evidence')] = 1;

        refetchTreePosition();

        if (evidenceSelected.length === maxEvidence) {
            evidenceAutoEliminated = eliminateNonSelectedEvidence(false);
        }

        refreshGhostStatus();
        debug();
        renderGhosts();
    }

    function deselectEvidence($button) {
        for (let i = 0; i < evidenceAutoEliminated.length; i++) {
            unEliminateEvidenceByName(evidenceAutoEliminated[i], true);
        }
        evidenceAutoEliminated = [];

        $button.removeClass(btnEvidenceSelectedClass).addClass(btnEvidenceClass);

        for (let i = 0; i < evidenceSelected.length; i++) {
            if (evidenceSelected[i] === $button.data('evidence')) {
                evidenceSelected.splice(i, 1);
            }
        }

        evidenceStatus[$button.data('evidence')] = 0;

        refetchTreePosition();
        refreshGhostStatus();
        renderGhosts();
    }

    function refetchTreePosition() {
        currentEvidenceTreePosition = evidenceTree;

        for (let i = 0; i < evidenceSelected.length; i++) {
            currentEvidenceTreePosition = (typeof currentEvidenceTreePosition.nextEvidence !== 'undefined') ?
                currentEvidenceTreePosition.nextEvidence[evidenceSelected[i]] :
                currentEvidenceTreePosition[evidenceSelected[i]];
        }
    }

    function eliminateEvidence($button, canBeUndone) {
        let evidence = $button.data('evidence');
        canBeUndone = (typeof canBeUndone === 'undefined') ? false : canBeUndone;
        $button.data('can-undo', canBeUndone);

        if (isEvidenceSelected(evidence)) {
            //Is selected
            deselectEvidence($button);
        }

        $button.removeClass(btnEvidenceClass).addClass(btnEvidenceEliminatedClass);
        $button.find('.eliminate-icon').first().removeClass(eliminateIcon).addClass(unEliminateIcon);

        evidenceEliminated.push(evidence);
        evidenceStatus[evidence] = -1;
        for (let ghostKey in evidenceTree[evidence].ghosts) {
            if (evidenceTree[evidence].ghosts.hasOwnProperty(ghostKey)) {
                ghostStatus[ghostKey].eliminated[evidence] = true;
            }
        }

        renderGhosts();
    }

    function unEliminateEvidence($button, forceUndo) {
        let evidence = $button.data('evidence');
        forceUndo = (typeof forceUndo === 'undefined') ? false : forceUndo;
        if (!$button.data('can-undo') && !forceUndo) {
            return false;
        }

        $button
            .removeClass(btnEvidenceEliminatedClass).addClass(btnEvidenceClass)
            .removeData('can-undo');
        $button.find('.eliminate-icon').first().removeClass(unEliminateIcon).addClass(eliminateIcon);

        for (let i = 0; i < evidenceEliminated.length; i++) {
            if (evidenceEliminated[i] === evidence) {
                evidenceEliminated.splice(i, 1);
                break;
            }
        }

        let ghostsEliminatedUnique = {};
        for (let i = 0; i < ghostsEliminated.length; i++) {
            ghostsEliminatedUnique[ghostsEliminated[i]] = '';
        }

        for (let ghostKey in evidenceTree[evidence].ghosts) {
            if (evidenceTree[evidence].ghosts.hasOwnProperty(ghostKey)) {
                if (typeof ghostsEliminatedUnique[ghostKey] === 'undefined') {
                    ghostStatus[ghostKey].eliminated[evidence] = false;
                }
            }
        }

        evidenceStatus[evidence] = 0;

        renderGhosts();
    }

    function eliminateNonSelectedEvidence(canBeUndone) {
        canBeUndone = (typeof canBeUndone === 'undefined') ? false : canBeUndone;
        let autoEliminated = [];

        $evidenceSection.find('.btn-evidence').each(function () {
            let evidence = $(this).data('evidence');

            if (isEvidenceDeselected(evidence)) {
                autoEliminated.push($(this).data('evidence'));
                eliminateEvidence($(this), canBeUndone);
            }
        });

        return autoEliminated;
    }

    function unEliminateAllEliminatedEvidence(forceUndo) {
        forceUndo = (typeof forceUndo === 'undefined') ? false : forceUndo;

        $evidenceSection.find('.btn-evidence').each(function () {
            let evidence = $(this).data('evidence');

            if (isEvidenceEliminated(evidence) && ($(this).data('can-undo') || forceUndo)) {
                unEliminateEvidence($(this), forceUndo);
            }
        })
    }

    function ghostIsPossible(ghostKey) {
        let eliminated = false;
        for (let evidence in ghostStatus[ghostKey].eliminated) {
            if (ghostStatus[ghostKey].eliminated.hasOwnProperty(evidence)) {
                if (ghostStatus[ghostKey].eliminated[evidence]) {
                    eliminated = true;
                    break;
                }
            }
        }

        return (
            ghostStatus[ghostKey].isPossibleByEvidence &&
            !eliminated
        );
    }

    function isEvidenceSelected(evidence) {
        return (evidenceStatus[evidence] === 1);
    }

    function isEvidenceDeselected(evidence) {
        return (evidenceStatus[evidence] === 0);
    }

    function isEvidenceEliminated(evidence) {
        return (evidenceStatus[evidence] === -1);
    }

    function ghostHasEvidence(ghostKey, evidence) {
        for (let i = 0; i < ghostIndex[ghostKey].evidence.length; i++) {
            if (ghostIndex[ghostKey].evidence[i] === evidence) {
                return true;
            }
        }

        return false;
    }

    function isGhostEvidenceEliminated(ghostKey, evidence) {
        return ghostStatus[ghostKey].eliminated[evidence];
    }

    function canEvidenceBeUnEliminated(evidence) {
        let $evidence = $evidenceSection.find('.btn-evidence[data-evidence="' + evidence + '"]').first();
        return $evidence.data('can-undo');
    }

    function isGhostEliminated(ghostKey) {
        //TODO: add this when adding the ghost elimination feature
    }

    function refreshGhostStatus() {
        let currentEvidencePointer = (typeof currentEvidenceTreePosition.nextEvidence === 'undefined') ?
        currentEvidenceTreePosition : currentEvidenceTreePosition.nextEvidence;

        let selectedEvidence = {};
        for (let evidence of evidenceSelected) {
            selectedEvidence[evidence] = '';
        }

        for (let ghostKey in ghostStatus) {
            let evidenceIsSelected = 0;

            if (ghostStatus.hasOwnProperty(ghostKey)) {
                ghostStatus[ghostKey].isPossibleByEvidence = true;

                for (let evidence in ghostStatus[ghostKey].possibleEvidence) {
                    if (ghostStatus[ghostKey].possibleEvidence.hasOwnProperty(evidence)) {
                        if (typeof selectedEvidence[evidence] !== 'undefined') {
                            evidenceIsSelected++;
                            ghostStatus[ghostKey].possibleEvidence[evidence] = true;
                        } else if (typeof currentEvidencePointer[evidence] === 'undefined') {
                            ghostStatus[ghostKey].possibleEvidence[evidence] = false;
                        } else {
                            ghostStatus[ghostKey].possibleEvidence[evidence] = true;
                        }

                        if (!ghostStatus[ghostKey].possibleEvidence[evidence]) {
                            ghostStatus[ghostKey].isPossibleByEvidence = false;
                        }
                    }
                }

                if (ghostStatus[ghostKey].isPossibleByEvidence && evidenceIsSelected !== evidenceSelected.length) {
                    ghostStatus[ghostKey].isPossibleByEvidence = false;
                }
            }
        }
    }

    function loadEvidence() {
        $evidenceSection.find('button').remove();
        let $buttonContainer = $('<div class="col-md-6 col-sm-6"></div>');
        let $buttonTemplate = $('<button type="button" class="btn btn-dark btn-evidence btn-xl"></button>');
        let $newButton, $newContainer;

        evidenceStatus = {};

        for (let key in evidenceIndex) {
            if (evidenceIndex.hasOwnProperty(key)) {
                $newButton = $buttonTemplate.clone();
                $newContainer = $buttonContainer.clone();

                $newButton.append('<span class="badge ' + evidenceIndex[key].badgeClass + ' float-left evidence-icon"><i class="' + evidenceIndex[key].iconClass + '"></i></span>');

                $newButton
                    .attr('data-evidence', key)
                    .append(evidenceIndex[key].name);
                $newButton.append('<i class="fa fa-unlock float-right eliminate-icon"></i>');
                $newContainer.append($newButton);

                $evidenceSection.append($newContainer);

                evidenceStatus[key] = {
                    isSelected: false,
                    isEliminated: false
                };
            }
        }
    }

    function renderGhosts() {
        let ghostList = [];
        let $listItemTemplate = $('<li class="list-group-item list-group-item-dark"><span id="ghostName"></span><span id="ghostEvidence"></span></li>');
        let $listItem;
        let evidenceSelectedUnique = {};
        let currentEvidencePointer = (typeof currentEvidenceTreePosition.nextEvidence === 'undefined') ?
            currentEvidenceTreePosition : currentEvidenceTreePosition.nextEvidence;
        let evidenceToEliminate = [];

        $ghostList.find('li').remove();

        if (evidenceSelected.length) {
            for (let evidence of evidenceSelected) {
                evidenceSelectedUnique[evidence] = '';
            }

            //ghostList = currentEvidenceTreePosition.ghosts;
            ghostList = ghostStatus;
        } else {
            ghostList = ghostStatus;
        }

        let evidencePossible = {};

        for (let ghostKey in ghostList) {
            let ghostData = ghostIndex[ghostKey];

            if (ghostIsPossible(ghostKey)) {
                let evidenceData, $ghostEvidence;

                $listItem = $listItemTemplate.clone();

                $listItem
                    .attr('data-ghost', ghostKey)
                    .find('#ghostName')
                    .html('<strong>' + ghostIndex[ghostKey].name + '</strong>');

                if (evidenceSelected.length < maxEvidence) {
                    $ghostEvidence = $listItem.find('#ghostEvidence');

                    for (let i = 0; i < ghostData.evidence.length; i++) {
                        evidenceData = evidenceIndex[ghostData.evidence[i]];

                        if (typeof evidenceSelectedUnique[ghostData.evidence[i]] === 'undefined') {
                            $ghostEvidence.append('<span class="badge ' + evidenceData.badgeClass + '"><i class="' + evidenceData.iconClass + '"></i></span>' + '&nbsp;');
                            evidencePossible[ghostData.evidence[i]] = '';
                        }
                    }
                }
                $ghostList.append($listItem);
            } else {
                for (let i = 0; i < ghostData.evidence.length; i++) {
                    if (
                        typeof currentEvidencePointer[ghostData.evidence[i]] === 'undefined' &&
                        typeof evidenceSelectedUnique[ghostData.evidence[i]] === 'undefined'
                    ) {
                        if (!isEvidenceEliminated(ghostData.evidence[i])) {
                            eliminateEvidenceByName(ghostData.evidence[i], false);
                            evidenceAutoEliminated.push(ghostData.evidence[i]);
                        }
                    }
                }
            }
        }

        $evidencePossible.find('.badge').remove();
        $evidencePossible.html('');

        if (evidenceSelected.length) {
            for (let evidence of Object.keys(evidencePossible)) {
                let evidenceData = evidenceIndex[evidence];

                $evidencePossible.append('<span class="badge ' + evidenceData.badgeClass + '"><i class="' + evidenceData.iconClass + '"></i></span>' + '&nbsp;');
            }
        } else {
            $evidencePossible.html('All');
        }
    }

    $('body')
        .on('click', '.btn-evidence', function (e) {
            e.stopPropagation();
            e.preventDefault();

            let evidence = $(this).data('evidence');

            if (isEvidenceSelected(evidence)) {
                deselectEvidence($(this));
            } else if (isEvidenceDeselected(evidence)) {
                selectEvidence($(this));
            }
        })
        .on('click', '#resetButton', function () {
            init(false);
        })
        .on('click', '.eliminate-icon', function (e) {
            e.stopPropagation();
            e.preventDefault();

            if ($(this).hasClass(eliminateIcon)) {
                eliminateEvidence($(this).closest('button'), true);
            } else {
                unEliminateEvidence($(this).closest('button'));
            }

            renderGhosts();
        });

    init();
});