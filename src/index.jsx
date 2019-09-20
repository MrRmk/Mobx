/*6、(性能提升)使用mobx-react、实现TodoList--------------------------------------------------------------------------------------------------*/
//spy也用来监控。
//监视所有事件、执行的每个action、对可观察数据的每次修改、甚至autorun、reaction的每次触发都能被监控到。

import {trace, toJS, spy, observe, observable, action, computed} from 'mobx';
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {observer, PropTypes as ObservablePropTypes } from 'mobx-react';

// spy(event => {
//     console.log(event);
// });

//定义Todo条目
class Todo {
    id = Math.random();
    @observable title = '';
    @observable finished = false;

    constructor(title) {
        this.title = title;
    }

    @action.bound toggle() {
        this.finished = !this.finished;
    }
}
//定义Store存储数据
class Store {
    // todo条目列表 数组类型的，是可变数据 用@observable修饰
    @observable todos = [];

    disposers =  [];

    constructor() {
        // observe函数返回的是disposer函数，当disposer函数执行时observe就停止监视
        observe(this.todos, change => {
            //解除监控
            this.disposers.forEach(disposer => disposer() );
            // 清空
            this.disposers = [];

            //便利todos成员进行新一轮监控
            for(let todo of change.object){
                var disposer = observe(todo, changex => {
                    this.save();
                    // console.log(changex);
                });
                this.disposers.push(disposer);
            }
            this.save();
            // console.log(change);
        });
    }

    // 将todos条目列表保存到localStorage
    save() {
        localStorage.setItem('todos', JSON.stringify(toJS(this.todos)));
        //console.log(toJS(this.todos));
    }

    @action.bound createTodo(title) {
        this.todos.unshift(new Todo(title));
    }

    @action.bound removeTodo(todo) {
        this.todos.remove(todo);
    }

    //未完成的条目长度
    @computed get left() {
        return this.todos.filter(todo => !todo.finished).length;
    }
}

var store = new Store();

@observer
class TodoItem extends Component{
    static propTypes = {
        todo: PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            finished: PropTypes.bool.isRequired
        }).isRequired
    }

    handleClick = (e) => {
        this.props.todo.toggle();
    }

    render() {trace();
        const todo = this.props.todo;
        return <Fragment>
            <input type="checkbox" className="toggle" checked={todo.finished} onClick={this.handleClick} />
            <span className={['title', todo.finished && 'finished'].join(' ')}>{todo.title}</span>
        </Fragment>;
    } 
}

@observer
class TodoFooter extends Component {
    static propTypes = {};
    render() {trace();
        const store = this.props.store;
        return <footer>{store.left} item(s) unfinished</footer>;
    }
}

@observer
class TodoView extends Component {
    static propTypes = {};
    render() {
        const todos = this.props.todos;
        return todos.map(todo => {
                return <li key={todo.id} className="todo-item">
                    <TodoItem todo={todo} />
                    <span className="delete" onClick={e=>store.removeTodo(todo)} >X</span>
                </li>
            });
    }
}

@observer
class TodoHeader extends Component {
    static propTypes = {};

    state = {inputValue: ''};

    handleSubmit = (e) => {
        //阻止整个页面被提交
        e.preventDefault();

        var store = this.props.store;
        var inputValue = this.state.inputValue;

        //创建条目
        store.createTodo(inputValue);
        //清空输入框
        this.setState({inputValue: ''});

    }

    handleChange = (e) => {
        var inputValue = e.target.value;
        this.setState({
            inputValue
        });
    }

    render() {
        return <header>
                    <form onSubmit={this.handleSubmit}>
                        <input type="text" onChange={this.handleChange} value={this.state.inputValue} className="input" placeholder="What needs to be finished?"/>
                    </form>
                </header>;
    }
}

//所有react组件用observer修饰,保证数据更改重新渲染
@observer
class TodoList extends Component {
    static propTypes = {
        store: PropTypes.shape({
            createTodo: PropTypes.func,
            todos: ObservablePropTypes.observableArrayOf(ObservablePropTypes.observableObject).isRequired
        }).isRequired
    };

