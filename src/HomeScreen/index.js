import React from 'react';
import { View, Text, StyleSheet, Image, Alert, ActivityIndicator} from 'react-native';
import { TouchableOpacity, ScrollView, TextInput } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-community/async-storage';
var stringSimilarity = require('../string-similarity');
import TodoCard from './TodoCard';

Text.defaultProps = Text.defaultProps || {};
TextInput.defaultProps = TextInput.defaultProps || {};

Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;

export default class HomeScreen extends React.Component{
    constructor(props){
        super(props);
        this.state={
            noTodoMessage: 'Add Todo!',
            loadingList: true,
            countItemLeftToComplete: 0,
            TodoList : []
        };
    }

    componentDidMount(){
        //AsyncStorage.clear();
        this.didFocusListner = this.props.navigation.addListener('didFocus', this.onDidFocus);
        this.onDidBlurListner = this.props.navigation.addListener('didBlur', this.onDidBlur);
        this.countItemLeftToComplete();
    }

    componentWillUnmount(){
        this.didFocusListner.remove();
        this.onDidBlurListner.remove();
    }

    onDidFocus=()=>{
        this.countItemLeftToComplete();
        this.fetchSavedTodo();
    }

    onDidBlur=()=>{
        this.setState({
            loadingList: true
        });
    }

    fetchSavedTodo(){
        AsyncStorage.getItem('TodoList').then((TodoList)=>{
            TodoList = JSON.parse(TodoList);
            if(TodoList){
                this.setState({loadingList:true,TodoList},()=>{ //TodoList ADDDD
                    this.setState({loadingList:false,noTodoMessage: 'Add Todo!',});
                });
            }
            else{
                this.setState({loadingList:false,noTodoMessage: 'Add Todo!'});
            }
        });
    }

    filterTodo(todoState){
        AsyncStorage.getItem('TodoList').then((TodoList)=>{
            TodoList = JSON.parse(TodoList);
            if(TodoList){
                let filterTodoList = [];
                TodoList.map((todoItem,todoIndex)=>{
                    if(todoItem.taskDone == todoState){
                        filterTodoList.push(todoItem);
                    }
                });
                this.setState({
                    TodoList: filterTodoList,
                    loadingList: true,
                    noTodoMessage: "It's empty here!"
                },()=>{
                    this.setState({
                        loadingList: false
                    });
                });
            }
        });
    }

    serchTodo=(title)=>{
        if(title == '') this.fetchSavedTodo();
        else{
            AsyncStorage.getItem('TodoList').then((TodoList)=>{
                TodoList = JSON.parse(TodoList);
    
                if(TodoList){
                    TodoList.map(async (todoItem,todoIndex)=>{
                        let score = stringSimilarity.compareTwoStrings(todoItem.title,title);
                        TodoList[todoIndex].score = score;
                    });
            
                    TodoList.sort((a, b) => {
                        if (a.score > b.score) return -1
                        return a.score < b.score ? 1 : 0
                    });
            
                    let searchTodoList = [];
                    TodoList.map((todoItem)=>{
                        if(todoItem.score > 0.1){
                            searchTodoList.push(todoItem);
                        }
                    });
            
                    this.setState({
                        TodoList: searchTodoList,
                        loadingList: true,
                        noTodoMessage: "No such todo!"
                    },()=>{
                        this.setState({
                            loadingList: false
                        });
                    });
                }
            });
        }
    }

    toggleCheckBox=(title)=>{
        let {TodoList} = this.state;
        AsyncStorage.getItem('TodoList').then((OriginalTodoList)=>{
            OriginalTodoList = JSON.parse(OriginalTodoList);
            if(OriginalTodoList){
                let newTodoList = [];
                for(let i=0; i<OriginalTodoList.length; ++i){
                    let todoItem = OriginalTodoList[i];
                    if(todoItem.title == title){
                        todoItem.taskDone = !todoItem.taskDone;
                        newTodoList.push(todoItem);
                        for(let j=0; j<TodoList.length; ++j){
                            if(TodoList[j].title == title){
                                TodoList[j].taskDone = !TodoList[j].taskDone;
                                break;
                            }
                        }
                    }
                    else{
                        newTodoList.push(todoItem);
                    }
                }
                this.setState({TodoList},()=>{
                    this.countItemLeftToComplete();
                    AsyncStorage.setItem('TodoList', JSON.stringify(newTodoList));
                });
            }
            this.countItemLeftToComplete();
        });
    }

    countItemLeftToComplete=()=>{
        let count = 0;
        AsyncStorage.getItem('TodoList').then((OriginalTodoList)=>{
            OriginalTodoList = JSON.parse(OriginalTodoList);
            if(OriginalTodoList){
                OriginalTodoList.map((item)=>{
                    if(!item.taskDone){
                        ++count;
                    }
                })
            }
            this.setState({
                countItemLeftToComplete: count
            })
        });
    }

    editTodo=(todoTitle)=>{
        this.navigateToNoteScreen(todoTitle);
    }

    deleteAlert=(title)=>{
        Alert.alert(
            "Delete Todo",
            "Are you sure?",
            [
                {
                    text: 'Yes', onPress: ()=>this.deleteTodo(title)
                },
                {
                    text: 'Cancel', onPress: ()=>{}
                }
            ],
            {cancelable: true}
        )
    }

