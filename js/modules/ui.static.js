import {replaceData} from './helpers.js';
import Config from './config.static.js';
import Core from './core.static.js';

export default class UI {
    static $evidenceSection = $('#evidence');
    static $ghostsSection = $('#ghosts');
    static $ghostList = this.$ghostsSection.find('#ghostList');
    static $evidencePossibleSection = $('#evidencePossibleContainer');
    static $evidencePossible = this.$evidencePossibleSection.find('#evidencePossible');
    static #debugMode = false;

    constructor() {};

    static init(debugMode = false)
    {
        this.#debugMode = debugMode;

        Config.set({
            //UI Global Config Items
            'ui.mainIcons.eliminate': 'fa fa-times-circle',
            'ui.mainIcons.unEliminate': 'far fa-times-circle',
            'ui.evidenceButton.default': 'btn-dark',
            'ui.evidenceButton.selected': 'btn-success',
            'ui.evidenceButton.eliminated': 'btn-outline-danger disabled',
            //renderEvidence Config Items
            'ui.renderEvidence.buttonContainer': '<div class="col-md-6 col-sm-6 evidence-outer-col"></div>',
            'ui.renderEvidence.buttonTemplate': '<button type="button" class="btn btn-dark btn-evidence btn-xl"></button>',
            'ui.renderEvidence.subContainerTemplate': '<div class="row evidence-row"></div>',
            'ui.renderEvidence.evidenceCol1': '<div class="col-sm-2 evidence-col-1"><span class="badge !!badgeClass!! evidence-icon"><i class="!!iconClass!!"></i></span></div>',
            'ui.renderEvidence.evidenceCol2': '<div class="col-sm-8 evidence-name evidence-col-2">!!name!!</div>',
            'ui.renderEvidence.evidenceCol3': '<div class="col-sm-2 eliminate-lock evidence-col-3"><i class="!!eliminateIcon!! eliminate-icon"></i></div>',
            //renderGhost Config Items
            'ui.renderGhosts.listItemTemplate': '<div class="card bg-dark"><div class="card-header"><h5 class="mb-0"><div class="row"><div class="col-sm-8 ghost-header-left"><button id="ghostName" class="btn btn-link collapsed" data-toggle="collapse" aria-expanded="true"></button></div><div class="col-sm-4 ghost-header-right"><span class="ghostEvidence float-right"></span></div></div></h5></div><div class="collapse" data-parent="#ghostList"><div class="card-body"></div></div></div>',
            'ui.renderGhosts.ghostDescription': '<p class="card-text">!!description!!</p>',
            'ui.renderGhosts.ghostUniqueStrength': '<p class="text-danger"><strong>!!uniqueStrength!!</strong></p>',
            'ui.renderGhosts.ghostWeakness': '<p class="text-success"><strong>!!weakness!!</strong></p>',
            'ui.renderGhosts.evidence': '<span class="badge !!badgeClass!!"><i class="!!iconClass!!"></i></span>&nbsp;',
            'ui.renderGhosts.evidencePossible.evidence': '<span class="badge !!badgeClass!!"><i class="!!iconClass!!"></i></span>&nbsp;'
        });
    }

    static render()
    {
        this.renderEvidence();
        this.renderGhosts();
    }

    static renderEvidence()
    {
        this.$evidenceSection.find('.evidence-outer-col').remove();
        let $buttonContainer = $(Config.get('ui.renderEvidence.buttonContainer'));
        let $buttonTemplate = $(Config.get('ui.renderEvidence.buttonTemplate'));
        let $subContainerTemplate = $(Config.get('ui.renderEvidence.subContainerTemplate'));
        let $newButton, $newContainer, $newButtonSubContainer;

        let replacements = {
            badgeClass: '',
            iconClass: '',
            name: '',
            eliminateIcon: Config.get('ui.mainIcons.eliminate')
        };

        for (let [evidenceKey, evidenceData] of Core.allEvidence().entries()) {
            $newButton = $buttonTemplate.clone();
            $newContainer = $buttonContainer.clone();
            $newButtonSubContainer = $subContainerTemplate.clone();

            replacements.badgeClass = evidenceData.badgeClass;
            replacements.iconClass = evidenceData.iconClass;
            replacements.name = evidenceData.name;

            $newButton.append($newButtonSubContainer);
            $newButtonSubContainer.append(replaceData(Config.get('ui.renderEvidence.evidenceCol1'), replacements));

            $newButton.attr('data-evidence', evidenceKey);
            $newButtonSubContainer.append(replaceData(Config.get('ui.renderEvidence.evidenceCol2'), replacements));
            $newButtonSubContainer.append(replaceData(Config.get('ui.renderEvidence.evidenceCol3'), replacements));
            $newContainer.append($newButton);

            this.$evidenceSection.append($newContainer);
        }
    }

