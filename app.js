// LIST
list = document.getElementById('list')

// LOCALSTORAGE OPTIONS & SETTINGS CHECKS
let options = {
  'theme': 'auto',
  'moveCompletedTasks': true,
  'saveList': true
}

if ('options' in localStorage) {
  options = JSON.parse(localStorage.options)
} else {
  localStorageUpdater()
}

document.querySelector(`input[name="theme"][value="${options.theme}"]`).checked = true
document.querySelector('input[name="moveCompletedTasks"]').checked = options.moveCompletedTasks
document.querySelector('input[name="saveList"]').checked = options.saveList

function localStorageUpdater() {
  localStorage.options = JSON.stringify(options)
}

// MODALS
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

// DARK OR LIGHT MODE
function manageTheme(theme) {
  document.body.classList.toggle('dark-theme', (theme == 'dark' || (theme == 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)))
}

manageTheme(options.theme)

document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener('change', () => {
    options.theme = radio.value
    manageTheme(options.theme)
    localStorageUpdater()
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
  localStorageUpdater()
})

// SAVE LIST
function listSaver() {
  if (!options.saveList) return
  let tasksArray = []
  document.querySelectorAll('.task').forEach(task => {
    if (task.querySelector('span').innerHTML == '') return
    tasksArray.push({'text': task.querySelector('span').innerHTML, 'completed': (task.classList.contains('completed'))})
  })
  localStorage.savedTasks = JSON.stringify(tasksArray)
}

setInterval(listSaver, 1500)

document.querySelector('input[name="saveList"]').addEventListener('change', e => {
  options.saveList = e.target.checked
  localStorageUpdater()
  if (!options.saveList) localStorage.savedTasks = []
})

// TO DO LIST
function appendTask(node, position, completed, text, focus) {
  newTask = document.createElement('div')
  newTask.classList = (completed ? 'task completed' : 'task')
  newTask.innerHTML = `
    <input type="checkbox" >
    <span contenteditable="${completed ? false : true}" placeholder="Type something...">${text}</span>
  `
  if (completed) newTask.querySelector('input').checked = true
  node.insertAdjacentElement(position, newTask)
  if (focus) newTask.querySelector('span').focus()
}

function focusTask(task, position) {
  if (position == 'prev') task.previousSibling.querySelector('span').focus()
  if (position == 'next') task.nextSibling.querySelector('span').focus()
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

if (options.saveList) {
  localStorageTasks = JSON.parse(localStorage.savedTasks)
  if (localStorageTasks.length == 0) {
    appendTask(list, 'afterbegin', false, '', true)
  } else {
    localStorageTasks.forEach(task => {
      appendTask(list, 'beforeend', task['completed'], task['text'], false)
    })
  }
} else {
  appendTask(list, 'afterbegin', false, '', true)
}

// EVENT LISTENERS
window.addEventListener('keydown', e => {
  modals.forEach(modal => {
    if (e.key == 'Escape' && modal.classList.contains('active')) manageModal(modal, false)
  })
  if (e.key == 'Enter' || e.key == 'Tab') {
		e.preventDefault()
	}
  if (e.ctrlKey && e.key == 'S') {
    e.preventDefault()
		listSaver()
	}
	if (e.target.parentNode.classList.contains('task')) {
		span = e.target
    task = span.parentNode
    if (e.key == 'ArrowUp') {
			focusTask(task, 'prev')
		}
    if (e.key == 'ArrowDown') {
      focusTask(task, 'next')
    }
    if (e.key == 'Backspace' && span.innerHTML == '' && task !== list.querySelector('.task:first-child')) {
      focusTask(task, 'prev')
			list.removeChild(task)
		}
    if (e.key == 'Enter' && span.innerHTML !== '') {
			appendTask(task, 'afterend', false, '', true)
		}
		if (e.ctrlKey) {
      if (e.key == 'ArrowUp') list.insertBefore(task, task.previousSibling)
      if (e.key == 'ArrowDown') insertAfter(task, task.nextSibling)
      span.focus()
    }
    if (e.shiftKey && e.key == 'Backspace') {
      focusTask(task, 'prev')
      list.removeChild(task)
    }
  } else {
   if (e.key == 'Enter' && list.querySelector('.task:last-child span').innerHTML !== '') {
     appendTask(list.querySelector('.task:last-child'), 'afterend', false, '', true)
   }
 }
})

window.addEventListener('click', e => {
  modals.forEach(modal => {
    if (e.target == modal && modal.classList.contains('active')) manageModal(modal, false)
  })
	tasks = list.querySelectorAll('.task')
	lastTask = tasks[tasks.length-1]
  if (!list.contains(e.target) && lastTask.querySelector('div > span').innerHTML !== '' && list.length > 0) {
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
