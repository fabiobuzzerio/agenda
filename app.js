// LOCALSTORAGE OPTIONS & SETTINGS CHECKS
let options = {
  'theme': 'auto',
  'moveCompletedTasks': true,
  'saveList': true
}

if ('options' in localStorage) {
  options = JSON.parse(localStorage.options)
} else {
  localStorage.options = JSON.stringify({
    'theme': options.theme,
    'moveCompletedTasks': options.moveCompletedTasks,
    'saveList': options.saveList
  })
}

document.querySelector(`input[name="theme"][value="${options.theme}"]`).checked = true
document.querySelector('input[name="moveCompletedTasks"]').checked = options.moveCompletedTasks
document.querySelector('input[name="saveList"]').checked = options.saveList

function updateLSOptions() {
  localStorage.options = JSON.stringify(options)
}

// DOM ELEMENTS
list = document.getElementById('list')


// OPEN & CLOSE MODALS
var modals = [
  document.getElementById('info'),
  document.getElementById('settings')
]
var modalsToggles = [
  document.getElementById('infoToggle'),
  document.getElementById('settingsToggle')
]

function manageModal(modal, state) {
  modal.classList.toggle('active', state)
}

modalsToggles.forEach((toggle, i) => {
  toggle.addEventListener('click', () => {
    manageModal(modals[i], true)
  })
})

window.addEventListener('click', e => {
  modals.forEach(modal => {
    if (e.target == modal && modal.classList.contains('active')) manageModal(modal, false)
  })
})


// DARK OR LIGHT MODE
function manageTheme(a) {
  document.body.classList.toggle('dark-theme', (a == 'dark' || (a == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)))
}

manageTheme(options.theme)

document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    options.theme = radio.value
    manageTheme(options.theme)
    updateLSOptions()
  })
})

window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
  manageTheme(options.theme)
})


// MOVE COMPLETED TASKS
document.querySelector('input[name="moveCompletedTasks"]').addEventListener('change', e => {
  if (e.target.checked) {
    lastTask = tasks[tasks.length-1]
    document.querySelectorAll('.completed').forEach(task => {
      insertAfter(task, lastTask)
      lastTask = task
    })
    options.moveCompletedTasks = true
  } else {
    options.moveCompletedTasks = false
  }
  listSaver()
  updateLSOptions()
})


// SAVE LIST
function listSaver() {
  if (!options.saveList) return
  let tasksArray = []
  document.querySelectorAll('.task').forEach(task => {
    tasksArray.push({'text': task.querySelector('span').innerHTML, 'completed': (task.classList.contains('completed') ? true : false)})
  })
  localStorage.savedTasks = JSON.stringify(tasksArray)
}

document.querySelector('input[name="saveList"]').addEventListener('change', e => {
  options.saveList = e.target.checked ? true : false
  updateLSOptions()
  if (!options.saveList) localStorage.savedTasks = []
})


// TO DO LIST
function appendTask(node, position, completed, text) {
  newTask = document.createElement('div')
  newTask.classList = (completed ? 'task completed' : 'task')
  newTask.innerHTML = `
    <input type="checkbox">
    <span contenteditable="${completed ? false : true}" placeholder="Type something...">${text}</span>
  `
  if (completed) newTask.querySelector('input').checked = true
  node.insertAdjacentElement(position, newTask)
}

function focusTask(task, position) {
  if (position == 'prev') task.previousSibling.querySelector('span').focus()
  if (position == 'next') task.nextSibling.querySelector('span').focus()
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

if (options.saveList) {
  tasks = JSON.parse(localStorage.savedTasks)
  tasks.forEach(task => {
    appendTask(list, 'beforeend', task['completed'], task['text'],)
  })
} else {
  appendTask(list, 'afterbegin', false, '')
  list.lastChild.querySelector('span').focus()
}

// document.body.querySelector('#list > :not(.completed)').lastChild.querySelector('span').focus()
// list.querySelectorAll(':not(.completed)')

window.addEventListener('keydown', e => {
	if (e.key == 'Enter' || e.key == 'Tab') {
		e.preventDefault()
	}
  if (e.ctrlKey && e.key == 's') {
    e.preventDefault()
		listSaver()
	}
	if (e.target.parentNode.classList.contains('task')) {
		span = e.target
    task = span.parentNode
		list = task.parentNode
		if (e.key == 'Backspace' && span.innerHTML == '' && task !== list.querySelector('div > div')) {
			focusTask(task, 'prev')
			list.removeChild(task)
		}
		if (e.key == 'Enter' && span.innerHTML !== '') {
			appendTask(task, 'afterend', false, '')
      focusTask(task, 'next')
		}
		if (e.key == 'ArrowUp') {
			focusTask(task, 'prev')
		}
    if (e.key == 'ArrowDown') {
      focusTask(task, 'next')
    }
		if (e.ctrlKey) {
      if (e.key == 'ArrowUp') list.insertBefore(task, task.previousSibling)
      if (e.key == 'ArrowDown') insertAfter(task, task.nextSibling)
      span.focus()
    }
  }
})

window.addEventListener('click', e => {
	tasks = list.querySelectorAll('.task')
	lastTask = tasks[tasks.length-1]
  if (!list.contains(e.target) && lastTask.querySelector('div > span').innerHTML !== '' && list.length !== 1) {
    listSaver()
  }
	if (!lastTask.contains(e.target) && lastTask.querySelector('div > span').innerHTML == '' && lastTask !== tasks[0]) {
		list.removeChild(lastTask)
  }
	if (e.target.nodeName == 'INPUT' && e.target.parentNode.classList.contains('task')) {
    checkbox = e.target
		task = e.target.parentNode
		span = task.querySelector('div > span')
		if (checkbox.checked) {
			task.classList.toggle('completed', true)
			span.contentEditable = false
      if (options.moveCompletedTasks) insertAfter(task, lastTask)
		} else {
      taskFirstCompleted = task.parentNode.querySelectorAll('div > .task.completed')[0]
			task.classList.toggle('completed', false)
			span.contentEditable = true
      if (options.moveCompletedTasks) list.insertBefore(task, taskFirstCompleted)
    }
	}
})


// let os
// if (navigator.appVersion.indexOf("Win") != -1) os = "Windows"
// if (navigator.appVersion.indexOf("Mac") != -1) os = "MacOS"
// if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX"
// if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux"
