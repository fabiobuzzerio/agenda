// TO DO LIST
function focusNextTask(task) {
	task.parentNode.nextSibling.querySelector('span').focus()
}

function focusPreviousTask(task) {
	task.parentNode.previousSibling.querySelector('span').focus()
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling)
}

function createTask(prevTask) {
	newTask = document.createElement('div')
	newTask.classList = 'task'
	newTask.innerHTML = `
		<input type="checkbox">
		<span contenteditable="true" placeholder="Something to do"></span>
	`
	insertAfter(newTask, prevTask)
	newTask.querySelector('span').focus()
}

window.addEventListener('keydown', e => {
	if (e.key == 'Enter' || e.key == 'Tab') {
		e.preventDefault()
	}
	if (e.target.parentNode.classList == 'task') {
		task = e.target
		list = task.parentNode.parentNode
		if (e.key == 'Backspace' && task.innerHTML == '' && task.parentNode !== list.querySelector('div > div')) {
			focusPreviousTask(task)
			list.removeChild(task.parentNode)
		}
		if (e.key == 'Enter' && task.innerHTML !== '') {
			createTask(task.parentNode)
		}
		if (e.key == 'ArrowUp') {
			focusPreviousTask(task)
		}
		if (e.ctrlKey && e.key == 'ArrowUp') {
			list.insertBefore(task.parentNode, task.parentNode.previousSibling)
			task.focus()
		}
		if (e.key == 'ArrowDown') {
			focusNextTask(task)
		}
		if (e.ctrlKey && e.key == 'ArrowDown') {
			insertAfter(task.parentNode, task.parentNode.nextSibling)
			task.focus()
		}
  }
})

window.addEventListener('click', e => {
	list = document.getElementById('list')
	tasks = list.querySelectorAll('.task')
	lastTask = tasks[tasks.length-1]
	if (!lastTask.contains(e.target) && lastTask.querySelector('div > span').innerHTML == '' && lastTask !== tasks[0]) {
		list.removeChild(lastTask)
  }
	if (e.target.nodeName == 'INPUT') {
		task = e.target.parentNode
		span = task.querySelector('div > span')
		if (e.target.checked) {
			task.classList.add('completed')
			span.contentEditable = false
			insertAfter(task, lastTask)
		}
		if (!e.target.checked) {
			taskFirstCompleted = task.parentNode.querySelectorAll('div > .task.completed')[0]
			task.classList.remove('completed')
			span.contentEditable = true
			list.insertBefore(task, taskFirstCompleted)
		}
	}
})


// DARK OR LIGHT MODE
const colorSchemeToggle = document.getElementById('colorSchemeToggle')
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)')
const svgLight = document.getElementById('light')
const svgDark = document.getElementById('dark')
let currentTheme

function toggleDarkMode(state) {
	document.body.classList.toggle('dark-mode', state)
}

if (prefersDarkMode.matches) {
	toggleDarkMode()
	svgDark.style.display = 'none'
	currentTheme = 'dark'
} else {
	svgLight.style.display = 'none'
	currentTheme = 'light'
}

prefersDarkMode.addListener(e => {
	toggleDarkMode()
})

colorSchemeToggle.addEventListener('click', () => {
	if (currentTheme == 'light') {
		toggleDarkMode()
		svgDark.style.display = 'none'
		svgLight.style.display = 'inline'
		currentTheme = 'dark'
	} else {
		toggleDarkMode()
		svgLight.style.display = 'none'
		svgDark.style.display = 'inline'
		currentTheme = 'light'
	}
})


// INFO
const info = document.getElementById('info')

document.getElementById('infoToggle').addEventListener('click', e => {
	info.classList.toggle('active', true)
})

window.addEventListener('click', e => {
	if (e.target == info && info.classList.contains('active')) {
		info.classList.toggle('active', false)
	}
})
