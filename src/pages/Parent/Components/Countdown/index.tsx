import Taro, { PureComponent } from "@tarojs/taro";
import classNames from 'classnames';
import { View } from "@tarojs/components";
import styles from "./index.modules.less";

type PageOwnProps = {
    className?:any;
    seconds: number;
    onTimeUp: () => void;
};

type IProps = PageOwnProps;

interface PageOwnState {
    showSeconds?: number;
  }

interface Index {
  state:PageOwnState;
  props: IProps;
  timer: any;
  seconds: number;
}


class Index extends PureComponent {
    constructor() {
        super(...arguments)
        const { seconds = 0 } = this.props
        this.seconds = seconds
        this.state = {
            showSeconds: this.seconds
        }
        this.timer = null
    }
  

    componentWillReceiveProps (nextProps) {
        if (JSON.stringify(this.props) === JSON.stringify(nextProps)) return
    
        const { seconds } = nextProps
        this.seconds = seconds;
        this.clearTimer()
        this.setTimer()
    }
    
    componentDidMount () {
        this.setTimer()
    }
    
    componentWillUnmount () {
        this.clearTimer()
    }
    
    componentDidHide () {
        this.clearTimer()
    }
    
    componentDidShow () {
        this.setTimer()
    }

    countdonwn () {
    
        const seconds = this.seconds;
        this.setState({
            showSeconds: seconds
        })
        this.seconds--

        if (this.seconds < 0) {
            this.clearTimer()
            this.props.onTimeUp()
            return
        }

        this.timer = setTimeout(() => {
            this.countdonwn()
        }, 1000)
    }

    setTimer () {
        if (!this.timer) this.countdonwn()
    }

    clearTimer () {
        if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
        }
    }

    render() {
        const {className} = this.props;
        const {
            showSeconds
        } = this.state   

        return (
            <View 
                className={
                classNames(styles.countdownView, className)}
            >
            {showSeconds}s
            </View>
        );
    }
}

export default Index;
