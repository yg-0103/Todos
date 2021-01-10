// Global Model
let todos = [];
let navState = 'all';

// DOM Nodes
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $allCompletedBtn = document.getElementById('ck-complete-all');
const $clearCompletedBtn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');

// Server Request
async function ajax(method, url, payload) {
  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    todos = await res.json();
    console.log(todos);
    render();
  } catch (e) {
    console.error(e);
  }
}

const req = {
  get(url) {
    return ajax('GET', url);
  },

  post(url, payload) {
    return ajax('POST', url, payload);
  },

  patch(url, payload) {
    return ajax('PATCH', url, payload);
  },

  delete(url) {
    return ajax('DELETE', url);
  },
};

// Todos Function
const render = () => {
  const activeTodo = todos.filter((todo) => !todo.completed);
  const completedTodo = todos.filter((todo) => todo.completed);
  const _todos =
    navState === 'all'
      ? todos
      : navState === 'active'
      ? activeTodo
      : completedTodo;

  $todos.innerHTML = _todos
    .map(
      ({ id, content, completed }) => `<li id="${id}" class="todo-item">
  <input class="checkbox" type="checkbox" id="ck-${id}" ${
        completed ? 'checked' : ''
      }>
  <label for="ck-${id}">${content}</label>
  <i class="remove-todo far fa-times-circle"></i>
</li>`
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
    req.post('/todos', payload);
  };
})();

const removeTodo = (id) => {
  req.delete(`/todos/${+id}`);
};

const toggleComplete = (id) => {
  const todo = todos.find((todo) => todo.id === +id);
  req.patch(`/todos/${+id}`, { ...todo, completed: !todo.completed });
};

const completedAll = (target) => {
  req.patch('/todos', { completed: target.checked });
};

const clearCompleted = () => {
  req.delete('/todos/completed');
};

const chageState = (target) => {
  [...$nav.children].forEach((child) => {
    child.classList.toggle('active', child === target);
  });

  navState = target.id;
};

// Event Handling
document.addEventListener('DOMContentLoaded', () => {
  req.get('/todos');
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

$nav.addEventListener('click', ({ target }) => {
  chageState(target);
  render();
});
