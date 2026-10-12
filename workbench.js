/* A conceptual illustration, connected to the real project. No model runs here. */
(function () {
  'use strict';
  const study = document.getElementById('signalStudy');
  if (!study) return;
  const controls = document.getElementById('signalControls');
  const buttons = [...controls.querySelectorAll('[data-lens]')];
  const explanation = document.getElementById('signalExplanation');
  const inspect = document.getElementById('signalInspect');
  const views = {
    data: { stage: 0, text: 'Start with questions. Inspect the records, the missing values, and what each feature means.', link: 'Inspect the data stage' },
    model: { stage: 2, text: 'A boundary is a hypothesis. Compare models on validation data before trusting the result.', link: 'Explore model evaluation' },
    api: { stage: 3, text: 'Make the model useful. Carry the same fitted pipeline into single-profile and batch inference.', link: 'Follow the prediction pipeline' }
  };
  let selected = 'model';
  function select(view) {
    if (!views[view]) return;
    selected = view;
    study.dataset.view = view;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lens === view)));
    explanation.textContent = views[view].text;
    inspect.querySelector('span').textContent = views[view].link;
  }
  controls.hidden = false;
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-lens]');
    if (button) select(button.dataset.lens);
  });
  controls.addEventListener('keydown', event => {
    const current = buttons.indexOf(event.target);
    if (current < 0) return;
    let next = current;
    if (event.key === 'ArrowRight') next = (current + 1) % buttons.length;
    else if (event.key === 'ArrowLeft') next = (current + buttons.length - 1) % buttons.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = buttons.length - 1;
    else return;
    event.preventDefault();
    select(buttons[next].dataset.lens);
    buttons[next].focus();
  });
  inspect.addEventListener('click', () => {
    const project = document.getElementById('project-churn');
    inspect.setAttribute('href', project ? '#project-churn' : '#projects');
    if (!project) return;
    if (project.hidden) document.querySelector('[data-filter="all"]')?.click();
    project.querySelector('[data-stage="' + views[selected].stage + '"]')?.click();
  });
  select(selected);
})();
