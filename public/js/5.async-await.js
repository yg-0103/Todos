let todos = [];
// 현재 선택된 nav 상태(현재 active 상태인 nav 요소의 자식 요소의 id)
let navState = 'all'; // 'all' / 'active' / 'completed'

// DOMs
const $todos = document.querySelector('.todos');
const $input = document.querySelector('.input-todo');
const $checkbox = document.querySelector('.complete-all > .checkbox');
const $clearCompleted = document.querySelector('.clear-completed > .btn');
const $completedTodos = document.querySelector('.completed-todos');
const $activeTodos = document.querySelector('.active-todos');
const $nav = document.querySelector('.nav');

const render = () => {
  const _todos = todos.filter(({ completed }) => (navState === 'all' ? true : navState === 'active' ? !completed : completed));

  let html = '';

  _todos.forEach(({ id, content, completed }) => {
    html += `
      <li id="${id}" class="todo-item">
        <input class="checkbox" type="checkbox" id="ck-${id}" ${completed ? 'checked' : ''}>
        <label for="ck-${id}">${content}</label>
        <i class="remove-todo far fa-times-circle"></i>
      </li>`;
  });

  $todos.innerHTML = html;
  $completedTodos.textContent = todos.filter(todo => todo.completed).length;
  $activeTodos.textContent = todos.filter(todo => !todo.completed).length;
};

const generateid = () => (todos.length ? Math.max(...todos.map(todo => todo.id)) + 1 : 1);

const getTodos = async () => {
  try {
    const res = await axios.get('/todos');
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

const addTodo = async content => {
  try {
    const res = await axios.post('/todos', { id: generateid(), content, completed: false });
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

const toggleCompleted = async id => {
  try {
    const completed = !todos.find(todo => todo.id === +id).completed;

    const res = await axios.patch(`/todos/${id}`, { completed });
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

const removeTodo = async id => {
  try {
    const res = await axios.delete(`/todos/${id}`);
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

const changeNav = id => {
  // $navItem의 id가 e.target의 id와 같으면 active 클래스를 추가하고 아니면 active 클래스를 제거
  [...$nav.children].forEach($navItem => {
    $navItem.classList.toggle('active', $navItem.id === id);
  });

  navState = id;
  console.log('[navState]', navState);
};

const toggleCompletedAll = async completed => {
  try {
    const res = await axios.patch('/todos', { completed });
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

const removeCompleted = async () => {
  try {
    const res = await axios.delete('/todos/completed');
    todos = res.data;
    render();
  } catch (e) {
    console.error(e);
  }
};

// Events
window.onload = getTodos;

$input.onkeyup = ({ target, keyCode }) => {
  const content = target.value.trim();

  if (!content || keyCode !== 13) return;

  target.value = '';
  addTodo(content);
};

$todos.onchange = ({ target }) => {
  toggleCompleted(target.parentNode.id);
};

$todos.onclick = ({ target }) => {
  if (!target.classList.contains('remove-todo')) return;
  removeTodo(target.parentNode.id);
};

$nav.onclick = ({ target }) => {
  if (target.classList.contains('nav')) return;
  changeNav(target.id);
  render();
};

// todo.completed 일괄 토글
$checkbox.onchange = ({ target }) => {
  toggleCompletedAll(target.checked);
};

// todo.completed 일괄 제거
$clearCompleted.onclick = removeCompleted;
