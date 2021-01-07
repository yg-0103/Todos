let todos = [];
let navState = 'all';

// DOM 노드
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $allCompletedBtn = document.getElementById('ck-complete-all');
const $clearCompletedBtn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');

// 서버 통신
const ajax = (() => {
  function req(method, url, cb, payload) {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(payload));

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        cb(JSON.parse(xhr.response));
      } else {
        throw new Error('Error' + xhr.status);
      }
    };
  }

  return {
    get(url, cb) {
      req('GET', url, cb);
    },

    post(url, cb, payload) {
      req('POST', url, cb, payload);
    },

    patch(url, cb, payload) {
      req('PATCH', url, cb, payload);
    },

    delete(url, cb) {
      req('DELETE', url, cb);
    },
  };
})();

// Todos function
const render = (data = todos) => {
  todos = data;
  const active = todos.filter((todo) => !todo.completed);
  const completed = todos.filter((todo) => todo.completed);
  const _todos =
    navState === 'all' ? todos : navState === 'active' ? active : completed;

  $todos.innerHTML = _todos
    .map(
      ({ id, content, completed }) => `<li id="${id}" class="todo-item">
  <input class="checkbox" type="checkbox" id="ck-${id}" ${
        completed ? 'checked' : ''
      }>
  <label for="ck-${id}" style="text-decoration: ${
        completed ? 'line-through' : 'none'
      }">${content}</label>
  <i class="remove-todo far fa-times-circle"></i>
</li>`
    )
    .join('');

  document.querySelector('.active-todos').textContent = active.length;
  document.querySelector('.completed-todos').textContent = completed.length;

  $allCompletedBtn.checked =
    todos.length === completed.length ? (todos.length ? true : true) : false;
};

const addTodo = (() => {
  const generateId = () =>
    todos.length ? Math.max(...todos.map((todo) => todo.id)) + 1 : 1;

  return (content) => {
    console.log(generateId());
    const payload = { id: generateId(), content, completed: false };
    ajax.post('/todos', render, payload);
  };
})();

const removeTodo = (id) => {
  ajax.delete(`/todos/${+id}`, render);
};

const toggleComplete = (id) => {
  const todo = todos.find((todo) => todo.id === +id);
  ajax.patch(`/todos/${+id}`, render, { ...todo, completed: !todo.completed });
};

const completedAll = (target) => {
  ajax.patch('/todos', render, { completed: target.checked });
};

const clearCompleted = () => {
  ajax.delete('todos/completed', render);
};

const chageState = (target) => {
  [...$nav.children].forEach((child) => {
    child.classList.toggle('active', child === target);
  });
  navState = target.id;
  render();
};

// event handle
document.addEventListener('DOMContentLoaded', () => {
  ajax.get('/todos', render);
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
  chageState(e.target);
});
