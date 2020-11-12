import Config from './modules/config.static.js';
import Core from './modules/core.static.js';
import UI from './modules/ui.static.js';

Core.init();
UI.init();
Config.lockStructure();
UI.render();

//Binds
$('body')
    .on('click', '.btn-evidence', function (e) {
        e.stopPropagation();
        e.preventDefault();

        let evidence = $(this).data('evidence');

        if (Core.evidenceSelected(evidence)) {
            //deselectEvidence($(this));
            //isEvidenceDeselected(evidence)
        } else if (1 === 1) {
            //selectEvidence($(this));
        }
    })
    .on('click', '#resetButton', function () {
        //init(false);
    })
    .on('click', '.eliminate-icon', function (e) {
        e.stopPropagation();
        e.preventDefault();

        if ($(this).hasClass(eliminateIcon)) {
            //eliminateEvidence($(this).closest('button'), true);
        } else {
            //unEliminateEvidence($(this).closest('button'));
        }

        //renderGhosts();
    });

Config.debug();
Core.debug();

console.log('Is Possible: ' + Core.ghost('banshee').is('possible'));