    deleteTodo=(title)=>{
        let {TodoList} = this.state;
        AsyncStorage.getItem('TodoList').then((OriginalTodoList)=>{
            OriginalTodoList = JSON.parse(OriginalTodoList);
            if(OriginalTodoList){
                let newTodoList = [];
                for(let i=0; i<OriginalTodoList.length; ++i){
                    if(OriginalTodoList[i].title == title){
                        for(let j=0; j<TodoList.length; ++j){
                            if(TodoList[j].title == title){
                                TodoList.splice(j,1);
                                break;
                            }
                        }
                    }
                    else{
                        newTodoList.push(OriginalTodoList[i]);
                    }
                }
                this.setState({TodoList,loadingList:true},()=>{
                    this.countItemLeftToComplete();
                    AsyncStorage.setItem('TodoList', JSON.stringify(newTodoList)).then(()=>{
                        this.setState({loadingList:false});
                    });
                });
            }
            this.countItemLeftToComplete();
        });
    }

    navigateToNoteScreen=(todoTitle)=>{
        if(todoTitle){
            this.props.navigation.navigate('Todo Details',{
                pageType: 'editTodo',
                todoTitle
            });
        }else{
            this.props.navigation.navigate('Todo Details',{
                pageType: 'addNewTodo'
            });
        }
    }

    filterAlert=()=>{
        Alert.alert(
            "Apply Filter",
            "Choose your filter",
            [
                {
                    text: 'Task Done', onPress: ()=>this.filterTodo(true)
                },
                {
                    text:'Task Todo', onPress: ()=>this.filterTodo(false)
                },
                {
                    text: 'All Task', onPress: ()=>this.fetchSavedTodo()
                }
            ],
            {cancelable: true}
        )
    }
    
    render(){
        return(
            <React.Fragment>
                <View style={{height:40,flexDirection:'row',marginTop:10,marginBottom:5}}>

                    <TouchableOpacity 
                        style={{flex:1,justifyContent:'center',alignItems:'center',paddingLeft:5,paddingRight:5}} 
                        onPress={this.filterAlert}
                    >
                        <Image
                            style={{width:20,height:20}}
                            source={require('../image/filter.png')}
                        />
                    </TouchableOpacity>

                    <View style={{flex:7,backgroundColor:'#fdfdfd',borderRadius:5, shadowColor: "#000",borderColor:'gray',borderWidth:1}}>
                        <TextInput
                        maxLength={80}
                        onChangeText={this.serchTodo}
                        placeholder="Search"
                        paddingLeft={10}
                        style={{
                        }}
                        />
                    </View>

                    <TouchableOpacity 
                    style={{flex:1,justifyContent:'center',alignItems:'center',paddingLeft:5,paddingRight:5}}
                    onPress={()=>this.filterTodo(false)}
                    >
                        <Text style={{color:'rgb(44,187,173)'}}>{this.state.countItemLeftToComplete} Left</Text>
                    </TouchableOpacity>
                </View>

                { this.state.loadingList ?
                    <View style={{flex:1,justifyContent:'center'}}>
                        <ActivityIndicator size="large" color="rgb(44,187,173)"/>
                    </View>
                    :
                    this.state.TodoList.length > 0 ?
                        <ScrollView style={{flex:1}}>
                            {this.state.TodoList.map((todoItem, todoIndex)=>{
                                if(todoIndex === 0) return (
                                    <View key={todoIndex} style={{marginTop:14,marginBottom:14,paddingLeft:20,paddingRight:20}}>
                                        <TodoCard taskDone={todoItem.taskDone} title={todoItem.title} toggleCheckBox={this.toggleCheckBox} editTodo={this.editTodo} deleteTodo={this.deleteAlert}/>
                                    </View>
                                )
                                else return (
                                    <View key={todoIndex} style={{marginBottom:14,paddingLeft:20,paddingRight:20}}>
                                        <TodoCard taskDone={todoItem.taskDone} title={todoItem.title} toggleCheckBox={this.toggleCheckBox} editTodo={this.editTodo} deleteTodo={this.deleteAlert}/>
                                    </View>
                                )
                            })}
                        </ScrollView>
                        :
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style={{color:'rgb(44,187,173)'}}>{this.state.noTodoMessage}</Text>
                        </View>
                }

                <View style={{width:50,height:50,position:'absolute',bottom:55,right:20,backgroundColor:'rgb(44,187,173)',borderRadius:25}}>
                    <TouchableOpacity onPress={this.navigateToNoteScreen}>
                        <Text style={{textAlign:'center',textAlignVertical:'center',height:'100%',fontSize:24,color:'white'}}>+</Text>
                    </TouchableOpacity>
                </View>
            </React.Fragment>
        )
    }
}



const HomeScreenStyle = StyleSheet.create({

});

/**
 * Todo dummy data
 *              {
                    title: 'Olive-green table for sale.',
                    content: 'hello 1 ',
                    taskDone: false
                },
                {
                    title: 'Bike in extremely good condition.',
                    content: 'hello 2 ',
                    taskDone: false
                },
                {
                    title: 'For sale: green Subaru Impreza, 210,000 miles',
                    content: 'hello 3 ',
                    taskDone: true
                },
                {
                    title: 'For sale: table in very good condition, olive green in colour.',
                    content: 'hello 4 ',
                    taskDone: false
                },
                {
                    title: 'Wanted: mountain bike with at least 21 gears.',
                    content: 'hello 5 ',
                    taskDone: false
                },
                {
                    title: 'Removed production dependencies',
                    content: 'hello 6 ',
                    taskDone: true
                },
                {
                    title: 'Performance improvement for compareTwoStrings',
                    content: 'hello 8',
                    taskDone: false
                },
                {
                    title: 'The algorithm has been tweaked slightly to disregard spaces and word boundaries.',
                    content: 'hello 9 ',
                    taskDone: true
                },
                {
                    title: 'Distributing as an UMD build to be used in browsers.',
                    content: 'hello 10 ',
                    taskDone: false
                }
 */