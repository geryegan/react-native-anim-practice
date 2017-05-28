import React, { Component } from 'react';
import { View, Animated, PanResponder, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 300;

class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => {},
        onSwipeLeft: () => {}
    }
    constructor(props) {
        super(props);
        const position = new Animated.ValueXY()
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy})
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD){
                    this.forceSwipe('right');
                } else if (gesture.dx < -SWIPE_THRESHOLD) {
                    this.forceSwipe('left');
                } else { 
                this.resetPosition();
                }
            }
        });

        this.state =  { panResponder, position, index: 0 }
        
    }

    forceSwipe(direction) {
       const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH  
       Animated.timing(this.state.position, {
           toValue: {x: x * 2, y: 0},
           duration: SWIPE_OUT_DURATION
       }).start(() => {
           this.onSwipeComplete(direction);
       }); 
    }

    onSwipeComplete(direction) {
        const { onSwipeRight, onSwipeLeft, data } = this.props;
        const item = data[this.state.index]
        direction === 'right' ? onSwipeRight() : onSwipeLeft();
        this.state.position.setValue({ x: 0, y: 0 })
        this.setState({index: this.state.index + 1})
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {x: 0, y: 0}
        }).start();
    }

    getCardStyle() {
        //destructure position property off of state
        const { position } = this.state;
        //interpolate x drag distance  with card rotation
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH * 2, 0, SCREEN_WIDTH * 2],
            outputRange: ['-120deg', '0deg', '120deg']
        })
        return {
            ///to be passed in to animated.view
            ...this.state.position.getLayout(),
            transform: [{ rotate }]
    };
    }

    renderCards() {
        if (this.state.index >= this.props.data.length) {
            return this.props.renderNoMoreCards();
        }

        return this.props.data.map((item, index) => {
            if (index < this.state.index){
                return null;
            }
            if (index === this.state.index) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[this.getCardStyle(), styles.cardStyle]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
                return (
                    <Animated.View 
                    key={item.id} 
                    style={[styles.cardStyle, { top: 10 * (index - this.state.index) }]}>
                        {this.props.renderCard(item)}
                    </Animated.View>
                    );    
        }).reverse();
    }
    render() {
        return (
            <Animated.View>
                {this.renderCards()}
            </Animated.View>
        );
    }
}

const styles = {
    cardStyle: {
        position: 'absolute',
        zIndex: 1,
        width: SCREEN_WIDTH
    }
}

export default Deck;
