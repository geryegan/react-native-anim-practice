import React, { Component } from 'react';
import { View, Animated, PanResponder, Text, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

class Deck extends Component {
    constructor(props) {
        super(props);
        const position = new Animated.ValueXY()
        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: gesture.dy})
            },
            onPanResponderRelease: () => {this.resetPosition()}
        });

        this.state =  { panResponder, position }
        
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
        return this.props.data.map((item, index) => {
            if (index === 0) {
                return (
                    <Animated.View
                        key={item.id}
                        style={this.getCardStyle()}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
            return this.props.renderCard(item);
        });
    }
    render() {
        return (
            <Animated.View>
                {this.renderCards()}
            </Animated.View>
        );
    }
}

export default Deck;
