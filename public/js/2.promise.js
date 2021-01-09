// Global state
let todos = [];
let navState = 'all';

// DOM Nodes
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $allCompletedBtn = document.getElementById('ck-complete-all');
const $clearCompletedBtn = document.querySelector('.clear-completed');
const $nav = document.querySelector('.nav');

// Server Request
const ajax = (() => {
  function req(method, url, payload) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open(method, url);
      xhr.setRequestHeader('content-type', 'application/json');
      xhr.send(JSON.stringify(payload));

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(JSON.parse(xhr.response));
        } else {
          reject(new Error('Error' + xhr.status));
        }
      };
    });
  }

  return {
    get(url) {
      return req('GET', url) //
        .then(render)
        .catch(console.log);
    },

    post(url, payload) {
      return req('POST', url, payload) //
        .then(render)
        .catch(console.log);
    },

    patch(url, payload) {
      return req('PATCH', url, payload) //
        .then(render)
        .catch(console.log);
    },

    delete(url) {
      return req('DELETE', url) //
        .then(render)
        .catch(console.log);
    },
  };
})();

// Todos Function
const render = (data = todos) => {
  todos = data;
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
      ({ id, content, completed }) =>
        `<li id="${id}" class="todo-item">
    <input class="checkbox" type="checkbox" 
    id="ck-${id}" ${completed ? 'checked' : ''}>
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
    ajax.post('/todos', payload);
  };
})();

const removeTodo = (id) => {
  ajax.delete(`/todos/${+id}`);
};

const toggleCompleted = (id) => {
  const todo = todos.find((todo) => todo.id === +id);
  ajax.patch(`/todos/${+id}`, { ...todo, completed: !todo.completed });
};

const completedAll = (target) => {
  ajax.patch('todos', { completed: target.checked });
};

const clearCompleted = () => {
  ajax.delete('/todos/completed');
};

const changeState = (target) => {
  [...$nav.children].forEach((child) => {
    child.classList.toggle('active', child === target);
  });
  navState = target.id;
  render();
};
// Event Handle
document.addEventListener('DOMContentLoaded', () => {
  ajax.get('/todos');
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
  toggleCompleted(e.target.parentNode.id);
});

$allCompletedBtn.addEventListener('click', (e) => {
  completedAll(e.target);
});

$clearCompletedBtn.addEventListener('click', clearCompleted);

$nav.addEventListener('click', (e) => {
  changeState(e.target);
});
