import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

export default class TodoCard extends React.Component{
    constructor(props){
        super(props);
        this.state={
            title : this.props.title
        }
    }
    render(){
        let {title} = this.state;
        let {taskDone, toggleCheckBox, editTodo, deleteTodo} = this.props;
        return(
            <View style={TodoCardStyle.OuterView}>

                <View style={TodoCardStyle.CheckBox}>
                    <CheckBox
                        value={taskDone}
                        onValueChange={toggleCheckBox.bind(this,title)}
                        tintColors = { {true:'rgb(44,187,173)',false:'rgb(44,187,173)'} }
                    />
                </View>

                <View style={{flex:10}}>
                    <TouchableOpacity style={TodoCardStyle.TitleTouch} onPress={editTodo.bind(this,title)}>
                        <Text numberOfLines={1} style={TodoCardStyle.Title}>{title}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={{flex:1,justifyContent:'center',alignItems:'center',paddingLeft:5,paddingRight:5}} onPress={deleteTodo.bind(this,title)}>
                    <Image
                        style={{width:18,height:18}}
                        source={require('../image/delete.png')}
                    />
                </TouchableOpacity>
            </View>
        )
    }
}


const TodoCardStyle = StyleSheet.create({
    OuterView:{
        height:60,
        backgroundColor:'white',
        padding: 2,
        borderRadius: 5,
        flexDirection:'row',

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    TitleTouch:{
        width:'100%',
        height:'100%',
    },
    Title:{
        flex:1,
        fontSize: 16,
        textAlignVertical:'center',
        fontFamily: 'notoserif',
        //paddingLeft:5,
        textTransform:'capitalize',
        fontFamily:''
    },
    CheckBox:{
        justifyContent:"center",
        alignContent:'center'
    }
});