    render() {
        trace();
        const store = this.props.store;
        const todos = store.todos;
        return <div className="todo-list">
            <TodoHeader store={store} />
            <ul><TodoView todos={todos} /></ul>
            <TodoFooter store={store} />
        </div>
    }
}

ReactDOM.render( <TodoList store={store} />, document.querySelector('#app') );

/*--------------------------------------------------------------------------------------------------*/


/*5、使用mobx-react、实现TodoList--------------------------------------------------------------------------------------------------
import {observable, action, computed} from 'mobx';
import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {observer, PropTypes as ObservablePropTypes } from 'mobx-react';
import { finished } from 'stream';

//定义Todo条目
class Todo {
    id = Math.random();
    @observable title = '';
    @observable finished = false;

    constructor(title) {
        this.title = title;
    }

    @action.bound toggle() {
        this.finished = !this.finished;
    }
}
//定义Store存储数据
class Store {
    // todo条目列表 数组类型的，是可变数据 用@observable修饰
    @observable todos = [];

    @action.bound createTodo(title) {
        this.todos.unshift(new Todo(title));
    }

    @action.bound removeTodo(todo) {
        this.todos.remove(todo);
    }

    //未完成的条目长度
    @computed get left() {
        return this.todos.filter(todo => !todo.finished).length;
    }
}

var store = new Store();

@observer
class TodoItem extends Component{
    static propTypes = {
        todo: PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            finished: PropTypes.bool.isRequired
        }).isRequired
    }

    handleClick = (e) => {
        this.props.todo.toggle();
    }

    render() {
        const todo = this.props.todo;
        return <Fragment>
            <input type="checkbox" className="toggle" checked={todo.finished} onClick={this.handleClick} />
            <span className={['title', todo.finished && 'finished'].join(' ')}>{todo.title}</span>
        </Fragment>;
    } 
}

//所有react组件用observer修饰,保证数据更改重新渲染
@observer
class TodoList extends Component {
    static propTypes = {
        store: PropTypes.shape({
            createTodo: PropTypes.func,
            todos: ObservablePropTypes.observableArrayOf(ObservablePropTypes.observableObject).isRequired
        }).isRequired
    };

    state = {inputValue: ''};

    handleSubmit = (e) => {
        //阻止整个页面被提交
        e.preventDefault();

        var store = this.props.store;
        var inputValue = this.state.inputValue;

        //创建条目
        store.createTodo(inputValue);
        //清空输入框
        this.setState({inputValue: ''});

    }

    handleChange = (e) => {
        var inputValue = e.target.value;
        this.setState({
            inputValue
        });
    }

    render() {
        const store = this.props.store;
        const todos = store.todos;
        return <div className="todo-list">
            <header>
                <form onSubmit={this.handleSubmit}>
                    <input type="text" onChange={this.handleChange} value={this.state.inputValue} className="input" placeholder="What needs to be finished?"/>
                </form>
            </header>
            <ul>{todos.map(todo => {
                return <li key={todo.id} className="todo-item">
                    <TodoItem todo={todo} />
                    <span className="delete" onClick={e=>store.removeTodo(todo)} >X</span>
                </li>
            })}</ul>
            <footer>{store.left} item(s) unfinished</footer>
        </div>
    }
}

ReactDOM.render( <TodoList store={store} />, document.querySelector('#app') );
/*--------------------------------------------------------------------------------------------------*/

