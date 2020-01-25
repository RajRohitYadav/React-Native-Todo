import React from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

Text.defaultProps = Text.defaultProps || {};
TextInput.defaultProps = TextInput.defaultProps || {};

Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;

export default class NoteScreen extends React.Component{

    constructor(props){
        super(props);
        const { navigation } = this.props;
        this.state={
            pageType: navigation.getParam('pageType', 'addNewTodo'),
            todoTitle: navigation.getParam('todoTitle', null),
            todoContent: '',
            isLoading: true,
            selection: {start:0,end:0}
        }
    }

    componentDidMount(){
        let {pageType,todoTitle} = this.state;
        if(pageType != 'addNewTodo') this.fetchTodoDetail(todoTitle);
        else{
            this.setState({
                isLoading: false
            });
        }
    }

    fetchTodoDetail(todoTitle){
        if(todoTitle){
            AsyncStorage.getItem('TodoList').then((TodoList)=>{
                TodoList = JSON.parse(TodoList);
                for(let i=0; i<TodoList.length; ++i){
                    if(TodoList[i].title ==  todoTitle){
                        this.setState({
                            todoContent: TodoList[i].content,
                            isLoading: false,
                            originalTitle: todoTitle
                        })
                        break;
                    }
                }
            });
        }
    }

    editTitle=(text)=>{
        this.setState({
            todoTitle: text
        });
    }

    setCursorToStart=()=>{
        if(this.state.selection != {}){
            this.setState({selection:{start:-1,end:-1}});
        }
    }

    saveTodo=(todoContent)=>{
        let {todoTitle, pageType, originalTitle} = this.state;

        if(todoTitle && todoTitle.length>0){AsyncStorage.getItem('TodoList').then((TodoList)=>{

            TodoList = JSON.parse(TodoList);
            if(!TodoList) TodoList = [];
            let itemExist = false;

            if(pageType != 'addNewTodo' && TodoList.length>0){
                for(let i=0; i<TodoList.length; ++i){
                    if(TodoList[i].title == originalTitle){
                        TodoList[i].title = todoTitle;
                        TodoList[i].content = todoContent;
                        TodoList[i].taskDone = TodoList[i].taskDone;
                        break;
                    }
                }
            }
            else{
                for(let i=0; i<TodoList.length; ++i){
                    if(TodoList[i].title == todoTitle){
                        Alert.alert('Duplicate Title',"Please change the title.")
                        itemExist = true;
                        break;
                    }
                }
                if(!itemExist){
                    TodoList.push({
                        title: todoTitle,
                        content: todoContent,
                        taskDone: false
                    });
                }
            }

            if(!itemExist){
                this.setState({isLoading: true});
                AsyncStorage.setItem('TodoList',JSON.stringify(TodoList)).then(()=>{
                    this.props.navigation.navigate('Todo List');
                });
            }
        });}
        else{
            Alert.alert('Provide Title',"Todo title can not be empty.");
        }
    }

    render(){
        return(
            <View style={{flex:1,padding:10}}>
                {this.state.isLoading?

                    <View style={{flex:1,justifyContent:'center',alignContent:'center'}}>
                        <ActivityIndicator size="large" color="rgb(44,187,173)" />
                    </View>
                    :
                    <React.Fragment>
                        <TextInput
                            placeholder='Todo Title'
                            paddingLeft={18}
                            value={this.state.todoTitle}
                            onChangeText={this.editTitle}
                            onFocus={this.setCursorToStart}
                            selection={this.state.selection}
                            style={{fontSize: 20,backgroundColor:'white',borderRadius:5,shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5}}
                        />
                        <NotePad todoContent={this.state.todoContent} saveTodo={this.saveTodo}/>
                    </React.Fragment>
                }
            </View>
        )
    }
}

class NotePad extends React.Component{

    constructor(props){
        super(props);
        this.state={
            todoContent: this.props.todoContent
        }
    }

    noteBookLine(){
        let lines = [];
        for(let i=0;i<100; ++i){
            lines.push(<View key={i} style={{height:36,width:'100%',borderBottomColor:'#e0e0e0',borderBottomWidth:1}}/>);
        }
        return lines;
    }

    editContent=(text)=>{
        this.setState({
            todoContent: text
        })
    }

    render(){
        return(
            <View style={{flex:1}}>

                {/* Notebook head */}
                <View style={{flexDirection:'row',marginTop:30}}>
                    <Text style={{fontSize: 28,fontWeight:'bold',marginLeft:21}}>Write a Note</Text>
                    <View style={{position:'absolute',right:0,width:80}}>
                        <Button
                            title="Save"
                            color="rgb(44,187,173)"
                            onPress={this.props.saveTodo.bind(this,this.state.todoContent)}
                        />
                    </View>
                </View>

                {/* Notebook body */}
                <View style={{flex:1,marginTop:20}}>

                    {this.noteBookLine()}

                    <TextInput 
                        style={{flex:1,fontSize:24,backgroundColor:'transparent',marginLeft:40,position:'absolute',top:0,width:'85%',textAlignVertical: 'top',
                        height:'100%'
                        }}
                        multiline={true}
                        value={this.state.todoContent}
                        onChangeText={this.editContent}
                    />
                    <View
                    style={{
                        borderLeftWidth: 2,
                        borderLeftColor: 'rgb(252,204,51)',
                        height:'100%',
                        position:'absolute',
                        left: 20
                    }}
                    />
                </View>

            </View>
        )
    }
}