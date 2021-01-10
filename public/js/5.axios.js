// Global Model
let todos = [];
let navState = 'all';

//DOM Nodes
const $todos = document.querySelector('.todos');
const $inputTodo = document.querySelector('.input-todo');
const $allCompletedBtn = document.getElementById('ck-complete-all');
const $clearCompletedBtn = document.querySelector('.btn');
const $nav = document.querySelector('.nav');

//Todos Function
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
    axios
      .post('/todos', payload)
      .then((res) => render(res.data))
      .catch(console.error);
  };
})();

const removeTodo = (id) => {
  axios
    .delete(`/todos/${+id}`)
    .then((res) => render(res.data))
    .catch(console.error);
};

const toggleComplete = (id) => {
  const todo = todos.find((todo) => todo.id === +id);
  axios
    .patch(`/todos/${+id}`, { ...todo, completed: !todo.completed })
    .then((res) => render(res.data))
    .catch(console.error);
};

const completedAll = (target) => {
  axios
    .patch('/todos', { completed: target.checked })
    .then((res) => render(res.data))
    .catch(console.error);
};

const clearCompleted = () => {
  axios
    .delete('/todos/completed')
    .then((res) => render(res.data))
    .catch(console.error);
};

const changeState = (target) => {
  [...$nav.children].forEach((child) => {
    child.classList.toggle('active', child === target);
  });

  navState = target.id;
};
// Event Handling
document.addEventListener('DOMContentLoaded', () => {
  axios
    .get('/todos')
    .then((res) => render(res.data))
    .catch(console.error);
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
  changeState(target);
  render();
});