/*4、使用mobx-react--------------------------------------------------------------------------------------------------
// mobx-react可以将react组件的render方法包装成autorun。那我执行action就会触发组件重渲染了。
// mobx-react已经为react实现了一个取消组件重渲染的方法shouldComponentUpdate()
import {observable, action} from 'mobx';
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {observer, PropTypes as ObservablePropTypes } from 'mobx-react';

class Store {
    @observable cache =  { queue: ['234'] }

    @action.bound refresh() {
        this.cache.queue.push(1);
    }
}

let store = new Store();

@observer
class Bar extends Component {
    static propTypes = {
        queue:  ObservablePropTypes.observableArray  //PropTypes.array
    };
    render() {
        const queue = this.props.queue;
        return <span>{queue.length}</span>;
    }
}

class Foo extends Component {
    static propTypes = {
        cache:  ObservablePropTypes.observableObject //PropTypes.object 
    };

    // 可以取消重渲染
    shouldComponentUpdate() {}

    render() {
        const cache = this.props.cache;
        return <div><button onClick={this.props.refresh}>Refresh</button><Bar queue={cache.queue} /></div>
    }
}

ReactDOM.render( <Foo cache={store.cache} refresh={store.refresh} />, document.querySelector('#app') );
/*--------------------------------------------------------------------------------------------------*/



/*3、mobx常用API-修改可观察数据--------------------------------------------------------------------------------------------------

//可观察数据变量的修改建议放在action中。方法前面用@action修饰。
import {observable, computed, autorun, when, reaction, isArrayLike, action, runInAction} from 'mobx';

class Store {
    @observable array = [];
    @observable abj = {};
    @observable map = new Map();

    @observable string = 'hello';
    @observable number = 20;
    @observable bool = false;

    @computed get mixed() { 
        return store.string + '/' + store.number; 
    }

    // @action bar() {
    //     this.string = 'world';
    //     this.number = 30;
    // }
    @action.bound bar() {
        this.string = 'world';
        this.number = 30;
    }

}
    var store = new Store();

    // 1、computed： 将多个可观察数据转化为一个可观察数据。一般用于函数的get属性方法上。
    // computed的值可以看成一个新的可观察数据看待的。
    // 1.1、函数角度
/*     var foo = computed(function(){ return store.string + '/' + store.number; });
    console.log(foo);
    console.log(foo.get());
    //监听数据变化,当数据变化时触发此方法
    foo.observe( function(change){ console.log(change) } );
    // foo.observe( change => console.log(change.newValue) );
    //可观察对象发生变化
    store.string = 'world';
    store.number = 30; */
    


    // 2、autorun： [按需执行]、[初始化时会被调用] 能自动追踪多引用的可观察数据，并在数据发生变化时重新触发
    // autorun会自动运行：传入autorun的函数（参数）； 怎么操作触发自动运行？ 修改autorun中引用的任意可观察数据时。
    // 作用：在可观察数据被修改之后，自动去执行依赖可观察数据的行为。 这个行为一般指的是传入autorun的函数。
     
    // 第一种情况：
    /*
    autorun(() => {
        console.log( store.string + '/' + store.number );
    });
    store.string = 'world';
    store.number = 30; 
    */

    // 第二种情况：
    /* autorun(() => {
        console.log( store.mixed );
    });
    store.string = 'world';
    store.number = 30; */

    
    // 3、when: [提供了条件执行逻辑]。 第一个函数参数必须是可观察数据变量，当为true时触发第二个函数参数。
    // 第一个函数根据可观察数据返回一个布尔值；当该布尔值为true的时候就去执行第二个函数，并且保证最多只会执行一次。
    /* console.log('before');
    when( () => store.bool, () => console.log("it's true") );
    console.log('after');
    store.bool = true */

    // 4、reaction： [分离可观察数据声明]。 
    // reaction也接受两个函数类型的参数，第一个函数引用可观察数据并返回一个值，作为第二个函数的参数
    // arr参数就是指这个数组[store.string, store.number]
    // 在初始化阶段，第一个函数参数（可观察数据被引用了）会先执行一次， 当可观察数据修改时调用第二个函数参数
    /* reaction( () => [store.string, store.number], arr => console.log(arr.join('/')) );
    store.string = 'world';
    store.number = 30; */

    // 5、action 对比reaction 这样只调用了一次。
    // action.bound 与action相比 只是多了把被修饰方法的上下文强制绑定到该对象上而已。
    
    // reaction( () => [store.string, store.number], arr => console.log(arr.join('/')) );
    // 第一种情况： action修饰函数
    // store.bar();
    // 第二种情况： action.bound修饰函数
    /* var bar = store.bar;
    bar(); */
    // 第三种情况： runInAction定义匿名的action函数
    // runInAction： mobx提供了一种语法糖，runInAction允许你定义一个匿名的action函数，并运行它。
    /* runInAction( () => {
        store.string = 'world';
        store.number = 30;
    });  */ 
    // runInAction也可以接受多一个字符串类型的参数
    /* runInAction( 'modify', () => {
        store.string = 'world';
        store.number = 30;
    });  */