    static renderGhosts()
    {
        let $listItemTemplate = $(Config.get('ui.renderGhosts.listItemTemplate'));
        let $listItem;
        let evidenceSelectedUnique = {};
        let currentEvidencePointer = (typeof Core.currentTree.nextEvidence === 'undefined') ?
            Core.currentTree : Core.currentTree.nextEvidence;

        this.$ghostList.find('div.card').remove();

        if (Core.evidenceSelected().length) {
            for (let evidence of Core.evidenceSelected()) {
                evidenceSelectedUnique[evidence] = '';
            }
        }

        let evidencePossible = {};

        let replacements = {
            description: '',
            uniqueStrength: '',
            weakness: '',
            badgeClass: '',
            iconClass: ''
        };

        for (let [ghostKey, ghost] of Core.allGhosts().entries()) {
            if (ghost.is('possible')) {
                let evidenceData, $ghostEvidence;

                $listItem = $listItemTemplate.clone();

                replacements.description = ghost.description;
                replacements.uniqueStrength = ghost.uniqueStrength;
                replacements.weakness = ghost.weakness;

                $listItem.find('.card-header').first()
                    .attr('id', 'card-heading-' + ghostKey)
                    .find('#ghostName')
                    .attr('data-target', '#card-info-' + ghostKey)
                    .attr('aria-controls', 'card-info-' + ghostKey)
                    .text(ghost.name);

                $listItem.find('.collapse').first()
                    .attr('id', 'card-info-' + ghostKey)
                    .attr('aria-labelledby', '#card-heading-' + ghostKey)
                    .find('.card-body').first()
                    .append(replaceData(Config.get('ui.renderGhosts.ghostDescription'), replacements))
                    .append(replaceData(Config.get('ui.renderGhosts.ghostUniqueStrength'), replacements))
                    .append(replaceData(Config.get('ui.renderGhosts.ghostWeakness'), replacements));

                if (Core.evidenceSelected().size < Core.maxEvidence) {
                    $ghostEvidence = $listItem.find('.ghostEvidence');

                    for (const [evidenceKey, evidence] of ghost.evidence) {
                        replacements.badgeClass = evidence.badgeClass;
                        replacements.iconClass = evidence.iconClass;

                        if (evidence.prop('isPossible')) {
                            $ghostEvidence.append(replaceData(Config.get('ui.renderGhosts.evidence'), replacements));
                            evidencePossible[evidenceKey] = '';
                        }
                    }
                }
                this.$ghostList.append($listItem);
            }
        }

        this.$evidencePossible.find('.badge').remove();
        this.$evidencePossible.html('');

        if (Core.evidenceSelected().size || Core.evidenceEliminated().size) {
            for (let evidence of Object.keys(evidencePossible)) {
                let evidenceData = Core.evidence(evidence);

                replacements.badgeClass = evidenceData.badgeClass;
                replacements.iconClass = evidenceData.iconClass;

                this.$evidencePossible.append(
                    replaceData(Config.get('ui.renderGhosts.evidencePossible.evidence'), replacements)
                );
            }
        } else {
            this.$evidencePossible.html('All');
        }
    }

    static switchEvidenceSelected(evidenceKey, select)
    {
        if (select) {
            //select evidence
            this.$evidenceSection
                .find('.btn-evidence[data-evidence="' + evidenceKey + '"]').first()
                .removeClass(Config.get('ui.evidenceButton.default'))
                .addClass(Config.get('ui.evidenceButton.selected'));
        } else {
            //deselect evidence
            this.$evidenceSection
                .find('.btn-evidence[data-evidence="' + evidenceKey + '"]').first()
                .removeClass(Config.get('ui.evidenceButton.selected'))
                .addClass(Config.get('ui.evidenceButton.default'));
        }

        return this;
    }

    static switchEvidenceEliminated(evidenceKey, eliminate)
    {
        if (eliminate) {
            //eliminate evidence
            this.$evidenceSection
                .find('.btn-evidence[data-evidence="' + evidenceKey + '"]').first()
                .removeClass(Config.get('ui.evidenceButton.default'))
                .addClass(Config.get('ui.evidenceButton.eliminated'));
        } else {
            //uneliminate evidence
            this.$evidenceSection
                .find('.btn-evidence[data-evidence="' + evidenceKey + '"]').first()
                .removeClass(Config.get('ui.evidenceButton.eliminated'))
                .addClass(Config.get('ui.evidenceButton.default'));
        }

        return this;
    }
}