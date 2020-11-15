import Config from './modules/config.static.js';
import Core from './modules/core.static.js';
import UI from './modules/ui.static.js';

let debugEnabled = false;

Core.init(debugEnabled);
UI.init(debugEnabled);
Config.debugMode(debugEnabled);
Config.lockStructure();
UI.render();

//Binds
$('body')
    .on('click', '.btn-evidence', function (e) {
        e.stopPropagation();
        e.preventDefault();

        let evidenceKey = $(this).data('evidence');

        if (Core.evidenceSelected(evidenceKey)) {
            if (Core.evidenceSelected().size === Core.maxEvidence) {
                for (const workingEvidenceKey of Core.evidenceAutoEliminated()) {
                    if (evidenceKey === workingEvidenceKey) {
                        continue;
                    }

                    let evidence = Core.evidence(workingEvidenceKey);

                    if (evidence.prop('isEliminated')) {
                        evidence.setProp('isEliminated', false)
                            .autoUpdateProp('isPossible');
                        if (evidence.is('possible')) {
                            Core.evidenceAutoEliminated(workingEvidenceKey, false);
                            UI.switchEvidenceEliminated(workingEvidenceKey, false);
                        }
                    }
                }
            }

            Core.evidenceSelected(evidenceKey, false);
            UI.switchEvidenceSelected(evidenceKey, false);

            Core.debug();
            UI.renderGhosts();
        } else if (!Core.evidenceSelected(evidenceKey) && Core.evidenceCanBeSelected(evidenceKey)) {
            if ((Core.evidenceSelected().size + 1) === Core.maxEvidence) {
                //Eliminate remaining evidence
                for (const [workingEvidenceKey, evidenceTreeData] of Core.allEvidence()) {
                    if (evidenceKey === workingEvidenceKey) {
                        continue;
                    }

                    let evidence = Core.evidence(workingEvidenceKey);

                    if (!evidence.prop('isSelected') && !evidence.prop('isEliminated')) {
                        evidence.setProp('isEliminated', true);
                        Core.evidenceAutoEliminated(workingEvidenceKey, true);
                        evidence.autoUpdateProp('isPossible');

                        UI.switchEvidenceEliminated(workingEvidenceKey, true);
                    }
                }

            }

            Core.evidenceSelected(evidenceKey, true);
            UI.switchEvidenceSelected(evidenceKey, true);

            Core.debug();
            UI.renderGhosts();
        }
    })
    .on('click', '#resetButton', function () {
        for (const evidenceKey of Core.evidenceAutoEliminated()) {
            Core.evidenceAutoEliminated(evidenceKey, false);
            Core.evidence(evidenceKey).setProp('isEliminatedByEvidence', false);
            Core.evidenceEliminated(evidenceKey, false, false);
        }

        for (const evidenceKey of Core.evidenceSelected()) {
            Core.evidenceSelected(evidenceKey, false, false);
        }
        for (const evidenceKey of Core.evidenceEliminated()) {
            Core.evidenceEliminated(evidenceKey, false, false);
        }

        for (const ghostKey of Core.ghostsEliminated()) {
            Core.ghostsEliminated(ghostKey, false);
        }

        Core.refreshGhostsEliminatedByAllEvidence(false);
        Core.refreshGhostsSelectedByAllEvidence(false);

        UI.render();
    })
    .on('click', '.eliminate-lock,.eliminate-icon', function (e) {
        e.stopPropagation();
        e.preventDefault();

        let $evidenceButton = $(this).closest('.btn-evidence');
        let evidenceKey = $evidenceButton.data('evidence');

        if (Core.evidenceSelected(evidenceKey)) {
            if (Core.evidenceSelected().size === Core.maxEvidence) {
                for (const workingEvidenceKey of Core.evidenceAutoEliminated()) {
                    if (evidenceKey === workingEvidenceKey) {
                        continue;
                    }

                    let evidence = Core.evidence(workingEvidenceKey);

                    if (evidence.prop('isEliminated')) {
                        evidence.setProp('isEliminated', false)
                            .autoUpdateProp('isPossible');
                        if (evidence.is('possible')) {
                            Core.evidenceAutoEliminated(workingEvidenceKey, false);
                            UI.switchEvidenceEliminated(workingEvidenceKey, false);
                        }
                    }
                }
            }

            Core.evidenceSelected(evidenceKey, false);
            UI.switchEvidenceSelected(evidenceKey, false);
        }

        if (Core.evidenceEliminated(evidenceKey)) {
            Core.evidenceEliminated(evidenceKey, false);
            UI.switchEvidenceEliminated(evidenceKey, false);
            Core.debug();
            UI.renderGhosts();
        } else if (!Core.evidenceEliminated(evidenceKey) && Core.evidenceCanBeEliminated(evidenceKey)) {
            Core.evidenceEliminated(evidenceKey, true);
            UI.switchEvidenceEliminated(evidenceKey, true);
            Core.debug();
            UI.renderGhosts();
        }

        //renderGhosts();
    });

Config.debug();
Core.debug();