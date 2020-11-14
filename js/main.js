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
            Core.evidenceSelected(evidenceKey, false);
            UI.switchEvidenceSelected(evidenceKey, false);
            UI.renderGhosts();
        } else if (!Core.evidenceSelected(evidenceKey) && Core.evidenceCanBeSelected(evidenceKey)) {
            Core.evidenceSelected(evidenceKey, true);
            Core.debug();
            UI.switchEvidenceSelected(evidenceKey, true);
            UI.renderGhosts();
        }
    })
    .on('click', '#resetButton', function () {
        for (const evidenceKey of Core.evidenceSelected()) {
            Core.evidenceSelected(evidenceKey, false);
        }
        for (const evidenceKey of Core.evidenceEliminated()) {
            Core.evidenceEliminated(evidenceKey, false);
        }

        for (const ghostKey of Core.ghostsEliminated()) {
            Core.ghostsEliminated(ghostKey, false);
        }

        UI.render();
    })
    .on('click', '.eliminate-icon', function (e) {
        e.stopPropagation();
        e.preventDefault();

        let $evidenceButton = $(this).closest('.btn-evidence');
        let evidenceKey = $evidenceButton.data('evidence');

        if (Core.evidenceSelected(evidenceKey)) {
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