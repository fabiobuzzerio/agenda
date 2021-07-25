// TO DO LIST
function focusNextTask(task) {
	task.nextSibling.querySelector('span').focus()
}

function focusPreviousTask(task) {
	task.previousSibling.querySelector('span').focus()
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function createTask(prevTask) {
	newTask = document.createElement('div')
	newTask.classList = 'task'
	newTask.innerHTML = `
		<input type="checkbox">
		<span contenteditable="true" placeholder="Type something..."></span>
	`
	insertAfter(newTask, prevTask)
	newTask.querySelector('span').focus()
}

window.addEventListener('keydown', e => {
	if (e.key == 'Enter' || e.key == 'Tab') {
		e.preventDefault()
	}
	if (e.target.parentNode.classList == 'task') {
		span = e.target
    task = span.parentNode
		list = task.parentNode
		if (e.key == 'Backspace' && span.innerHTML == '' && task !== list.querySelector('div > div')) {
			focusPreviousTask(task)
			list.removeChild(span.parentNode)
		}
		if (e.key == 'Enter' && span.innerHTML !== '') {
			createTask(task)
		}
		if (e.key == 'ArrowUp') {
			focusPreviousTask(task)
		}
		if (e.ctrlKey && e.key == 'ArrowUp') {
			list.insertBefore(task, task.previousSibling)
			span.focus()
		}
		if (e.key == 'ArrowDown') {
			focusNextTask(task)
		}
		if (e.ctrlKey && e.key == 'ArrowDown') {
			insertAfter(task, task.nextSibling)
			span.focus()
		}
  }
})

let moveCompletedTasks

if ('moveCompletedTasks' in localStorage) {
  moveCompletedTasksCheckbox = document.querySelector('input[name="moveCompletedTasks"]')
  if (localStorage.moveCompletedTasks == 'true') {
    moveCompletedTasks = moveCompletedTasksCheckbox.checked = true
     true
  } else {
    moveCompletedTasks = moveCompletedTasksCheckbox.checked = false
  }
}

window.addEventListener('click', e => {
	list = document.getElementById('list')
	tasks = list.querySelectorAll('.task')
	lastTask = tasks[tasks.length-1]
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
      if (moveCompletedTasks) insertAfter(task, lastTask)
		} else {
      taskFirstCompleted = task.parentNode.querySelectorAll('div > .task.completed')[0]
			task.classList.toggle('completed', false)
			span.contentEditable = true
      if (moveCompletedTasks) list.insertBefore(task, taskFirstCompleted)
    }
	}
})

/*
let os
if (navigator.appVersion.indexOf("Win") != -1) os = "Windows"
if (navigator.appVersion.indexOf("Mac") != -1) os = "MacOS"
if (navigator.appVersion.indexOf("X11") != -1) os = "UNIX"
if (navigator.appVersion.indexOf("Linux") != -1) os = "Linux"
*/

// OPEN & CLOSE MODALS
function activateModal(modal, active) {
  modal.classList.toggle('active', active)
}

var info = document.getElementById('info')
var infoToggle = document.getElementById('infoToggle')
var settings = document.getElementById('settings')
var settingsToggle = document.getElementById('settingsToggle')

modals = [info, settings]
modalsToggles = [infoToggle, settingsToggle]

modalsToggles.forEach((toggle, i) => {
  toggle.addEventListener('click', () => {
    activateModal(modals[i], true)
  })
})

window.addEventListener('click', e => {
  modals.forEach(modal => {
    if (e.target == modal && modal.classList.contains('active')) {
  		activateModal(modal, false)
  	}
  })
})

// MOVE COMPLETED TASKS
document.querySelector('input[name="moveCompletedTasks"]').addEventListener('change', e => {
  if (e.target.checked) {
    lastTask = tasks[tasks.length-1]
    document.querySelectorAll('.completed').forEach(task => {
      insertAfter(task, lastTask)
      lastTask = task
    })
    moveCompletedTasks = true
    localStorage.moveCompletedTasks = 'true'
  } else {
    moveCompletedTasks = false
    localStorage.moveCompletedTasks = 'false'
  }
})

// DARK OR LIGHT MODE
function toggleDarkMode(state) {
	document.body.classList.toggle('dark-mode', state)
}

if ('theme' in localStorage) {
  if (localStorage.theme == 'dark' || (localStorage.theme == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) toggleDarkMode(true)
  document.querySelector(`input[name="theme"][value="${localStorage.theme}"]`).checked = true
}

document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.value == 'light' || (radio.value == 'auto' && !window.matchMedia('(prefers-color-scheme: dark)').matches)) toggleDarkMode(false)
    if (radio.value == 'dark' || (radio.value == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) toggleDarkMode(true)
    localStorage.setItem('theme', radio.value)
  })
})

window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    toggleDarkMode(true)
  } else {
    toggleDarkMode(false)
  }
})