/*--------------------------------------------------------------------------------------------------3、*/    


/*1、--------------------------------------------------------------------------------------------------
//decorator装饰器语法

function log(target){
    //获取所有的成员签名
    const desc = Object.getOwnPropertyDescriptors(target.prototype);

    //获取所有的成员名称
    for (const key of Object.keys(desc) ) {
        //忽略成员方法
        if( key === 'constructor' ){
            continue;
        }

        const func = desc[key].value;

        if( 'function' === typeof func ){
            //重新定义属性
            Object.defineProperty(target.prototype, key, {
                value(...args) {
                    console.log('before ' + key);
                    const ret = func.apply(this, args);
                    console.log('after ' + key);

                    return ret;
                }
            })
        }
    }
}


// 类成员修饰器
// 三个参数
// target:类的实例对象
// key:该类成员的名称
// descriptor:该类成员的描述符

function readonly(target, key, descriptor) {
    descriptor.writable = false;
}

function validate(target, key, descriptor) {
    const func = descriptor.value;
    descriptor.value = function(...args) {
        for (let num of args){
            if( 'number' !==typeof num ){
                throw new Error(`"${num}" is not a number`);
            }
        }

        return func.apply(this, args);
    }
}

//类修饰器
@log
class Numberic {
    //类成员修饰器
    @readonly PI = 3.1415926;

    @validate
    add(...nums) {
        return nums.reduce( (p,n) => (p + n), 0 )
    }
}

new Numberic().add(1, 2);
new Numberic().PI = 100;
new Numberic().add(1, 'x');
--------------------------------------------------------------------------------------------------1、*/   


/*2、--------------------------------------------------------------------------------------------------
//用observable: 将变量转化为可观察的对象


import {observable, isArrayLike, extendObservable} from 'mobx';

// observable.box
//1、对于数组、纯对象、以及ES6中的Map直接把observable当成函数来把变量转化为可观察的对象。
//之后对于数组、对象、Map中的数据都将会被监视。
//2、对于其他类型都必须调用observable.box来将变量包装为可观察的对象，之后对该变量的直接赋值将会被监视。

// array、object、map 

// 1、数组array
const arr = observable(['a', 'b', 'c']);
console.log("arr: " + arr);
console.log(arr , Array.isArray(arr), isArrayLike(arr));
console.log(arr[0], arr[2]);
console.log(arr.pop(), arr.push('d'));
console.log("arr: " + arr);
console.log(arr[3]);

// 2、对象object
//注意：只能对已有的属性进行监视。对新添加的属性需要用extendObservable()方法
const obj = observable({a:1, b:2});
//extendObservable()
console.log(obj);
console.log(obj.a, obj.b);

// 3、Map
const map = observable(new Map());
map.set('a', 1)
console.log(map);
console.log(map.has('a'));
map.delete('a');
console.log(map.has('a'));

// 4、其他类型
var num = observable.box(20);
var str = observable.box('hello');
var bool = observable.box(true);

console.log(num, str, bool);
console.log(num.get(), str.get(), bool.get());
num.set(50);
str.set('world');
bool.set(false);
console.log(num.get(), str.get(), bool.get());
--------------------------------------------------------------------------------------------------2、*/
