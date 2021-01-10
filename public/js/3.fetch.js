// Global state
let todos = [];
let navState = 'all';

// DOM Nodes
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $allCompletedBtn = document.getElementById('ck-complete-all');
const $clearCompletedBtn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');

// Server request
const req = {
  get(url) {
    return fetch(url).then((res) => res.json());
  },

  post(url, payload) {
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => res.json());
  },

  patch(url, payload) {
    return fetch(url, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    }).then((res) => res.json());
  },

  delete(url) {
    return fetch(url, { method: 'DELETE' }).then((res) => res.json());
  },
};

// Todos Function
const render = (data = todos) => {
  todos = data;
  const activeTodo = todos.filter((todo) => !todo.completed);
  const completedTodo = todos.filter((todo) => todo.completed);
  const _todos =
    navState === 'all'
      ? todos
      : navState === 'act~ive'
      ? activeTodo
      : completedTodo;

  $todos.innerHTML = _todos
    .map(
      ({ id, content, completed }) => `
      <li id="${id}" class="todo-item">
      <input class="checkbox" type="checkbox" id="ck-${id}" ${
        completed ? 'checked' : ''
      }>~
      <label for="ck-${id}">${content}</label>
      <i class="remove-todo far fa-times-circle"></i>
      </li> `
    )
    .join('');

  document.querySelector('.active-todos').textContent = activeTodo.length;
  document.querySelector('.completed-todos').textContent = completedTodo.length;

  $allCompletedBtn.checked =
    todos.length === completedTodo.length
      ? todos.length
        ? true
        : false
      : false;
};

const addTodo = (() => {
  const generateId = () =>
    todos.length ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;

  return (content) => {
    const payload = { id: generateId(), content, completed: false };
    req
      .post('/todos', payload) //
      .then(render)
      .catch(console.log);
  };
})();

const removeTodo = (id) => {
  req
    .delete(`/todos/${+id}`)
    .then(render)
    .catch(console.log);
};

const toggleComplete = (id) => {
  const todo = todos.find((todo) => todo.id === +id);
  req
    .patch(`/todos/${+id}`, { ...todo, completed: !todo.completed })
    .then(render)
    .catch(console.log);
};

const completedAll = (target) => {
  req
    .patch('/todos', { completed: target.checked })
    .then(render)
    .catch(console.log);
};

const clearCompleted = () => {
  req
    .delete('/todos/completed') //
    .then(render)
    .catch(console.log);
};

const changeState = (target) => {
  [...$nav.children].forEach((child) => {
    child.classList.toggle('active', child === target);
  });

  navState = target.id;
  render();
};
// Event handle
document.addEventListener('DOMContentLoaded', () => {
  req
    .get('/todos') //
    .then(render)
    .catch(console.log);
});

$inputTodo.addEventListener('keyup', (e) => {
  if (e.key !== 'Enter' || !e.target.value) return;
  addTodo(e.target.value);
  e.target.value = '';
});

$todos.addEventListener('click', (e) => {
  if (!e.target.matches('.remove-todo')) return;
  removeTodo(e.target.parentNode.id);
});

$todos.addEventListener('change', (e) => {
  toggleComplete(e.target.parentNode.id);
});

$allCompletedBtn.addEventListener('click', (e) => {
  completedAll(e.target);
});

$clearCompletedBtn.addEventListener('click', clearCompleted);

$nav.addEventListener('click', (e) => {
  changeState(e.target);
});
