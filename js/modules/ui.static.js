import Core from './core.static.js';

export default class UI {
    static $evidenceSection = $('#evidence');
    static $ghostsSection = $('#ghosts');
    static $ghostList = this.$ghostsSection.find('#ghostList');
    static $evidencePossibleSection = $('#evidencePossibleContainer');
    static $evidencePossible = this.$evidencePossibleSection.find('#evidencePossible');

    constructor() {};

    static init()
    {
        this.renderEvidence();
        this.renderGhosts();
    }

    static renderEvidence()
    {
        this.$evidenceSection.find('button').remove();
        let $buttonContainer = $('<div class="col-md-6 col-sm-6"></div>');
        let $buttonTemplate = $('<button type="button" class="btn btn-dark btn-evidence btn-xl"></button>');
        let $newButton, $newContainer;

        for (let [evidenceKey, evidenceData] of Core.allEvidence().entries()) {
            $newButton = $buttonTemplate.clone();
            $newContainer = $buttonContainer.clone();

            $newButton.append('<span class="badge ' + evidenceData.badgeClass + ' float-left evidence-icon"><i class="' + evidenceData.iconClass + '"></i></span>');

            $newButton
                .attr('data-evidence', evidenceKey)
                .append(evidenceData.name);
            $newButton.append('<i class="fa fa-unlock float-right eliminate-icon"></i>');
            $newContainer.append($newButton);

            this.$evidenceSection.append($newContainer);
        }
    }

    static renderGhosts()
    {
        let ghostList = [];
        let $listItemTemplate = $('<li class="list-group-item list-group-item-dark"><span id="ghostName"></span><span id="ghostEvidence"></span></li>');
        let $listItem;
        let evidenceSelectedUnique = {};
        let currentEvidencePointer = (typeof Core.currentTree.nextEvidence === 'undefined') ?
            Core.currentTree : Core.currentTree.nextEvidence;
        let evidenceToEliminate = [];

        this.$ghostList.find('li').remove();

        if (Core.evidenceSelected().length) {
            for (let evidence of Core.evidenceSelected()) {
                evidenceSelectedUnique[evidence] = '';
            }
        }

        let evidencePossible = {};

        for (let [ghostKey, ghost] of Core.allGhosts().entries()) {
            if (ghost.is('possible')) {
                let evidenceData, $ghostEvidence;

                $listItem = $listItemTemplate.clone();

                $listItem
                    .attr('data-ghost', ghostKey)
                    .find('#ghostName')
                    .html('<strong>' + ghost.name + '</strong>');

                if (Core.evidenceSelected().length < Core.maxEvidence) {
                    $ghostEvidence = $listItem.find('#ghostEvidence');

                    for (let i = 0; i < ghost.evidence.length; i++) {
                        evidenceData = Core.evidence(ghost.evidence[i]);

                        if (typeof evidenceSelectedUnique[ghost.evidence[i]] === 'undefined') {
                            $ghostEvidence.append('<span class="badge ' + evidenceData.badgeClass + '"><i class="' + evidenceData.iconClass + '"></i></span>' + '&nbsp;');
                            evidencePossible[ghost.evidence[i]] = '';
                        }
                    }
                }
                this.$ghostList.append($listItem);
            }
        }

        this.$evidencePossible.find('.badge').remove();
        this.$evidencePossible.html('');

        if (Core.evidenceSelected().length) {
            for (let evidence of Object.keys(evidencePossible)) {
                let evidenceData = Core.evidence(evidence);

                this.$evidencePossible.append('<span class="badge ' + evidenceData.badgeClass + '"><i class="' + evidenceData.iconClass + '"></i></span>' + '&nbsp;');
            }
        } else {
            this.$evidencePossible.html('All');
        }
    }
}