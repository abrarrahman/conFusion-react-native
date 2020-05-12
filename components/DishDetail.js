import React from 'react';
import { Text, View, ScrollView, FlatList, Modal, StyleSheet, 
  Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';


class RenderDish extends React.Component{
  constructor(props){
    super(props);
    this.state={
      showCommentModal: false,
      rating: 5,
      author: '',
      comment: ''
    }
  }
  toggleCommentModal = () => {
    this.setState({showCommentModal: !this.state.showCommentModal})
  }
  resetCommentForm = () => {
    this.setState({
      showCommentModal: false,
      rating: 5,
      author: '',
      comment: ''
    })
  }
  shareDish = (title, message, url) => {
    Share.share({
      title: title,
      message: title + ': ' + message + ' ' + url,
      url: url
    }, {
      dialogTitle: 'Share ' + title
    })
  }
  render(){
    const dish = this.props.dish;
    const didSwipeLeft = ({ moveX, moveY, dx, dy }) => {
      if ( dx < -200 )
          return true;
      else
          return false;
    }
    const didSwipeRight = ({ moveX, moveY, dx, dy }) => {
      if ( dx > 200 )
          return true;
      else
          return false;
    }
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gestureState) => {
        return true;
      },
      onPanResponderGrant: () => {
        this.refs.dishRef.rubberBand(1000)
        .then(endState => console.log(endState.finished ? 
          'finished' : 'cancelled')
        );
      },
      onPanResponderEnd: (e, gestureState) => {
        console.log("pan responder end", gestureState);
        if (didSwipeLeft(gestureState)){
          Alert.alert(
            'Add Favorite',
            'Are you sure you wish to add ' + dish.name + ' to favorite?',
            [
              { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
              { text: 'OK', onPress: () => this.props.favorite ?
                console.log('Already favorite') :
                this.props.onPress() 
              },
            ],
            { cancelable: false }
          );
        }else if (didSwipeRight(gestureState)){
          this.toggleCommentModal();
        }

        return true;
      }
    })
    if(dish != null){
      return(
        <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
          ref='dishRef'
          {...panResponder.panHandlers}>
          <Card
            featuredTitle={dish.name}
            image={{ uri: baseUrl + dish.image }}>
            <Text style={{ margin: 10 }}>
              {dish.description}
            </Text>
            <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
              <Icon
                raised
                reverse
                name={this.props.favorite ? 'heart' : 'heart-o'}
                type='font-awesome'
                color='#f50'
                onPress={() => this.props.favorite ?
                  console.log('Already favorite') :
                  this.props.onPress()}
              />
              <Icon
                raised
                reverse
                name='pencil'
                type='font-awesome'
                color='#512da8'
                onPress={() => this.toggleCommentModal()}
              />
              <Icon
                raised
                reverse
                name='share'
                type='font-awesome'
                color='#51d2a8'
                onPress={() => this.shareDish(
                  dish.name,
                  dish.description,
                  baseUrl + dish.image)}
              />
            </View>
            <Modal
              animationType={'slide'}
              transparent={false}
              visible={this.state.showCommentModal}
              onDismiss={() => { this.toggleCommentModal(); this.resetCommentForm() }}
              onRequestClose={() => { this.toggleCommentModal(); this.resetCommentForm() }}
            >
              <Rating
                showRating
                startingValue={5}
                onFinishRating={rating => this.setState({ rating: rating })}
                style={{ paddingVertical: 10 }}
              />
              <Input
                placeholder="Author"
                leftIcon={{ type: 'font-awesome', name: 'user-o' }}
                style={styles.modalText}
                onChangeText={value => this.setState({ author: value })}
              />
              <Input
                placeholder="Comment"
                leftIcon={{ type: 'font-awesome', name: 'comment-o' }}
                style={styles.modalText}
                onChangeText={value => this.setState({ comment: value })}
              />
              <Button
                onPress={() => {
                  this.props.onSubmitComment(
                    this.state.rating,
                    this.state.comment,
                    this.state.author
                  );
                  this.toggleCommentModal();
                }}
                color='#512da8'
                title='Submit'
                margin={10}
              />
              <Button onPress={() => { this.toggleCommentModal(); this.resetCommentForm() }}
                color='gray'
                title='Cancel'
                paddingVertical={10}
              />
            </Modal>
          </Card>
        </Animatable.View>
      );
    }else{return <View></View>}
  }
}
function RenderComments(props) {

  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
        <Text style={{ fontSize: 12 }}>{'-- ' + item.author + ', ' + new Date(item.date).toDateString() } </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title='Comments' >
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={item => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}
class DishDetail extends React.Component {
  markFavorite(dishId){
    this.props.postFavorite(dishId);
  }
  handleComment = (dishId,rating,comment,author) => {
    console.log(JSON.stringify(this.state));
    this.props.postComment(dishId,rating,comment,author)
  }
  static navigationOptions = {
    title: 'Dish Details'
  }
  render(){
    const dishId = this.props.navigation.getParam('dishId','');
    return(
      <ScrollView>
        <RenderDish dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some(el=>el===dishId)}
          onPress={()=>this.markFavorite(dishId)}
          onSubmitComment={(rating,comment,author)=>this.handleComment(dishId,rating,comment,author)}
        />
        <RenderComments comments={this.props.comments.comments.filter(comment=>comment.dishId===dishId)}/>
      </ScrollView>
    )
  }
}
const styles = {
  modalText: {
    fontSize: 18,
    margin: 10
  }
}
const mapStateToProps = state => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites
  }
}
const mapDispatchToProps = dispatch => {
  return {
    postFavorite: dishId => dispatch(postFavorite(dishId)),
    postComment: (dishId,rating,comment,author) => dispatch(postComment(dishId,rating,comment,author))
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(DishDetail);